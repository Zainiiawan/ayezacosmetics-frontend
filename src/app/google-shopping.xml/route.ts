import { generateGoogleMerchantFeedXml } from '@/lib/googleMerchantFeed';

export const revalidate = 3600;

export async function GET() {
  const xml = await generateGoogleMerchantFeedXml();

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
