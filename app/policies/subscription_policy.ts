import User from '#models/user'
import PrivilegeService from '#services/privilege_service'

export default class SubscriptionPolicy {
  /**
   * Check if user can create a new subscription
   */
  async create(user: User): Promise<boolean> {
    const canCreate = await PrivilegeService.canCreateSubscription(user)
    return canCreate.allowed
  }

  /**
   * Check if user can view their subscriptions
   */
  async viewList(_user: User): Promise<boolean> {
    // All authenticated users can view their subscription list
    return true
  }

  /**
   * Check if user can view a specific subscription
   */
  async view(user: User, subscription: any): Promise<boolean> {
    // Users can only view their own subscriptions
    return subscription.userId === user.id
  }

  /**
   * Check if user can edit a subscription
   */
  async edit(user: User, subscription: any): Promise<boolean> {
    // Users can only edit their own subscriptions
    return subscription.userId === user.id
  }

  /**
   * Check if user can delete a subscription
   */
  async delete(user: User, subscription: any): Promise<boolean> {
    // Users can only delete their own subscriptions
    return subscription.userId === user.id
  }
}
