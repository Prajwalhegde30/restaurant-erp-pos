export class ChannelManager {
  /**
   * Generates a strict Redis channel name ensuring multi-tenant isolation.
   * If branchId is provided, isolates the event to a specific branch.
   * Based on Architecture.md (Room naming conventions translated to pub/sub channels).
   */
  static getChannelName(tenantId: string, branchId?: string): string {
    if (branchId) {
      return `events:tenant:${tenantId}:branch:${branchId}`;
    }
    return `events:tenant:${tenantId}:global`;
  }
}
