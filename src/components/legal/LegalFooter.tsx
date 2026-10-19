import { STORE_CONTACT } from '@/shared/constants';

/** Who runs the store and how to reach them, shown at the end of every policy page. */
export default function LegalFooter({ updated = '19 October 2026' }: { updated?: string }) {
  return (
    <div className="mt-12 pt-6 border-t border-line text-[0.9rem] text-gray-600 space-y-1">
      <p className="font-medium text-ink">{STORE_CONTACT.name}</p>
      <p>{STORE_CONTACT.address}</p>
      <p>
        Email: <a href={`mailto:${STORE_CONTACT.email}`} className="text-crimson underline underline-offset-2">{STORE_CONTACT.email}</a> · Phone / WhatsApp:{' '}
        <a href={`tel:${STORE_CONTACT.phone.replace(/\s/g, '')}`} className="text-crimson underline underline-offset-2">{STORE_CONTACT.phone}</a>
      </p>
      <p>Customer care: {STORE_CONTACT.businessHours}</p>
      <p className="pt-2 text-[0.8rem] text-gray-500">Last updated: {updated}</p>
    </div>
  );
}
