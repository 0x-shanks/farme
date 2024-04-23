'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const RedirectHome = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, []);
  return <></>;
};
