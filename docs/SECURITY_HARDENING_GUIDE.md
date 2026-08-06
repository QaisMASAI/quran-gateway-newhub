# Quran Gateway — Production Security Hardening Guide & Architecture Spec

**Author**: Senior Cybersecurity Engineer  
**Target Compliance**: GDPR (EU), CCPA (California), ISO 27001, Islamic Digital Ethics Guidelines  

---

## 1. Rate Limiting Architecture (Redis Token Bucket)

To protect the platform against DDoS, brute-force attacks, and API scraper abuse while supporting high-throughput legitimate traffic, we implement a tiered rate limiting system in Redis:

| Tier / Endpoint Group | Burst Capacity | Window | Limit / Min | Action on Breach |
| :--- | :--- | :--- | :--- | :--- |
| **Public Reading (`/api/v1/quran/*`)** | 200 req | 1 minute | 1,000 req | HTTP 429 + Progressive Exponential Backoff |
| **Search Gateway (`/api/v1/search`)** | 60 req | 1 minute | 300 req | HTTP 429 + Retry-After Header |
| **Authenticated User Actions (`/user/*`)**| 100 req | 1 minute | 600 req | HTTP 429 + Session Flag |
| **Authentication / Login / 2FA** | 5 req | 15 minutes | 10 req | HTTP 429 + Account Temporary Lockout |
| **Admin Operations (`/api/public/admin/*`)**| 30 req | 1 minute | 100 req | HTTP 429 + Security Incident Event Logged |

---

## 2. Authentication, Authorization (RBAC) & 2FA

### 2.1 Role-Based Access Control (RBAC) Matrix

| Role | `read:quran` | `write:notes` | `moderate:comments` | `certify:tafsir` | `admin:access` | `manage:users` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Guest** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **User** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Moderator** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Scholar** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Super Admin**| ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 2.2 Two-Factor Authentication (TOTP / RFC 6238)
- Provisioning file: `/src/lib/security/totp.ts`
- Standard: 6-digit TOTP with HMAC-SHA1 and 30-second sliding time windows.
- Backup Codes: 10 single-use cryptographically generated recovery codes per user.

---

## 3. Data Protection, PII & Compliance

### 3.1 GDPR & CCPA Compliance
- **Right to Erasure (Article 17)**: Automated deletion routine (`processRightToErasure`) soft-deletes user accounts and strips PII from audit logs.
- **Data Minimization & Masking**: All user emails and names exposed via non-profile endpoints are masked via `maskEmail()`.
- **Encryption at Rest & Transit**: AES-256 for database storage; TLS 1.3 for all client-server communications.

### 3.2 Islamic Data Handling Guidelines
- **Ad-Free Sanctity**: Absolute ban on third-party ad-tracking scripts or behavioral profiling pixels.
- **Sacred Content Integrity**: Strict cryptographic checksums on all Ayah text and Tafsir entries to prevent unauthorized tampering.

---

## 4. Incident Response Plan

1. **Detection**: Real-time alerts triggered by `audit.audit_logs` or Redis 429 breach surges.
2. **Containment**: Automated IP banning via Cloudflare / GCP Armor rules for IP thresholds > 10,000 req/min.
3. **Eradication**: Token revocation for compromised credentials across all session stores.
4. **Recovery & Post-Mortem**: Restore from PITR backup within SLA targets (RTO < 15 min, RPO < 5s).
