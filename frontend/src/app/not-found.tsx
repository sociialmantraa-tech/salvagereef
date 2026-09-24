'use client';

import dynamic from 'next/dynamic';

const NextAppShell = dynamic(() => import('@/components/NextAppShell'), {
  ssr: false,
});

export default function NotFound() {
  return <NextAppShell />;
}
