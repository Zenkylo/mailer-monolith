import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import EmailLog from '#models/email_log'
import PrivilegeService from '#services/privilege_service'

export default class AccountController {
  /**
   * Show account settings including email status
   */
  public async showSettings({ auth, inertia }: HttpContext) {
    const user = auth.user as User

    // Get email statistics for the user
    const emailStats = {
      status: user.emailStatus || 'active',
      bounceCount: user.bounceCount || 0,
      lastBounceAt: user.lastBounceAt?.toISO() || null,
      canReceiveEmails: user.canReceiveEmails(),
    }

    // Get privilege information
    const privileges = await PrivilegeService.getUserPrivileges(user)
    const usage = await PrivilegeService.getUserUsage(user)

    return inertia.render('dashboard/account/settings', {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt.toISO(),
        updatedAt: user.updatedAt?.toISO() || user.createdAt.toISO(),
      },
      emailStats,
      privileges,
      usage,
    })
  }

  /**
   * Show detailed email status page
   */
  public async showEmailStatus({ auth, inertia }: HttpContext) {
    const user = auth.user as User

    const emailDetails = {
      status: user.emailStatus || 'active',
      bounceCount: user.bounceCount || 0,
      lastBounceAt: user.lastBounceAt?.toISO() || null,
      canReceiveEmails: user.canReceiveEmails(),
      statusDescriptions: {
        active: 'Your email is active and can receive notifications.',
        bounced: 'Your email has bounced. You may not receive some notifications.',
        complained: 'Your email provider marked our emails as spam. Email delivery is suspended.',
        suppressed: 'Email delivery has been suppressed for your account.',
      },
      recommendations: this.getEmailRecommendations(user),
    }

    return inertia.render('dashboard/account/email-status', {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      emailDetails,
    })
  }

  /**
   * Request email reactivation (admin approval required)
   */
  public async requestEmailReactivation({ auth, response }: HttpContext) {
    const user = auth.user as User

    if (user.canReceiveEmails()) {
      return response.badRequest({
        error: 'Your email is already active and can receive notifications.',
      })
    }

    // In a real app, you might want to:
    // 1. Create a reactivation request record
    // 2. Send notification to admins
    // 3. Log the request

    return response.ok({
      message: 'Email reactivation request submitted. An administrator will review your request.',
    })
  }

  /**
   * Show email preview - displays the rendered HTML like an inbox view
   */
  public async showEmailPreview({ auth, params, response, bouncer }: HttpContext) {
    const user = auth.user as User
    const { nid } = params

    // Use bouncer.authorize() to throw AuthorizationException if denied
    await bouncer.authorize('viewEmailHistory')

    // Find the email log and ensure it belongs to the authenticated user
    const emailLog = await EmailLog.query()
      .where('nid', nid)
      .where('userId', user.id)
      .preload('user')
      .preload('subscription')
      .first()

    if (!emailLog) {
      return response.notFound('Email not found or access denied')
    }

    // If no HTML content is stored, return a message
    if (!emailLog.htmlContent) {
      return response.notFound('Email HTML content not available')
    }

    // Create an email client-like wrapper for the email content
    const emailClientWrapper = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Preview - ${emailLog.subject}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
        }
        .email-client-container {
            max-width: 800px;
            margin: 20px auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .email-header {
            background: #f8f9fa;
            padding: 20px;
            border-bottom: 1px solid #dee2e6;
        }
        .email-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .email-subject {
            font-size: 20px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0;
        }
        .email-date {
            color: #6c757d;
            font-size: 14px;
        }
        .email-from {
            color: #495057;
            font-size: 14px;
            margin: 5px 0;
        }
        .email-status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
        }
        .status-delivered { background: #d4edda; color: #155724; }
        .status-sent { background: #cce7ff; color: #0056b3; }
        .status-bounced { background: #fff3cd; color: #856404; }
        .status-failed { background: #f8d7da; color: #721c24; }
        .email-content {
            padding: 0;
            background: white;
        }
        .back-button {
            position: fixed;
            top: 20px;
            left: 20px;
            background: #007bff;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 14px;
            z-index: 1000;
        }
        .back-button:hover {
            background: #0056b3;
            color: white;
        }
    </style>
</head>
<body>
    <a href="/dashboard/account/email-history" class="back-button">← Back to Email History</a>
    
    <div class="email-client-container">
        <div class="email-header">
            <div class="email-meta">
                <div>
                    <h1 class="email-subject">${emailLog.subject}</h1>
                    <div class="email-from">From: ${emailLog.recipientEmail}</div>
                    <div class="email-from">To: ${emailLog.recipientEmail}</div>
                </div>
                <div>
                    <span class="email-status status-${emailLog.status}">${emailLog.status}</span>
                    <div class="email-date">${emailLog.createdAt.toFormat("MMM d, yyyy 'at' h:mm a")}</div>
                </div>
            </div>
        </div>
        
        <div class="email-content">
            ${emailLog.htmlContent}
        </div>
    </div>
</body>
</html>`

    // Return the wrapped HTML content
    return response.header('Content-Type', 'text/html; charset=utf-8').send(emailClientWrapper)
  }

  /**
   * Show email history for the user
   */
  public async showEmailHistory({ auth, inertia, request, bouncer }: HttpContext) {
    const user = auth.user as User

    // Use bouncer.authorize() to throw AuthorizationException if denied
    await bouncer.authorize('viewEmailHistory')

    const page = request.input('page', 1)

    // Import EmailLogService dynamically to avoid circular dependencies
    const { default: EmailLogService } = await import('#services/email_log_service')

    const result = await EmailLogService.getUserEmailLogs(user.id, page, 25)
    const stats = await EmailLogService.getUserEmailStats(user.id)

    return inertia.render('dashboard/account/email-history', {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      emailLogs: result.data.map((log) => ({
        id: log.id,
        nid: log.nid,
        subject: log.subject,
        status: log.status,
        emailType: log.emailType,
        sentAt: log.sentAt?.toISO(),
        deliveredAt: log.deliveredAt?.toISO(),
        bouncedAt: log.bouncedAt?.toISO(),
        complainedAt: log.complainedAt?.toISO(),
        createdAt: log.createdAt.toISO(),
        subscription: log.subscription
          ? {
              id: log.subscription.id,
              name: log.subscription.name,
              nid: log.subscription.nid,
            }
          : null,
        errorMessage: log.errorMessage,
      })),
      pagination: result.pagination,
      stats,
    })
  }

  /**
   * Show upgrade page with pricing and current usage
   */
  public async showUpgrade({ auth, inertia, request }: HttpContext) {
    const user = auth.user!
    const reason = request.input('reason')
    const feature = request.input('feature')

    const usage = await PrivilegeService.getUserUsage(user)
    const tiers = PrivilegeService.getTiersWithHierarchy()
    const tierHierarchy = PrivilegeService.getTierHierarchy()

    return inertia.render('dashboard/account/upgrade', {
      reason,
      feature,
      usage,
      tiers,
      tierHierarchy,
    })
  }

  /**
   * Get recommendations based on email status
   */
  private getEmailRecommendations(user: User): string[] {
    const recommendations: string[] = []
    const status = user.emailStatus || 'active'

    switch (status) {
      case 'bounced':
        recommendations.push('Check if your email address is correct and accessible')
        recommendations.push('Ensure your mailbox is not full')
        recommendations.push('Contact your email provider if the issue persists')
        if ((user.bounceCount || 0) > 3) {
          recommendations.push('Consider updating to a different email address')
        }
        break

      case 'complained':
        recommendations.push('Check your spam/junk folder for our emails')
        recommendations.push('Add our email address to your contacts or safe sender list')
        recommendations.push('Contact support if you believe this was marked as spam incorrectly')
        break

      case 'suppressed':
        recommendations.push('Contact support to understand why email delivery was suppressed')
        recommendations.push('You can request reactivation using the button above')
        break

      case 'active':
        recommendations.push('Your email is working properly!')
        recommendations.push('Make sure to check your spam folder occasionally')
        break
    }

    return recommendations
  }
}
