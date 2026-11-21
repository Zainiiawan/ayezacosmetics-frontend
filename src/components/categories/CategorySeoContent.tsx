import React from 'react';

export default function CategorySeoContent({ slug, name }: { slug: string; name?: string }) {
  const s = (slug || '').toLowerCase();
  const n = (name || '').toLowerCase();

  // 1. Skincare / Whitening Cream Category (Matches 'whitening-cream', 'skin-care', 'cream', 'skincare', etc.)
  if (
    s.includes('whitening') ||
    s.includes('cream') ||
    s.includes('skin') ||
    n.includes('skin') ||
    n.includes('cream') ||
    n.includes('whitening')
  ) {
    return (
      <div className="mt-16 border-t border-gray-200 pt-16 pb-8 bg-gray-50 rounded-2xl px-6 md:px-10">
        <div className="container mx-auto max-w-4xl prose prose-rose">
          <h2 className="text-3xl font-serif font-bold text-black mb-6">
            The Ultimate Guide to Whitening Creams & Skincare in Pakistan
          </h2>
          <p className="text-gray-700 mb-6 text-base md:text-lg leading-relaxed">
            Achieving an even, radiant, and naturally luminous complexion in Pakistan requires skincare formulated specifically for our climate. With intense summer heat, high humidity, dust, pollution, and dehydrating winters, standard international products or harsh local bleaching formulas often fall short or damage the skin barrier. AZEEORA Skincare offers dermatologically balanced, steroid-free solutions that gently restore luminosity, fade stubborn dark spots, and protect against environmental stress.
          </p>

          <h3 className="text-2xl font-bold text-black mb-4">Why Choose AZEEORA Whitening & Skincare Formulations?</h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            In a market flooded with unverified beauty creams that use mercury or dangerous corticosteroids for temporary, damaging bleaching, AZEEORA stands apart with our 100% clean beauty standard:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-700">
            <li><strong>Zero Mercury & Steroids:</strong> Free from toxic bleaches, hydroquinone, and harsh chemicals that cause skin thinning and rebound redness.</li>
            <li><strong>Clinically Proven Brightening Actives:</strong> Formulated with Glutathione, Niacinamide, Alpha Arbutin, and Vitamin C that regulate tyrosinase enzyme activity at the cellular level.</li>
            <li><strong>Deep Barrier Hydration:</strong> Enriched with Hyaluronic Acid, Aloe Vera, and Provitamin B5 to prevent moisture loss in both air-conditioned and humid environments.</li>
            <li><strong>Non-Comedogenic & Breathable:</strong> Absorbs quickly without leaving a heavy, oily residue or clogging pores.</li>
          </ul>

          <h3 className="text-2xl font-bold text-black mb-4">A Dermatologist-Approved Routine for Maximum Radiance</h3>
          <ol className="list-decimal pl-6 space-y-3 mb-8 text-gray-700">
            <li><strong>Cleanse:</strong> Start with <span className="font-semibold text-black">AZEEORA Radiance Face Wash</span> to gently clear excess sebum, dirt, and pollution without stripping natural moisture.</li>
            <li><strong>Exfoliate (Weekly):</strong> Use the <span className="font-semibold text-black">AZEEORA Glutathione Skin Polish Kit</span> once or twice weekly to slough off dead skin cells and boost active penetration.</li>
            <li><strong>Nourish & Treat:</strong> In the evening, apply a dime-sized amount of <span className="font-semibold text-black">AZEEORA Beauty Cream</span> evenly across face and neck in upward circular motions.</li>
            <li><strong>Protect (Daytime):</strong> Always apply broad-spectrum sunscreen with SPF 50 during daytime hours to lock in your glow and prevent new UV-induced pigmentation.</li>
          </ol>

          <h3 className="text-2xl font-bold text-black mb-6">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <h4 className="font-bold text-base md:text-lg text-black mb-2">How long does it take to see results with AZEEORA Whitening Cream?</h4>
              <p className="text-gray-600 text-sm leading-relaxed">Most customers notice improved skin hydration and a refreshed glow within 7 to 10 days of consistent nighttime use. Significant reduction in dark spots, acne blemishes, and sun tan typically becomes visible over 3 to 4 weeks as your natural skin cells renew.</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <h4 className="font-bold text-base md:text-lg text-black mb-2">Is AZEEORA Beauty Cream safe for long-term daily use?</h4>
              <p className="text-gray-600 text-sm leading-relaxed">Yes, absolutely. Because our formula contains no mercury, steroids, or harsh bleaches, it does not thin the skin or cause rebound dark patches when you stop using it. It is designed as a gentle, nourishing daily beauty treatment.</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <h4 className="font-bold text-base md:text-lg text-black mb-2">Can this be used on sensitive or acne-prone skin?</h4>
              <p className="text-gray-600 text-sm leading-relaxed">Yes. Our non-comedogenic texture incorporates soothing botanicals and Niacinamide, which actively calms redness and helps regulate excess oil production. As with any skincare product, we recommend a 24-hour patch test prior to full application.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Hair Care Category
  if (s.includes('hair') || n.includes('hair')) {
    return (
      <div className="mt-16 border-t border-gray-200 pt-16 pb-8 bg-gray-50 rounded-2xl px-6 md:px-10">
        <div className="container mx-auto max-w-4xl prose prose-rose">
          <h2 className="text-3xl font-serif font-bold text-black mb-6">Best Hair Care Products & Growth Serums in Pakistan</h2>
          <p className="text-gray-700 mb-6 text-base md:text-lg leading-relaxed">
            Discover AZEEORA&apos;s luxury hair care range, designed specifically to repair and nourish hair exposed to Pakistan&apos;s intense heat, dust, hard water, and humidity. From intensive hair growth serums to frizz control remedies, our products revive dull, damaged locks into soft, silky, and voluminous hair.
          </p>

          <h3 className="text-2xl font-bold text-black mb-4">Why Invest in Dedicated Hair Serums?</h3>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Hair serums provide a protective shield against heat styling and humidity while delivering concentrated botanical oils right to weak roots and brittle ends. Regular application ensures faster hair growth, reduced hair fall, and all-day frizz-free manageability without leaving any sticky residue.
          </p>

          <h3 className="text-2xl font-bold text-black mb-6">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <h4 className="font-bold text-base md:text-lg text-black mb-2">Which is the best hair serum in Pakistan for frizz and hair fall?</h4>
              <p className="text-gray-600 text-sm leading-relaxed">AZEEORA Hair Growth Serum is specially formulated to lock out humidity and smooth the hair cuticle, eliminating frizz and delivering essential nutrients for root strength and new follicle growth.</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <h4 className="font-bold text-base md:text-lg text-black mb-2">Can I use hair care serums on coloured or chemically treated hair?</h4>
              <p className="text-gray-600 text-sm leading-relaxed">Yes! Our formula is safe, sulfate-free, and paraben-free, making it ideal for chemically treated, heat-styled, or colored hair.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Face Wash Category
  if (s.includes('wash') || n.includes('face wash')) {
    return (
      <div className="mt-16 border-t border-gray-200 pt-16 pb-8 bg-gray-50 rounded-2xl px-6 md:px-10">
        <div className="container mx-auto max-w-4xl prose prose-rose">
          <h2 className="text-3xl font-serif font-bold text-black mb-6">Best Face Wash for Oily & Acne-Prone Skin in Pakistan</h2>
          <p className="text-gray-700 mb-6 text-base md:text-lg leading-relaxed">
            Finding the right cleanser is the most critical step in any skincare routine, especially if you struggle with oily, acne-prone, or sensitive skin. AZEEORA Radiance Face Wash is expertly formulated to gently purify your skin, remove excess sebum, and unclog pores without causing dryness or irritation.
          </p>

          <h3 className="text-2xl font-bold text-black mb-4">Why Choose AZEEORA Face Washes?</h3>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Unlike harsh, stripping cleansers that damage your moisture barrier, AZEEORA face washes are balanced to maintain your skin&apos;s natural pH. Enriched with Niacinamide, Aloe Vera, and botanical extracts, our cleansers leave your skin feeling fresh, balanced, and radiant after every wash.
          </p>

          <h3 className="text-2xl font-bold text-black mb-6">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <h4 className="font-bold text-base md:text-lg text-black mb-2">Should I use face wash twice a day?</h4>
              <p className="text-gray-600 text-sm leading-relaxed">Yes, dermatologists recommend washing your face twice daily—once in the morning to remove overnight sebum and once at night to cleanse away makeup, dirt, and pollution.</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <h4 className="font-bold text-base md:text-lg text-black mb-2">Does this face wash help with acne blemishes?</h4>
              <p className="text-gray-600 text-sm leading-relaxed">Yes. Our formulation contains Niacinamide and clarifying extracts that help soothe active breakouts, regulate sebum, and fade post-blemish spots.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
