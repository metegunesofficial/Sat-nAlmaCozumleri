# Satın Alma Çözümleri Platformu - BMAD Metodolojisi ile Kapsamlı PRD ve Uygulama Planı

**Versiyon:** 1.0
**Tarih:** 7 Kasım 2025
**Metodoloji:** BMAD (Analysis → Planning → Solutioning → Implementation)

---

## Executive Summary

Bu belge, **enterprise white-label multi-tenant satın alma platformu** için BMAD metodolojisi çerçevesinde hazırlanmış kapsamlı bir PRD ve 20 haftalık uygulama planıdır. Mevcut 12 adımlık plana entegre edilerek 4 kritik yenilik ekler:

### Temel Yenilikler

1. **White-Label Özelleştirme**: Logo, tema, custom fields, form layouts, menü yapısı
2. **Zoho-Style Dinamik Raporlama**: Drag-drop builder, pivot tables, dashboards, scheduled reports
3. **Multi-Channel Bildirim**: Email, SMS, WhatsApp, Push, In-App (real-time)
4. **Visual Workflow Designer**: Sınırsız approval flows, conditional branching, escalation

### Teknoloji Stack

- **Framework**: Next.js 14+ App Router, TypeScript
- **Database**: Vercel Postgres + Prisma ORM
- **Auth**: NextAuth.js with bcrypt
- **Queue**: BullMQ (Upstash Redis)
- **Notifications**: SendGrid, Twilio, WhatsApp Business API
- **Real-time**: Server-Sent Events (SSE)
- **Workflow**: ReactFlow visual designer
- **Reports**: Recharts, TanStack Table

---

## PHASE 1: BMAD ANALYSIS

### 1.1 Problem Statement

**Mevcut Durum:**
Türk işletmeleri satın alma süreçlerini manuel Excel, email ve kağıt tabanlı yöntemlerle yönetiyor. Merkado.com.tr gibi çözümler temel ihtiyaçları karşılıyor ancak:

- ❌ Her şirket aynı arayüzü kullanıyor (white-label yok)
- ❌ Raporlar statik ve sınırlı
- ❌ Workflow esnekliği düşük
- ❌ Modern bildirim kanalları eksik (WhatsApp, Push)
- ❌ API dokümantasyonu zayıf
- ❌ Custom field desteği yok

**Hedef Çözüm:**
Her şirkete özel, tam özelleştirilebilir, API-first, modern bir SaaS platform.

### 1.2 Merkado.com.tr Karşılaştırması

**Merkado'nun Mevcut Özellikleri:**
- ✅ Satın alma talebi oluşturma
- ✅ Onay akışları (temel)
- ✅ Teklif toplama ve karşılaştırma
- ✅ Tedarikçi yönetimi
- ✅ Sipariş takibi
- ✅ ERP entegrasyonu
- ✅ Raporlama (sınırlı)

**Merkado'nun Eksikleri (Bizim Avantajımız):**

| Özellik | Merkado | Bizim Platform |
|---------|---------|----------------|
| White-label | ❌ Yok | ✅ Tam özelleştirme |
| Dinamik Raporlama | ❌ Statik | ✅ Zoho-style builder |
| Visual Workflow | ❌ Yok | ✅ Drag-drop designer |
| WhatsApp | ❌ Yok | ✅ Business API |
| Push Notifications | ❌ Yok | ✅ PWA push |
| Real-time Updates | ❌ Yok | ✅ SSE |
| Custom Fields | ❌ Yok | ✅ Sınırsız |
| API Docs | ⚠️ Zayıf | ✅ OpenAPI 3.0 |
| Modern UI/UX | ⚠️ Eski | ✅ Next.js 14 |

### 1.3 User Personas

**Persona 1: Satın Alma Müdürü (Mehmet, 42)**
- **Hedef**: Maliyetleri optimize etmek, süreçleri hızlandırmak
- **Pain Points**: Manuel süreçler, görünürlük eksikliği, yavaş onaylar
- **İhtiyaçlar**: Executive dashboards, spend analytics, vendor performance

**Persona 2: IT Yöneticisi (Ayşe, 35)**
- **Hedef**: Güvenlik, entegrasyon, ölçeklenebilirlik
- **Pain Points**: API eksikliği, legacy system entegrasyonları
- **İhtiyaçlar**: REST API, SSO, audit logs, webhooks

**Persona 3: CFO (Ali, 50)**
- **Hedef**: Bütçe kontrolü, compliance, cost reduction
- **Pain Points**: Bütçe aşımları, approval bottlenecks
- **İhtiyaçlar**: Financial reports, approval policies, budget alerts

**Persona 4: Satın Alma Uzmanı (Zeynep, 28)**
- **Hedef**: Günlük işleri hızlı tamamlamak
- **Pain Points**: Yavaş sistem, bildirim eksikliği, mobil erişim
- **İhtiyaçlar**: Quick request creation, mobile app, instant notifications

---

## PHASE 2: BMAD PLANNING

### 2.1 Functional Requirements

#### **FR-001: Multi-Tenant Infrastructure**

- Self-service tenant registration
- Subdomain routing (sirket.platform.com)
- Custom domain support (satinalma.sirket.com.tr)
- Database-per-tenant data isolation
- Tenant provisioning workflow
- Billing and metering

#### **FR-002: White-Label Customization**

**Branding:**
- Logo upload (header, email, PDF, mobile)
- Favicon customization
- Company name display
- Footer customization
- Login page branding

**Theme System:**
- Primary, secondary, accent colors
- Font selection (Google Fonts)
- Button styles and variants
- Dark/light mode
- CSS variables
- Live preview

**Custom Fields:**
- Field types: text, number, date, dropdown, multi-select, file, checkbox, formula
- Field validations (required, min/max, regex, custom)
- Conditional visibility rules
- Field dependencies
- Per-module custom fields

**Form Builder:**
- Drag-drop interface
- Section grouping
- Multi-column layouts (1-4 columns)
- Field ordering
- Help text and tooltips

**Menu Customization:**
- Dynamic menu structure
- Add/remove menu items
- Icon selection (Lucide icons)
- Role-based visibility
- Menu ordering

**Email Templates:**
- HTML email editor
- Variable interpolation {{user.name}}
- Multi-language support (TR/EN)
- Template preview
- Per-tenant templates

**Advanced:**
- Custom CSS injection (sanitized)
- Custom JavaScript (sandboxed)

#### **FR-003: Dynamic Reporting System**

**Report Builder:**
- Drag-and-drop UI (ReactFlow-inspired)
- Multi-table data sources
- Field picker (all database columns)
- Join configuration
- Aggregations (SUM, AVG, COUNT, MIN, MAX)
- Calculated fields (formulas)
- Grouping (3 levels)
- Sorting (multi-column)
- Real-time preview

**Filter Engine:**
- Simple filters (field = value)
- Complex filters (AND/OR/NOT)
- Date ranges (relative: "Last 30 days", absolute)
- User-based filters ("My records", "My team")
- Dynamic parameters

**Report Types:**
- **Tabular**: Flat list
- **Summary**: Grouped with subtotals
- **Matrix**: Pivot tables (2D)
- **Chart**: Visual only
- **Combo**: Table + Chart

**Visualizations (Recharts):**
- Column, Bar, Line, Pie, Donut, Area, Funnel charts
- Multi-series support
- Interactive drill-down
- Color customization

**Report Management:**
- Save as templates
- Folder organization
- Share (users, roles, public link)
- Version history
- Clone reports

**Scheduled Reports:**
- Daily, weekly, monthly schedules
- Cron expressions
- Email delivery (multiple recipients)
- Export formats (Excel, PDF, CSV)
- Delivery logs

**Dashboards:**
- Multi-widget layout (React Grid Layout)
- Drag-drop positioning
- Auto-refresh
- Global filters
- KPI widgets
- Dashboard sharing

#### **FR-004: Notification System**

**Channels:**

1. **Email** (SendGrid)
   - HTML templates
   - Attachments
   - Delivery tracking
   - Bounce handling
   - Unsubscribe links

2. **SMS** (Twilio/Netgsm)
   - 160 char templates
   - Delivery status
   - Cost tracking
   - DND compliance

3. **WhatsApp** (Business API)
   - Template messages
   - Interactive buttons
   - Media support
   - 24h conversation window
   - Opt-in management

4. **In-App** (SSE)
   - Real-time delivery
   - Notification center
   - Read/unread status
   - Action buttons
   - 30-day history

5. **Push** (PWA)
   - Web Push API
   - Service Worker
   - FCM integration
   - Action buttons

**Features:**
- Template library (multi-channel, multi-language)
- User preferences (channel, category, quiet hours)
- Notification logs (complete audit trail)
- Retry logic (exponential backoff)
- Rate limiting (anti-spam)
- A/B testing

#### **FR-005: Dynamic Approval Workflows**

**Visual Workflow Designer:**
- Node-based canvas (ReactFlow)
- Node types: Start, Task, Approval, Decision, Parallel Split/Join, Wait, End
- Drag-drop connections
- Validation (no orphans, single start/end)
- Auto-layout
- JSON export/import

**Approval Logic:**
- Single approver
- Multiple approvers (sequential, parallel)
- Approval threshold (all, any, majority, count, weighted)
- Role-based assignment
- Dynamic assignment (requester.manager, department.head)
- Approval matrix

**Decision Nodes:**
- If/Then/Else conditional branching
- Multi-condition (AND/OR)
- Operators: =, ≠, >, <, >=, <=, contains, in, exists
- Formula-based conditions

**Escalation System:**
- Time-based escalation (after X hours)
- Hierarchy escalation
- Custom escalation paths
- Multi-channel notifications (email → SMS → manager)
- SLA tracking

**Delegation:**
- Temporary delegation (date range)
- Permanent delegation
- Scope (workflow types, amount thresholds)
- Audit trail (original + effective approver)

**Advanced:**
- Workflow versioning
- In-flight instance handling
- Template library
- Workflow analytics

#### **FR-006: Core Procurement**

**Purchase Requests:**
- Request creation form
- Multi-item line items
- File attachments (Vercel Blob)
- Budget check
- Auto-save drafts
- Request cloning
- Bulk import (Excel)

**Approval Processing:**
- Approval inbox
- Approve/Reject/Request Changes
- Comments and feedback
- History timeline
- Bulk approval
- Mobile-friendly

**RFQ Management:**
- Create RFQ from approved request
- Select suppliers (multi)
- Email notifications to suppliers
- Supplier quote portal (no login required)
- Quote comparison matrix
- Best quote selection

**Purchase Orders:**
- Auto PO generation
- PO numbering system
- PDF generation
- Email to supplier
- PO tracking
- Delivery tracking

**Supplier Management:**
- Supplier database
- Category mapping
- Contact management
- Performance scoring
- Document library
- Supplier portal

**Budget Management:**
- Budget allocation (department/category)
- Budget vs actual tracking
- Budget alerts (80%, 90%, 100%)
- Multi-year budgets

#### **FR-007: Integration & API**

**REST API:**
- Complete CRUD for all resources
- OAuth2 + API key authentication
- Rate limiting (per tenant)
- Webhooks (events: request.created, request.approved, etc.)
- OpenAPI 3.0 documentation
- SDKs (JavaScript, Python)

**ERP Integration:**
- SAP connector
- Oracle connector
- Generic REST/SOAP adapter
- Field mapping UI
- Sync scheduling
- Error handling

**SSO:**
- SAML 2.0
- OAuth2/OpenID Connect
- Azure AD, Okta support
- JIT provisioning

### 2.2 Non-Functional Requirements

#### **NFR-001: Performance**
- Page load: < 2s (P95)
- API response: < 500ms (P95)
- Report generation: < 5s (10K rows)
- Real-time notification: < 1s latency
- Concurrent users: 1000+ per tenant

#### **NFR-002: Scalability**
- Horizontal scaling (stateless)
- Redis caching
- CDN for static assets
- Database connection pooling
- Auto-scaling (Vercel)

#### **NFR-003: Security**
- **Auth**: NextAuth.js + bcrypt
- **Session**: HTTP-only secure cookies
- **Encryption**: TLS 1.3, AES-256 at rest
- **2FA**: TOTP support
- **Rate Limiting**: Multi-level
- **XSS**: CSP headers
- **CSRF**: Token-based
- **Audit Logs**: All sensitive ops

#### **NFR-004: Compliance**
- GDPR: Data export, deletion, portability
- KVKK: Turkish data protection
- ISO 27001 ready
- SOC 2 roadmap

#### **NFR-005: Availability**
- Uptime: 99.9% SLA
- Daily backups
- RTO < 4 hours
- RPO < 1 hour

#### **NFR-006: Usability**
- Mobile-responsive
- WCAG 2.1 Level AA
- Multi-language (TR, EN)
- Modern browsers (latest 2 versions)
- Keyboard navigation

---

## PHASE 3: BMAD SOLUTIONING

### 3.1 System Architecture

```
┌─────────────────────────────────────────────────┐
│           Vercel Edge Network (CDN)              │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│        Next.js 14 App (Vercel Serverless)        │
│  ┌──────────────────────────────────────────┐   │
│  │ Middleware: Tenant + Auth + Rate Limit   │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │ App Router: Server/Client Components     │   │
│  └──────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         Prisma ORM (Type-Safe)                   │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│      Vercel Postgres (Neon) + Redis Cache        │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│     BullMQ Workers + Vercel Cron Jobs            │
└──────────────────────────────────────────────────┘

External: SendGrid, Twilio, WhatsApp, Vercel Blob
```

### 3.2 Database Design (Key Tables)

```prisma
model Tenant {
  id              String   @id @default(cuid())
  slug            String   @unique
  name            String
  customDomain    String?  @unique
  logoUrl         String?
  primaryColor    String   @default("#0070f3")
  settings        Json     @default("{}")
  plan            String   @default("starter")
  users           User[]
  createdAt       DateTime @default(now())
}

model User {
  id              String   @id @default(cuid())
  tenantId        String
  email           String
  passwordHash    String
  role            String   @default("user")
  permissions     Json     @default("[]")
  @@unique([tenantId, email])
}

model CustomField {
  id              String   @id @default(cuid())
  tenantId        String
  entityType      String   // "purchase_request"
  name            String
  fieldType       String   // "text", "number", "date"
  validation      Json?
  @@unique([tenantId, entityType, name])
}

model PurchaseRequest {
  id              String   @id @default(cuid())
  tenantId        String
  requestNumber   String   @unique
  title           String
  requesterId     String
  status          String   @default("draft")
  estimatedAmount Decimal?
  customData      Json     @default("{}")
  workflowInstance WorkflowInstance?
  items           RequestItem[]
}

model WorkflowTemplate {
  id              String   @id @default(cuid())
  tenantId        String
  name            String
  version         Int      @default(1)
  isActive        Boolean  @default(true)
  definition      Json     // Visual designer JSON
  instances       WorkflowInstance[]
}

model WorkflowInstance {
  id              String   @id @default(cuid())
  templateId      String
  entityType      String
  entityId        String
  currentState    String
  status          String   @default("running")
  data            Json     @default("{}")
  tasks           WorkflowTask[]
}

model WorkflowTask {
  id              String   @id @default(cuid())
  instanceId      String
  assigneeId      String
  taskType        String   // "approval"
  status          String   @default("pending")
  dueDate         DateTime?
  action          String?  // "approved", "rejected"
}

model ApprovalRule {
  id              String   @id @default(cuid())
  tenantId        String
  conditions      Json     // { amount: { min, max }, department }
  approverType    String   // "role", "user", "dynamic"
  approverValue   String
  level           Int      @default(1)
}

model NotificationTemplate {
  id              String   @id @default(cuid())
  tenantId        String
  name            String
  channel         String   // "email", "sms", "whatsapp"
  category        String   // "transactional", "marketing"
  subject         String?
  body            String   // With {{variables}}
  @@unique([tenantId, name, channel])
}

model NotificationLog {
  id              String   @id @default(cuid())
  tenantId        String
  userId          String
  channel         String
  status          String   @default("pending")
  recipient       String
  sentAt          DateTime?
  deliveredAt     DateTime?
}

model ReportTemplate {
  id              String   @id @default(cuid())
  tenantId        String
  name            String
  reportType      String   // "tabular", "summary", "matrix"
  definition      Json     // Fields, filters, grouping
  chartType       String?
  chartConfig     Json?
}

model AuditLog {
  id              String   @id @default(cuid())
  tenantId        String
  userId          String
  action          String   // "create", "update", "delete"
  entityType      String
  entityId        String
  changes         Json?
  createdAt       DateTime @default(now())
}
```

### 3.3 API Design

**Authentication (NextAuth.js):**
```typescript
// app/api/auth/[...nextauth]/route.ts
export const authOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Verify tenant + email + password
        const user = await prisma.user.findUnique({
          where: {
            tenantId_email: {
              tenantId: getTenantId(credentials.tenantSlug),
              email: credentials.email
            }
          }
        });

        if (!user) return null;

        const isValid = await compare(
          credentials.password,
          user.passwordHash
        );

        return isValid ? user : null;
      }
    })
  ]
};
```

**REST API Example:**
```typescript
// app/api/requests/route.ts
export async function POST(req: Request) {
  const session = await getServerSession();
  const body = await req.json();

  // Validate
  const validated = createRequestSchema.parse(body);

  // Create
  const request = await prisma.purchaseRequest.create({
    data: {
      tenantId: session.user.tenantId,
      requesterId: session.user.id,
      ...validated
    }
  });

  // Trigger workflow
  await triggerWorkflow(request.id);

  return Response.json(request, { status: 201 });
}
```

### 3.4 Security Architecture

**Multi-Layer Security:**

1. **Middleware** (tenant isolation, auth check, rate limit)
2. **API Layer** (validation, permission check)
3. **Database** (row-level security via tenantId)
4. **Audit** (all sensitive operations logged)

**Permission System:**
```typescript
const PERMISSIONS = {
  "requests.create": ["user", "manager", "admin"],
  "requests.approve": ["manager", "director"],
  "workflows.create": ["admin"],
  "reports.create": ["user", "manager", "admin"],
  "settings.edit": ["admin"]
};
```

---

## PHASE 4: BMAD IMPLEMENTATION

### 4.1 Entegre 20 Haftalık Roadmap

#### **SPRINT 1-2: Foundation (Weeks 1-2)**
**Mevcut Plan: Step 1-4**

**Week 1:**
- ✅ Step 1: Vercel Postgres + Prisma setup
- ✅ Core models: Tenant, User, AuditLog
- ✅ Migrations + seed data

**Week 2:**
- ✅ Step 2: NextAuth.js + bcrypt
- ✅ Step 3: Permission models
- ✅ Step 4: Middleware (tenant, auth, authz)

**Deliverable:** Working auth + tenant isolation

---

#### **SPRINT 3-4: Core Infrastructure (Weeks 3-4)**
**Mevcut Plan: Step 5-7**

**Week 3:**
- ✅ Step 5: /dev-admin panel
- ✅ Step 6: Tenant provisioning
- ✅ User management CRUD

**Week 4:**
- ⭐ **NEW**: CompanySettings model
- ⭐ White-label: Logo upload
- ⭐ Theme customization UI
- ⭐ CSS variables system

**Deliverable:** Admin panel + basic white-label

---

#### **SPRINT 5-6: Purchase Requests (Weeks 5-6)**
**Mevcut Plan: Step 7-8**

**Week 5:**
- ✅ Step 7: PurchaseRequest model
- ✅ Request creation form
- ✅ Request list/detail pages
- ✅ File attachments

**Week 6:**
- ✅ Step 8: Admin modules refactoring
- ✅ Supplier management
- ✅ Category management
- ✅ Department management

**Deliverable:** Functional procurement module

---

#### **SPRINT 7-8: Custom Fields (Weeks 7-8)**
**Mevcut Plan: Step 9 + NEW**

**Week 7:**
- ✅ Step 9: Hierarchical categories
- ✅ Category tree UI

**Week 8:**
- ⭐ **NEW**: CustomField model
- ⭐ Field type support (10+ types)
- ⭐ Form builder UI
- ⭐ Dynamic form rendering
- ⭐ JSONB custom data storage

**Deliverable:** Custom fields on all modules

---

#### **SPRINT 9-10: Workflow Foundation (Weeks 9-10)**
**NEW**

**Week 9:**
- ⭐ WorkflowTemplate, Instance, Task models
- ⭐ ApprovalRule, EscalationRule models
- ⭐ State machine engine
- ⭐ Workflow execution logic

**Week 10:**
- ⭐ ReactFlow integration
- ⭐ Visual designer UI
- ⭐ Node library (7+ node types)
- ⭐ Drag-drop canvas
- ⭐ JSON export/import

**Deliverable:** Visual workflow designer

---

#### **SPRINT 11-12: Workflow Execution (Weeks 11-12)**
**NEW**

**Week 11:**
- ⭐ Workflow trigger on request
- ⭐ State transitions
- ⭐ Dynamic approver resolution
- ⭐ Approval actions (approve/reject)

**Week 12:**
- ⭐ Conditional branching
- ⭐ Parallel approvals
- ⭐ Approval matrix evaluation
- ⭐ Escalation monitoring (cron)
- ⭐ Delegation system

**Deliverable:** End-to-end workflow execution

---

#### **SPRINT 13-14: Notifications (Weeks 13-14)**
**NEW**

**Week 13:**
- ⭐ NotificationTemplate, Log models
- ⭐ BullMQ setup (Upstash Redis)
- ⭐ SendGrid integration
- ⭐ Template engine (Handlebars)
- ⭐ Email sending

**Week 14:**
- ⭐ Twilio SMS integration
- ⭐ WhatsApp Business API
- ⭐ In-app notifications (SSE)
- ⭐ Web Push (PWA)
- ⭐ User preferences UI

**Deliverable:** Multi-channel notifications

---

#### **SPRINT 15-16: Dynamic Reporting (Weeks 15-16)**
**Mevcut Plan: Step 10 + NEW**

**Week 15:**
- ⭐ ReportTemplate, Dashboard models
- ⭐ Report builder UI (drag-drop)
- ⭐ Multi-table data sources
- ⭐ Filter configuration
- ⭐ Real-time preview

**Week 16:**
- ⭐ Chart types (Recharts)
- ⭐ Dashboard creation (React Grid Layout)
- ⭐ Report scheduling (Vercel Cron)
- ⭐ Excel/PDF export
- ⭐ Report sharing

**Deliverable:** Zoho-style reporting

---

#### **SPRINT 17-18: Security & Testing (Weeks 17-18)**
**Mevcut Plan: Step 11-12**

**Week 17:**
- ✅ Step 11: Security headers (CSP, HSTS)
- ✅ Rate limiting
- ⭐ 2FA (TOTP)
- ⭐ Security audit (OWASP)
- ⭐ Penetration testing

**Week 18:**
- ✅ Step 12: Unit tests (Vitest)
- ✅ Integration tests (Supertest)
- ✅ E2E tests (Playwright)
- ⭐ Performance testing (K6)
- ⭐ Load testing (Artillery)

**Deliverable:** Production-ready security

---

#### **SPRINT 19-20: Launch (Weeks 19-20)**
**NEW**

**Week 19:**
- ⭐ Mobile responsiveness
- ⭐ Loading/error states
- ⭐ Onboarding flow
- ⭐ i18n (TR/EN)
- ⭐ Help system

**Week 20:**
- ⭐ Monitoring (Sentry, Vercel Analytics)
- ⭐ Backup strategy
- ⭐ Documentation
- ⭐ Marketing website
- 🚀 **Production Launch**

**Deliverable:** Live platform

---

### 4.2 Epic Breakdown

**EPIC 1: Multi-Tenant (P0) - 2 weeks**
- Tenant CRUD
- Subdomain routing
- Custom domain support
- Data isolation

**EPIC 2: White-Label (P0) - 3 weeks**
- Branding (logo, colors, fonts)
- Custom fields (10+ types)
- Form builder
- Menu customization

**EPIC 3: Purchase Requests (P0) - 2 weeks**
- Request CRUD
- Multi-item line items
- File attachments
- Request workflow

**EPIC 4: Dynamic Workflows (P0) - 4 weeks**
- Visual designer (ReactFlow)
- Approval engine
- Conditional logic
- Escalation system

**EPIC 5: Notifications (P1) - 2 weeks**
- Email, SMS, WhatsApp, Push, In-App
- Template system
- User preferences
- Delivery tracking

**EPIC 6: Dynamic Reporting (P1) - 3 weeks**
- Report builder (drag-drop)
- Pivot tables
- Dashboards
- Scheduled reports

**EPIC 7: Security (P0) - 2 weeks**
- 2FA
- Audit logs
- Rate limiting
- Security hardening

**EPIC 8: Testing (P0) - 1 week**
- Unit, integration, E2E tests
- Performance testing
- Load testing

---

### 4.3 Testing Strategy

**Unit Tests (Vitest):**
- Utility functions
- Business logic
- Permission system
- Workflow state machine

**Integration Tests (Supertest):**
- API endpoints
- Database operations
- Workflow execution
- Notification delivery

**E2E Tests (Playwright):**
- User flows (login → create request → approve)
- Workflow designer
- Report builder
- Multi-tenant isolation

**Performance Tests:**
- K6 load tests (1000+ concurrent users)
- Database query optimization
- Report generation speed
- API response times

---

## Merkado.com.tr vs Our Platform

| Feature | Merkado | Our Platform | Advantage |
|---------|---------|--------------|-----------|
| **White-Label** | ❌ No | ✅ Full | 🎯 Every company branded |
| **Custom Fields** | ❌ No | ✅ Unlimited | 🎯 Company-specific data |
| **Visual Workflow** | ❌ No | ✅ Drag-drop | 🎯 No-code workflows |
| **Dynamic Reports** | ⚠️ Static | ✅ Zoho-style | 🎯 Self-service analytics |
| **WhatsApp** | ❌ No | ✅ Business API | 🎯 Modern channels |
| **Real-time** | ❌ No | ✅ SSE | 🎯 Live updates |
| **API Docs** | ⚠️ Limited | ✅ OpenAPI 3.0 | 🎯 Developer-friendly |
| **Modern UI** | ⚠️ Old | ✅ Next.js 14 | 🎯 Best UX |
| **Mobile** | ⚠️ Unknown | ✅ Responsive PWA | 🎯 Mobile-first |
| **Pricing** | ❓ Unknown | 💰 Transparent | 🎯 Clear value |

---

## Final Recommendations

### Phase 1: MVP (12 weeks)
**Focus:** Core procurement + basic workflows + email notifications

**Includes:**
- Multi-tenant infrastructure
- Purchase request module
- Basic approval workflows (sequential)
- Email notifications
- Supplier management
- Basic reporting

**Target:** First 5 pilot customers

---

### Phase 2: Advanced (8 weeks)
**Focus:** White-label + dynamic reporting + workflow designer

**Includes:**
- Complete white-label system
- Visual workflow designer
- Zoho-style reporting
- Multi-channel notifications
- Custom fields

**Target:** 20+ paying customers

---

### Phase 3: Enterprise (Ongoing)
**Focus:** Scale + integrations + advanced features

**Includes:**
- SAP/Oracle connectors
- Advanced analytics (AI/ML)
- Mobile apps (React Native)
- Multi-region deployment
- SOC 2 compliance

**Target:** Enterprise customers (100+ users)

---

## Success Metrics

**Technical KPIs:**
- Test coverage: >80%
- Page load: <2s
- API response: <500ms
- Uptime: 99.9%

**Business KPIs:**
- 50+ tenants in Year 1
- 5000+ users by end of Year 1
- 95%+ customer satisfaction
- <5% churn rate

**Feature Adoption:**
- 80%+ use white-label features
- 60%+ create custom reports
- 90%+ use email notifications
- 40%+ use custom workflows

---

## Conclusion

Bu PRD, BMAD metodolojisi çerçevesinde hazırlanmış, production-ready bir satın alma platformu için tam bir blueprint sağlar. 20 haftalık roadmap, mevcut 12 adımlık plana entegre edilerek 4 kritik yeniliği ekler:

1. ✅ **White-Label**: Her şirket için unique deneyim
2. ✅ **Dynamic Reporting**: Zoho CRM seviyesinde self-service analytics
3. ✅ **Visual Workflows**: No-code approval designer
4. ✅ **Multi-Channel Notifications**: WhatsApp, Push, real-time

**Next Steps:**
1. Stakeholder review ve approval
2. Development team onboarding
3. Sprint 1 kickoff
4. İlk 2 haftada foundation tamamlanması

**Timeline:** 20 hafta (5 ay) sonunda production-ready platform.

---

**Doküman Sonu**
