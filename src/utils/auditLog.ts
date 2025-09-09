export interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: 'RECEIPT' | 'CONSUMPTION' | 'USER';
  entityId: string;
  userId: string;
  userName: string;
  timestamp: string;
  changes?: Record<string, { from: any; to: any }>;
  description: string;
}

class AuditLogger {
  private logs: AuditLog[] = [];

  log(action: AuditLog['action'], entityType: AuditLog['entityType'], entityId: string, description: string, changes?: AuditLog['changes']) {
    const auditLog: AuditLog = {
      id: `LOG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      entityType,
      entityId,
      userId: '1', // In a real app, this would come from auth context
      userName: 'John Smith', // In a real app, this would come from auth context
      timestamp: new Date().toISOString(),
      changes,
      description
    };

    this.logs.unshift(auditLog);
    
    // Keep only last 1000 logs for performance
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(0, 1000);
    }

    // In a real app, you'd send this to a backend API
    console.log('Audit Log:', auditLog);
  }

  getLogs(): AuditLog[] {
    return [...this.logs];
  }

  getLogsForEntity(entityType: AuditLog['entityType'], entityId: string): AuditLog[] {
    return this.logs.filter(log => log.entityType === entityType && log.entityId === entityId);
  }

  exportAuditTrail(): string {
    const csvHeaders = ['ID', 'Action', 'Entity Type', 'Entity ID', 'User', 'Timestamp', 'Description'];
    const csvRows = this.logs.map(log => [
      log.id,
      log.action,
      log.entityType,
      log.entityId,
      log.userName,
      new Date(log.timestamp).toLocaleString(),
      `"${log.description}"`
    ]);

    return [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
  }
}

export const auditLogger = new AuditLogger();

// Sample audit logs for demonstration
auditLogger.log('CREATE', 'RECEIPT', 'SR001', 'Created stock receipt for Portland Cement (100 bags)');
auditLogger.log('CREATE', 'RECEIPT', 'SR002', 'Created stock receipt for Steel Rebar 12mm (50 pieces)');
auditLogger.log('CREATE', 'CONSUMPTION', 'SC001', 'Recorded consumption of Portland Cement for Foundation Work');
auditLogger.log('UPDATE', 'RECEIPT', 'SR001', 'Updated supplier information for Portland Cement receipt');
auditLogger.log('CREATE', 'CONSUMPTION', 'SC002', 'Recorded consumption of Steel Rebar for Column Reinforcement');
