import env from '#start/env'
import { SendEmailData } from '#types/send_email_type'
import SendEmailJob from '#jobs/send_email_job'

export default class EmailService {
  private readonly sendNotificationEmailsFrom = env.get('EMAIL_NOREPLY')
  private readonly sendNoReplyEmailsFrom = env.get('EMAIL_NOTIFICATIONS')
  private readonly appUrl = env.get('APP_URL')

  async sendTestEmail(to: string, message: string) {
    const subject = 'Test Email'
    const html = `<p>${message}</p>`
    return this.queueEmail({
      to,
      subject,
      htmlView: 'emails/test_email',
      from: this.sendNoReplyEmailsFrom,
      data: {
        message,
      },
    })
  }

  async sendEmaiVerificationEmail(to: string, token: string) {
    const verificationLink = `${this.appUrl}/auth/verify/${token}`

    const subject = 'Email Verification'
    const html = `
      <p>Click the following link to verify your email address:</p>
      <a href="${verificationLink}">Verify Email</a>
    `

    return this.queueEmail({ to, subject, html, from: this.sendNoReplyEmailsFrom })
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const resetLink = `${this.appUrl}/auth/reset-password/${token}`

    const subject = 'Password Reset'
    const html = `
      <p>Click the following link to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
    `

    return this.queueEmail({ to, subject, html, from: this.sendNoReplyEmailsFrom })
  }

  private async queueEmail(params: SendEmailData) {
    await SendEmailJob.dispatch(params)
    return
  }
}
