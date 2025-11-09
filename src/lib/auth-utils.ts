
import { headers } from 'next/headers';
import { auth } from '@/lib/auth'; // Ensure this import path is correct
import { redirect } from 'next/navigation';


export const requireAuth = async () => {

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/login');
  }

  return session;
};


export const requireUnAuth = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect('/');
  }
};
