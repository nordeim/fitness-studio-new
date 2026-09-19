import { permanentRedirect } from 'next/navigation'

/** The source app serves legal pages at /terms — moved in this repo, redirect forever. */
export default function LegacyTermsPage() {
  permanentRedirect('/terms')
}
