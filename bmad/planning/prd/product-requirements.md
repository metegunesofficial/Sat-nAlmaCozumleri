# Product Requirements Document (PRD)
## Attelia Dental - Enterprise Satın Alma Yönetim Platformu

**Version:** 1.0
**Date:** 2025-11-05
**Status:** Active Development
**Method:** BMAD Method Track

---

## Executive Summary

Attelia Dental, kurumsal düzeyde çok kiracılı (multi-tenant) satın alma ve onay yönetim sistemidir. Birden fazla şirket/organizasyon için 3 katmanlı bütçe kontrolleri, çok aşamalı onay süreçleri ve kapsamlı raporlama özellikleri sunar.

### Business Goals
- Kurumsal satın alma süreçlerini dijitalleştirme
- Bütçe kontrolü ve mali disiplin sağlama
- Çok aşamalı onay süreçlerini otomatikleştirme
- Departmanlar arası şeffaflık ve izlenebilirlik
- Satın alma performans metrikleri ve analitiği

### Success Metrics
- %50+ satın alma süreç süresi azalması
- %30+ bütçe uyum iyileştirmesi
- %90+ kullanıcı onay takip oranı
- <2 saat ortalama onay süresi
- %95+ sistem kullanılabilirlik (uptime)

---

## Product Overview

### Vision
"Şirketlerin satın alma süreçlerini tamamen dijitalleştiren, otomatik kontroller ve akıllı onay sistemleri ile mali disiplini sağlayan enterprise platform."

### Target Users

#### Primary Users
1. **Çalışanlar (Employees)**
   - Satın alma talebi oluşturma
   - Talep durumu takibi
   - Kişisel bütçe görüntüleme
   - Ürün katalog browsing

2. **Departman Müdürleri**
   - Departman taleplerini onaylama/reddetme
   - Departman bütçe takibi
   - Takım üyesi harcama görüntüleme

3. **Satın Alma Müdürleri**
   - Orta/yüksek tutarlı onaylar
   - Tedarikçi yönetimi
   - Satın alma metrikleri izleme

4. **Finans Müdürleri**
   - Yüksek tutarlı nihai onaylar
   - Bütçe performans analizi
   - Mali raporlama

5. **Sistem Yöneticileri**
   - Platform konfigürasyonu
   - Kullanıcı ve yetki yönetimi
   - Workflow tanımlama

#### Secondary Users
- Tedarikçiler (gelecek faz)
- C-Level executives (raporlama görüntüleme)
- Denetçiler (audit log erişimi - gelecek faz)

---

## Core Features

### 1. Multi-Tenant Architecture

**Business Value:** Tek platform üzerinde birden fazla şirket/organizasyon hizmeti

**Technical Requirements:**
- Tam veri izolasyonu (company-scoped)
- Şirket bazlı konfigürasyon
- Cross-company data leakage prevention
- Company-specific branding (gelecek faz)

**User Stories:**
```
AS A super admin
I WANT TO manage multiple companies on a single platform
SO THAT I can serve multiple organizations efficiently

AS A company admin
I WANT TO see only my company's data
SO THAT data privacy is maintained

AS A user
I WANT TO be associated with a specific company
SO THAT I only access relevant data
```

**Acceptance Criteria:**
- ✅ Company model with isolation
- ✅ All queries include companyId filter
- ✅ User-company relationship validation
- ✅ Company-specific settings storage
- ⏳ Company branding customization

---

### 2. Three-Tier Budget Management System

**Business Value:** Granüler bütçe kontrolü (şirket → departman → kişi)

#### 2.1 Company-Level Budget
**Features:**
- Yıllık/aylık bütçe tanımlama
- Kategori bazlı bütçe dağılımı (IT, Operasyonel, Genel)
- Gerçek zamanlı harcama tracking
- Bütçe aşım uyarıları

**User Stories:**
```
AS A finance manager
I WANT TO set company-wide budget by category
SO THAT I can control overall spending

AS A company admin
I WANT TO see real-time budget utilization
SO THAT I can make informed decisions
```

**Acceptance Criteria:**
- ✅ CompanyBudget model
- ✅ Monthly/yearly budget fields
- ✅ Category-based allocation
- ✅ Real-time calculation
- ⏳ Alert thresholds

#### 2.2 Department-Level Budget
**Features:**
- Departman bazlı bütçe ataması
- Hiyerarşik departman yapısı desteği
- Alt departmanlara bütçe dağılımı
- Departman müdürü yetkilendirmesi

**User Stories:**
```
AS A finance manager
I WANT TO allocate budget to departments
SO THAT spending is controlled at dept level

AS A department manager
I WANT TO see my department's budget status
SO THAT I can manage my team's spending
```

**Acceptance Criteria:**
- ✅ Budget model linked to departments
- ✅ Hierarchical department structure
- ✅ Budget inheritance rules
- ✅ Department manager override (with approval)
- ⏳ Budget transfer between departments

#### 2.3 User-Level Budget
**Features:**
- Çalışan bazında aylık/yıllık limit
- Kişisel harcama takibi
- Otomatik limit kontrolü (talep oluşturma)
- Limit aşım bildirimleri

**User Stories:**
```
AS A department manager
I WANT TO set individual budget limits
SO THAT I can control team member spending

AS AN employee
I WANT TO see my remaining budget
SO THAT I know my purchasing power
```

**Acceptance Criteria:**
- ✅ UserBudget model
- ✅ Monthly/yearly limits
- ✅ Real-time spent calculation
- ✅ Pre-request validation
- ⏳ Budget request flow (increase request)

---

### 3. Hierarchical Purchase Category System

**Business Value:** Organize purchases by type with specific rules and limits

**Features:**
- Unlimited nesting levels
- Category-specific budget limits
- Automatic approval requirements
- Minimum approval thresholds
- Category-based access control

**Category Structure:**
```
IT ve Teknoloji
├── Donanım
│   ├── Bilgisayar (Limit: 100K/month)
│   ├── Server (Limit: 200K/month)
│   └── Network Equipment (Limit: 50K/month)
└── Yazılım
    ├── Licenses (Min Approval: 5K)
    └── SaaS Subscriptions (Min Approval: 1K)

Ofis Malzemeleri
├── Kırtasiye (Auto-approve: <500₺)
└── Mobilya (Min Approval: 2K)

Operasyonel Giderler
├── Temizlik
└── Bakım-Onarım
```

**User Stories:**
```
AS A procurement manager
I WANT TO define purchase categories with rules
SO THAT purchases follow company policies

AS AN employee
I WANT TO select appropriate category
SO THAT my request follows the correct approval flow
```

**Acceptance Criteria:**
- ✅ PurchaseCategory model
- ✅ Parent-child relationships
- ✅ Monthly/yearly limits per category
- ✅ requiresApproval flag
- ✅ minApprovalAmount threshold
- ⏳ Category spending analytics

---

### 4. Multi-Step Approval Workflows

**Business Value:** Automated, rule-based approval routing

**Features:**
- Amount-based workflow selection
- Unlimited approval steps
- Parallel and sequential approval support
- Role-based approvers
- Approve/Reject/Return actions
- Comment and justification system
- Automatic notifications

**Default Workflows:**

| Amount Range | Workflow | Steps |
|--------------|----------|-------|
| 0 - 10,000₺ | Standard | Dept Manager |
| 10,001 - 50,000₺ | Two-Step | Dept Manager → Procurement Manager |
| 50,001+₺ | Three-Step | Dept Manager → Procurement → Finance Manager |

**User Stories:**
```
AS A procurement manager
I WANT TO define approval workflows by amount
SO THAT appropriate stakeholders review purchases

AS AN approver
I WANT TO approve/reject with comments
SO THAT I can provide feedback

AS A requester
I WANT TO track approval progress
SO THAT I know the status of my request
```

**Acceptance Criteria:**
- ✅ ApprovalWorkflow model
- ✅ ApprovalStep model (ordered)
- ✅ Amount-based workflow selection
- ✅ Role-based approver assignment
- ✅ ApprovalAction tracking
- ✅ Status transitions (pending → in_review → approved/rejected)
- ⏳ Parallel approval support
- ⏳ Escalation rules (timeout)
- ⏳ Email notifications

---

### 5. Purchase Request Management

**Business Value:** Core purchasing workflow

**Features:**
- Multi-item requests
- Budget validation (3-tier)
- Category validation
- Automatic workflow assignment
- Real-time status tracking
- Request modification (before approval)
- Priority levels (low/medium/high/urgent)

**Request Lifecycle:**
```
draft → submitted → in_review →
  └─→ approved → ordered → received → completed
  └─→ rejected → closed
  └─→ returned → draft (for modification)
```

**User Stories:**
```
AS AN employee
I WANT TO create purchase requests
SO THAT I can request needed items

AS A system
I WANT TO validate budgets automatically
SO THAT invalid requests are prevented

AS AN approver
I WANT TO see complete request details
SO THAT I can make informed decisions
```

**Acceptance Criteria:**
- ✅ PurchaseRequest model
- ✅ PurchaseRequestItem model
- ✅ 3-tier budget validation
- ✅ Category limit validation
- ✅ Workflow auto-assignment
- ✅ Status management
- ✅ Priority levels
- ⏳ Draft/save functionality
- ⏳ Request modification workflow
- ⏳ Batch approval

---

### 6. Comprehensive Reporting System

**Business Value:** Data-driven insights and performance tracking

#### 6.1 Purchase Reports
**Metrics:**
- Status-based analysis (pending/approved/rejected)
- Department spending breakdown
- Priority distribution
- Top requested products
- Average approval times
- Request volume trends

**User Stories:**
```
AS A finance manager
I WANT TO see company-wide purchase analytics
SO THAT I can identify spending patterns

AS A department manager
I WANT TO see my department's purchase history
SO THAT I can manage future budgets
```

#### 6.2 Budget Reports
**Metrics:**
- 3-tier budget utilization
- Department vs budget performance
- Individual spending tracking
- Category-based spending
- Critical/warning levels
- Budget forecast

**User Stories:**
```
AS A finance manager
I WANT TO see budget utilization across all levels
SO THAT I can plan next period's budgets

AS AN admin
I WANT TO receive alerts on budget overruns
SO THAT I can take corrective action
```

#### 6.3 Approval Performance Reports
**Metrics:**
- Approver performance analysis
- Approval/rejection rates
- Average response times
- Bottleneck identification
- Workflow efficiency
- Approval chain analysis

**User Stories:**
```
AS A procurement manager
I WANT TO see approval bottlenecks
SO THAT I can optimize workflows

AS AN executive
I WANT TO see overall approval efficiency
SO THAT I can improve processes
```

**Acceptance Criteria:**
- ✅ API endpoints for all reports
- ✅ Date range filtering
- ✅ Company/department filtering
- ✅ Export-ready data format
- ⏳ Frontend UI with charts
- ⏳ Excel/PDF export
- ⏳ Scheduled reports (email)
- ⏳ Custom report builder

---

### 7. Role-Based Access Control (RBAC)

**Roles & Permissions:**

| Role | Level | Key Permissions |
|------|-------|-----------------|
| SUPER_ADMIN | Platform | All companies access, system config |
| COMPANY_ADMIN | Company | Company-wide config, user management |
| GENERAL_MANAGER | Executive | All approvals, all reports |
| FINANCE_MANAGER | Financial | Financial approvals, budget management |
| PROCUREMENT_MANAGER | Operational | Procurement approvals, supplier management |
| DEPARTMENT_MANAGER | Department | Department approvals, team management |
| EMPLOYEE | Basic | Create requests, view own data |

**User Stories:**
```
AS A system admin
I WANT TO assign roles to users
SO THAT they have appropriate access

AS A user
I WANT TO see only authorized features
SO THAT the system is secure

AS AN auditor
I WANT TO review role assignments
SO THAT I can ensure compliance
```

**Acceptance Criteria:**
- ✅ Role enum in User model
- ✅ Role-based API authentication
- ✅ Frontend role-based UI rendering
- ⏳ Fine-grained permissions (beyond roles)
- ⏳ Audit log for role changes
- ⏳ Temporary role delegation

---

### 8. E-Commerce Module

**Business Value:** Internal product catalog and ordering

**Features:**
- Company-scoped product catalog
- Hierarchical categories
- Advanced search & filtering
- Shopping cart
- Product images & details
- Stock tracking
- Bulk pricing support
- Minimum order quantity
- Product reviews (future)

**User Stories:**
```
AS AN employee
I WANT TO browse available products
SO THAT I can add them to my request

AS A procurement manager
I WANT TO manage product catalog
SO THAT employees have pre-approved options

AS A system
I WANT TO validate stock availability
SO THAT orders are fulfillable
```

**Acceptance Criteria:**
- ✅ Product model (company-scoped)
- ✅ Category hierarchy
- ✅ Search & filter API
- ✅ Cart functionality
- ✅ Stock tracking
- ✅ Bulk pricing tiers
- ⏳ Product image upload
- ⏳ Product reviews/ratings
- ⏳ Wishlist functionality

---

## Technical Requirements

### Performance
- Page load time: <2 seconds
- API response time: <500ms (95th percentile)
- Support 1000+ concurrent users
- Database query optimization (indexes on all foreign keys)
- Pagination on all list endpoints

### Security
- JWT-based authentication
- HTTPS only (production)
- Password hashing (bcrypt)
- SQL injection prevention (Prisma ORM)
- XSS protection
- CSRF tokens
- Rate limiting (future)
- IP whitelisting (enterprise feature)

### Scalability
- Horizontal scaling ready
- Stateless API design
- Database connection pooling
- Redis caching (future)
- CDN for static assets (future)
- Microservices migration path (future)

### Reliability
- 99.5% uptime SLA
- Automatic error logging
- Database backup (daily)
- Disaster recovery plan
- Health check endpoints

### Compliance
- GDPR compliance (EU)
- KVKK compliance (Turkey)
- SOC 2 Type II (future)
- ISO 27001 (future)

---

## User Experience Requirements

### Usability
- Mobile-responsive design
- Intuitive navigation
- Maximum 3 clicks to any feature
- Consistent UI patterns
- Loading states for all actions
- Clear error messages
- Tooltips for complex features

### Accessibility
- WCAG 2.1 Level AA compliance (future)
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Font size adjustments

### Performance
- Perceived performance (skeleton screens)
- Optimistic UI updates
- Background task processing
- Progressive enhancement

---

## Integration Requirements

### Current
- PostgreSQL database
- Next.js API Routes
- Prisma ORM

### Planned
- Email service (SendGrid/AWS SES)
- SMS notifications (Twilio)
- File storage (AWS S3/Azure Blob)
- PDF generation (PDFKit/Puppeteer)
- Excel export (ExcelJS)

### Future Considerations
- ERP integration (SAP/Oracle)
- Accounting software (QuickBooks)
- Payment gateways
- E-signature (DocuSign)
- BI tools (Tableau/Power BI)

---

## Success Criteria

### Launch Criteria (MVP)
- ✅ Multi-tenant architecture
- ✅ 3-tier budget system
- ✅ Multi-step approvals
- ✅ Purchase request CRUD
- ✅ Basic reporting APIs
- ⏳ User authentication UI
- ⏳ Dashboard with key metrics
- ⏳ Request management UI
- ⏳ Admin panel (users, departments, products)

### Phase 2 (3 months)
- Complete frontend UI
- Email notifications
- File attachments
- Advanced reporting UI
- Excel/PDF export
- Audit logging

### Phase 3 (6 months)
- Mobile app (React Native)
- Supplier portal
- Contract management
- Invoice management
- Advanced analytics
- AI-powered insights

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Budget calculation errors | High | Medium | Extensive testing, validation rules |
| Approval workflow bugs | High | Medium | State machine testing, edge cases |
| Performance with large data | Medium | High | Pagination, indexing, caching |
| Multi-tenancy data leaks | Critical | Low | Comprehensive security audits |
| User adoption resistance | Medium | Medium | Training, onboarding, support |

---

## Out of Scope (Current Phase)

- Mobile native applications
- Supplier portal
- Contract lifecycle management
- Invoice processing
- Payment processing
- Advanced analytics/BI
- Machine learning recommendations
- Blockchain/audit trail
- Multi-currency support
- Multi-language support

---

## Appendix

### Glossary
- **Multi-tenant:** Single application instance serving multiple organizations
- **Approval Workflow:** Predefined sequence of approval steps
- **Budget Tier:** Level of budget control (company/department/user)
- **Purchase Category:** Classification of purchasable items
- **Company-scoped:** Data isolated to specific company

### References
- BMAD-METHOD: https://github.com/bmad-code-org/BMAD-METHOD
- Next.js Documentation: https://nextjs.org/docs
- Prisma Documentation: https://www.prisma.io/docs

### Revision History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-05 | BMAD Team | Initial PRD |

---

**Document Status:** ✅ Approved for Development
**Next Review Date:** 2025-12-05
**Owner:** Product Management Team
