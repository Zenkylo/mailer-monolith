import User from '#models/user'
import PrivilegeService from '#services/privilege_service'

export default class EmailPolicy {
  /**
   * Check if user can send emails (daily limit check)
   */
  async send(user: User): Promise<boolean> {
    const canSend = await PrivilegeService.canReceiveEmail(user)
    return canSend.allowed
  }

  /**
   * Check if user can view their email history
   */
  async viewHistory(user: User): Promise<boolean> {
    const canView = await PrivilegeService.canViewEmailHistory(user)
    return canView.allowed
  }

  /**
   * Check if user can export email data
   */
  async exportData(user: User): Promise<boolean> {
    const canExport = await PrivilegeService.canExportData(user)
    return canExport.allowed
  }

  /**
   * Check if user can view a specific email
   */
  async view(user: User, email: any): Promise<boolean> {
    // Users can only view their own emails
    return email.userId === user.id
  }

  /**
   * Check if user can preview email content
   */
  async preview(user: User): Promise<boolean> {
    // Must be able to view email history to preview emails
    return await this.viewHistory(user)
  }
}
