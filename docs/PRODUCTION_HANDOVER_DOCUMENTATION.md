# Production Handover Documentation
## Mental Health Practice Scheduling and Waitlist Management System

### Document Version: 1.0
### Handover Date: June 6, 2025
### Prepared for: Operations Team

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture and Infrastructure](#architecture-and-infrastructure)
3. [Access and Credentials](#access-and-credentials)
4. [Deployment Procedures](#deployment-procedures)
5. [Operational Procedures](#operational-procedures)
6. [Monitoring and Alerts](#monitoring-and-alerts)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [Maintenance Procedures](#maintenance-procedures)
9. [Security Operations](#security-operations)
10. [Support Procedures](#support-procedures)
11. [Knowledge Transfer](#knowledge-transfer)
12. [Appendices](#appendices)

---

## 1. System Overview

### 1.1 System Description
The Mental Health Practice Scheduling and Waitlist Management System is a comprehensive web application designed to optimize appointment scheduling and waitlist management for mental health practices.

### 1.2 Key Components
- **Frontend**: React 18.2 SPA with TypeScript
- **Backend**: Node.js with Express.js REST API
- **Database**: PostgreSQL 14 with read replicas
- **Cache**: Redis for session and data caching
- **Queue**: Bull for background job processing
- **File Storage**: AWS S3 for documents and images

### 1.3 Critical Business Functions
1. Patient appointment scheduling
2. Waitlist management and matching
3. Provider availability management
4. Secure messaging (HIPAA compliant)
5. Analytics and reporting
6. Billing and payment processing

---

## 2. Architecture and Infrastructure

### 2.1 Infrastructure Overview

```
┌─────────────────┐     ┌─────────────────┐
│   CloudFlare    │────▶│  Load Balancer  │
│      (CDN)      │     │   (AWS ALB)     │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              ┌─────▼─────┐            ┌─────▼─────┐
              │  Web App  │            │  Web App  │
              │  Server 1 │            │  Server 2 │
              └─────┬─────┘            └─────┬─────┘
                    │                         │
                    └───────────┬─────────────┘
                                │
                    ┌───────────┴────────────┐
                    │                        │
              ┌─────▼─────┐           ┌─────▼─────┐
              │    API    │           │   Redis   │
              │  Servers  │           │   Cache   │
              └─────┬─────┘           └───────────┘
                    │
              ┌─────▼─────┐
              │PostgreSQL │
              │  Primary  │
              └─────┬─────┘
                    │
              ┌─────▼─────┐
              │PostgreSQL │
              │  Replica  │
              └───────────┘
```

### 2.2 Server Specifications

#### Production Web Servers
- **Type**: AWS EC2 t3.large
- **Count**: 2 (auto-scaling to 10)
- **OS**: Ubuntu 22.04 LTS
- **Location**: us-east-1a, us-east-1b

#### API Servers
- **Type**: AWS EC2 c5.xlarge
- **Count**: 3 (auto-scaling to 15)
- **OS**: Ubuntu 22.04 LTS
- **Location**: us-east-1a, us-east-1b, us-east-1c

#### Database Servers
- **Type**: AWS RDS PostgreSQL
- **Instance**: db.r6g.xlarge
- **Storage**: 500GB SSD with encryption
- **Replicas**: 2 read replicas

### 2.3 Network Configuration
- **VPC**: 10.0.0.0/16
- **Public Subnets**: 10.0.1.0/24, 10.0.2.0/24
- **Private Subnets**: 10.0.10.0/24, 10.0.11.0/24
- **Database Subnets**: 10.0.20.0/24, 10.0.21.0/24

---

## 3. Access and Credentials

### 3.1 AWS Access
```bash
# AWS CLI Configuration
aws configure --profile healthscheduler-prod
AWS Access Key ID: [Stored in 1Password - "AWS Prod Access"]
AWS Secret Access Key: [Stored in 1Password - "AWS Prod Secret"]
Default region: us-east-1
```

### 3.2 Server Access
```bash
# SSH Access to Web Servers
ssh -i ~/.ssh/healthscheduler-prod.pem ubuntu@web1.healthscheduler.com
ssh -i ~/.ssh/healthscheduler-prod.pem ubuntu@web2.healthscheduler.com

# SSH Access to API Servers
ssh -i ~/.ssh/healthscheduler-prod.pem ubuntu@api1.healthscheduler.com
ssh -i ~/.ssh/healthscheduler-prod.pem ubuntu@api2.healthscheduler.com
ssh -i ~/.ssh/healthscheduler-prod.pem ubuntu@api3.healthscheduler.com
```

### 3.3 Database Access
```sql
-- Production Database
Host: db.healthscheduler.com
Port: 5432
Database: healthscheduler_prod
Username: [Stored in AWS Secrets Manager: "prod/db/master"]
Password: [Stored in AWS Secrets Manager: "prod/db/password"]

-- Read Replica
Host: db-read.healthscheduler.com
Port: 5432
```

### 3.4 Application Credentials
All application secrets are stored in AWS Secrets Manager:
- `prod/jwt/secret` - JWT signing secret
- `prod/email/api-key` - SendGrid API key
- `prod/sms/api-key` - Twilio credentials
- `prod/payment/stripe-key` - Stripe API keys
- `prod/redis/password` - Redis authentication

---

## 4. Deployment Procedures

### 4.1 Standard Deployment Process

```bash
# 1. Connect to deployment server
ssh deploy@deploy.healthscheduler.com

# 2. Run deployment script
cd /opt/healthscheduler/deploy
./deploy.sh production v1.0.0

# 3. Monitor deployment
tail -f /var/log/healthscheduler/deploy.log
```

### 4.2 Blue-Green Deployment

```bash
# Current state: Blue is live, deploying to Green
./deploy-green.sh v1.0.0

# Test green environment
curl https://green.healthscheduler.com/health

# Switch traffic to green
./switch-to-green.sh

# Verify switch
./verify-deployment.sh
```

### 4.3 Emergency Rollback

```bash
# Immediate rollback to previous version
./emergency-rollback.sh

# Or specific version rollback
./rollback-to-version.sh v0.9.9
```

### 4.4 Database Migrations

```bash
# Always backup before migrations
./backup-database.sh

# Run migrations
cd /opt/healthscheduler/api
npm run migrate:prod

# Verify migrations
npm run migrate:status
```

---

## 5. Operational Procedures

### 5.1 Daily Operations Checklist

#### Morning (9:00 AM EST)
- [ ] Check system health dashboard
- [ ] Review overnight alerts
- [ ] Check backup completion
- [ ] Review error logs
- [ ] Check queue processing status
- [ ] Verify appointment sync status

#### Afternoon (2:00 PM EST)
- [ ] Monitor performance metrics
- [ ] Check disk space usage
- [ ] Review security alerts
- [ ] Check API rate limits
- [ ] Monitor user reports

#### Evening (6:00 PM EST)
- [ ] Review daily metrics
- [ ] Check scheduled jobs
- [ ] Prepare for overnight batch jobs
- [ ] Update status page if needed

### 5.2 Weekly Maintenance

```bash
# Every Monday at 3:00 AM EST
0 3 * * 1 /opt/healthscheduler/maintenance/weekly.sh

# Tasks performed:
# - Log rotation and compression
# - Database vacuum and analyze
# - Cache cleanup
# - Temporary file cleanup
# - Security updates check
```

### 5.3 Monthly Procedures

1. **Security Patching** (First Tuesday)
   ```bash
   ./security-patch.sh
   ```

2. **Performance Review** (First Monday)
   - Analyze slow query logs
   - Review API performance metrics
   - Update capacity planning

3. **Disaster Recovery Test** (Third Thursday)
   ```bash
   ./dr-test.sh
   ```

---

## 6. Monitoring and Alerts

### 6.1 Monitoring Stack
- **Application Monitoring**: DataDog
- **Infrastructure Monitoring**: AWS CloudWatch
- **Error Tracking**: Sentry
- **Uptime Monitoring**: Pingdom
- **Log Aggregation**: ELK Stack

### 6.2 Critical Alerts

| Alert | Threshold | Action | Escalation |
|-------|-----------|---------|------------|
| API Response Time | >1000ms for 5 min | Check load, scale if needed | 15 min |
| Error Rate | >1% for 5 min | Check logs, identify issue | 10 min |
| Database CPU | >80% for 10 min | Investigate queries | 20 min |
| Disk Space | <20% free | Clean up logs/temp files | 30 min |
| Queue Depth | >1000 items | Scale workers | 15 min |
| Failed Logins | >100/min | Check for attacks | Immediate |

### 6.3 Dashboard URLs
- **System Health**: https://monitor.healthscheduler.com/dashboard
- **API Metrics**: https://monitor.healthscheduler.com/api
- **User Analytics**: https://analytics.healthscheduler.com
- **Security Dashboard**: https://security.healthscheduler.com

---

## 7. Troubleshooting Guide

### 7.1 Common Issues and Solutions

#### High API Response Times
```bash
# 1. Check current load
htop
docker stats

# 2. Check slow queries
psql -h db.healthscheduler.com -U postgres -d healthscheduler_prod
\x
SELECT * FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '1 minute';

# 3. Clear Redis cache if needed
redis-cli -h redis.healthscheduler.com
FLUSHDB

# 4. Scale API servers
aws autoscaling set-desired-capacity --auto-scaling-group-name healthscheduler-api-asg --desired-capacity 5
```

#### Database Connection Issues
```bash
# 1. Check connection pool
curl http://api1.healthscheduler.com:9090/metrics | grep pg_pool

# 2. Check database status
psql -h db.healthscheduler.com -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# 3. Restart connection pool
pm2 restart api-server

# 4. If critical, failover to replica
./failover-to-replica.sh
```

#### Payment Processing Failures
```bash
# 1. Check Stripe webhook status
curl https://api.stripe.com/v1/webhook_endpoints \
  -u sk_live_xxx:

# 2. Verify webhook secret
grep STRIPE_WEBHOOK_SECRET /opt/healthscheduler/api/.env

# 3. Check webhook logs
tail -f /var/log/healthscheduler/webhooks.log

# 4. Manually replay failed webhooks
./replay-webhooks.sh --from "2025-06-06 00:00:00"
```

### 7.2 Emergency Procedures

#### System Down
1. Check status page: https://status.healthscheduler.com
2. Run diagnostics: `./emergency-diagnostics.sh`
3. If database issue: `./db-emergency-recovery.sh`
4. If application issue: `./app-emergency-restart.sh`
5. Update status page
6. Notify stakeholders via emergency email list

#### Data Breach Suspected
1. **IMMEDIATELY** run: `./security-lockdown.sh`
2. Preserve logs: `./preserve-security-logs.sh`
3. Contact security team: security@healthscheduler.com
4. Contact legal team: legal@healthscheduler.com
5. Begin incident response procedure (see Security Runbook)

---

## 8. Maintenance Procedures

### 8.1 Routine Maintenance

#### Database Maintenance
```sql
-- Weekly VACUUM (automated)
VACUUM ANALYZE;

-- Monthly REINDEX (scheduled)
REINDEX DATABASE healthscheduler_prod;

-- Quarterly full maintenance
./db-full-maintenance.sh
```

#### Application Updates
```bash
# Security patches (monthly)
./apply-security-patches.sh

# Dependency updates (quarterly)
cd /opt/healthscheduler/api
npm audit
npm update

cd /opt/healthscheduler/frontend
npm audit
npm update
```

### 8.2 Backup Procedures

#### Automated Backups
- **Database**: Every 4 hours to S3
- **File Storage**: Daily incremental to S3
- **Configuration**: Daily to Git repository
- **Retention**: 30 days standard, 1 year for monthly

#### Manual Backup
```bash
# Full system backup
./backup-full-system.sh

# Database only
./backup-database.sh --type full

# Application files
./backup-application.sh
```

#### Restore Procedures
```bash
# List available backups
./list-backups.sh

# Restore database to point in time
./restore-database.sh --timestamp "2025-06-06 10:00:00"

# Restore application files
./restore-application.sh --backup-id prod-2025-06-06-1000
```

---

## 9. Security Operations

### 9.1 Security Monitoring

#### Daily Security Tasks
- Review authentication logs
- Check failed login attempts
- Monitor API rate limit violations
- Review security alerts
- Check SSL certificate expiry

#### Security Tools
```bash
# Run security scan
./security-scan.sh

# Check for vulnerabilities
npm audit
./check-cves.sh

# Review access logs
./analyze-access-logs.sh --suspicious

# Generate security report
./generate-security-report.sh --daily
```

### 9.2 Incident Response

#### Security Incident Levels
1. **Level 1** (Low): Unusual activity, monitor
2. **Level 2** (Medium): Potential threat, investigate
3. **Level 3** (High): Active threat, contain
4. **Level 4** (Critical): Breach confirmed, full response

#### Response Procedures
```bash
# Level 3-4 Response
./initiate-incident-response.sh --level 3

# This will:
# 1. Snapshot all systems
# 2. Increase logging
# 3. Alert security team
# 4. Begin evidence collection
# 5. Prepare for containment
```

### 9.3 Compliance

#### HIPAA Compliance Checks
```bash
# Daily PHI access audit
./audit-phi-access.sh --date today

# Weekly compliance report
./generate-compliance-report.sh --type hipaa

# Monthly security review
./security-compliance-review.sh
```

#### Audit Trail Maintenance
- Audit logs retained for 7 years
- Encrypted and stored in separate infrastructure
- Regular integrity checks
- Quarterly audit reviews

---

## 10. Support Procedures

### 10.1 Support Tiers

#### Tier 1 - Customer Support
- Password resets
- Basic navigation help
- Known issue workarounds
- Escalation to Tier 2

#### Tier 2 - Technical Support
- Application errors
- Data issues
- Integration problems
- Escalation to Tier 3

#### Tier 3 - Engineering
- Code fixes
- Infrastructure issues
- Performance problems
- Security incidents

### 10.2 Common Support Tasks

#### Reset User Password
```bash
# Via admin panel
https://admin.healthscheduler.com/users

# Via CLI
./reset-user-password.sh --email user@example.com
```

#### Unlock User Account
```bash
./unlock-account.sh --email user@example.com
```

#### Generate Support Report
```bash
./generate-support-report.sh --user user@example.com --days 7
```

### 10.3 Escalation Procedures

| Issue Type | First Response | Escalation Time | Contact |
|------------|---------------|-----------------|---------|
| System Down | 5 minutes | 15 minutes | On-call engineer |
| Data Loss | 10 minutes | 20 minutes | Data team lead |
| Security | Immediate | 5 minutes | Security team |
| Performance | 15 minutes | 30 minutes | DevOps lead |
| Feature Bug | 30 minutes | 2 hours | Dev team |

---

## 11. Knowledge Transfer

### 11.1 Training Schedule

#### Week 1: System Overview
- Architecture walkthrough
- Component deep dive
- Security model
- Hands-on exercises

#### Week 2: Operations
- Deployment procedures
- Monitoring and alerts
- Troubleshooting
- Maintenance tasks

#### Week 3: Advanced Topics
- Performance tuning
- Security operations
- Disaster recovery
- Custom procedures

### 11.2 Documentation Resources

#### Internal Documentation
- Technical wiki: https://wiki.healthscheduler.com
- Runbooks: https://runbooks.healthscheduler.com
- API docs: https://api-docs.healthscheduler.com
- Video tutorials: https://training.healthscheduler.com

#### External Resources
- AWS documentation
- PostgreSQL documentation
- Node.js best practices
- HIPAA compliance guides

### 11.3 Key Contacts

#### Development Team
- **Tech Lead**: John Smith (john@healthscheduler.com)
- **Backend Lead**: Jane Doe (jane@healthscheduler.com)
- **Frontend Lead**: Mike Johnson (mike@healthscheduler.com)
- **DevOps Lead**: Sarah Williams (sarah@healthscheduler.com)

#### Support Contacts
- **AWS Support**: Premium support portal
- **Database Support**: support@postgresql.com
- **Security Vendor**: soc@securityvendor.com
- **Monitoring Vendor**: support@datadog.com

### 11.4 Handover Checklist

- [ ] All documentation reviewed
- [ ] Access credentials verified
- [ ] Monitoring dashboards accessible
- [ ] Deployment procedures tested
- [ ] Emergency contacts updated
- [ ] On-call schedule configured
- [ ] Training completed
- [ ] Shadow operations for 1 week
- [ ] Independent operations verified
- [ ] Sign-off completed

---

## 12. Appendices

### Appendix A: Script Locations

All operational scripts are located in:
```
/opt/healthscheduler/scripts/
├── deployment/
├── maintenance/
├── monitoring/
├── security/
├── backup/
└── troubleshooting/
```

### Appendix B: Configuration Files

```
/etc/healthscheduler/
├── nginx/
├── systemd/
├── monitoring/
├── security/
└── backup/
```

### Appendix C: Log File Locations

```
/var/log/healthscheduler/
├── api/
├── frontend/
├── nginx/
├── deployment/
├── security/
└── audit/
```

### Appendix D: Important URLs

#### Production
- Main App: https://app.healthscheduler.com
- API: https://api.healthscheduler.com
- Admin: https://admin.healthscheduler.com
- Status: https://status.healthscheduler.com

#### Staging
- Main App: https://staging.healthscheduler.com
- API: https://api-staging.healthscheduler.com
- Admin: https://admin-staging.healthscheduler.com

### Appendix E: Glossary

- **PHI**: Protected Health Information
- **MFA**: Multi-Factor Authentication
- **RTO**: Recovery Time Objective (4 hours)
- **RPO**: Recovery Point Objective (1 hour)
- **ALB**: Application Load Balancer
- **WAF**: Web Application Firewall
- **KMS**: Key Management Service
- **VPC**: Virtual Private Cloud

---

## Sign-Off

### Development Team Handover

**Prepared by**: Development Team Lead  
**Date**: June 6, 2025  
**Signature**: _______________________

### Operations Team Acceptance

**Accepted by**: Operations Team Lead  
**Date**: _______________________  
**Signature**: _______________________

### Notes
_Space for any additional notes or concerns from the handover process:_

---

*This document contains sensitive operational information. Handle according to company security policies. Last updated: June 6, 2025*