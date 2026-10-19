'use client';

/** Floating "order on WhatsApp" button: how many Pakistani shoppers prefer to ask before buying. */
export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/923060466911?text=Assalam%20o%20Alaikum%2C%20I%20have%20a%20question%20about%20AZEEORA"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 group flex items-center gap-2 rounded-full bg-[#1f8f4e] text-white shadow-[0_14px_30px_-10px_rgba(0,0,0,0.45)] pl-3.5 pr-3.5 sm:pr-5 py-3.5 hover:bg-[#187a42] transition-colors"
    >
      <svg viewBox="0 0 32 32" className="w-6 h-6 fill-current" aria-hidden>
        <path d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.4.7 4.7 1.9 6.7L3 29l6.9-2.2c1.9 1 4 1.6 6.1 1.6 7 0 12.7-5.6 12.7-12.6S23 3 16 3zm0 23.1c-2 0-3.9-.6-5.6-1.6l-.4-.2-4.1 1.3 1.3-4-.3-.4c-1.1-1.7-1.7-3.7-1.7-5.7C5.2 10 10 5.2 16 5.2S26.8 10 26.8 15.8 22 26.1 16 26.1zm5.9-7.7c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.7s1.2 3.2 1.4 3.4c.2.2 2.4 3.6 5.7 5 .8.3 1.4.5 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z" />
      </svg>
      <span className="hidden sm:inline text-sm font-semibold">Order on WhatsApp</span>
    </a>
  );
}
