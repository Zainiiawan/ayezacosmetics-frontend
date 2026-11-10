import React from 'react';

export default function ProductSeoContent({ slug }: { slug: string }) {
  const s = slug.toLowerCase();

  // 1. Beauty Cream / Whitening Cream
  if (s.includes('cream') || s.includes('whitening')) {
    return (
      <div className="mt-16 border-t border-gray-200 pt-16 pb-8">
        <div className="container mx-auto px-4 max-w-4xl prose prose-rose">
          <h2 className="text-3xl font-serif font-bold text-black mb-6">
            The Best Whitening Cream in Pakistan for Radiant, Glowing Skin
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            Experience the ultimate transformation with <strong>Azeeora Beauty Cream</strong>. Recognized as one of the best whitening creams in Pakistan, this rich formula targets dark spots, stubborn hyperpigmentation, uneven skin tone, and dullness to reveal a bright, natural glow. Formulated safely without harmful bleaching agents or mercury, our cream delivers visible, enduring results.
          </p>

          <div className="grid md:grid-cols-2 gap-8 my-10">
            <div className="bg-rose-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-black mb-4">Key Benefits</h3>
              <ul className="space-y-3 text-gray-700">
                <li>✨ Rapidly brightens and evens out skin complexion</li>
                <li>✨ Fades acne scars, dark spots and melasma</li>
                <li>✨ Deeply hydrates and repairs moisture barrier overnight</li>
                <li>✨ Protects against harsh environmental pollution & UV damage</li>
                <li>✨ 100% Mercury-Free, Steroid-Free and Dermatologically Tested</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-black mb-4">Who is it suitable for?</h3>
              <p className="text-gray-700">
                Azeeora Beauty Cream is specially formulated for Pakistani skin and weather conditions. Suitable for normal, dry, oily, and combination skin types. Its lightweight, non-sticky texture absorbs smoothly without clogging pores.
              </p>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-black mb-4">How to Use for Best Results</h3>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700 mb-10">
            <li>Cleanse your face thoroughly with Azeeora Radiance Face Wash and pat dry.</li>
            <li>Take a pea-sized amount of Azeeora Beauty Cream onto your fingertips.</li>
            <li>Gently massage across face and neck using upward circular motions.</li>
            <li>Apply nightly before sleep, and follow with sunscreen during daytime.</li>
          </ol>

          <h3 className="text-2xl font-bold text-black mb-6">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-lg text-black">Is Azeeora the best whitening cream without side effects?</h4>
              <p className="text-gray-600">Yes! Azeeora Beauty Cream is 100% free from mercury, hydroquinone, steroids, and harsh bleach. We use safe active ingredients that nourish and brighten naturally without thinning the skin.</p>
            </div>
            <div>
              <h4 className="font-bold text-lg text-black">How long does it take to see visible results?</h4>
              <p className="text-gray-600">Most customers notice a clearer, brighter complexion with enhanced hydration in 7 to 14 days of consistent night use.</p>
            </div>
            <div>
              <h4 className="font-bold text-lg text-black">Can men also use Azeeora Beauty Cream?</h4>
              <p className="text-gray-600">Absolutely. Azeeora Beauty Cream works effectively for both men and women struggling with sun tan, dullness, or dark spots.</p>
            </div>
          </div>
        </div>

        {/* SEO FAQ Schema for Beauty Cream */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Is Azeeora the best whitening cream without side effects?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! Azeeora Beauty Cream is 100% free from mercury, hydroquinone, steroids, and harsh bleach. We use safe active ingredients that nourish and brighten naturally without thinning the skin."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How long does it take to see visible results?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Most customers notice a clearer, brighter complexion with enhanced hydration in 7 to 14 days of consistent night use."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can men also use Azeeora Beauty Cream?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Absolutely. Azeeora Beauty Cream works effectively for both men and women struggling with sun tan, dullness, or dark spots."
                  }
                }
              ]
            })
          }}
        />
      </div>
    );
  }

  // 2. Hair Serum / Hair Care
  if (s.includes('hair') || s.includes('serum')) {
    return (
      <div className="mt-16 border-t border-gray-200 pt-16 pb-8">
        <div className="container mx-auto px-4 max-w-4xl prose prose-rose">
          <h2 className="text-3xl font-serif font-bold text-black mb-6">
            The Best Hair Serum in Pakistan for Frizz Control & Fast Growth
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            Say goodbye to dull, frizzy, and unmanageable hair with <strong>Azeeora Hair Growth Serum (30ml)</strong>. Formulated with premium natural botanical oils and active nutrients, this lightweight oil serum penetrates deep into hair follicles to reduce breakage, stimulate new growth, and provide an all-day glass-like shine.
          </p>

          <div className="grid md:grid-cols-2 gap-8 my-10">
            <div className="bg-rose-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-black mb-4">Key Benefits</h3>
              <ul className="space-y-3 text-gray-700">
                <li>✨ Controls stubborn frizz and humidity puffiness instantly</li>
                <li>✨ Strengthens roots and stimulates healthy hair follicle growth</li>
                <li>✨ Restores radiant shine to dull, heat-damaged hair</li>
                <li>✨ Heat protectant for styling, blow-drying, and straightening</li>
                <li>✨ Non-sticky, lightweight oil formula that won&apos;t weigh hair down</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-black mb-4">Suitable for All Hair Types</h3>
              <p className="text-gray-700">
                Perfect for dry, curly, chemically treated, or colored hair. Designed to withstand Pakistan&apos;s humid summers and dry winters, protecting your locks from heat and environmental pollutants.
              </p>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-black mb-4">How to Apply Hair Serum</h3>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700 mb-10">
            <li>Wash your hair and gently towel dry until damp.</li>
            <li>Take 2 to 4 drops of Azeeora Hair Serum onto your palm and rub hands together.</li>
            <li>Evenly distribute through mid-lengths and ends of hair.</li>
            <li>For scalp nourishment, gently massage a few drops into the roots before bedtime.</li>
          </ol>

          <h3 className="text-2xl font-bold text-black mb-6">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-lg text-black">Which is the best hair serum in Pakistan for frizzy hair?</h4>
              <p className="text-gray-600">Azeeora Hair Growth Serum is rated as one of the best hair serums in Pakistan because it controls humidity-induced frizz while delivering essential nourishment for long-term hair growth.</p>
            </div>
            <div>
              <h4 className="font-bold text-lg text-black">Can I use Azeeora Hair Serum on dry hair?</h4>
              <p className="text-gray-600">Yes! While applying to damp hair seals in moisture best, applying a drop to dry hair provides an instant shine boost and tames flyaways.</p>
            </div>
            <div>
              <h4 className="font-bold text-lg text-black">Does this serum make hair greasy?</h4>
              <p className="text-gray-600">No. Azeeora Hair Serum has a quick-absorbing, lightweight texture that leaves hair soft, silky, and bouncy without any heavy greasy buildup.</p>
            </div>
          </div>
        </div>

        {/* SEO FAQ Schema for Hair Serum */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Which is the best hair serum in Pakistan for frizzy hair?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Azeeora Hair Growth Serum is rated as one of the best hair serums in Pakistan because it controls humidity-induced frizz while delivering essential nourishment for long-term hair growth."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I use Azeeora Hair Serum on dry hair?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! While applying to damp hair seals in moisture best, applying a drop to dry hair provides an instant shine boost and tames flyaways."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Does this serum make hair greasy?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. Azeeora Hair Serum has a quick-absorbing, lightweight texture that leaves hair soft, silky, and bouncy without any heavy greasy buildup."
                  }
                }
              ]
            })
          }}
        />
      </div>
    );
  }

  // 3. Glutathione Skin Polish Kit
  if (s.includes('polish')) {
    return (
      <div className="mt-16 border-t border-gray-200 pt-16 pb-8">
        <div className="container mx-auto px-4 max-w-4xl prose prose-rose">
          <h2 className="text-3xl font-serif font-bold text-black mb-6">
            Best Glutathione Skin Polish Kit in Pakistan for Instant Glow
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            Get salon-quality facial results at home with the <strong>Azeeora Glutathione Skin Polish Kit</strong>. Combining a gentle 20 Vol Oxidizing Emulsion with ultra-fine Dust-Free Blonder Powder, this duo lifts sun tan, dead skin cells, and impurities for an instant, radiant, glass-skin glow.
          </p>

          <div className="grid md:grid-cols-2 gap-8 my-10">
            <div className="bg-rose-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-black mb-4">Key Benefits</h3>
              <ul className="space-y-3 text-gray-700">
                <li>✨ Instant facial glow and skin brightening in just 15 minutes</li>
                <li>✨ Non-irritating Dust-Free formula protects airways during mixing</li>
                <li>✨ Enriched with Glutathione for deep cellular radiance</li>
                <li>✨ Eliminates sun tan, dead skin, and surface dullness</li>
                <li>✨ Ideal for special occasions, bridal preparation, and monthly rituals</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-black mb-4">Salon Quality at Home</h3>
              <p className="text-gray-700">
                Formulated with precision so you can achieve professional salon glow in the comfort of your home without the harsh burning or redness associated with cheap bleach powders.
              </p>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-black mb-4">How to Use Skin Polish Kit</h3>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700 mb-10">
            <li>Mix 2 parts Oxidizing Emulsion with 1 part Blonder Powder in a non-metallic bowl.</li>
            <li>Blend smoothly until a creamy paste forms.</li>
            <li>Apply evenly across face and neck, avoiding the delicate eye area and eyebrows.</li>
            <li>Leave on for 12 to 15 minutes, then rinse off thoroughly with cool water.</li>
            <li>Follow with Azeeora Beauty Cream or soothing moisturizer.</li>
          </ol>

          <h3 className="text-2xl font-bold text-black mb-6">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-lg text-black">Does this skin polish cause redness or burning?</h4>
              <p className="text-gray-600">Azeeora Skin Polish is formulated with soothing conditioning agents to minimize irritation. We always recommend performing a 24-hour patch test behind your ear before full facial application.</p>
            </div>
            <div>
              <h4 className="font-bold text-lg text-black">How often can I use the skin polish?</h4>
              <p className="text-gray-600">Using the kit once every 2 to 3 weeks is recommended to maintain a fresh, bright complexion without over-exfoliating.</p>
            </div>
          </div>
        </div>

        {/* SEO FAQ Schema for Skin Polish */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Does this skin polish cause redness or burning?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Azeeora Skin Polish is formulated with soothing conditioning agents to minimize irritation. We always recommend performing a 24-hour patch test behind your ear before full facial application."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How often can I use the skin polish?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Using the kit once every 2 to 3 weeks is recommended to maintain a fresh, bright complexion without over-exfoliating."
                  }
                }
              ]
            })
          }}
        />
      </div>
    );
  }

  // 4. Face Wash / Cleanser
  if (s.includes('wash') || s.includes('face')) {
    return (
      <div className="mt-16 border-t border-gray-200 pt-16 pb-8">
        <div className="container mx-auto px-4 max-w-4xl prose prose-rose">
          <h2 className="text-3xl font-serif font-bold text-black mb-6">
            The Best Face Wash in Pakistan for Glowing, Clear & Acne-Free Skin
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            Start and end your day right with the <strong>Azeeora Radiance Face Wash (100ml)</strong>. Specially designed for Pakistani weather, this sulfate-free cleanser removes stubborn dirt, sweat, and excess sebum without stripping the skin of its essential moisture.
          </p>

          <div className="grid md:grid-cols-2 gap-8 my-10">
            <div className="bg-rose-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-black mb-4">Key Benefits</h3>
              <ul className="space-y-3 text-gray-700">
                <li>✨ Deeply purifies pores to prevent blackheads and acne breakouts</li>
                <li>✨ Powered by Niacinamide (Vitamin B3) for oil regulation & dark spot reduction</li>
                <li>✨ Aloe Vera & Vitamin B5 calm irritation and maintain barrier hydration</li>
                <li>✨ 100% Sulfate-Free, Paraben-Free, gentle for twice-daily cleansing</li>
                <li>✨ Leaves skin feeling instantly refreshed, balanced, and radiant</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-black mb-4">Who is it suitable for?</h3>
              <p className="text-gray-700">
                Ideal for all skin types, including sensitive, oily, and acne-prone skin. Its gentle formulation ensures a thorough clean without compromising your delicate skin barrier.
              </p>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-black mb-4">How to Use</h3>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700 mb-10">
            <li>Dampen your face with lukewarm water.</li>
            <li>Take a small amount of Azeeora Radiance Face Wash and work into a lather.</li>
            <li>Gently massage onto your face in circular motions for 30-60 seconds.</li>
            <li>Rinse thoroughly and pat dry with a clean towel. Follow with Azeeora Beauty Cream.</li>
          </ol>

          <h3 className="text-2xl font-bold text-black mb-6">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-lg text-black">Which is the best face wash for oily and acne-prone skin in Pakistan?</h4>
              <p className="text-gray-600">Azeeora Radiance Face Wash is formulated with Niacinamide and soothing botanical extracts, which regulate sebum production and reduce active breakouts without drying out the skin.</p>
            </div>
            <div>
              <h4 className="font-bold text-lg text-black">Does this face wash help with whitening and glowing skin?</h4>
              <p className="text-gray-600">Yes! By removing dead cells and delivering Niacinamide, regular cleansing promotes a bright, clear, and glowing complexion.</p>
            </div>
          </div>
        </div>

        {/* SEO FAQ Schema for Face Wash */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Which is the best face wash for oily and acne-prone skin in Pakistan?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Azeeora Radiance Face Wash is formulated with Niacinamide and soothing botanical extracts, which regulate sebum production and reduce active breakouts without drying out the skin."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Does this face wash help with whitening and glowing skin?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! By removing dead cells and delivering Niacinamide, regular cleansing promotes a bright, clear, and glowing complexion."
                  }
                }
              ]
            })
          }}
        />
      </div>
    );
  }

  return null;
}
