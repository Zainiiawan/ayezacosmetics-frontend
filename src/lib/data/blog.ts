export interface FAQ {
  question: string;
  answer: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML string
  featuredImage: { url: string; alt: string };
  author: string;
  publishDate: string;
  readingTime: string; // e.g., '5 min read'
  categories: string[];
  tags: string[];
  faqs?: FAQ[];
}

// Posts only recommend and link products AZEEORA actually sells.
export const blogPosts: BlogPost[] = [
  {
    slug: "ultimate-skincare-routine-for-glowing-skin",
    title: "A Simple Skincare Routine for Glowing Skin",
    excerpt: "Glowing skin is less about a long shelf of products and more about a few steps done every day. Here is a routine that works for Pakistani weather.",
    content: `
      <h2>Start with the basics</h2>
      <p>Healthy, glowing skin comes from consistency: cleansing, moisturising and protecting from the sun, every single day. A short routine you actually follow beats a long one you skip.</p>

      <h2>Step 1: Cleanse, morning and night</h2>
      <p>Heat, sweat and city dust settle on the skin through the day. A gentle cleanser removes them without stripping the skin's natural moisture. Our <a href="/products/ayeza-radiance-face-wash" class="text-crimson font-medium underline underline-offset-4">AZEEORA Radiance Face Wash</a> is sulfate-free and made with niacinamide, aloe vera and vitamin B5, so it cleans thoroughly while staying gentle.</p>

      <h2>Step 2: Moisturise</h2>
      <p>Every skin type needs moisture, oily skin included. Skipping it can leave skin feeling tight and looking dull. Smooth a small amount of <a href="/products/ayeza-beauty-cream" class="text-crimson font-medium underline underline-offset-4">AZEEORA Beauty Cream</a> over clean skin to keep it soft and comfortable.</p>

      <h2>Step 3: Sunscreen, every morning</h2>
      <p>Pakistan's sun is strong for most of the year. Finish your morning routine with a broad-spectrum sunscreen of SPF 30 or higher, and reapply if you are outdoors for long.</p>

      <h2>Give it time</h2>
      <p>Skin renews itself over about four weeks, so give any routine at least a month before judging the results. Always patch-test a new product on your inner arm first.</p>
    `,
    featuredImage: { url: "/blog/cover-routine.jpg", alt: "A simple daily skincare routine" },
    author: "AZEEORA Skincare Team",
    publishDate: "2026-08-01",
    readingTime: "4 min read",
    categories: ["Skincare Routine"],
    tags: ["Glowing Skin", "Routine", "Daily Care"],
    faqs: [{ question: "How often should I use AZEEORA Radiance Face Wash?", answer: "Twice a day, once in the morning and once at night, is ideal for most skin types." }, { question: "Do I need sunscreen if I stay indoors?", answer: "Daylight through windows still reaches your skin, so a light sunscreen is a good habit on most days." }],
  },
  {
    slug: "benefits-of-niacinamide-for-clear-skin",
    title: "Niacinamide: Why This Ingredient Is Everywhere",
    excerpt: "Niacinamide (vitamin B3) is one of the most popular skincare ingredients today. Here is what it does and how to use it in your routine.",
    content: `
      <h2>What is niacinamide?</h2>
      <p>Niacinamide, also called vitamin B3, is a well-tolerated skincare ingredient that suits most skin types. It is popular because it is gentle and pairs easily with other products.</p>

      <h2>Why people love it</h2>
      <ul>
        <li><strong>Balance:</strong> it is often used in routines for oily and combination skin.</li>
        <li><strong>Even-looking tone:</strong> regular use is associated with a brighter, more even-looking complexion.</li>
        <li><strong>Comfort:</strong> it is generally gentle, which makes it a good everyday ingredient.</li>
      </ul>

      <h2>An easy way to use it</h2>
      <p>The simplest way to bring niacinamide into your routine is through your cleanser. <a href="/products/ayeza-radiance-face-wash" class="text-crimson font-medium underline underline-offset-4">AZEEORA Radiance Face Wash</a> includes niacinamide alongside aloe vera and vitamin B5, so it fits into the step you already do twice a day. Follow with a moisturiser such as <a href="/products/ayeza-beauty-cream" class="text-crimson font-medium underline underline-offset-4">AZEEORA Beauty Cream</a>.</p>

      <h2>A note on patience</h2>
      <p>Skincare results build slowly. Use your routine consistently for several weeks, and patch-test any new product before using it on your face.</p>
    `,
    featuredImage: { url: "/blog/cover-niacinamide.jpg", alt: "Niacinamide in skincare" },
    author: "AZEEORA Skincare Team",
    publishDate: "2026-07-28",
    readingTime: "4 min read",
    categories: ["Ingredients"],
    tags: ["Niacinamide", "Ingredients", "Clear Skin"],
    faqs: [{ question: "Is niacinamide suitable for sensitive skin?", answer: "Niacinamide is generally well tolerated, but everyone is different. Patch-test first and stop if you notice irritation." }],
  },
  {
    slug: "how-to-choose-the-right-moisturizer",
    title: "How to Choose the Right Moisturiser for Your Skin Type",
    excerpt: "Dry, oily or combination, every skin type needs moisture. Here is how to choose the right texture for you and for the season.",
    content: `
      <h2>Why moisturising matters</h2>
      <p>A moisturiser helps your skin hold on to water and keeps it feeling soft and comfortable. Whether your skin is dry, oily or combination, it is a step worth keeping.</p>

      <h2>Dry skin</h2>
      <p>If your skin feels tight or looks flaky, especially in winter, choose a richer cream and apply it on slightly damp skin after cleansing.</p>

      <h2>Oily skin</h2>
      <p>Oily skin still needs moisture. Use a thin layer of a light cream, focusing on the cheeks and areas that feel dry, and go lighter on the T-zone in summer.</p>

      <h2>Dull-looking skin</h2>
      <p>For skin that looks tired, a nourishing cream used every night is a simple place to start. <a href="/products/ayeza-beauty-cream" class="text-crimson font-medium underline underline-offset-4">AZEEORA Beauty Cream</a> is made to keep skin soft and smooth with daily use.</p>

      <h2>Season by season</h2>
      <p>Pakistani weather changes a lot through the year. Use a little less in humid summer months and a little more when winter air turns dry. Explore our <a href="/shop" class="text-crimson font-medium underline underline-offset-4">full collection</a> to find your fit.</p>
    `,
    featuredImage: { url: "/brand/products/azeeora-beauty-cream.jpg", alt: "AZEEORA Beauty Cream" },
    author: "AZEEORA Skincare Team",
    publishDate: "2026-07-25",
    readingTime: "4 min read",
    categories: ["Skincare Routine"],
    tags: ["Moisturiser", "Hydration", "Skin Type"],
    faqs: [{ question: "Can I use a moisturiser under makeup?", answer: "Yes. Let it absorb for a few minutes first so your makeup sits smoothly." }],
  },
  {
    slug: "achieve-glass-skin-with-glow-serum",
    title: "Glass Skin: What It Means and How to Get Closer to It",
    excerpt: "\"Glass skin\" describes a smooth, clear, well-hydrated complexion. Here is a realistic routine that helps your skin look its healthiest.",
    content: `
      <h2>What is glass skin?</h2>
      <p>The term comes from Korean beauty and describes skin that looks smooth, clear and well hydrated, almost reflective. Nobody's skin is literally poreless, but a steady routine can help your skin look its healthiest.</p>

      <h2>A realistic glass skin routine</h2>
      <ol>
        <li><strong>Cleanse gently:</strong> wash with <a href="/products/ayeza-radiance-face-wash" class="text-crimson font-medium underline underline-offset-4">AZEEORA Radiance Face Wash</a> to remove sweat, dust and makeup without stripping moisture.</li>
        <li><strong>Hydrate:</strong> pat on a hydrating toner or essence if you use one.</li>
        <li><strong>Moisturise:</strong> lock in moisture with <a href="/products/ayeza-beauty-cream" class="text-crimson font-medium underline underline-offset-4">AZEEORA Beauty Cream</a>.</li>
        <li><strong>Protect:</strong> in the morning, finish with a broad-spectrum sunscreen.</li>
      </ol>

      <h2>Habits that help</h2>
      <p>Drink enough water, sleep well and avoid over-scrubbing. Healthy-looking skin is the result of small habits repeated every day.</p>
    `,
    featuredImage: { url: "/blog/cover-glass-skin.jpg", alt: "Glass skin routine" },
    author: "AZEEORA Skincare Team",
    publishDate: "2026-07-20",
    readingTime: "3 min read",
    categories: ["Beauty Trends"],
    tags: ["Glass Skin", "Radiance", "Routine"],
    faqs: [],
  },
  {
    slug: "night-vs-day-skincare-routine",
    title: "Day vs Night Skincare: Why You Need Both",
    excerpt: "Your skin needs protection during the day and care at night. Here is how to build simple morning and evening routines.",
    content: `
      <h2>Day: protect</h2>
      <p>During the day your skin faces sun, heat, dust and pollution. Keep the morning routine light and protective:</p>
      <ol>
        <li>Cleanse with <a href="/products/ayeza-radiance-face-wash" class="text-crimson font-medium underline underline-offset-4">AZEEORA Radiance Face Wash</a>.</li>
        <li>Moisturise lightly.</li>
        <li>Finish with a broad-spectrum sunscreen, SPF 30 or higher.</li>
      </ol>

      <h2>Night: nourish</h2>
      <p>At night your skin rests. Wash away the day's sweat, sunscreen and makeup with <a href="/products/ayeza-radiance-face-wash" class="text-crimson font-medium underline underline-offset-4">AZEEORA Radiance Face Wash</a>, then apply <a href="/products/ayeza-beauty-cream" class="text-crimson font-medium underline underline-offset-4">AZEEORA Beauty Cream</a> so your skin stays soft and comfortable through the night.</p>

      <h2>Keep it consistent</h2>
      <p>The best routine is the one you follow every day. Two minutes in the morning and two at night is all it takes.</p>
    `,
    featuredImage: { url: "/blog/cover-day-night.jpg", alt: "Day and night skincare" },
    author: "AZEEORA Skincare Team",
    publishDate: "2026-07-15",
    readingTime: "3 min read",
    categories: ["Skincare Routine"],
    tags: ["Day Routine", "Night Routine", "Skin Care"],
    faqs: [{ question: "Can I use the same products day and night?", answer: "Yes. A gentle cleanser and a moisturiser work at both times. The main difference is adding sunscreen in the morning." }],
  },
  {
    slug: "best-face-wash-for-oily-acne-prone-skin",
    title: "How to Choose a Face Wash for Oily Skin",
    excerpt: "Oily skin needs a cleanser that cleans well without stripping. Here is what to look for and how to wash your face properly.",
    content: `
      <h2>Why the right cleanser matters</h2>
      <p>For oily skin, a cleanser that is too harsh can leave the skin feeling tight and uncomfortable, while one that is too mild may not remove sweat and excess oil. You want something in between.</p>

      <h2>What to look for</h2>
      <ul>
        <li><strong>Sulfate-free:</strong> cleans without a squeaky, stripped feel.</li>
        <li><strong>Gentle ingredients:</strong> such as aloe vera and vitamin B5.</li>
        <li><strong>Suitable for daily use:</strong> you will wash your face twice a day, every day.</li>
      </ul>
      <p><a href="/products/ayeza-radiance-face-wash" class="text-crimson font-medium underline underline-offset-4">AZEEORA Radiance Face Wash</a> is sulfate-free and made with niacinamide, aloe vera and vitamin B5, and is suitable for all skin types. Browse our <a href="/categories/face-wash" class="text-crimson font-medium underline underline-offset-4">face wash collection</a>.</p>

      <h2>How to wash your face</h2>
      <p>Wet your face with lukewarm water, lather a small amount between your palms, massage gently for about 30 to 60 seconds and rinse well. Pat dry with a clean towel and follow with a moisturiser. If you have persistent acne, please consult a dermatologist.</p>
    `,
    featuredImage: { url: "/brand/products/azeeora-radiance-face-wash.jpg", alt: "AZEEORA Radiance Face Wash" },
    author: "AZEEORA Skincare Team",
    publishDate: "2026-08-15",
    readingTime: "4 min read",
    categories: ["Cleansing"],
    tags: ["Face Wash", "Oily Skin", "Cleansing"],
    faqs: [{ question: "Will this face wash dry out my skin?", answer: "AZEEORA Radiance Face Wash is sulfate-free and gentle. If your skin ever feels tight, follow with a moisturiser and wash once a day until it settles." }],
  },
];
