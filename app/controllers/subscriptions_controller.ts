import Subscription from '#models/subscription'
import User from '#models/user'
import SecureDataFetcher from '#services/secure_data_fetcher'
import { TRANSLATION_KEYS } from '#types/translation_types'
import type { HttpContext } from '@adonisjs/core/http'
import parser from 'cron-parser'
import { DateTime } from 'luxon'

export default class SubscriptionsController {
  public async showList({ auth, inertia, bouncer }: HttpContext) {
    const user = auth.user!
    const subscriptions = await Subscription.query().where('user_id', user.id)

    // Use bouncer to check creation ability
    const canCreateResult = await bouncer.allows('createSubscription')

    return inertia.render('dashboard/subscriptions/list', {
      subscriptions,
      canCreate: { allowed: canCreateResult },
    })
  }

  public async create({ auth, request, response, bouncer, session, i18n }: HttpContext) {
    const user = auth.user!

    await bouncer.authorize('createSubscription')

    const { name, endpoint } = request.body() // TODO request validator
    try {
      const { nid } = await Subscription.create({
        name,
        endpoint,
        userId: user.id,
        timezone: user.timeZone || 'UTC',
      })

      session.flash('success', i18n.t(TRANSLATION_KEYS.SUBSCRIPTIONS.CREATE.SUCCESS_MESSAGE))
      return response.redirect(`/dashboard/subscriptions/${nid}`)
    } catch (error) {
      session.flash('error', i18n.t(TRANSLATION_KEYS.SUBSCRIPTIONS.CREATE.ERRORS.CREATION_FAILED))
      return response.redirect().back()
    }
  }

  public async show({ auth, inertia, params }: HttpContext) {
    const subscription = await Subscription.query()
      .where('user_id', auth.user!.id)
      .andWhere('nid', params.nid)
      .orderBy('created_at', 'desc')
      .first()

    return inertia.render('dashboard/subscriptions/show', { subscription })
  }

  public async clientUpdateSubscription({ params, request, response, auth }: HttpContext) {
    const { name, enabled, endpoint, cronExpression } = request.body()
    const { nid } = params

    const user = auth.user as User
    const { id: userId } = user
    const subscription = await Subscription.query()
      .where('user_id', userId)
      .andWhere('nid', nid)
      .firstOrFail()

    subscription.name = name
    subscription.timezone = user.timeZone || 'UTC'
    subscription.enabled = enabled
    subscription.endpoint = endpoint
    subscription.cronExpression = cronExpression
    subscription.timezone = 'America/New_York'

    await subscription.save()

    return response.ok(subscription)
  }

  public async clientCronDeliveries({ request, response }: HttpContext) {
    const format = 'cccc, LLLL d, yyyy h:mm a'
    try {
      const { cron, timezone } = request.body()
      const cronExpression = parser.parseExpression(cron, { tz: timezone })
      const next5 = []
      for (let i = 0; i < 5; i++) {
        const next = cronExpression.next().toDate()
        const toTimeZone = DateTime.fromJSDate(next).setZone(timezone).toFormat(format)
        next5.push(toTimeZone)
      }
      return response.json(next5)
    } catch (e) {
      return response.badRequest({ error: 'Invalid cron expression' })
    }
  }

  public async clientTestSubscriptionEndpoint({
    params,
    request,
    response,
    auth,
    i18n,
  }: HttpContext) {
    const { nid } = params
    const { endpoint } = request.qs()

    const user = auth.user as User
    const { id: userId } = user
    // Query subscription to verify user ownership, result not needed
    await Subscription.query().where('user_id', userId).andWhere('nid', nid).firstOrFail()

    try {
      const result = await SecureDataFetcher.fetchData(
        endpoint,
        {
          timeout: 5000,
        },
        {
          i18n,
          user,
          requestId: request.id?.(),
        }
      )
      return response.ok({
        status: 'success',
        response: result.data,
        fetchStatus: result.status,
      })
    } catch (error) {
      return response.badRequest({ status: 'error', error: error.message })
    }
  }

  public async processDueSubscriptions({ response }: HttpContext) {
    try {
      // Import the job dynamically to avoid potential circular dependency issues
      const { default: ProcessDueSubscriptionsJob } = await import(
        '#jobs/process_due_subscriptions_job'
      )

      // Queue the main processing job
      await ProcessDueSubscriptionsJob.dispatch({})

      return response.ok({
        message: 'Subscription processing queued successfully',
        status: 'queued',
      })
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to queue subscription processing',
        error: error.message,
      })
    }
  }
}
