'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import { Smartphone, Truck, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { clearCart } from '@/store/slices/cartSlice';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { orderApi, PaymentMethod } from '@/lib/api/orderApi';
import { paymentApi } from '@/lib/api/paymentApi';
import { productApi } from '@/lib/api/productApi';
import { shippingApi } from '@/lib/api/shippingApi';
import { settingsApi } from '@/lib/api/settingsApi';
import ManualPaymentCard from '@/components/payments/ManualPaymentCard';
import { getEffectivePrice } from '@/lib/productUtils';

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  street: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

// The courier needs a province; most orders come from these cities, others fall back to the city itself.
const PROVINCE_BY_CITY: Record<string, string> = {
  lahore: 'Punjab', faisalabad: 'Punjab', rawalpindi: 'Punjab', multan: 'Punjab', gujranwala: 'Punjab', sialkot: 'Punjab',
  sahiwal: 'Punjab', vehari: 'Punjab', bahawalpur: 'Punjab', sargodha: 'Punjab', 'rahim yar khan': 'Punjab', okara: 'Punjab',
  sheikhupura: 'Punjab', jhang: 'Punjab', kasur: 'Punjab', 'dera ghazi khan': 'Punjab', gujrat: 'Punjab', khanewal: 'Punjab',
  burewala: 'Punjab', mianwali: 'Punjab', chiniot: 'Punjab', pakpattan: 'Punjab',
  karachi: 'Sindh', hyderabad: 'Sindh', sukkur: 'Sindh', larkana: 'Sindh', nawabshah: 'Sindh', mirpurkhas: 'Sindh',
  peshawar: 'Khyber Pakhtunkhwa', mardan: 'Khyber Pakhtunkhwa', abbottabad: 'Khyber Pakhtunkhwa', swat: 'Khyber Pakhtunkhwa',
  mingora: 'Khyber Pakhtunkhwa', kohat: 'Khyber Pakhtunkhwa', 'dera ismail khan': 'Khyber Pakhtunkhwa',
  quetta: 'Balochistan', gwadar: 'Balochistan', turbat: 'Balochistan',
  islamabad: 'Islamabad Capital Territory', gilgit: 'Gilgit-Baltistan', skardu: 'Gilgit-Baltistan',
  muzaffarabad: 'Azad Kashmir', mirpur: 'Azad Kashmir',
};

function CheckoutContent() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const isBuyNow = searchParams?.get('buyNow') === 'true';
  const buyNowProductId = searchParams?.get('productId');
  const initialQuantity = Math.min(20, Math.max(1, parseInt(searchParams?.get('quantity') || '1', 10) || 1));
  const [buyNowQuantity, setBuyNowQuantity] = useState(initialQuantity);

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartDiscount = useSelector((state: RootState) => state.cart.discount);
  const couponCode = useSelector((state: RootState) => state.cart.couponCode);

  const { data: buyNowProduct, isLoading: isLoadingBuyNow } = useQuery({
    queryKey: ['product', buyNowProductId],
    queryFn: () => productApi.getById(buyNowProductId!),
    enabled: isBuyNow && !!buyNowProductId,
  });

  const { data: accounts } = useQuery({
    queryKey: ['payment-accounts'],
    queryFn: paymentApi.getAccounts,
  });

  const { data: shippingRates } = useQuery({
    queryKey: ['shipping-rates'],
    queryFn: shippingApi.getAllRates,
  });

  const { data: storeSettings } = useQuery({
    queryKey: ['store-settings'],
    queryFn: settingsApi.getSettings,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CheckoutFormData>({
    defaultValues: {
      email: user?.email || '',
      fullName: [user?.firstName, user?.lastName].filter(Boolean).join(' '),
      phone: (user as { phone?: string } | null)?.phone || '',
      paymentMethod: 'cod',
    },
  });

  const paymentMethod = watch('paymentMethod');
  const selectedCity = watch('city');

  const paymentMethods = useMemo(
    () =>
      [
        { id: 'cod' as const, name: 'Cash on delivery', icon: Truck, description: 'Pay when it arrives' },
        { id: 'jazzcash' as const, name: 'JazzCash', icon: Smartphone, description: 'Send payment, upload screenshot' },
        { id: 'easypaisa' as const, name: 'Easypaisa', icon: Smartphone, description: 'Send payment, upload screenshot' },
      ] as const,
    []
  );

  const account =
    paymentMethod === 'jazzcash'
      ? accounts?.jazzcash
      : paymentMethod === 'easypaisa'
        ? accounts?.easypaisa
        : null;

  // Determine items to checkout
  const checkoutItems = useMemo(() => {
    if (isBuyNow && buyNowProduct) {
      const price = getEffectivePrice(buyNowProduct);
      return [{
        product: {
          _id: buyNowProduct._id,
          name: buyNowProduct.name,
          images: buyNowProduct.images,
          basePrice: buyNowProduct.basePrice,
        },
        quantity: buyNowQuantity,
        price,
        total: price * buyNowQuantity
      }];
    }
    return cartItems;
  }, [isBuyNow, buyNowProduct, buyNowQuantity, cartItems]);

  const originalSubtotal = checkoutItems.reduce((sum, item) => sum + (item.product.basePrice || item.price) * item.quantity, 0);
  const effectiveSubtotal = checkoutItems.reduce((sum, item) => sum + item.total, 0);
  const productDiscount = originalSubtotal - effectiveSubtotal;
  
  const calculatedShipping = useMemo(() => {
    if (effectiveSubtotal === 0) return 0;
    
    // Check free shipping threshold
    const freeThreshold = storeSettings?.freeShippingThreshold ?? 6000;
    if (effectiveSubtotal > freeThreshold) return 0;

    if (selectedCity && shippingRates) {
      const cityRate = shippingRates.find(
        r => r.city.toLowerCase().trim() === selectedCity.toLowerCase().trim() && r.isActive
      );
      if (cityRate) return cityRate.cost;
    }

    if (!selectedCity) return null;

    // Default fallback
    return storeSettings?.defaultShippingCost ?? 200;
  }, [effectiveSubtotal, selectedCity, shippingRates, storeSettings]);

  const couponDiscountAmount = isBuyNow ? 0 : (cartDiscount || 0);
  const totalDiscount = productDiscount + couponDiscountAmount;
  const total = Math.max(0, effectiveSubtotal + (calculatedShipping ?? 0) - couponDiscountAmount);

  const onSubmit = async (data: CheckoutFormData) => {
    if (checkoutItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    setError('');
    try {
      const [firstName, ...rest] = data.fullName.trim().split(/\s+/);
      const lastName = rest.join(' ') || firstName;
      const city = data.city.trim();
      const payload: any = {
        shippingAddress: {
          firstName,
          lastName,
          phone: data.phone.trim(),
          street: data.street.trim(),
          city,
          state: PROVINCE_BY_CITY[city.toLowerCase()] ?? city,
          postalCode: '00000',
          country: 'Pakistan',
        },
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      };

      if (!isAuthenticated) {
        payload.guestInfo = {
          email: data.email.trim(),
          firstName,
          lastName,
          phone: data.phone.trim(),
        };
      }

      if (isBuyNow) {
        payload.items = checkoutItems.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          price: item.price
        }));
      } else {
        payload.couponCode = couponCode || undefined;
        // The backend knows how to fetch items from the active user's cart if `items` is not provided and the user is authenticated.
        // But for guest checkout using the cart, we need to pass items.
        if (!isAuthenticated) {
          payload.items = checkoutItems.map(item => ({
            productId: item.product._id,
            quantity: item.quantity,
            price: item.price
          }));
        }
      }

      const order = await orderApi.create(payload);
      
      if (!isBuyNow) {
        dispatch(clearCart());
      }

      router.push(`/checkout/success?orderId=${order._id}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Checkout failed. Please try again.';
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isBuyNow && isLoadingBuyNow) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="animate-pulse text-gray-500">Preparing checkout...</div>
      </div>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold mb-2">Your cart is empty</h1>
          <Link href="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  const field = 'w-full h-12 px-4 border border-line bg-white text-[0.95rem] text-ink placeholder:text-gray-400 focus:outline-none focus:border-crimson transition-colors';
  const fieldLabel = 'block text-[0.8rem] text-gray-600 mb-1.5';
  const errorText = 'mt-1 text-[0.78rem] text-crimson';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <Link href={isBuyNow ? `/products/${buyNowProduct?.slug}` : '/cart'} className="inline-flex items-center gap-2 text-[0.85rem] text-gray-600 hover:text-crimson">
          <ArrowLeft className="w-4 h-4" /> Back to {isBuyNow ? 'product' : 'bag'}
        </Link>
        <h1 className="mt-4 font-serif text-[1.8rem] sm:text-[2.1rem] text-ink">Checkout</h1>

        {/* What you are buying */}
        <section className="mt-6 bg-blush p-4 sm:p-5 space-y-4" aria-label="Your order">
          {checkoutItems.map((item, index) => (
            <div key={`${item.product._id}-${(item as any).variant || index}`} className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.product.images?.[0]?.url || '/logo.png'} alt={item.product.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover bg-white shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-serif text-[1rem] sm:text-[1.1rem] text-ink leading-snug">{item.product.name}</p>
                <p className="mt-1 text-[0.9rem] text-gray-600">
                  {formatPrice(item.price)}
                  {item.product.basePrice > item.price && <span className="ml-2 text-gray-400 line-through">{formatPrice(item.product.basePrice)}</span>}
                </p>
                {isBuyNow ? (
                  <div className="mt-2 inline-flex items-center bg-white" role="group" aria-label="Quantity">
                    <button type="button" onClick={() => setBuyNowQuantity((q) => Math.max(1, q - 1))} className="w-9 h-9 text-ink hover:text-crimson" aria-label="Decrease quantity">−</button>
                    <span className="w-8 text-center text-[0.9rem]">{buyNowQuantity}</span>
                    <button type="button" onClick={() => setBuyNowQuantity((q) => Math.min(20, q + 1))} className="w-9 h-9 text-ink hover:text-crimson" aria-label="Increase quantity">+</button>
                  </div>
                ) : (
                  <p className="mt-1 text-[0.8rem] text-gray-500">Qty {item.quantity}</p>
                )}
              </div>
              <p className="font-medium text-ink shrink-0">{formatPrice(item.total)}</p>
            </div>
          ))}
        </section>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12 items-start" noValidate>
          <div className="space-y-8">
            <section>
              <h2 className="eyebrow text-crimson">Your details</h2>
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <label className="sm:col-span-2">
                  <span className={fieldLabel}>Full name</span>
                  <input className={field} autoComplete="name" placeholder="e.g. Ayesha Khan" {...register('fullName', { required: 'Please enter your name', validate: (v) => v.trim().length >= 2 || 'Please enter your name' })} />
                  {errors.fullName && <p className={errorText}>{errors.fullName.message}</p>}
                </label>
                <label>
                  <span className={fieldLabel}>Phone</span>
                  <input className={field} type="tel" inputMode="tel" autoComplete="tel" placeholder="03XX XXXXXXX" {...register('phone', { required: 'Please enter your phone number', pattern: { value: /^(\+92|0)?3\d{2}[\s-]?\d{7}$/, message: 'Enter a Pakistani mobile number, e.g. 0300 1234567' } })} />
                  {errors.phone && <p className={errorText}>{errors.phone.message}</p>}
                </label>
                <label>
                  <span className={fieldLabel}>Email</span>
                  <input className={field} type="email" autoComplete="email" placeholder="you@example.com" {...register('email', { required: 'Please enter your email', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Please enter a valid email' } })} />
                  {errors.email && <p className={errorText}>{errors.email.message}</p>}
                </label>
                <label>
                  <span className={fieldLabel}>City</span>
                  <input className={field} autoComplete="address-level2" placeholder="e.g. Lahore" {...register('city', { required: 'Please enter your city' })} />
                  {errors.city && <p className={errorText}>{errors.city.message}</p>}
                </label>
                <label className="sm:col-span-2">
                  <span className={fieldLabel}>Delivery address</span>
                  <input className={field} autoComplete="street-address" placeholder="House, street, area" {...register('street', { required: 'Please enter your delivery address', validate: (v) => v.trim().length >= 5 || 'Please enter your full address' })} />
                  {errors.street && <p className={errorText}>{errors.street.message}</p>}
                </label>
                <label className="sm:col-span-2">
                  <span className={fieldLabel}>Order note (optional)</span>
                  <input className={field} placeholder="e.g. call before delivery" {...register('notes')} />
                </label>
              </div>
            </section>

            <section>
              <h2 className="eyebrow text-crimson">Payment</h2>
              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const selected = paymentMethod === method.id;
                  return (
                    <label key={method.id} className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors ${selected ? 'bg-blush ring-1 ring-crimson' : 'bg-tile hover:bg-blush'}`}>
                      <input type="radio" value={method.id} className="sr-only" {...register('paymentMethod')} />
                      <Icon className={`w-5 h-5 shrink-0 ${selected ? 'text-crimson' : 'text-gray-500'}`} strokeWidth={1.5} />
                      <span>
                        <span className="block text-[0.88rem] font-medium text-ink">{method.name}</span>
                        <span className="block text-[0.75rem] text-gray-500 leading-snug">{method.description}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {account && (
                <div className="mt-4">
                  <ManualPaymentCard account={account} amountLabel={formatPrice(total)} />
                </div>
              )}
            </section>
          </div>

          <aside className="bg-tile p-6 lg:sticky lg:top-32 space-y-3 text-[0.92rem]">
            <h2 className="eyebrow text-ink">Order summary</h2>
            <div className="flex justify-between text-gray-600 pt-2"><span>Subtotal</span><span className="text-ink">{formatPrice(originalSubtotal)}</span></div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-crimson"><span>Discount</span><span>-{formatPrice(totalDiscount)}</span></div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span className="text-ink">{calculatedShipping === null ? 'Enter your city' : calculatedShipping === 0 ? 'Free' : formatPrice(calculatedShipping)}</span>
            </div>
            <div className="flex justify-between text-[1.1rem] font-medium text-ink pt-3 border-t border-line">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            {error && <p className="text-[0.85rem] text-crimson bg-white px-3 py-2">{error}</p>}

            <Button type="submit" className="w-full h-12 mt-2" loading={isProcessing}>
              Place order
            </Button>
            <p className="text-[0.75rem] text-gray-500 leading-relaxed">
              {paymentMethod === 'cod' ? `Pay ${formatPrice(total)} in cash when your order arrives. ` : ''}
              By placing your order you agree to our{' '}
              <Link href="/terms" className="underline underline-offset-2 hover:text-crimson">Terms</Link> and{' '}
              <Link href="/refunds" className="underline underline-offset-2 hover:text-crimson">Refund policy</Link>.
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
