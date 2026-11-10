import React from 'react';

export default function CategorySeoContent({ slug, name }: { slug: string; name?: string }) {
  const s = slug.toLowerCase();
  const n = (name || '').toLowerCase();

  // 1. Face Wash Category
  if (s === 'face-wash' || s.includes('wash') || n.includes('face wash')) {
    return (
      <div className="mt-16 border-t border-gray-200 pt-16 pb-8 bg-gray-50 rounded-xl px-4 md:px-8">
        <div className="container mx-auto max-w-4xl prose prose-rose">
          <h2 className="text-3xl font-serif font-bold text-black mb-6">Best Face Wash for Oily & Acne-Prone Skin in Pakistan</h2>
          <p className="text-gray-600 mb-6 text-lg">
            Finding the right cleanser is the most critical step in any skincare routine, especially if you struggle with oily, acne-prone, or sensitive skin. Our collection of premium face washes is expertly formulated to gently purify your skin, remove excess sebum, and unclog pores without causing dryness or irritation.
          </p>

          <h3 className="text-2xl font-bold text-black mb-4">Why Choose Azeeora Face Washes?</h3>
          <p className="text-gray-700 mb-6">
            Unlike harsh, stripping cleansers that damage your moisture barrier, Azeeora face washes are balanced to maintain your skin&apos;s natural pH. Whether you need a daily gentle cleanser or a targeted acne-control wash, our products contain soothing botanical extracts and active ingredients that leave your skin feeling fresh and radiant.
          </p>

          <h3 className="text-2xl font-bold text-black mb-6">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-lg text-black">Which face wash is best for acne-prone skin?</h4>
              <p className="text-gray-600">For acne-prone skin, we recommend our specialized acne control formulas that contain ingredients to unclog pores and reduce inflammation without overdrying.</p>
            </div>
            <div>
              <h4 className="font-bold text-lg text-black">Should I use face wash twice a day?</h4>
              <p className="text-gray-600">Yes, dermatologists generally recommend washing your face twice daily—once in the morning to remove overnight oils, and once at night to cleanse away makeup, dirt, and pollution.</p>
            </div>
          </div>
        </div>

        {/* SEO FAQ Schema for Face Wash Category */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Which face wash is best for acne-prone skin?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "For acne-prone skin, we recommend our specialized acne control formulas that contain ingredients to unclog pores and reduce inflammation without overdrying."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Should I use face wash twice a day?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, dermatologists generally recommend washing your face twice daily—once in the morning to remove overnight oils, and once at night to cleanse away makeup, dirt, and pollution."
                  }
                }
              ]
            })
          }}
        />
      </div>
    );
  }

  // 2. Hair Care Category
  if (s.includes('hair') || n.includes('hair')) {
    return (
      <div className="mt-16 border-t border-gray-200 pt-16 pb-8 bg-gray-50 rounded-xl px-4 md:px-8">
        <div className="container mx-auto max-w-4xl prose prose-rose">
          <h2 className="text-3xl font-serif font-bold text-black mb-6">Best Hair Care Products & Serums in Pakistan</h2>
          <p className="text-gray-600 mb-6 text-lg">
            Discover Azeeora&apos;s luxury hair care range, designed specifically to repair and nourish hair exposed to Pakistan&apos;s heat, dust, and humidity. From intensive hair growth serums to frizz control remedies, our products revive dull, damaged locks into soft, silky, and voluminous hair.
          </p>

          <h3 className="text-2xl font-bold text-black mb-4">Why Invest in Dedicated Hair Serums?</h3>
          <p className="text-gray-700 mb-6">
            Hair serums provide a protective shield against heat styling and humidity while delivering concentrated botanical oils right to weak roots and brittle ends. Regular application ensures faster hair growth, reduced hair fall, and all-day manageability.
          </p>

          <h3 className="text-2xl font-bold text-black mb-6">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-lg text-black">Which is the best hair serum in Pakistan for frizz?</h4>
              <p className="text-gray-600">Azeeora Hair Growth Serum is specially formulated to lock out humidity and smooth the hair cuticle, eliminating frizz without any greasy residue.</p>
            </div>
            <div>
              <h4 className="font-bold text-lg text-black">Can I use hair care serums on coloured or treated hair?</h4>
              <p className="text-gray-600">Yes! Our formula is safe, sulfate-free, and paraben-free, making it ideal for chemically treated and colored hair.</p>
            </div>
          </div>
        </div>

        {/* SEO FAQ Schema for Hair Care Category */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Which is the best hair serum in Pakistan for frizz?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Azeeora Hair Growth Serum is specially formulated to lock out humidity and smooth the hair cuticle, eliminating frizz without any greasy residue."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I use hair care serums on coloured or treated hair?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! Our formula is safe, sulfate-free, and paraben-free, making it ideal for chemically treated and colored hair."
                  }
                }
              ]
            })
          }}
        />
      </div>
    );
  }

  // 3. Skincare Category
  if (s.includes('skin') || n.includes('skincare')) {
    return (
      <div className="mt-16 border-t border-gray-200 pt-16 pb-8 bg-gray-50 rounded-xl px-4 md:px-8">
        <div className="container mx-auto max-w-4xl prose prose-rose">
          <h2 className="text-3xl font-serif font-bold text-black mb-6">Best Skincare & Whitening Products in Pakistan</h2>
          <p className="text-gray-600 mb-6 text-lg">
            Elevate your beauty ritual with Azeeora Skincare. Formulated with dermatologically tested actives, our collection of beauty creams, facial cleansers, and skin polish kits works in harmony with Pakistani skin to restore radiance, eliminate dark spots, and reveal your natural, healthy glow.
          </p>

          <h3 className="text-2xl font-bold text-black mb-4">Clean, Safe Beauty for Every Skin Type</h3>
          <p className="text-gray-700 mb-6">
            All Azeeora skincare formulations are 100% free from mercury, steroids, and harmful bleaches. Experience genuine, lasting skin rejuvenation backed by science and nature.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
