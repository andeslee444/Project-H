# Troubleshooting Guide

## Emergency Response

### System Down
```bash
# 1. Check services
sudo systemctl status project-h nginx postgresql

# 2. Check logs
tail -f /var/log/project-h/error.log

# 3. Quick restart
sudo systemctl restart project-h nginx

# 4. Verify health
curl -f http://localhost/health
```

### HIPAA Violation Alert
```bash
# 1. IMMEDIATELY isolate
sudo systemctl stop project-h

# 2. Check compliance
npm run compliance:immediate-check

# 3. Review audit logs  
npm run audit:review-last-hour

# 4. Document incident
echo "$(date): HIPAA incident detected" >> /var/log/compliance/incidents.log
```
**CRITICAL**: Notify compliance officer within 15 minutes

### Data Breach Suspected  
```bash
# 1. Preserve evidence
sudo cp -r /var/log/project-h /tmp/breach-evidence-$(date +%Y%m%d_%H%M%S)

# 2. Check unauthorized access
npm run security:check-unauthorized-access

# 3. Generate incident report
npm run security:generate-incident-report
```
**CRITICAL**: Notify security team and compliance officer immediately

## Security System Issues

### HIPAA Compliance Red Status
```bash
# Diagnosis
npm run compliance:detailed-status
npm run audit:review --hours=24
npm run access:check-violations

# Common fixes
sudo systemctl restart audit-service    # Audit logging not working
npm run permissions:reset-defaults      # Access control issues  
npm run encryption:check-keys          # Encryption problems
```

### Session Management Problems
```bash
# Users logged out immediately
grep -r "idleTimeout\|maxAge" src/lib/session/
npm run session:storage-check

# Fix: Edit src/lib/session/SessionManager.ts
# Increase timeouts if too aggressive

# Session security warnings
npm run security:check-session-events
npm run security:force-logout-user --userId=SUSPICIOUS_USER_ID
```

### Performance Issues
```bash
# Dashboard not loading
sudo systemctl status performance-monitor
npm run performance:check-metrics

# Constant alerts
npm run performance:current-status
top && df -h && free -m

# Fix thresholds in src/lib/performance/PerformanceMonitor.ts
```

## Database Issues

### Connection Problems
```bash
# Cannot connect
sudo systemctl status postgresql
psql -h localhost -U healthcare_user -d healthcare_db -c "SELECT 1;"
npm run db:reset-pool

# Slow queries
npm run db:check-active-queries
npm run db:check-locks
npm run db:kill-slow-queries
npm run db:rebuild-indexes
```

### Audit Trail Missing
```bash
# Check audit tables
npm run db:check-audit-tables
npm run db:check-audit-triggers

# Fix
npm run db:repair-audit-tables
npm run db:recreate-audit-triggers

# If data truly missing (CRITICAL)
echo "$(date): Audit data gap detected" >> /var/log/compliance/data-gaps.log
# Notify compliance officer immediately
```

## Frontend Issues

### White Screen of Death
```bash
# Check browser console for JavaScript errors
# Rebuild application
npm run build && npm run deploy

# Clear browser cache (instruct users: Ctrl+F5)
npm run lint && npm run type-check
```

### Components Not Rendering
```bash
npm run test:components
npm run test:prop-types
npm run build:css
npm run clear:component-cache
```

## Infrastructure Issues

### High CPU Usage
```bash
# Check CPU usage
top -p $(pgrep -f "project-h")
npm run memory:check-leaks

# Fix
sudo systemctl restart project-h
npm run deploy:scale-up
npm run performance:optimize-cpu
```

### Out of Memory
```bash
# Check memory
free -m && ps aux | grep project-h
npm run memory:leak-check

# Fix
export NODE_OPTIONS="--max-old-space-size=4096"
sudo systemctl restart project-h

# Add swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
```

## Escalation Matrix

### Immediate Escalation (15 min response)
- **HIPAA Violation**: Compliance Officer
- **Data Breach**: Security Team + Compliance Officer  
- **System Outage**: DevOps Lead + Senior Developer
- **Data Loss**: Database Admin + Senior Developer

### Standard Escalation
- **Performance >50% degraded**: DevOps Lead (1 hour)
- **Accessibility issues**: Frontend Lead (4 hours)
- **Login/session issues**: Backend Lead (2 hours)

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Session expired, please login again" | Session timeout/storage issue | Check session config, restart session service |
| "Access denied - insufficient permissions" | RBAC issue | Verify user roles, check permissions |
| "Database connection failed" | DB service down | Restart PostgreSQL, check network |
| "Performance threshold exceeded" | System overload | Check resources, optimize queries |
| "HIPAA compliance check failed" | Missing audit logs/access violation | Check audit service, verify access controls |

---
**Golden Rule**: When in doubt, check logs. When still in doubt, escalate. Patient safety and data security come first.