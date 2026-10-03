import PersonEditor from '@components/PersonEditor/PersonEditor';
import { redirect } from 'next/navigation';
import { getCurrentAccount } from '@/lib/session';
export default async function NewPersonPage() {
  if (!(await getCurrentAccount())) redirect('/login');
  return <PersonEditor />;
}