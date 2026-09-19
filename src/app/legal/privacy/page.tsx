import { permanentRedirect } from 'next/navigation'

/** The source app serves legal pages at /privacy — moved in this repo, redirect forever. */
export default function LegacyPrivacyPage() {
  permanentRedirect('/privacy')
}
