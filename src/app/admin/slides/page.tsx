'use client';

import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, ArrowDown, ArrowUp, Edit2, Eye, EyeOff, ImagePlus, Plus, Trash2, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { slideApi, Slide, SlideImage } from '@/lib/api/slideApi';
import { mediaApi } from '@/lib/api/mediaApi';
import { productApi } from '@/lib/api/productApi';
import { revalidateSlidesCache } from '@/app/actions/revalidate';

interface FormState {
  image: SlideImage | null;
  mobileImage: SlideImage | null;
  title: string;
  subtitle: string;
  buttonText: string;
  link: string;
  isActive: boolean;
}

const EMPTY: FormState = { image: null, mobileImage: null, title: '', subtitle: '', buttonText: '', link: '', isActive: true };

const errorText = (e: unknown) =>
  (e as { response?: { status?: number; data?: { message?: string } } })?.response?.status === 404
    ? 'The slides feature is not on the server yet. Deploy the latest backend on Render, then try again.'
    : (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Something went wrong. Please try again.';

function ImagePicker({
  label,
  hint,
  value,
  onChange,
  wide,
}: {
  label: string;
  hint: string;
  value: SlideImage | null;
  onChange: (img: SlideImage | null) => void;
  wide?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const pick = async (file?: File) => {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const [uploaded] = await mediaApi.upload([file]);
      onChange({ url: uploaded.url, publicId: uploaded.publicId });
    } catch (e) {
      setError(errorText(e));
    } finally {
      setUploading(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div>
      <p className="text-sm font-medium text-gray-800">{label}</p>
      <p className="text-xs text-gray-500 mb-2">{hint}</p>
      <div className={`relative bg-gray-50 border border-dashed border-gray-300 rounded-lg overflow-hidden ${wide ? 'aspect-[12/5]' : 'aspect-square max-w-[220px]'}`}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.url} alt="" className="w-full h-full object-cover" />
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-rose-gold">
            <ImagePlus className="w-7 h-7" />
            <span className="text-sm">{uploading ? 'Uploading…' : 'Choose image'}</span>
          </button>
        )}
      </div>
      <div className="mt-2 flex gap-3 text-sm">
        {value && (
          <>
            <button type="button" onClick={() => input.current?.click()} className="text-rose-gold hover:underline" disabled={uploading}>
              {uploading ? 'Uploading…' : 'Change'}
            </button>
            <button type="button" onClick={() => onChange(null)} className="text-gray-500 hover:text-red-600">
              Remove
            </button>
          </>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} aria-label={label} />
    </div>
  );
}

export default function AdminSlidesPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [formError, setFormError] = useState('');

  const { data: slides = [], isLoading, error } = useQuery({ queryKey: ['admin-slides'], queryFn: slideApi.getAll, retry: false });
  const { data: productData } = useQuery({ queryKey: ['admin-slide-products'], queryFn: () => productApi.getAll({ limit: 100 }) });
  const products = productData?.products ?? [];

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin-slides'] });
    await queryClient.invalidateQueries({ queryKey: ['home-slides'] });
    await revalidateSlidesCache();
  };

  const close = () => {
    setEditing(null);
    setForm(EMPTY);
    setFormError('');
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!form.image) throw new Error('Please add the slide image first.');
      const data = {
        image: form.image,
        mobileImage: form.mobileImage,
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        buttonText: form.buttonText.trim(),
        link: form.link.trim(),
        isActive: form.isActive,
      };
      return editing === 'new' ? slideApi.create(data) : slideApi.update(editing as string, data);
    },
    onSuccess: async () => {
      close();
      await refresh();
    },
    onError: (e) => setFormError(e instanceof Error && !('response' in e) ? e.message : errorText(e)),
  });

  const toggle = useMutation({
    mutationFn: (s: Slide) => slideApi.update(s._id, { isActive: !s.isActive }),
    onSuccess: refresh,
    onError: (e) => alert(errorText(e)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => slideApi.delete(id),
    onSuccess: refresh,
    onError: (e) => alert(errorText(e)),
  });

  const reorder = useMutation({
    mutationFn: (ids: string[]) => slideApi.reorder(ids),
    onSuccess: refresh,
    onError: (e) => alert(errorText(e)),
  });

  const move = (i: number, step: number) => {
    const ids = slides.map((s) => s._id);
    const j = i + step;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    reorder.mutate(ids);
  };

  const startEdit = (s: Slide) => {
    setEditing(s._id);
    setFormError('');
    setForm({
      image: s.image,
      mobileImage: s.mobileImage ?? null,
      title: s.title ?? '',
      subtitle: s.subtitle ?? '',
      buttonText: s.buttonText ?? '',
      link: s.link ?? '',
      isActive: s.isActive,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const field = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-rose-gold';

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/admin" className="text-gray-500 hover:text-black" aria-label="Back to dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-2xl font-serif font-bold text-black">Slides</h1>
              <p className="text-sm text-gray-500">The big slideshow at the top of the homepage</p>
            </div>
          </div>
          {editing === null && (
            <Button
              onClick={() => {
                setEditing('new');
                setForm(EMPTY);
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Add slide
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
        <p className="text-sm text-gray-600 bg-white rounded-xl shadow-sm p-4">
          Slides you add here show first, in this order, and change every 6 seconds. While there are none, the homepage shows a slide for each product
          automatically. Below the slideshow, every product also gets its own slide with its photo, uses and benefits, taken from the product details.
        </p>

        {editing !== null && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing === 'new' ? 'New slide' : 'Edit slide'}</h2>
              <button type="button" onClick={close} className="p-1.5 text-gray-500 hover:text-black" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <ImagePicker
              wide
              label="Slide image (required)"
              hint="Wide banner for laptops and tablets. Best size 1920 × 800 px."
              value={form.image}
              onChange={(image) => setForm((f) => ({ ...f, image }))}
            />
            <ImagePicker
              label="Phone image (optional)"
              hint="Square image for phones, 1080 × 1080 px. Without it, phones show the slide image in full."
              value={form.mobileImage}
              onChange={(mobileImage) => setForm((f) => ({ ...f, mobileImage }))}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-800">Heading (optional)</span>
                <input className={`${field} mt-1`} value={form.title} maxLength={120} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Eid glow sale" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-800">Button text (optional)</span>
                <input className={`${field} mt-1`} value={form.buttonText} maxLength={40} onChange={(e) => setForm((f) => ({ ...f, buttonText: e.target.value }))} placeholder="e.g. Shop now" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-gray-800">Short text (optional)</span>
                <textarea className={`${field} mt-1`} rows={2} value={form.subtitle} maxLength={300} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="One line shown under the heading" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-gray-800">When someone taps the slide, open</span>
                <select
                  className={`${field} mt-1`}
                  value={products.some((p) => `/products/${p.slug}` === form.link) || ['', '/shop', '/offers', '/categories'].includes(form.link) ? form.link : '__custom'}
                  onChange={(e) => setForm((f) => ({ ...f, link: e.target.value === '__custom' ? f.link || '/' : e.target.value }))}
                >
                  <option value="">Nothing (image only)</option>
                  <option value="/shop">Shop, all products</option>
                  <option value="/offers">Offers</option>
                  <option value="/categories">Categories</option>
                  {products.map((p) => (
                    <option key={p._id} value={`/products/${p.slug}`}>
                      Product: {p.name}
                    </option>
                  ))}
                  <option value="__custom">Another page or web address…</option>
                </select>
                {!(products.some((p) => `/products/${p.slug}` === form.link) || ['', '/shop', '/offers', '/categories'].includes(form.link)) && (
                  <input className={`${field} mt-2`} value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} placeholder="/categories/face-wash or https://…" />
                )}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                Show on the homepage
              </label>
            </div>

            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div className="flex gap-3">
              <Button onClick={() => save.mutate()} disabled={save.isPending || !form.image}>
                {save.isPending ? 'Saving…' : 'Save slide'}
              </Button>
              <Button variant="outline" onClick={close}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">Loading slides…</div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-600">{errorText(error)}</div>
        ) : slides.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No slides yet, so the homepage shows a slide for each product. Press <span className="font-medium">Add slide</span> to upload your own.
          </div>
        ) : (
          <ul className="space-y-3">
            {slides.map((s, i) => (
              <li key={s._id} className="bg-white rounded-xl shadow-sm p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image.url} alt="" className={`w-full sm:w-56 aspect-[12/5] object-cover rounded-lg ${s.isActive ? '' : 'opacity-40'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-black truncate">{s.title || `Slide ${i + 1}`}</p>
                  <p className="text-xs text-gray-500 truncate">{s.link ? `Opens ${s.link}` : 'Image only'}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {s.isActive ? 'Showing' : 'Hidden'}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0 || reorder.isPending} className="p-2 text-gray-500 hover:text-black disabled:opacity-30" title="Move up" aria-label="Move up">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === slides.length - 1 || reorder.isPending} className="p-2 text-gray-500 hover:text-black disabled:opacity-30" title="Move down" aria-label="Move down">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => toggle.mutate(s)} className="p-2 text-gray-500 hover:text-black" title={s.isActive ? 'Hide' : 'Show'} aria-label={s.isActive ? 'Hide slide' : 'Show slide'}>
                    {s.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button type="button" onClick={() => startEdit(s)} className="p-2 text-gray-500 hover:text-rose-gold" title="Edit" aria-label="Edit slide">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => window.confirm('Delete this slide?') && remove.mutate(s._id)}
                    className="p-2 text-gray-500 hover:text-red-600"
                    title="Delete"
                    aria-label="Delete slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
