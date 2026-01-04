import EmailVerification from '#models/email_verification'
import PasswordResetRequest from '#models/password_reset_request'
import User from '#models/user'
import EmailService from '#services/email_service'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class AuthController {
  private readonly emailService = new EmailService()

  showLogin({ inertia, auth, response }: HttpContext) {
    if (auth.isAuthenticated) {
      return response.redirect('/dashboard')
    }
    return inertia.render('public/auth/login')
  }

  showRegister({ inertia, auth, response, request }: HttpContext) {
    const { csrfToken } = request
    if (auth.isAuthenticated) {
      return response.redirect('/dashboard')
    }
    return inertia.render('public/auth/register', { csrfToken })
  }

  async showVerify({ logger, inertia, params, request }: HttpContext) {
    logger.info('start:showVerify')
    const { token } = params
    const csrfToken = request.csrfToken
    const emailVerification = await EmailVerification.query().where('token', token).first()

    logger.info('emailVerification: %o', emailVerification ? emailVerification.toJSON() : null)

    const valid =
      emailVerification && !emailVerification?.isExpired && !emailVerification.isVerified

    logger.info('email verification valid: %s', valid)

    logger.info('end:showVerify')

    return inertia.render('public/auth/verify', {
      valid,
      email: emailVerification?.email,
      token,
      csrfToken,
    })
  }

  async clientVerify({ logger, request, response, auth }: HttpContext) {
    logger.info('start:verify')
    const { token, email, password, passwordConfirm } = request.all()

    logger.info('verifying email: %s', email)

    if (password !== passwordConfirm) {
      logger.info('passwords do not match')
      return response.status(400).json({ message: 'Passwords do not match' })
    }

    const emailVerification = await EmailVerification.query()
      .where('email', email)
      .andWhere('token', token)
      .firstOrFail()

    const valid =
      !emailVerification.isExpired &&
      !emailVerification.isVerified &&
      emailVerification.email === email

    if (!valid) {
      logger.info('email verification invalid: %o', {
        isExpired: emailVerification.isExpired,
        isVerified: emailVerification.isVerified,
        email: emailVerification.email,
      })
      return response.status(400).json({ message: 'Email verification invalid' })
    }

    logger.info('email verification valid: %s', email)
    logger.info('creating user: %s', email)

    await User.create({ email: emailVerification.email, password })

    logger.info('user created: %s', email)

    const user = await User.verifyCredentials(email, password)

    emailVerification.verifiedAt = DateTime.now()

    await emailVerification.save()

    await auth.use('web').login(user)

    logger.info('end:verify')

    return response.status(200).json({ message: 'Email verification successful. Logging in...' })
  }

  async showForgotPassword({ inertia, auth, response, request }: HttpContext) {
    const { csrfToken } = request
    if (auth.isAuthenticated) {
      return response.redirect('/dashboard')
    }
    return inertia.render('public/auth/forgot-password', { csrfToken })
  }

  async showResetPassword({ inertia, logger, params }: HttpContext) {
    logger.info('start:showResetPassword')
    const { token } = params
    const passwordResetRequest = await PasswordResetRequest.query().where('token', token).first()
    const valid =
      passwordResetRequest &&
      !passwordResetRequest?.isExpired &&
      passwordResetRequest?.status === 'pending'
    logger.info('end:showResetPassword')

    if (!valid) return inertia.render('public/auth/reset-password-invalid')

    return inertia.render('public/auth/reset-password', {
      email: passwordResetRequest?.email,
      token,
    })
  }

  async clientLogin({ auth, request, response, i18n }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    const user = await User.verifyCredentials(email, password)
    await auth.use('web').login(user)
    return response.status(200).json({ message: i18n.t('messages.auth.login.success') })
  }

  async clientRegister({ request, response, i18n, logger }: HttpContext) {
    logger.info('start:register')
    const defaultResponseMessage = i18n.t('messages.auth.register.success')
    const email = request.input('email')
    if (!email) return response.redirect().back()

    const existingUser = await User.query().whereILike('email', request.input('email')).first()
    if (existingUser) {
      logger.warn('existing user: %s', email)
      return response.redirect().back()
    }

    const existingEmailVerification = await EmailVerification.query().where('email', email).first()
    if (existingEmailVerification && existingEmailVerification.sentMinutesAgo < 2) {
      logger.info('email verification already sent: %s', email)
      return response.json({ message: defaultResponseMessage })
    }

    const emailVerification = await EmailVerification.create({ email })

    const { token } = emailVerification

    logger.info('sending email verification to: %s', email)

    await this.emailService.sendEmaiVerificationEmail(request.input('email'), token)

    logger.info('end:register')

    return response.json({ message: defaultResponseMessage })
  }

  async clientForgotPassword({ logger, request, response, session }: HttpContext) {
    logger.info('start:forgotPassword')
    const message = 'If the email exists in our system, we will send a password reset link.'
    session.flash('success', message)
    const { email } = request.only(['email'])
    logger.info('forgot password: %s', email)
    const user = await User.query().whereILike('email', email).first()
    if (!user) {
      logger.info('user not found: %s', email)
      return response.status(200).json({ message })
    }

    const ipAddress = request.ip()
    const passwordResetRequest = await PasswordResetRequest.create({ email: user.email, ipAddress })

    await this.emailService.sendPasswordResetEmail(user.email, passwordResetRequest.token)
    logger.info('end:forgotPassword')
    return response.status(200).json({ message })
  }

  async clientResetPassword({ logger, request, response, auth, session }: HttpContext) {
    logger.info('start:resetPassword')
    const { email, password, passwordConfirm, token } = request.all()
    logger.info('resetting password: %s', email)
    if (password !== passwordConfirm) {
      logger.info('passwords do not match')
      session.flash('errors', 'Passwords do not match')
      return response.status(400).json({ message: 'Passwords do not match' })
    }
    const passwordResetRequest = await PasswordResetRequest.query()
      .where('email', email)
      .andWhere('token', token)
      .firstOrFail()
    const valid =
      !passwordResetRequest.isExpired &&
      passwordResetRequest.email === email &&
      passwordResetRequest.status === 'pending'
    if (!valid) {
      logger.info('email verification invalid: %o', {
        isExpired: passwordResetRequest.isExpired,
        email: passwordResetRequest.email,
      })

      return response.status(400).json({ message: 'Passwords reset is invalid. Please try again.' })
    }
    logger.info('email verification valid: %s', email)
    logger.info('resetting password: %s', email)
    const user = await User.query().where('email', email).firstOrFail()
    user.password = password
    await user.save()

    passwordResetRequest.status = 'completed'
    await passwordResetRequest.save()

    await auth.use('web').login(user)
    logger.info('end:resetPassword')
    return response.status(200).json({ message: 'Password reset successful. Logging in...' })
  }

  logout({ auth, response }: HttpContext) {
    auth.use('web').logout()
    return response.redirect('/')
  }

  /**
   * Just testing for now.
   */
  async sendEmail({ auth, request, response, i18n }: HttpContext) {
    const { message } = request.only(['message'])
    await this.emailService.sendTestEmail(auth.user!.email, message)
    return response.status(200).json({ message: i18n.t('messages.auth.email.sent') })
  }
}
