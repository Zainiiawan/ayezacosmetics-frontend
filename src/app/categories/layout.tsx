import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | AZEEORA',
    default: 'All Categories | Luxury Skincare & Beauty Collections',
  },
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
