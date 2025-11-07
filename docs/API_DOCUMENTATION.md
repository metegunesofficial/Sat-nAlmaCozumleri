# 📡 API Documentation

Complete API reference for Attelia Dental Satın Alma Platformu.

## 🔐 Authentication

All API requests (except login/register) require JWT authentication.

### Headers

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

### Token Management

Tokens are returned on successful login/register and should be stored securely (localStorage/sessionStorage).

---

## 📋 Authentication Endpoints

### Register User

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "REQUESTER",
  "department": "Dental Operations",
  "companyName": "My Dental Clinic",
  "subdomain": "mydental"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Kayıt başarılı",
  "user": {
    "id": "cuid123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "REQUESTER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "company": {
    "id": "comp123",
    "name": "My Dental Clinic",
    "subdomain": "mydental"
  }
}
```

**Errors:**
- `400` - Subdomain already exists
- `400` - Email already exists
- `500` - Server error

---

### Login User

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Giriş başarılı",
  "user": {
    "id": "cuid123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "REQUESTER",
    "companyId": "comp123"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `401` - Invalid credentials
- `500` - Server error

---

### Get Current User

```http
GET /api/auth/me
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "cuid123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "REQUESTER",
    "department": "Dental Operations",
    "companyId": "comp123"
  }
}
```

**Errors:**
- `401` - Invalid/missing token
- `500` - Server error

---

## 🛒 Purchase Request Endpoints

### List Purchase Requests

```http
GET /api/purchase-requests
```

**Query Parameters:**
- `status` (optional): Filter by status (PENDING, APPROVED, REJECTED, IN_PROGRESS)
- `priority` (optional): Filter by priority (LOW, MEDIUM, HIGH, URGENT)
- `search` (optional): Search in title or request number

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "req123",
      "requestNumber": "PR-2024-001",
      "title": "Dental Supplies Order",
      "description": "Monthly dental supplies",
      "category": "SUPPLIES",
      "priority": "MEDIUM",
      "status": "PENDING",
      "estimatedTotal": 15000.00,
      "currency": "TRY",
      "items": [...],
      "requester": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-11-07T10:00:00Z"
    }
  ],
  "count": 1
}
```

---

### Get Purchase Request by ID

```http
GET /api/purchase-requests/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "req123",
    "requestNumber": "PR-2024-001",
    "title": "Dental Supplies Order",
    "description": "Monthly supplies order",
    "category": "SUPPLIES",
    "priority": "MEDIUM",
    "status": "PENDING",
    "estimatedTotal": 15000.00,
    "currency": "TRY",
    "items": [
      {
        "id": "item1",
        "name": "Dental Gloves",
        "description": "Nitrile gloves, box of 100",
        "quantity": 50,
        "unit": "box",
        "estimatedUnitPrice": 150.00,
        "estimatedTotal": 7500.00
      }
    ],
    "attachments": [...],
    "requester": {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "approvals": [...],
    "workflowInstances": [...],
    "createdAt": "2024-11-07T10:00:00Z",
    "updatedAt": "2024-11-07T10:00:00Z"
  }
}
```

**Errors:**
- `404` - Purchase request not found
- `401` - Unauthorized
- `500` - Server error

---

### Create Purchase Request

```http
POST /api/purchase-requests
```

**Request Body:**
```json
{
  "title": "Dental Equipment Purchase",
  "description": "New dental chair and equipment",
  "category": "EQUIPMENT",
  "priority": "HIGH",
  "estimatedTotal": 50000.00,
  "currency": "TRY",
  "expectedDeliveryDate": "2024-12-01T00:00:00Z",
  "items": [
    {
      "name": "Dental Chair",
      "description": "Ergonomic dental chair with hydraulic lift",
      "quantity": 1,
      "unit": "piece",
      "estimatedUnitPrice": 50000.00
    }
  ],
  "suppliers": [
    {
      "name": "ABC Dental Supply",
      "contact": "contact@abcdental.com",
      "phone": "+90 555 123 4567",
      "address": "Istanbul, Turkey"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Satın alma talebi oluşturuldu",
  "data": {
    "id": "req456",
    "requestNumber": "PR-2024-002",
    "title": "Dental Equipment Purchase",
    "status": "PENDING",
    "workflowStarted": true
  }
}
```

**Notes:**
- Automatically starts workflow if configured
- Sends email notification to requester
- Generates unique request number

**Errors:**
- `400` - Validation error
- `401` - Unauthorized
- `500` - Server error

---

### Update Purchase Request

```http
PUT /api/purchase-requests/:id
```

**Request Body:** (Same as create, all fields optional)

**Response (200):**
```json
{
  "success": true,
  "message": "Satın alma talebi güncellendi",
  "data": {
    "id": "req123",
    "requestNumber": "PR-2024-001",
    "title": "Updated Title",
    "status": "PENDING"
  }
}
```

**Permissions:**
- Requester can update own requests
- Approvers can update assigned requests
- Admins can update any request

---

### Delete Purchase Request

```http
DELETE /api/purchase-requests/:id
```

**Response (200):**
```json
{
  "success": true,
  "message": "Satın alma talebi silindi"
}
```

**Permissions:**
- Only requester or admin can delete
- Cannot delete if workflow is running

---

## ✅ Approval Endpoints

### Create Approval

```http
POST /api/approvals
```

**Request Body:**
```json
{
  "purchaseRequestId": "req123",
  "approverId": "user456",
  "status": "APPROVED",
  "comments": "Budget approved for Q4"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Onay kaydedildi",
  "data": {
    "id": "appr123",
    "status": "APPROVED",
    "approver": {
      "name": "Jane Manager",
      "role": "APPROVER"
    },
    "createdAt": "2024-11-07T11:00:00Z"
  }
}
```

---

### Get Approvals for Request

```http
GET /api/purchase-requests/:id/approvals
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "appr123",
      "status": "APPROVED",
      "comments": "Budget approved",
      "approver": {
        "name": "Jane Manager",
        "email": "jane@example.com",
        "role": "APPROVER"
      },
      "createdAt": "2024-11-07T11:00:00Z"
    }
  ]
}
```

---

## 🔄 Workflow Endpoints

### List Workflows

```http
GET /api/workflows
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "wf123",
      "name": "Standard Approval Workflow",
      "description": "Default approval process",
      "isActive": true,
      "isVisual": true,
      "createdAt": "2024-11-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

---

### Get Workflow by ID

```http
GET /api/workflows/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "wf123",
    "name": "Standard Approval Workflow",
    "description": "Default approval process",
    "isActive": true,
    "isVisual": true,
    "definition": {
      "nodes": [
        {
          "id": "start-1",
          "type": "start",
          "position": { "x": 100, "y": 100 },
          "data": { "label": "Başlat" }
        },
        {
          "id": "approval-1",
          "type": "approval",
          "position": { "x": 300, "y": 100 },
          "data": {
            "label": "Manager Approval",
            "config": {
              "approverType": "role",
              "approverRole": "APPROVER",
              "threshold": "all",
              "timeoutDays": 3
            }
          }
        },
        {
          "id": "end-1",
          "type": "end",
          "position": { "x": 500, "y": 100 },
          "data": { "label": "Bitir", "status": "APPROVED" }
        }
      ],
      "edges": [
        {
          "id": "e1",
          "source": "start-1",
          "target": "approval-1"
        },
        {
          "id": "e2",
          "source": "approval-1",
          "target": "end-1"
        }
      ]
    },
    "createdAt": "2024-11-01T00:00:00Z"
  }
}
```

---

### Create Workflow

```http
POST /api/workflows
```

**Request Body:**
```json
{
  "name": "High-Value Purchase Workflow",
  "description": "Multi-level approval for purchases > 50K",
  "isVisual": true,
  "definition": {
    "nodes": [...],
    "edges": [...]
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Workflow oluşturuldu",
  "data": {
    "id": "wf456",
    "name": "High-Value Purchase Workflow",
    "isActive": false,
    "isVisual": true
  }
}
```

**Validation:**
- Must have exactly 1 start node
- Must have at least 1 end node
- No orphan nodes allowed
- No cycles allowed
- Decision nodes must have 2+ outgoing edges

---

### Update Workflow

```http
PUT /api/workflows/:id
```

**Request Body:** (Same as create, all fields optional)

**Response (200):**
```json
{
  "success": true,
  "message": "Workflow güncellendi",
  "data": {
    "id": "wf123",
    "name": "Updated Workflow Name",
    "isActive": true
  }
}
```

**Notes:**
- Cannot update active workflows
- Must deactivate first to edit
- Re-validation performed on update

---

### Activate/Deactivate Workflow

```http
PATCH /api/workflows/:id/activate
PATCH /api/workflows/:id/deactivate
```

**Response (200):**
```json
{
  "success": true,
  "message": "Workflow aktif edildi"
}
```

**Notes:**
- Only one workflow can be active per company
- Activating a workflow deactivates others
- Cannot deactivate if instances are running

---

### Delete Workflow

```http
DELETE /api/workflows/:id
```

**Response (200):**
```json
{
  "success": true,
  "message": "Workflow silindi"
}
```

**Notes:**
- Cannot delete active workflows
- Cannot delete if instances exist

---

## 📋 Workflow Task Endpoints

### Get My Tasks

```http
GET /api/workflows/tasks/my-tasks
```

**Description:** Returns all pending approval tasks assigned to the current user.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "task123",
      "nodeId": "approval-1",
      "dueDate": "2024-11-10T00:00:00Z",
      "createdAt": "2024-11-07T10:00:00Z",
      "workflow": {
        "name": "Standard Approval Workflow"
      },
      "purchaseRequest": {
        "id": "req123",
        "requestNumber": "PR-2024-001",
        "title": "Dental Supplies Order",
        "amount": 15000.00,
        "priority": "MEDIUM",
        "requester": {
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    }
  ],
  "count": 1
}
```

---

### Make Approval Decision

```http
POST /api/workflows/tasks/:taskId/decide
```

**Request Body:**
```json
{
  "decision": "APPROVED",
  "comment": "Budget approved for Q4 2024"
}
```

**Valid Decisions:**
- `APPROVED` - Approve the task
- `REJECTED` - Reject the task

**Response (200):**
```json
{
  "success": true,
  "message": "Onaylandı"
}
```

**Behavior:**
- Updates task status to COMPLETED or REJECTED
- Continues workflow execution if approved
- Sends email notifications
- Updates purchase request status if workflow completes

**Errors:**
- `400` - Invalid decision
- `401` - Not assigned to this task
- `404` - Task not found
- `500` - Server error

---

## 👥 User Management Endpoints

### List Users

```http
GET /api/users
```

**Query Parameters:**
- `role` (optional): Filter by role (ADMIN, APPROVER, REQUESTER)
- `search` (optional): Search by name or email

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "REQUESTER",
      "department": "Dental Operations",
      "isActive": true,
      "createdAt": "2024-11-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

**Permissions:** Admin only

---

### Get User by ID

```http
GET /api/users/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "REQUESTER",
    "department": "Dental Operations",
    "isActive": true,
    "createdAt": "2024-11-01T00:00:00Z"
  }
}
```

---

### Update User

```http
PUT /api/users/:id
```

**Request Body:**
```json
{
  "name": "John Updated",
  "role": "APPROVER",
  "department": "Management",
  "isActive": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Kullanıcı güncellendi",
  "data": {
    "id": "user123",
    "name": "John Updated",
    "role": "APPROVER"
  }
}
```

**Permissions:** Admin only

---

### Delete User

```http
DELETE /api/users/:id
```

**Response (200):**
```json
{
  "success": true,
  "message": "Kullanıcı silindi"
}
```

**Permissions:** Admin only

**Notes:**
- Cannot delete yourself
- Cannot delete users with active tasks
- Soft delete (sets isActive = false)

---

## ⚙️ Company Settings Endpoints

### Get Company Settings

```http
GET /api/settings/company
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "comp123",
    "name": "My Dental Clinic",
    "subdomain": "mydental",
    "logo": "https://blob.vercel-storage.com/logo.png",
    "primaryColor": "#2563eb",
    "secondaryColor": "#1e40af",
    "createdAt": "2024-11-01T00:00:00Z"
  }
}
```

---

### Update Company Settings

```http
PUT /api/settings/company
```

**Request Body:**
```json
{
  "name": "Updated Clinic Name",
  "primaryColor": "#ef4444",
  "secondaryColor": "#dc2626"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Ayarlar güncellendi",
  "data": {
    "id": "comp123",
    "name": "Updated Clinic Name",
    "primaryColor": "#ef4444"
  }
}
```

**Permissions:** Admin only

---

### Upload Company Logo

```http
POST /api/settings/company/logo
```

**Request:** multipart/form-data

```
Content-Type: multipart/form-data
file: [binary data]
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logo yüklendi",
  "url": "https://blob.vercel-storage.com/logo-abc123.png"
}
```

**Constraints:**
- Max file size: 5MB
- Allowed formats: PNG, JPG, JPEG, SVG
- Recommended size: 200x200px

**Permissions:** Admin only

---

## 📊 Dashboard & Analytics

### Get Dashboard Stats

```http
GET /api/dashboard/stats
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalRequests": 156,
    "pendingRequests": 12,
    "approvedRequests": 120,
    "rejectedRequests": 24,
    "totalValue": 2500000.00,
    "pendingValue": 180000.00,
    "myPendingTasks": 3,
    "recentActivity": [
      {
        "id": "act1",
        "type": "REQUEST_CREATED",
        "description": "New purchase request created",
        "timestamp": "2024-11-07T10:00:00Z",
        "user": {
          "name": "John Doe"
        }
      }
    ]
  }
}
```

---

### Get Activity Log

```http
GET /api/dashboard/activity
```

**Query Parameters:**
- `limit` (optional): Number of records (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `type` (optional): Filter by activity type

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "log1",
      "type": "APPROVAL_GIVEN",
      "description": "Purchase request approved",
      "user": {
        "name": "Jane Manager",
        "role": "APPROVER"
      },
      "purchaseRequest": {
        "id": "req123",
        "requestNumber": "PR-2024-001"
      },
      "timestamp": "2024-11-07T11:00:00Z"
    }
  ],
  "count": 1,
  "total": 156
}
```

---

## 🔍 Search & Filter

### Global Search

```http
GET /api/search
```

**Query Parameters:**
- `q` (required): Search query
- `type` (optional): Filter by type (requests, users, workflows)

**Response (200):**
```json
{
  "success": true,
  "results": {
    "purchaseRequests": [...],
    "users": [...],
    "workflows": [...]
  },
  "totalResults": 15
}
```

---

## 📧 Email Notification Endpoints

### Get Email Templates

```http
GET /api/settings/email-templates
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "template1",
      "type": "PURCHASE_REQUEST_CREATED",
      "subject": "Yeni Satın Alma Talebi: {{requestNumber}}",
      "body": "Merhaba {{userName}},\n\nYeni bir satın alma talebi oluşturuldu...",
      "isActive": true
    }
  ]
}
```

---

### Update Email Template

```http
PUT /api/settings/email-templates/:id
```

**Request Body:**
```json
{
  "subject": "Updated Subject: {{requestNumber}}",
  "body": "Updated email body with {{variables}}",
  "isActive": true
}
```

---

## 🔐 Permission System

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|------------|
| **ADMIN** | Full access to all features |
| **APPROVER** | Approve/reject requests, view all requests, manage own tasks |
| **REQUESTER** | Create requests, view own requests, update own requests |

### Endpoint Permissions

| Endpoint | ADMIN | APPROVER | REQUESTER |
|----------|-------|----------|-----------|
| `POST /api/purchase-requests` | ✅ | ✅ | ✅ |
| `GET /api/purchase-requests` | ✅ (all) | ✅ (all) | ✅ (own) |
| `PUT /api/purchase-requests/:id` | ✅ (all) | ✅ (assigned) | ✅ (own) |
| `DELETE /api/purchase-requests/:id` | ✅ | ❌ | ✅ (own) |
| `POST /api/workflows` | ✅ | ❌ | ❌ |
| `PUT /api/workflows/:id` | ✅ | ❌ | ❌ |
| `GET /api/users` | ✅ | ❌ | ❌ |
| `PUT /api/users/:id` | ✅ | ❌ | ❌ |
| `PUT /api/settings/company` | ✅ | ❌ | ❌ |
| `POST /api/workflows/tasks/:id/decide` | ✅ | ✅ (assigned) | ❌ |

---

## 🚨 Error Codes

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format

```json
{
  "success": false,
  "message": "Hata açıklaması",
  "error": "DETAILED_ERROR_CODE",
  "details": {
    "field": "validation error details"
  }
}
```

### Common Error Messages

**Authentication Errors:**
- `Token bulunamadı` - No Authorization header
- `Geçersiz token` - Invalid or expired token
- `Yetkisiz erişim` - Insufficient permissions

**Validation Errors:**
- `Gerekli alanlar eksik` - Required fields missing
- `Geçersiz format` - Invalid data format
- `Geçersiz değer` - Invalid value

**Business Logic Errors:**
- `Workflow zaten aktif` - Workflow already active
- `Onay yetkisi yok` - Not authorized to approve
- `Talep bulunamadı` - Request not found

---

## 🔄 Webhook Support (Future)

Planned webhook support for external integrations:

```http
POST /api/webhooks/configure
```

**Events:**
- `purchase_request.created`
- `purchase_request.approved`
- `purchase_request.rejected`
- `workflow.completed`
- `approval.given`

---

## 📝 Rate Limiting

**Current Limits:**
- 100 requests per minute per IP
- 1000 requests per hour per user

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699363200
```

**Rate Limit Exceeded (429):**
```json
{
  "success": false,
  "message": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

## 🧪 Testing the API

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Get purchase requests
curl -X GET http://localhost:3000/api/purchase-requests \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create purchase request
curl -X POST http://localhost:3000/api/purchase-requests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Request","category":"SUPPLIES","priority":"MEDIUM","estimatedTotal":1000,"items":[{"name":"Test Item","quantity":1,"unit":"piece","estimatedUnitPrice":1000}]}'
```

### Using Postman

1. Import the Postman collection (if available)
2. Set environment variable `API_URL` = `http://localhost:3000`
3. Login to get token
4. Set `TOKEN` environment variable
5. Use `{{API_URL}}` and `{{TOKEN}}` in requests

### Using JavaScript/Fetch

```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password123'
  })
});
const { token } = await loginResponse.json();

// Get requests
const requestsResponse = await fetch('/api/purchase-requests', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const { data } = await requestsResponse.json();
```

---

## 📚 Additional Resources

- [Deployment Guide](./DEPLOYMENT.md)
- [README](../README.md)
- [Environment Setup](../.env.example)
- [Database Schema](../prisma/schema.prisma)

---

## 🆘 Support

For API issues or questions:
1. Check error message and status code
2. Review this documentation
3. Check server logs
4. Create an issue on GitHub

---

**Last Updated:** 2024-11-07
**API Version:** 1.0.0
**Base URL:** `http://localhost:3000` (development) | `https://yourdomain.vercel.app` (production)
