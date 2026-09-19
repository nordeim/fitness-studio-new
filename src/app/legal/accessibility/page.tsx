import { permanentRedirect } from 'next/navigation'

/** The source app serves legal pages at /accessibility — moved in this repo, redirect forever. */
export default function LegacyAccessibilityPage() {
  permanentRedirect('/accessibility')
}
