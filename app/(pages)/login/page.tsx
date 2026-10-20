import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Sign in | Caelum' };

export default async function LoginPage() {
  redirect('/?login=true');
}
