import { redirect } from 'next/navigation';

export default function NotificationsPageRedirect() {
  redirect('/account/notifications');
}
