'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include', // ✅ Ensures cookies are included
      });

      // ✅ Redirect to login after successful logout
      router.push('/login');
    };

    logout();
  }, [router]);

  return <p>Logging out...</p>; // Optional loading message
}
