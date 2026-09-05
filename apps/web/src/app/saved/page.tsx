import { redirect } from 'next/navigation';

export default function SavedPageRedirect() {
  redirect('/account/saved');
}
