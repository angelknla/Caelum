import PersonEditor from '@components/PersonEditor/PersonEditor';
import { notFound, redirect } from 'next/navigation';
import { getPerson } from '@/lib/data/personal';
import { getCurrentAccount } from '@/lib/session';
export default async function EditPersonPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentAccount())) redirect('/login');
  const person = await getPerson((await params).id);
  if (!person) notFound();
  return <PersonEditor person={person} />;
}
