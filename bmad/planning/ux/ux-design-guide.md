# UX/UI Design Guide
## Attelia Dental - Enterprise Satın Alma Yönetim Platformu

**Version:** 1.0
**Date:** 2025-11-05
**Design System:** Attelia Design System v1

---

## Design Principles

### 1. Clarity
"Every element should have a clear purpose and meaning"
- Clear information hierarchy
- Obvious action buttons
- Descriptive labels
- Unambiguous icons

### 2. Efficiency
"Users should accomplish tasks with minimum effort"
- Maximum 3 clicks to any feature
- Keyboard shortcuts for power users
- Bulk actions for repeated tasks
- Smart defaults and auto-fill

### 3. Consistency
"Similar things should look and behave similarly"
- Unified design language
- Consistent interaction patterns
- Predictable navigation
- Standard component usage

### 4. Feedback
"System should respond to every user action"
- Loading states
- Success/error messages
- Progress indicators
- Hover/focus states

### 5. Accessibility
"Design for all users, regardless of ability"
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode

---

## Color System

### Brand Colors

```css
/* Primary - Corporate Blue */
--primary-50:  #EFF6FF;
--primary-100: #DBEAFE;
--primary-200: #BFDBFE;
--primary-300: #93C5FD;
--primary-400: #60A5FA;
--primary-500: #3B82F6;  /* Main brand color */
--primary-600: #2563EB;
--primary-700: #1D4ED8;
--primary-800: #1E40AF;
--primary-900: #1E3A8A;

/* Secondary - Professional Gray */
--gray-50:  #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;
```

### Semantic Colors

```css
/* Success - Green */
--success-50:  #F0FDF4;
--success-500: #10B981;
--success-700: #047857;

/* Warning - Amber */
--warning-50:  #FFFBEB;
--warning-500: #F59E0B;
--warning-700: #B45309;

/* Error - Red */
--error-50:  #FEF2F2;
--error-500: #EF4444;
--error-700: #B91C1C;

/* Info - Blue */
--info-50:  #EFF6FF;
--info-500: #3B82F6;
--info-700: #1D4ED8;
```

### Usage Guidelines

**Primary Blue:** Main actions, links, active states
**Gray:** Text, borders, backgrounds
**Success Green:** Approved status, success messages
**Warning Amber:** Pending status, warnings
**Error Red:** Rejected status, errors
**Info Blue:** Information messages, tooltips

---

## Typography

### Font Family

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Font Scales

```css
/* Headings */
--text-xs:   0.75rem;  /* 12px */
--text-sm:   0.875rem; /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg:   1.125rem; /* 18px */
--text-xl:   1.25rem;  /* 20px */
--text-2xl:  1.5rem;   /* 24px */
--text-3xl:  1.875rem; /* 30px */
--text-4xl:  2.25rem;  /* 36px */
--text-5xl:  3rem;     /* 48px */
```

### Font Weights

```css
--font-normal:    400;
--font-medium:    500;
--font-semibold:  600;
--font-bold:      700;
```

### Typography Usage

**Page Title:** text-3xl, font-bold (Dashboard, Reports)
**Section Title:** text-2xl, font-semibold (Purchase Requests)
**Card Title:** text-xl, font-semibold
**Body Text:** text-base, font-normal
**Small Text:** text-sm (captions, metadata)
**Micro Text:** text-xs (timestamps, footnotes)

---

## Spacing System

### Base Unit: 4px

```css
--space-0:  0;
--space-1:  0.25rem;  /* 4px */
--space-2:  0.5rem;   /* 8px */
--space-3:  0.75rem;  /* 12px */
--space-4:  1rem;     /* 16px */
--space-5:  1.25rem;  /* 20px */
--space-6:  1.5rem;   /* 24px */
--space-8:  2rem;     /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### Spacing Guidelines

**Component Padding:**
- Small: space-3 (12px)
- Medium: space-4 (16px)
- Large: space-6 (24px)

**Section Spacing:**
- Between sections: space-8 (32px)
- Page margins: space-6 (24px)

**Element Spacing:**
- Form fields: space-4 (16px)
- Buttons: space-2 (8px) between
- Icons: space-2 (8px) from text

---

## Component Library

### Buttons

#### Primary Button
```typescript
<button className="
  px-4 py-2
  bg-primary-600 hover:bg-primary-700
  text-white font-medium
  rounded-lg
  transition-colors
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Primary Action
</button>
```

**Usage:** Main actions (Submit, Save, Create)

#### Secondary Button
```typescript
<button className="
  px-4 py-2
  bg-white hover:bg-gray-50
  text-gray-700 font-medium
  border border-gray-300
  rounded-lg
  transition-colors
">
  Secondary Action
</button>
```

**Usage:** Cancel, Back, Alternative actions

#### Danger Button
```typescript
<button className="
  px-4 py-2
  bg-error-600 hover:bg-error-700
  text-white font-medium
  rounded-lg
  transition-colors
">
  Delete
</button>
```

**Usage:** Destructive actions (Delete, Reject)

#### Icon Button
```typescript
<button className="
  p-2
  hover:bg-gray-100
  rounded-lg
  transition-colors
">
  <Icon className="w-5 h-5 text-gray-600" />
</button>
```

**Usage:** Compact actions, toolbars

### Forms

#### Text Input
```typescript
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">
    Label
  </label>
  <input
    type="text"
    className="
      w-full px-3 py-2
      border border-gray-300 rounded-lg
      focus:outline-none focus:ring-2 focus:ring-primary-500
      disabled:bg-gray-50 disabled:text-gray-500
    "
    placeholder="Enter value..."
  />
  <p className="text-sm text-gray-500">Helper text</p>
</div>
```

#### Select Dropdown
```typescript
<select className="
  w-full px-3 py-2
  border border-gray-300 rounded-lg
  focus:outline-none focus:ring-2 focus:ring-primary-500
">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

#### Checkbox
```typescript
<label className="flex items-center space-x-2">
  <input
    type="checkbox"
    className="
      w-4 h-4
      border-gray-300 rounded
      text-primary-600
      focus:ring-primary-500
    "
  />
  <span className="text-sm text-gray-700">Checkbox label</span>
</label>
```

### Cards

#### Standard Card
```typescript
<div className="
  bg-white
  border border-gray-200
  rounded-lg
  p-6
  shadow-sm
">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">
    Card Title
  </h3>
  <p className="text-gray-600">
    Card content...
  </p>
</div>
```

#### Stat Card
```typescript
<div className="
  bg-white
  border border-gray-200
  rounded-lg
  p-6
">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-600">Total Requests</p>
      <p className="text-3xl font-bold text-gray-900">1,234</p>
    </div>
    <div className="p-3 bg-primary-50 rounded-lg">
      <Icon className="w-8 h-8 text-primary-600" />
    </div>
  </div>
  <div className="mt-4">
    <span className="text-sm text-success-600">+12% from last month</span>
  </div>
</div>
```

### Tables

#### Data Table
```typescript
<div className="overflow-x-auto">
  <table className="w-full">
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Column 1
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Column 2
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 text-sm text-gray-900">
          Data 1
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          Data 2
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Badges

#### Status Badge
```typescript
// Approved
<span className="
  inline-flex items-center
  px-2.5 py-0.5
  rounded-full
  text-xs font-medium
  bg-success-100 text-success-800
">
  Approved
</span>

// Pending
<span className="
  inline-flex items-center
  px-2.5 py-0.5
  rounded-full
  text-xs font-medium
  bg-warning-100 text-warning-800
">
  Pending
</span>

// Rejected
<span className="
  inline-flex items-center
  px-2.5 py-0.5
  rounded-full
  text-xs font-medium
  bg-error-100 text-error-800
">
  Rejected
</span>
```

### Alerts

```typescript
// Success
<div className="
  p-4
  bg-success-50
  border border-success-200
  rounded-lg
">
  <div className="flex">
    <CheckCircleIcon className="w-5 h-5 text-success-600" />
    <div className="ml-3">
      <h3 className="text-sm font-medium text-success-800">Success</h3>
      <p className="text-sm text-success-700 mt-1">Message...</p>
    </div>
  </div>
</div>

// Error
<div className="p-4 bg-error-50 border border-error-200 rounded-lg">
  <div className="flex">
    <XCircleIcon className="w-5 h-5 text-error-600" />
    <div className="ml-3">
      <h3 className="text-sm font-medium text-error-800">Error</h3>
      <p className="text-sm text-error-700 mt-1">Message...</p>
    </div>
  </div>
</div>
```

### Loading States

```typescript
// Skeleton
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>

// Spinner
<div className="flex justify-center items-center p-8">
  <div className="
    w-8 h-8
    border-4 border-primary-200 border-t-primary-600
    rounded-full
    animate-spin
  "></div>
</div>
```

---

## Page Layouts

### Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│ Header (fixed)                                      │
│ Logo | Navigation | Search | User Menu              │
├──────┬──────────────────────────────────────────────┤
│      │                                               │
│ Side │  Main Content Area                           │
│ bar  │  ┌─────────────────────────────────┐        │
│      │  │ Page Title & Actions            │        │
│ Nav  │  ├─────────────────────────────────┤        │
│      │  │                                 │        │
│ Menu │  │ Dashboard Cards/Stats           │        │
│      │  │                                 │        │
│      │  ├─────────────────────────────────┤        │
│      │  │                                 │        │
│      │  │ Charts & Data Visualization     │        │
│      │  │                                 │        │
│      │  └─────────────────────────────────┘        │
└──────┴──────────────────────────────────────────────┘
```

### List/Table Layout

```
┌─────────────────────────────────────────────────────┐
│ Page Header                                         │
│ Title | Breadcrumbs | Actions (+ New)               │
├─────────────────────────────────────────────────────┤
│ Filters & Search                                    │
│ Search | Status Filter | Date Range | Export        │
├─────────────────────────────────────────────────────┤
│ Data Table                                          │
│ ┌───────┬──────────┬──────────┬─────────┬────────┐│
│ │Select │ Title    │ Status   │ Amount  │Actions ││
│ ├───────┼──────────┼──────────┼─────────┼────────┤│
│ │ ☐     │ Item 1   │ Pending  │ 1,000₺  │ •••   ││
│ │ ☐     │ Item 2   │ Approved │ 2,500₺  │ •••   ││
│ └───────┴──────────┴──────────┴─────────┴────────┘│
├─────────────────────────────────────────────────────┤
│ Pagination                                          │
│ Showing 1-50 of 250 | « ‹ 1 2 3 4 5 › »           │
└─────────────────────────────────────────────────────┘
```

### Form Layout

```
┌─────────────────────────────────────────────────────┐
│ Page Header                                         │
│ Create Purchase Request | Save Draft | Cancel       │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Form Section 1: Basic Information                  │
│ ┌─────────────────────────────────────────────┐   │
│ │ Title: [________________]                   │   │
│ │ Category: [Select...    ▼]                  │   │
│ │ Priority: ○ Low ● Normal ○ High ○ Urgent   │   │
│ │ Description: [_________________________    │   │
│ │              _________________________]    │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Form Section 2: Items                              │
│ ┌─────────────────────────────────────────────┐   │
│ │ [+ Add Item]                                │   │
│ │                                             │   │
│ │ Product | Quantity | Price | Total | Remove │   │
│ │ Item 1  |    2     | 500₺  | 1000₺ |   ✕    │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Form Section 3: Summary                            │
│ ┌─────────────────────────────────────────────┐   │
│ │ Subtotal:         1,000₺                    │   │
│ │ Tax (20%):          200₺                    │   │
│ │ Total:            1,200₺                    │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ [Cancel]                      [Submit Request]     │
└─────────────────────────────────────────────────────┘
```

### Detail View Layout

```
┌─────────────────────────────────────────────────────┐
│ Page Header                                         │
│ ‹ Back | Request #PR-2025-001 | Edit | Delete      │
├─────────────────────────────────────────────────────┤
│ Status Badge: [Pending Approval]                   │
│ Priority: High | Created: 2025-11-05 | By: John   │
├─────────────────────────────────────────────────────┤
│ ┌─────────────┐  ┌─────────────────────────────┐  │
│ │ Left Panel  │  │ Main Content                │  │
│ │             │  │                             │  │
│ │ Info Card   │  │ Items List                  │  │
│ │ • Requester │  │ ┌─────────────────────────┐ │  │
│ │ • Dept      │  │ │ Item 1 | Qty | Price    │ │  │
│ │ • Budget    │  │ │ Item 2 | Qty | Price    │ │  │
│ │             │  │ └─────────────────────────┘ │  │
│ │ Actions     │  │                             │  │
│ │ [Approve]   │  │ Approval Timeline           │  │
│ │ [Reject]    │  │ ┌─────────────────────────┐ │  │
│ │             │  │ │ ✓ Step 1: Approved      │ │  │
│ │             │  │ │ ⧗ Step 2: Pending       │ │  │
│ │             │  │ │ ○ Step 3: Not started   │ │  │
│ └─────────────┘  │ └─────────────────────────┘ │  │
│                  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## User Flows

### Purchase Request Creation Flow

```
1. Dashboard
   ↓ [+ New Request]
2. Product Selection
   - Browse catalog
   - Search products
   - Add to cart
   ↓ [Continue]
3. Request Form
   - Fill details
   - Set priority
   - Add notes
   ↓ [Submit]
4. Budget Validation
   - Check user budget
   - Check dept budget
   - Check company budget
   ↓
5. Workflow Assignment
   - Determine approval steps
   - Assign approvers
   ↓
6. Confirmation
   - Show request number
   - Show approval steps
   - Email notification
```

### Approval Flow

```
1. Notification
   - Email alert
   - Dashboard badge
   ↓
2. Approval Queue
   - List pending requests
   - Priority sorting
   ↓ [View Request]
3. Request Review
   - View details
   - Check budget
   - See history
   ↓
4. Decision
   ├─→ [Approve] → Next step / Complete
   ├─→ [Reject] → Email requester
   └─→ [Return] → Back to requester
```

---

## Accessibility Guidelines

### Keyboard Navigation

**Tab Order:**
1. Header navigation
2. Sidebar menu
3. Main content
4. Forms (top to bottom)
5. Actions/buttons

**Keyboard Shortcuts:**
- `Ctrl/Cmd + K`: Global search
- `Ctrl/Cmd + N`: New request
- `Esc`: Close modal
- `Enter`: Submit form
- `Tab`: Navigate forward
- `Shift + Tab`: Navigate backward

### Screen Reader Support

**ARIA Labels:**
```typescript
<button aria-label="Close dialog">
  <XIcon />
</button>

<input aria-describedby="email-help" />
<p id="email-help">Enter your work email</p>

<nav aria-label="Main navigation">
  ...
</nav>
```

### Color Contrast

**Minimum Ratios (WCAG AA):**
- Normal text: 4.5:1
- Large text: 3:1
- UI components: 3:1

**Don't rely on color alone:**
- Use icons + colors
- Use text labels
- Use patterns/textures

### Focus States

```css
/* Visible focus indicator */
.focus-visible:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

---

## Responsive Design

### Breakpoints

```css
/* Mobile */
@media (min-width: 640px)  { /* sm */ }

/* Tablet */
@media (min-width: 768px)  { /* md */ }

/* Desktop */
@media (min-width: 1024px) { /* lg */ }

/* Large Desktop */
@media (min-width: 1280px) { /* xl */ }
```

### Mobile Adaptations

**Navigation:**
- Hamburger menu on mobile
- Full sidebar on desktop

**Tables:**
- Card view on mobile
- Table view on desktop

**Forms:**
- Single column on mobile
- Two columns on desktop

**Actions:**
- Full-width buttons on mobile
- Inline buttons on desktop

---

## Animation & Transitions

### Transition Timings

```css
--transition-fast:   150ms;
--transition-base:   200ms;
--transition-slow:   300ms;
```

### Common Animations

```css
/* Fade in */
.fade-in {
  animation: fadeIn 200ms ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide down */
.slide-down {
  animation: slideDown 200ms ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## Icons

**Library:** Lucide React

**Common Icons:**
- Home: `Home`
- Search: `Search`
- User: `User`
- Settings: `Settings`
- Cart: `ShoppingCart`
- Check: `Check`
- X: `X`
- Plus: `Plus`
- Edit: `Pencil`
- Delete: `Trash2`
- Download: `Download`
- Upload: `Upload`
- Filter: `Filter`

**Usage:**
```typescript
import { Home, Search, User } from 'lucide-react';

<Home className="w-5 h-5" />
```

---

**Document Status:** ✅ Active
**Last Updated:** 2025-11-05
**Next Review:** 2025-12-05
