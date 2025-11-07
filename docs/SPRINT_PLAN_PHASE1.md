# Phase 1 MVP - Detaylı Sprint Planı (8 Hafta)

**Hedef:** Merkado.com.tr'yi geçecek 3 kritik özellikle MVP launch
**Timeline:** 8 hafta (2 haftalık 4 sprint)
**Başlangıç:** Bu hafta
**Tamamlanma Hedefi:** 8 hafta sonra

---

## Sprint Özeti

| Sprint | Hafta | Odak | Teslim Edilen |
|--------|-------|------|---------------|
| **Sprint 1** | 1-2 | White-Label Foundation | Logo, tema, CSS variables |
| **Sprint 2** | 3 | Email Notifications ✅ | SMTP, templates, API integration |
| **Sprint 3** | 4-5 | Visual Workflow Designer - Part 1 | ReactFlow, node library, canvas |
| **Sprint 4** | 6-7 | Visual Workflow Designer - Part 2 | Execution engine, escalation |
| **Sprint 5** | 8 | Testing, Polish, Launch Prep | E2E tests, bug fixes, docs |

---

## SPRINT 1: White-Label Foundation (Week 1-2)

**Goal:** Her tenant kendi branding'ini görebilsin

### Week 1: Database & Core Settings

#### Task 1.1: Company Settings Model (2 days)
**Priority:** P0 - Critical
**Effort:** 2 days

```prisma
model CompanySettings {
  id              String   @id @default(cuid())
  companyId       String   @unique
  company         Company  @relation(fields: [companyId], references: [id])

  // Branding
  logoUrl         String?
  faviconUrl      String?
  primaryColor    String   @default("#0070f3")
  secondaryColor  String   @default("#0051cc")
  accentColor     String   @default("#ea580c")

  // Typography
  fontFamily      String   @default("Inter")

  // Layout
  sidebarBgColor  String   @default("#ffffff")
  headerBgColor   String   @default("#0070f3")

  // Advanced
  customCSS       String?  // Sanitized custom CSS

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

**Deliverables:**
- [ ] Update `prisma/schema.prisma`
- [ ] Run migration: `npx prisma migrate dev --name add_company_settings`
- [ ] Generate Prisma client
- [ ] Add seed data with default settings

---

#### Task 1.2: Settings API (1 day)
**Priority:** P0
**Effort:** 1 day

**Endpoints:**
```
GET    /api/settings             - Get company settings
PUT    /api/settings             - Update settings
POST   /api/settings/logo        - Upload logo (Vercel Blob)
POST   /api/settings/favicon     - Upload favicon
DELETE /api/settings/logo        - Remove logo
```

**Deliverables:**
- [ ] `app/api/settings/route.ts` (GET, PUT)
- [ ] `app/api/settings/logo/route.ts` (POST, DELETE)
- [ ] Vercel Blob integration for file uploads
- [ ] Image validation (format, size)
- [ ] API tests

---

#### Task 1.3: Vercel Blob Setup (0.5 day)
**Priority:** P0
**Effort:** 0.5 day

```bash
npm install @vercel/blob
```

**Configuration:**
```typescript
// lib/blob.ts
import { put, del } from '@vercel/blob';

export async function uploadLogo(file: File, companyId: string) {
  const blob = await put(`logos/${companyId}/logo.png`, file, {
    access: 'public',
    addRandomSuffix: false,
  });
  return blob.url;
}
```

**Deliverables:**
- [ ] Install @vercel/blob
- [ ] Create `lib/blob.ts` helper
- [ ] Configure Vercel Blob storage
- [ ] Test file upload/delete

---

### Week 2: Theme System & UI

#### Task 1.4: CSS Variables System (1 day)
**Priority:** P0
**Effort:** 1 day

**Implementation:**
```typescript
// app/layout.tsx or middleware
export function generateThemeCSS(settings: CompanySettings) {
  return `
    :root {
      --color-primary: ${settings.primaryColor};
      --color-secondary: ${settings.secondaryColor};
      --color-accent: ${settings.accentColor};
      --font-family: ${settings.fontFamily}, sans-serif;
      --sidebar-bg: ${settings.sidebarBgColor};
      --header-bg: ${settings.headerBgColor};
    }
  `;
}
```

**Deliverables:**
- [ ] Create `lib/theme.ts` for CSS generation
- [ ] Inject CSS variables in `app/layout.tsx`
- [ ] Update all components to use CSS variables
- [ ] Test color changes reflect instantly

---

#### Task 1.5: Settings UI Page (2 days)
**Priority:** P0
**Effort:** 2 days

**Pages:**
- `/admin/settings` - Settings management page

**Features:**
- Logo upload with preview
- Color pickers (react-colorful or native)
- Font selector (Google Fonts)
- Live preview panel
- Save/Reset buttons

**Deliverables:**
- [ ] `app/admin/settings/page.tsx`
- [ ] Logo upload component with drag-drop
- [ ] Color picker component
- [ ] Font dropdown (10+ Google Fonts)
- [ ] Live theme preview
- [ ] Form validation
- [ ] Save confirmation

---

#### Task 1.6: Dynamic Branding Integration (1 day)
**Priority:** P0
**Effort:** 1 day

**Components to Update:**
- Header: Show company logo
- Login page: Show logo + brand colors
- Email templates: Use company logo
- PDF exports: Use company branding

**Deliverables:**
- [ ] Update `components/Header.tsx` to show logo
- [ ] Update `app/login/page.tsx` with branding
- [ ] Update email templates to inject logo
- [ ] Test branding across all pages

---

#### Task 1.7: Testing & Bug Fixes (0.5 day)
**Priority:** P0
**Effort:** 0.5 day

**Deliverables:**
- [ ] E2E test: Upload logo and verify display
- [ ] E2E test: Change colors and verify CSS
- [ ] Manual testing on different tenants
- [ ] Fix any visual bugs

---

### Sprint 1 Deliverables Summary:
✅ CompanySettings model
✅ Settings CRUD API
✅ Logo upload (Vercel Blob)
✅ CSS variables system
✅ Settings UI page
✅ Dynamic branding on all pages

**Demo:** Show 2 tenants with different logos and colors

---

## SPRINT 2: Email Notifications ✅ (Week 3)

**Status:** ✅ **COMPLETED** (already implemented in current PR)

### Completed Tasks:
- [x] NotificationTemplate model
- [x] NotificationLog model
- [x] Email service (lib/email.ts)
- [x] Template engine (lib/email-templates.ts)
- [x] Notification service (lib/notifications.ts)
- [x] Approval API integration
- [x] 3 email templates (submitted, approved, rejected)

### Remaining Tasks (0.5 week):

#### Task 2.1: Database Migration (0.1 day)
**Priority:** P0
**Effort:** 0.1 day

```bash
npx prisma migrate dev --name add_notifications
npx prisma generate
npm install  # Install nodemailer
```

**Deliverables:**
- [ ] Run migration
- [ ] Verify tables created
- [ ] Seed default templates

---

#### Task 2.2: SMTP Configuration (0.1 day)
**Priority:** P0
**Effort:** 0.1 day

**Action:** Configure production SMTP credentials

**Options:**
1. **SendGrid** (recommended)
2. **Gmail** (development only)
3. **AWS SES** (scalable)

**Deliverables:**
- [ ] Create SendGrid account
- [ ] Generate API key
- [ ] Update `.env` with credentials
- [ ] Test email sending

---

#### Task 2.3: Email Testing & Polish (0.3 day)
**Priority:** P1
**Effort:** 0.3 day

**Test Cases:**
1. Create purchase request → Approver receives email
2. Approve request → Requester receives approval email
3. Reject request → Requester receives rejection email
4. Email contains correct data (request number, amount, etc.)
5. Email links work (redirect to correct page)
6. Email displays correctly on mobile

**Deliverables:**
- [ ] Test all 3 email templates
- [ ] Verify email delivery
- [ ] Check spam score
- [ ] Mobile responsiveness
- [ ] Fix any formatting issues

---

### Sprint 2 Deliverables Summary:
✅ Multi-channel notification infrastructure
✅ Email templates with branding
✅ Approval workflow integration
✅ Notification logging

**Demo:** Send test approval email and show delivery in inbox

---

## SPRINT 3: Visual Workflow Designer - Part 1 (Week 4-5)

**Goal:** No-code workflow creation with drag-drop UI

### Week 4: ReactFlow Integration & Node Library

#### Task 3.1: Install ReactFlow (0.1 day)
**Priority:** P0
**Effort:** 0.1 day

```bash
npm install reactflow
npm install @types/reactflow
```

**Deliverables:**
- [ ] Install dependencies
- [ ] Verify installation

---

#### Task 3.2: Workflow Designer Page (1 day)
**Priority:** P0
**Effort:** 1 day

**Page:** `/admin/workflows/designer`

**Features:**
- Drag-drop canvas
- Node palette (left sidebar)
- Properties panel (right sidebar)
- Toolbar (save, export, validate)
- Minimap
- Zoom controls

**Deliverables:**
- [ ] `app/admin/workflows/designer/page.tsx`
- [ ] ReactFlow canvas setup
- [ ] Basic layout (3-column)
- [ ] Minimap component
- [ ] Zoom controls

---

#### Task 3.3: Node Library (2 days)
**Priority:** P0
**Effort:** 2 days

**Node Types:**
1. **Start Node** - Workflow entry point
2. **Approval Node** - Single/multi approver
3. **Decision Node** - If/then/else branching
4. **Notification Node** - Send email/SMS
5. **Wait Node** - Time delay
6. **Parallel Split** - Fork workflow
7. **Parallel Join** - Merge workflow
8. **End Node** - Workflow termination

**Deliverables:**
- [ ] `components/workflow/nodes/StartNode.tsx`
- [ ] `components/workflow/nodes/ApprovalNode.tsx`
- [ ] `components/workflow/nodes/DecisionNode.tsx`
- [ ] `components/workflow/nodes/NotificationNode.tsx`
- [ ] `components/workflow/nodes/WaitNode.tsx`
- [ ] `components/workflow/nodes/ParallelSplitNode.tsx`
- [ ] `components/workflow/nodes/ParallelJoinNode.tsx`
- [ ] `components/workflow/nodes/EndNode.tsx`
- [ ] Node icons (Lucide icons)
- [ ] Node styling (consistent design)

---

#### Task 3.4: Node Properties Panel (1 day)
**Priority:** P0
**Effort:** 1 day

**Features:**
- Show selected node properties
- Editable fields based on node type
- Validation
- Save changes

**Node-Specific Properties:**

**Approval Node:**
- Approver selection (role/user/dynamic)
- Approval threshold (all/any/majority)
- Timeout (hours)
- Escalation settings

**Decision Node:**
- Condition builder (field, operator, value)
- Multiple conditions (AND/OR)
- Branch labels

**Notification Node:**
- Channel (email/SMS/WhatsApp)
- Template selection
- Recipients

**Deliverables:**
- [ ] `components/workflow/PropertiesPanel.tsx`
- [ ] Approval node form
- [ ] Decision node condition builder
- [ ] Notification node form
- [ ] Form validation

---

### Week 5: Workflow Storage & Execution Prep

#### Task 3.5: Workflow JSON Schema (0.5 day)
**Priority:** P0
**Effort:** 0.5 day

**Schema Definition:**
```typescript
interface WorkflowDefinition {
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata: {
    name: string;
    description?: string;
    createdAt: string;
    createdBy: string;
  };
}

interface WorkflowNode {
  id: string;
  type: string;  // 'start' | 'approval' | 'decision' | etc.
  position: { x: number; y: number };
  data: {
    label: string;
    config: Record<string, any>;  // Node-specific config
  };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;  // For decision branches
}
```

**Deliverables:**
- [ ] `lib/workflow-schema.ts` with TypeScript types
- [ ] JSON validation functions
- [ ] Export workflow to JSON
- [ ] Import workflow from JSON

---

#### Task 3.6: Workflow CRUD API (1 day)
**Priority:** P0
**Effort:** 1 day

**Endpoints:**
```
GET    /api/workflows/templates          - List workflow templates
GET    /api/workflows/templates/:id      - Get template
POST   /api/workflows/templates          - Create template
PUT    /api/workflows/templates/:id      - Update template
DELETE /api/workflows/templates/:id      - Delete template
POST   /api/workflows/templates/:id/activate   - Activate
POST   /api/workflows/templates/:id/deactivate - Deactivate
```

**Deliverables:**
- [ ] Update `ApprovalWorkflow` model to store JSON definition
- [ ] Implement all API endpoints
- [ ] Validate workflow JSON structure
- [ ] Prevent deletion of active workflows

---

#### Task 3.7: Workflow Validation (1 day)
**Priority:** P0
**Effort:** 1 day

**Validation Rules:**
1. Must have exactly one Start node
2. Must have at least one End node
3. No orphan nodes (all connected)
4. No cycles (infinite loops)
5. Decision nodes must have 2+ outgoing edges
6. Parallel split/join must be balanced
7. All approval nodes must have assignees

**Deliverables:**
- [ ] `lib/workflow-validator.ts`
- [ ] Validation functions for each rule
- [ ] Error messages (user-friendly)
- [ ] Visual error indicators on canvas

---

#### Task 3.8: Save/Load Workflows (0.5 day)
**Priority:** P0
**Effort:** 0.5 day

**Features:**
- Save workflow to database
- Load existing workflow
- Auto-save (every 30 seconds)
- Version history (optional)

**Deliverables:**
- [ ] Save button handler
- [ ] Load workflow on page mount
- [ ] Auto-save with debounce
- [ ] Success/error notifications

---

### Sprint 3 Deliverables Summary:
✅ ReactFlow integration
✅ 8 node types
✅ Drag-drop canvas
✅ Properties panel
✅ Workflow validation
✅ Save/load workflows

**Demo:** Create a workflow with 5 nodes, save it, reload page, verify it loads

---

## SPRINT 4: Visual Workflow Designer - Part 2 (Week 6-7)

**Goal:** Execute workflows created in designer

### Week 6: Workflow Execution Engine

#### Task 4.1: Workflow Executor Service (2 days)
**Priority:** P0
**Effort:** 2 days

**Service:** `lib/workflow-executor.ts`

**Core Functions:**
```typescript
async function startWorkflow(templateId: string, entityId: string): Promise<WorkflowInstance>
async function processTask(taskId: string, action: string, userId: string): Promise<void>
async function checkEscalations(): Promise<void>
```

**State Machine:**
- Initialize workflow instance
- Create first task
- Track current state
- Handle transitions
- Update request status

**Deliverables:**
- [ ] `lib/workflow-executor.ts`
- [ ] `startWorkflow()` function
- [ ] `processTask()` function
- [ ] State transition logic
- [ ] Database updates (WorkflowInstance, WorkflowTask)

---

#### Task 4.2: Decision Node Evaluation (1 day)
**Priority:** P0
**Effort:** 1 day

**Condition Types:**
- Numeric: `amount > 10000`
- String: `department == "IT"`
- Boolean: `urgent == true`
- Date: `requiredDate < now() + 7 days`

**Operators:**
- `==`, `!=`, `>`, `<`, `>=`, `<=`
- `contains`, `in`, `exists`
- `&&`, `||`, `!`

**Deliverables:**
- [ ] `lib/workflow-conditions.ts`
- [ ] Condition parser
- [ ] Condition evaluator
- [ ] Support for nested conditions (AND/OR)
- [ ] Unit tests for all operators

---

#### Task 4.3: Parallel Workflow Support (1 day)
**Priority:** P1 (can defer to Phase 2)
**Effort:** 1 day

**Features:**
- Parallel split: Create multiple tasks simultaneously
- Parallel join: Wait for all tasks to complete
- Track parallel branches

**Deliverables:**
- [ ] Parallel split logic
- [ ] Parallel join logic
- [ ] Track active branches
- [ ] Update workflow when all branches complete

---

#### Task 4.4: Integrate with Purchase Request API (1 day)
**Priority:** P0
**Effort:** 1 day

**Changes:**
- When request is submitted → Start workflow
- When workflow task is approved → Transition to next state
- When workflow completes → Mark request as APPROVED

**Files to Update:**
- `app/api/purchase-requests/route.ts` (POST)
- `app/api/purchase-requests/[id]/approve/route.ts` (already has approval logic)

**Deliverables:**
- [ ] Auto-start workflow on request submission
- [ ] Use visual workflow instead of hardcoded steps
- [ ] Backward compatibility (support old workflows)

---

### Week 7: Escalation & Testing

#### Task 4.5: Escalation System (1 day)
**Priority:** P0
**Effort:** 1 day

**Escalation Rules:**
- If task not completed within X hours → Escalate
- Escalation actions:
  - Notify manager
  - Notify original approver (reminder)
  - Auto-approve (optional)
  - Auto-reject (optional)

**Implementation:**
- Cron job (Vercel Cron) runs every hour
- Check overdue tasks
- Trigger escalation actions

**Deliverables:**
- [ ] `app/api/cron/escalations/route.ts`
- [ ] Escalation checker logic
- [ ] Escalation notification templates
- [ ] Configure Vercel Cron (`vercel.json`)

**Vercel Cron Config:**
```json
{
  "crons": [
    {
      "path": "/api/cron/escalations",
      "schedule": "0 * * * *"  // Every hour
    }
  ]
}
```

---

#### Task 4.6: Workflow Analytics (0.5 day)
**Priority:** P1
**Effort:** 0.5 day

**Metrics:**
- Average approval time
- Approval rate (approved vs rejected)
- Bottleneck detection (slow steps)
- Most active workflows

**Deliverables:**
- [ ] `app/api/workflows/analytics/route.ts`
- [ ] Query functions for metrics
- [ ] Basic analytics dashboard (optional UI)

---

#### Task 4.7: E2E Workflow Tests (1 day)
**Priority:** P0
**Effort:** 1 day

**Test Cases:**
1. Create workflow → Submit request → Workflow starts
2. Approve task → Next task created
3. Reject task → Request marked as rejected
4. Decision node → Correct branch taken
5. Parallel workflow → All branches execute
6. Escalation → Overdue task escalated
7. Complex workflow (5+ steps) → Completes successfully

**Deliverables:**
- [ ] E2E tests with Playwright
- [ ] Test all node types
- [ ] Test error handling
- [ ] Performance test (1000 concurrent workflows)

---

#### Task 4.8: UI Polish & Bug Fixes (1.5 days)
**Priority:** P0
**Effort:** 1.5 days

**Tasks:**
- Fix visual bugs
- Improve node styling
- Add loading states
- Add error states
- Improve UX (tooltips, help text)
- Mobile responsiveness (view-only on mobile)

**Deliverables:**
- [ ] Visual polish
- [ ] Loading/error states
- [ ] Responsive design
- [ ] User documentation
- [ ] Video tutorial (optional)

---

### Sprint 4 Deliverables Summary:
✅ Workflow execution engine
✅ Decision node evaluation
✅ Parallel workflows
✅ Purchase request integration
✅ Escalation system
✅ E2E tests

**Demo:** Create 3-step approval workflow, submit request, approve/reject, verify execution

---

## SPRINT 5: Testing, Polish, Launch Prep (Week 8)

**Goal:** Production-ready MVP

### Task 5.1: Security Audit (1 day)
**Priority:** P0
**Effort:** 1 day

**Checks:**
- SQL injection (Prisma should prevent)
- XSS vulnerabilities
- CSRF tokens
- Rate limiting
- Input validation
- File upload security (logo, favicon)
- Tenant isolation (critical!)

**Deliverables:**
- [ ] Security audit report
- [ ] Fix all critical vulnerabilities
- [ ] Add rate limiting to sensitive endpoints
- [ ] CSP headers
- [ ] CSRF protection

---

### Task 5.2: Performance Optimization (1 day)
**Priority:** P1
**Effort:** 1 day

**Optimizations:**
- Database query optimization (N+1 queries)
- API response time (target: <500ms)
- Page load time (target: <2s)
- Image optimization (logos)
- Code splitting
- CDN caching

**Deliverables:**
- [ ] Performance profiling
- [ ] Optimize slow queries
- [ ] Add database indexes
- [ ] Enable Next.js optimizations
- [ ] Lighthouse score >90

---

### Task 5.3: User Onboarding Flow (0.5 day)
**Priority:** P1
**Effort:** 0.5 day

**Features:**
- First-time login tutorial
- Sample data (demo purchase request)
- Interactive guide (optional)
- Help tooltips

**Deliverables:**
- [ ] Onboarding modal on first login
- [ ] Sample data seed script
- [ ] Help tooltips on key features
- [ ] Video tutorial (2-3 minutes)

---

### Task 5.4: Documentation (1 day)
**Priority:** P0
**Effort:** 1 day

**Documents:**
1. **User Guide** - How to use the platform
2. **Admin Guide** - How to configure workflows
3. **API Documentation** - For integrations
4. **Deployment Guide** - Vercel deployment steps

**Deliverables:**
- [ ] `docs/USER_GUIDE.md`
- [ ] `docs/ADMIN_GUIDE.md`
- [ ] `docs/API_DOCUMENTATION.md`
- [ ] `docs/DEPLOYMENT.md`
- [ ] Screenshots for all guides

---

### Task 5.5: Bug Bash & Fixes (1 day)
**Priority:** P0
**Effort:** 1 day

**Process:**
1. Invite 3-5 test users
2. Ask them to use all features
3. Collect bug reports
4. Prioritize (P0 = blocker, P1 = important, P2 = minor)
5. Fix all P0 and P1 bugs

**Deliverables:**
- [ ] Bug bash session
- [ ] Bug report spreadsheet
- [ ] Fix all P0 bugs
- [ ] Fix critical P1 bugs

---

### Task 5.6: Staging Deployment (0.5 day)
**Priority:** P0
**Effort:** 0.5 day

**Steps:**
1. Deploy to Vercel staging
2. Configure environment variables
3. Run migrations on staging database
4. Smoke test all features
5. Invite pilot customers

**Deliverables:**
- [ ] Staging environment live
- [ ] All features working
- [ ] Invite 2-3 pilot customers

---

### Task 5.7: Production Deployment (0.5 day)
**Priority:** P0
**Effort:** 0.5 day

**Pre-Launch Checklist:**
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Documentation complete
- [ ] Backup strategy configured
- [ ] Monitoring set up (Sentry, Vercel Analytics)
- [ ] SMTP configured
- [ ] Domain configured

**Deployment:**
```bash
# Production deploy
vercel --prod

# Post-deploy checks
✅ Health check endpoint
✅ Database connection
✅ Email sending
✅ File uploads (Vercel Blob)
✅ Workflow execution
```

**Deliverables:**
- [ ] Production deployment
- [ ] Smoke test on production
- [ ] Announce launch 🚀

---

### Task 5.8: Launch Marketing (0.5 day)
**Priority:** P2 (optional)
**Effort:** 0.5 day

**Channels:**
- LinkedIn post
- Twitter/X announcement
- ProductHunt launch (optional)
- Email to warm leads
- Demo video

**Deliverables:**
- [ ] LinkedIn post drafted
- [ ] Twitter thread
- [ ] Demo video (3 minutes)
- [ ] Landing page updated

---

### Sprint 5 Deliverables Summary:
✅ Security audit passed
✅ Performance optimized
✅ Documentation complete
✅ All bugs fixed
✅ Staging deployed
✅ Production deployed
✅ 🚀 **MVP LAUNCHED**

---

## Phase 1 Success Metrics

### Technical Metrics:
- [ ] Test coverage >70%
- [ ] API response time <500ms (P95)
- [ ] Page load time <2s
- [ ] Zero critical security vulnerabilities
- [ ] Uptime >99.9%

### Feature Metrics:
- [ ] White-label: Logo + 3 colors customizable
- [ ] Email notifications: 3 templates working
- [ ] Visual workflows: 8 node types functional
- [ ] Workflow execution: Sequential + parallel
- [ ] Escalation: Hourly cron working

### Business Metrics (Post-Launch):
- [ ] 5+ pilot customers signed up
- [ ] 80%+ use white-label features
- [ ] 90%+ receive email notifications
- [ ] 50%+ create custom workflows
- [ ] <5% bug report rate

---

## Risk Mitigation

### Risk 1: ReactFlow Complexity
**Mitigation:** Start with simple workflow, add complexity iteratively

### Risk 2: Email Deliverability
**Mitigation:** Use SendGrid (99%+ delivery rate), configure SPF/DKIM

### Risk 3: Performance Issues
**Mitigation:** Database indexing, query optimization, caching

### Risk 4: Timeline Slippage
**Mitigation:** Cut scope (defer parallel workflows to Phase 2 if needed)

### Risk 5: Security Vulnerabilities
**Mitigation:** Security audit in Sprint 5, third-party pentesting

---

## Post-Phase 1 Roadmap

### Phase 2: Advanced Features (6 weeks)
- Custom fields system
- Dynamic reporting (Zoho-style)
- RFQ & PO system
- SMS/WhatsApp notifications

### Phase 3: Enterprise (6 weeks)
- SSO (SAML, OAuth)
- API documentation (OpenAPI)
- ERP integrations
- Advanced analytics

---

## Team Roles

**Required Team:**
- 1x Full-stack Developer (Next.js, TypeScript, Prisma)
- 1x Frontend Developer (React, ReactFlow)
- 0.5x Designer (UI/UX polish)
- 0.5x QA Engineer (Testing)

**Estimated Total Effort:** 8 weeks × 1.5 FTE = 12 person-weeks

---

## Daily Standup Questions

1. What did I complete yesterday?
2. What will I work on today?
3. Any blockers?

**Sprint Review:** Every 2 weeks (Friday)
**Sprint Retrospective:** After review (30 minutes)

---

## Definition of Done

**For Each Task:**
- [ ] Code written and reviewed
- [ ] Unit tests passing
- [ ] E2E tests passing (if applicable)
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] QA verified

**For Each Sprint:**
- [ ] All P0 tasks completed
- [ ] Demo prepared
- [ ] Sprint goals met
- [ ] No critical bugs

**For Phase 1:**
- [ ] All 5 sprints completed
- [ ] Production deployed
- [ ] 5+ pilot customers onboarded
- [ ] User feedback collected

---

## Support & Escalation

**Blocker:** Contact team lead immediately (Slack)
**Question:** Post in #engineering channel
**Bug:** Create GitHub issue with [BUG] prefix

---

**🎉 Ready to start Sprint 1! Let's build something amazing.**

---

**Document Version:** 1.0
**Last Updated:** 2025-11-07
**Next Review:** End of Sprint 1 (Week 2)
