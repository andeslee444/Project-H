# System Upgrade Guide

## Pre-Upgrade (CRITICAL)
```bash
# 1. Full backup
pg_dump healthcare_db > backup_$(date +%Y%m%d_%H%M%S).sql
tar -czf app_backup_$(date +%Y%m%d_%H%M%S).tar.gz /path/to/project-h

# 2. Health check
npm run health-check && npm run compliance-check && npm test

# 3. Schedule 2-4 hour maintenance window, notify users 48h advance
```

## Security Layer Upgrades

### Layer 1: Session Management
```bash
# Update session timeouts/encryption
npm run test:session-security
npm run deploy:session --environment=staging
npm run deploy:session --environment=production
```

### Layer 2: HIPAA Compliance  
```bash
# REQUIRES compliance officer approval
npm run test:hipaa-compliance
npm run deploy:compliance --environment=staging
npm run compliance:verify-production
```

### Layer 3: Performance Monitoring
```bash
# Update thresholds and metrics
npm run test:performance-monitoring
npm run deploy:performance --canary=10%
npm run deploy:performance --canary=100%
```

### Layer 4: Accessibility Testing
```bash
# Update WCAG rules and healthcare patterns
npm run accessibility:update-rules
npm run test:accessibility-full
npm run deploy:accessibility
```

### Layer 5: Data Encryption
```bash
# DANGEROUS: Key rotation requires maintenance window
npm run encryption:backup-keys
npm run encryption:rotate-keys --confirm
npm run test:encryption-integrity
```

### Layer 6: Input Sanitization
```bash
# Update validation rules
npm run test:input-validation
npm run deploy:sanitization
```

### Layer 7: Infrastructure Security
```bash
# Update security headers and rate limits
npm run test:security-headers
npm run deploy:infrastructure-security
```

## Database Upgrades
```bash
# 1. Test migration on staging
NODE_ENV=staging npx knex migrate:latest

# 2. Verify data integrity
npm run verify:data-integrity

# 3. Production migration
NODE_ENV=production npx knex migrate:latest

# 4. Verify HIPAA compliance
npm run compliance:verify-database
```

## Emergency Rollback
```bash
# 1. Stop application
sudo systemctl stop project-h

# 2. Restore database
psql healthcare_db < backup_20240120_143022.sql

# 3. Restore application
tar -xzf app_backup_20240120_143022.tar.gz

# 4. Restart services
sudo systemctl start project-h
```

## Post-Upgrade Verification

### 24-Hour Monitoring
- Session success rate >99.5%
- HIPAA compliance score 100%
- Performance within thresholds
- Error rates <0.1%

### Test Suite
```bash
# Security testing
npm run test:security-full

# Performance testing  
npm run test:performance-regression

# Integration testing
npm run test:integration-full

# Accessibility testing
npm run test:accessibility-wcag
```

## Critical Upgrade Triggers

### Immediate Rollback Required
- HIPAA compliance violations detected
- Patient data access failures  
- Security system failures
- Performance degradation >50%

### Emergency Contacts
| Issue | Contact | Response Time |
|-------|---------|---------------|
| HIPAA Violation | Compliance Officer | 15 minutes |
| Security Incident | Security Team | 30 minutes |  
| System Outage | DevOps Lead | 15 minutes |
| Data Loss | Database Admin | 10 minutes |

## Upgrade Checklist

### Pre-Upgrade
- [ ] Full system backup completed
- [ ] Maintenance window scheduled  
- [ ] Users notified
- [ ] Health checks passed
- [ ] Emergency contacts notified

### During Upgrade
- [ ] Application stopped gracefully
- [ ] Security layers updated in order
- [ ] Database migrations applied
- [ ] Health checks passed
- [ ] Application restarted

### Post-Upgrade  
- [ ] All tests passed
- [ ] HIPAA compliance verified
- [ ] Performance metrics normal
- [ ] 24-hour monitoring initiated
- [ ] Users notified of completion

---
**Golden Rule**: When in doubt, rollback. Patient safety > any upgrade.