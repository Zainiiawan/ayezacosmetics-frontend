'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h2 className="text-4xl font-serif text-black mb-4">Something went wrong!</h2>
          <p className="text-gray-600 mb-8">
            An unexpected error has occurred. Our team has been notified.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => reset()}
              className="inline-block bg-white text-black border border-black px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-block bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-900 transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
