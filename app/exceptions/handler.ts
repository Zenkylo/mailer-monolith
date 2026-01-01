import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * Status pages are used to display a custom HTML pages for certain error
   * codes. You might want to enable them in production only, but feel
   * free to enable them in development as well.
   */
  protected renderStatusPages = app.inProduction

  /**
   * Status pages is a collection of error code range and a callback
   * to return the HTML contents to send as a response.
   */
  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    // '403': (error, { inertia, auth }) => {
    //   // For authorization errors, show upgrade option if it's a privilege-related issue
    //   const showUpgrade =
    //     error.message?.includes('subscription') ||
    //     error.message?.includes('tier') ||
    //     error.message?.includes('limit')
    //   return inertia.render('errors/forbidden', {
    //     error,
    //     user: auth.user,
    //     message: error.message,
    //     showUpgrade,
    //   })
    // },
    '403': (error, { view }) => view.render('errors/forbidden', { error }),
    '404': (error, { view }) => view.render('errors/not_found', { error }),
    '429': (error, { inertia }) => inertia.render('errors/rate_limited', { error }),
    '500..599': (error, { inertia }) => inertia.render('errors/server_error', { error }),
  }

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    // Handle authorization exceptions specifically
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'E_AUTHORIZATION_FAILURE'
    ) {
      // For regular requests, return 403 status
      // return ctx.inertia.render('errors/forbidden', { error })
      ctx.session.flash('error', ctx.i18n.t('messages.errors.unauthorized'))
      return ctx.response.redirect('back')
      // return ctx.response.redirect('/403')
    }

    // if cors request
    if (ctx.request.header('X-Requested-Lib') === 'NetworkClient') {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'E_TOO_MANY_REQUESTS'
      ) {
        return ctx.response.status(429).json({
          error: ctx.i18n.t('messages.errors.rate_limited', {
            limit: (error as any).response?.limit || 0,
            remaining: (error as any).response?.remaining || 0,
            availableIn: (error as any).response?.availableIn || 0,
          }),
        })
      }
      // If route not found
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'E_ROUTE_NOT_FOUND'
      ) {
        return ctx.response.status(404).json({
          error: ctx.i18n.t('messages.errors.route_not_found'),
        })
      }
      return ctx.response.status(400).json({
        error: ctx.i18n.t('messages.errors.bad_request'),
      })
    }

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'E_TOO_MANY_REQUESTS'
    ) {
      ctx.session.flash(
        'error',
        ctx.i18n.t('messages.errors.rate_limited', {
          limit: (error as any).response?.limit || 0,
          remaining: (error as any).response?.remaining || 0,
          availableIn: (error as any).response?.availableIn || 0,
        })
      )
      console.log((error as any).response)
      return ctx.response.redirect('back')
    }

    // 403
    if (error && typeof error === 'object' && 'code' in error && error.code === 'E_FORBIDDEN') {
      return ctx.response.redirect('/403')
    }

    // If route not found
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'E_ROUTE_NOT_FOUND'
    ) {
      return ctx.response.redirect('/404')
    }

    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
