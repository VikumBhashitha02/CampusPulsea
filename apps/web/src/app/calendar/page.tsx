import { redirect } from 'next/navigation';

export default function CalendarPageRedirect() {
  redirect('/account/calendar');
}
