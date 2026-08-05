import { EventCallback } from '../contracts/events';

export class SubscriptionManager {
  // Map of channelName -> Array of Callbacks
  private subscriptions: Map<string, Set<EventCallback>> = new Map();

  public addSubscription(channel: string, callback: EventCallback): void {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    this.subscriptions.get(channel)!.add(callback);
  }

  public removeSubscription(channel: string, callback: EventCallback): void {
    const callbacks = this.subscriptions.get(channel);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.subscriptions.delete(channel);
      }
    }
  }

  public getCallbacks(channel: string): EventCallback[] {
    const callbacks = this.subscriptions.get(channel);
    return callbacks ? Array.from(callbacks) : [];
  }

  public getActiveChannels(): string[] {
    return Array.from(this.subscriptions.keys());
  }
}
