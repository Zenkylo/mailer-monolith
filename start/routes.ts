/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { loginThrottle, testSubscriptionEndpointThrottle } from '#start/limiter'
import { middleware } from '#start/kernel'
const AuthController = () => import('#controllers/auth_controller')
const SubscriptionsController = () => import('#controllers/subscriptions_controller')
const PolarController = () => import('#controllers/polar_controller')
const AccountController = () => import('#controllers/account_controller')
const SesWebhooksController = () => import('#controllers/webhooks/ses_webhooks_controller')

import { queueDashUiRoutes } from '@nemoventures/adonis-jobs/ui/queuedash'

/**
 * Public routes /*
 */
router.get('/', async ({ view }) => { return view.render('promo') })
router.get('/auth/login', [AuthController, 'showLogin'])
router.get('/auth/register', [AuthController, 'showRegister'])
router.get('/auth/verify/:token', [AuthController, 'showVerify'])
router.get('/auth/forgot-password', [AuthController, 'showForgotPassword'])
router.get('/auth/reset-password/:token', [AuthController, 'showResetPassword'])
router.get('/auth/logout', [AuthController, 'logout']).use(middleware.auth())

router.post('/client/auth/login', [AuthController, 'clientLogin']).use(loginThrottle)
router.post('/client/auth/register', [AuthController, 'clientRegister']).use(loginThrottle)
router.post('/client/auth/verify', [AuthController, 'clientVerify']).use(loginThrottle)
router.post('/client/auth/forgot-password', [AuthController, 'clientForgotPassword']).use(loginThrottle).use(loginThrottle)
router.post('/client/auth/reset-password', [AuthController, 'clientResetPassword']).use(loginThrottle)

/**
 * Client routes client/*
 */
router
  .group(() => {
    router.post('/send-email', [AuthController, 'sendEmail']).use(middleware.auth())
    router.post('/cron/deliveries', [SubscriptionsController, 'clientCronDeliveries']).use(middleware.auth())
    router.post('/subscriptions', [SubscriptionsController, 'create']).use(middleware.auth())
    router.put('/subscriptions/:nid', [SubscriptionsController, 'clientUpdateSubscription']).use(loginThrottle)
    router.get('/subscriptions/:nid/test', [SubscriptionsController, 'clientTestSubscriptionEndpoint']).use(middleware.auth()).use(testSubscriptionEndpointThrottle)
  })
  .prefix('/client')
  .use(middleware.auth())


/**
 * Dashboard routes /dashboard/*
 */
router
  .group(() => {
    router.get('/', async ({ inertia }) => { return inertia.render('dashboard/index') })
    
    // Subscription routes
    router.get('/subscriptions', [SubscriptionsController, 'showList'])
    router.post('/subscriptions', [SubscriptionsController, 'create'])
    router.get('/subscriptions/:nid', [SubscriptionsController, 'show'])
    router.get('/billing/portal', [PolarController, 'redirectCustomerToBillingPortal'])
    
    // Account routes
    router.get('/account/settings', [AccountController, 'showSettings'])
    router.get('/account/email-status', [AccountController, 'showEmailStatus'])
    router.get('/account/email-history', [AccountController, 'showEmailHistory'])
    router.get('/account/email-preview/:nid', [AccountController, 'showEmailPreview'])
    router.get('/account/upgrade', [AccountController, 'showUpgrade']).as('dashboard.upgrade')
    router.post('/account/email-reactivation', [AccountController, 'requestEmailReactivation'])
  })

  .prefix('/dashboard')
  .use(
    middleware.auth({
      guards: ['web'],
    })
  )

/**
 * Webhook routes /webhooks/*
 */
router.group(() => {
  router.post('/polar', [PolarController, 'captureWebhook'])
}).prefix('/webhooks')

/**
 * Email bounce webhook routes /webhooks/email/*
 */
router.group(() => {
  router.post('/ses/notifications', [SesWebhooksController, 'handleNotification'])
}).prefix('/webhooks/email')

/**
 * Admin email management routes /admin/email/*
 */
router.group(() => {
  router.get('/bounce-stats', [SesWebhooksController, 'getBounceStats'])
  router.get('/users-with-issues', [SesWebhooksController, 'getUsersWithEmailIssues'])
  router.post('/reactivate-emails', [SesWebhooksController, 'reactivateEmails'])
}).prefix('/admin/email')

/**
 * Cron/Trigger routes /trigger/*
 */
router.group(() => {
  router.post('/process-subscriptions', [SubscriptionsController, 'processDueSubscriptions'])
}).prefix('/trigger')


/**
 * Queue routes /admin/*
 */
router.group(() => {
  queueDashUiRoutes().prefix('/queue')
}).prefix('/admin')

router.get('/403', async ({ inertia }) => {
  return inertia.render('errors/forbidden')
}).use(middleware.silent())

router.get('/404', async ({ inertia }) => {
  return inertia.render('errors/not_found')
}).use(middleware.silent())
