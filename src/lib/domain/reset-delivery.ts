/**
 * Reset-link delivery decision + message construction — pure. The action
 * layer supplies the reset URL (request origin + token) and performs the
 * actual send (Resend API when configured, operator console otherwise).
 */

export type ResetDeliveryChannel = 'email' | 'operator-log'

export function chooseResetChannel(emailConfigured: boolean): ResetDeliveryChannel {
  return emailConfigured ? 'email' : 'operator-log'
}

export interface ResetEmail {
  to: string
  subject: string
  html: string
  text: string
}

export function buildResetEmail(to: string, resetUrl: string): ResetEmail {
  return {
    to,
    subject: 'Reset your AURA Studio password',
    html: [
      `<p>Hello queen,</p>`,
      `<p>We received a request to reset your AURA Studio password. This link is valid for one hour and can be used once.</p>`,
      `<p><a href="${resetUrl}">Choose a new password</a></p>`,
      `<p>If you didn't request this, you can safely ignore this email — your password stays as it is.</p>`,
      `<p>— AURA Studio</p>`,
    ].join('\n'),
    text: [
      `Hello queen,`,
      ``,
      `We received a request to reset your AURA Studio password. This link is valid for one hour and can be used once:`,
      ``,
      resetUrl,
      ``,
      `If you didn't request this, you can safely ignore this email — your password stays as it is.`,
      ``,
      `— AURA Studio`,
    ].join('\n'),
  }
}
