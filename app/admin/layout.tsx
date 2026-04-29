import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionToken } from '../../lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('mini_crm_session')?.value;
  const session = verifySessionToken(token);

  if (!session || session.role !== 'ADMIN') {
    redirect('/leads');
  }

  return <>{children}</>;
}
