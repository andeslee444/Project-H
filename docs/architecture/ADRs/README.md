# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for the Project H mental health practice management system.

## What are ADRs?

Architecture Decision Records (ADRs) capture important architectural decisions made during the development of this system. Each ADR documents:

- **Context**: The situation that prompted the decision
- **Decision**: What was decided
- **Status**: Proposed, accepted, deprecated, or superseded
- **Consequences**: The results of the decision, both positive and negative

## ADR Index

| ADR | Title | Status | Date |
|-----|--------|--------|------|
| [ADR-001](./001-security-layered-approach.md) | Multi-layered Security Architecture | Accepted | 2024-01-20 |
| [ADR-002](./002-hipaa-compliance-framework.md) | HIPAA Compliance Framework Design | Accepted | 2024-01-20 |
| [ADR-003](./003-session-management-strategy.md) | Secure Session Management Strategy | Accepted | 2024-01-20 |
| [ADR-004](./004-performance-monitoring-approach.md) | Performance Monitoring Implementation | Accepted | 2024-01-20 |
| [ADR-005](./005-accessibility-testing-automation.md) | Accessibility Testing Automation | Accepted | 2024-01-20 |
| [ADR-006](./006-data-encryption-patterns.md) | Data Encryption and PII Protection | Accepted | 2024-01-20 |
| [ADR-007](./007-audit-trail-design.md) | Audit Trail System Design | Accepted | 2024-01-20 |

## ADR Template

When creating new ADRs, use the [ADR template](./template.md).

## Reading Order

For new team members, we recommend reading ADRs in this order:

1. **ADR-001**: Understand the overall security philosophy
2. **ADR-002**: Learn about HIPAA compliance requirements
3. **ADR-003**: Understand session management
4. **ADR-006**: Learn about data protection
5. **ADR-007**: Understand audit requirements
6. **ADR-004**: Learn about performance monitoring
7. **ADR-005**: Understand accessibility requirements

## Maintenance Guidelines

### When to Create an ADR

Create an ADR when making decisions about:

- Security architecture and implementation
- HIPAA compliance strategies
- Performance optimization approaches
- Major technology choices
- Data architecture decisions
- Integration patterns
- Accessibility strategies

### ADR Lifecycle

1. **Proposed**: Decision is under consideration
2. **Accepted**: Decision has been made and implemented
3. **Deprecated**: Decision is no longer recommended but still in use
4. **Superseded**: Decision has been replaced by a newer ADR

### Reviewing ADRs

ADRs should be reviewed:
- **Quarterly**: Check if decisions still make sense
- **Before major releases**: Ensure alignment with current architecture
- **When incidents occur**: Review related decisions
- **When onboarding**: Use as training material

## Contact

For questions about architectural decisions, contact:
- Security Team: for security-related ADRs
- Compliance Team: for HIPAA-related ADRs
- Engineering Team: for technical implementation ADRs