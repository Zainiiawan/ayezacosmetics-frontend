import { Suspense } from 'react';
import ActivateClient from './ActivateClient';

export const metadata = { title: 'Activate your account | Azeeora', robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ActivateClient />
    </Suspense>
  );
}
