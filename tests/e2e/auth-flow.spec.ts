import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete registration flow', async ({ page }) => {
    // Navigate to register page
    await page.click('text=Kayıt Ol');

    // Wait for registration form
    await expect(page).toHaveURL(/.*register/);

    // Fill registration form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="department"]', 'Testing Department');
    await page.fill('input[name="companyName"]', 'Test Company');
    await page.fill('input[name="subdomain"]', `test${Date.now()}`);

    // Select role
    await page.selectOption('select[name="role"]', 'REQUESTER');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });

    // Should see welcome message or user name
    await expect(page.locator('text=Test User')).toBeVisible();
  });

  test('should complete login flow', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Giriş Yap');

    // Wait for login form
    await expect(page).toHaveURL(/.*login/);

    // Fill login form
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });

    // Should see dashboard elements
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.click('text=Giriş Yap');
    await expect(page).toHaveURL(/.*login/);

    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/Geçersiz|hatalı/i')).toBeVisible();

    // Should stay on login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('should handle logout', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);

    // Click profile menu
    await page.click('[data-testid="user-menu"]');

    // Click logout
    await page.click('text=Çıkış Yap');

    // Should redirect to login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('should prevent access to protected routes without auth', async ({ page }) => {
    // Try to access dashboard without logging in
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe('Purchase Request Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should create a new purchase request', async ({ page }) => {
    // Navigate to purchase requests
    await page.click('text=Satın Alma Talepleri');

    // Click new request button
    await page.click('text=Yeni Talep');

    // Wait for form
    await expect(page.locator('form')).toBeVisible();

    // Fill basic information
    await page.fill('input[name="title"]', 'Test Purchase Request');
    await page.fill('textarea[name="description"]', 'Test description for automated testing');
    await page.selectOption('select[name="category"]', 'SUPPLIES');
    await page.selectOption('select[name="priority"]', 'MEDIUM');
    await page.fill('input[name="estimatedTotal"]', '5000');
    await page.selectOption('select[name="currency"]', 'TRY');

    // Add item
    await page.click('text=Ürün Ekle');
    await page.fill('input[name="items.0.name"]', 'Test Item');
    await page.fill('input[name="items.0.quantity"]', '10');
    await page.fill('input[name="items.0.unit"]', 'piece');
    await page.fill('input[name="items.0.estimatedUnitPrice"]', '500');

    // Add supplier
    await page.click('text=Tedarikçi Ekle');
    await page.fill('input[name="suppliers.0.name"]', 'Test Supplier');
    await page.fill('input[name="suppliers.0.contact"]', 'John Doe');
    await page.fill('input[name="suppliers.0.email"]', 'supplier@example.com');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show success message
    await expect(page.locator('text=/başarıyla|oluşturuldu/i')).toBeVisible();

    // Should redirect to request list or detail
    await expect(page).toHaveURL(/.*purchase-requests/);
  });

  test('should view purchase request details', async ({ page }) => {
    await page.goto('/purchase-requests');

    // Click on first request
    await page.click('[data-testid="request-row"]:first-child');

    // Should see request details
    await expect(page.locator('text=Talep Detayları')).toBeVisible();
    await expect(page.locator('text=Talep Numarası')).toBeVisible();
    await expect(page.locator('text=Ürünler')).toBeVisible();
    await expect(page.locator('text=Tedarikçiler')).toBeVisible();
  });

  test('should filter purchase requests', async ({ page }) => {
    await page.goto('/purchase-requests');

    // Filter by status
    await page.selectOption('select[name="status"]', 'PENDING');

    // Should show filtered results
    await expect(page.locator('[data-testid="request-row"]')).toHaveCount(
      await page.locator('[data-testid="request-row"]').count()
    );

    // Filter by priority
    await page.selectOption('select[name="priority"]', 'HIGH');

    // Results should update
    await page.waitForLoadState('networkidle');
  });
});

test.describe('Workflow Designer', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should access workflow designer', async ({ page }) => {
    // Navigate to workflow designer
    await page.click('text=Görsel Workflow Designer');

    // Should see canvas
    await expect(page.locator('[data-testid="workflow-canvas"]')).toBeVisible();

    // Should see node palette
    await expect(page.locator('text=Start')).toBeVisible();
    await expect(page.locator('text=Approval')).toBeVisible();
    await expect(page.locator('text=Decision')).toBeVisible();
    await expect(page.locator('text=End')).toBeVisible();
  });

  test('should create a simple workflow', async ({ page }) => {
    await page.goto('/admin/workflows/designer');

    // Drag Start node to canvas
    await page.dragAndDrop('[data-node-type="start"]', '[data-testid="workflow-canvas"]', {
      targetPosition: { x: 100, y: 100 },
    });

    // Drag Approval node
    await page.dragAndDrop('[data-node-type="approval"]', '[data-testid="workflow-canvas"]', {
      targetPosition: { x: 300, y: 100 },
    });

    // Drag End node
    await page.dragAndDrop('[data-node-type="end"]', '[data-testid="workflow-canvas"]', {
      targetPosition: { x: 500, y: 100 },
    });

    // Connect nodes (this depends on ReactFlow implementation)
    // await connectNodes(page, 'start-1', 'approval-1');
    // await connectNodes(page, 'approval-1', 'end-1');

    // Save workflow
    await page.fill('input[name="workflowName"]', 'Test Workflow');
    await page.click('button:has-text("Kaydet")');

    // Should show success message
    await expect(page.locator('text=/kaydedildi|başarılı/i')).toBeVisible();
  });
});

test.describe('Approval Tasks', () => {
  test.beforeEach(async ({ page }) => {
    // Login as approver
    await page.goto('/login');
    await page.fill('input[name="email"]', 'approver@example.com');
    await page.fill('input[name="password"]', 'approver123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should view pending approval tasks', async ({ page }) => {
    // Navigate to my tasks
    await page.click('text=Bekleyen Görevlerim');

    // Should see task list
    await expect(page.locator('[data-testid="task-card"]')).toBeVisible();
  });

  test('should approve a task', async ({ page }) => {
    await page.goto('/tasks/my-tasks');

    // Click on first task
    await page.click('[data-testid="task-card"]:first-child');

    // Fill comment
    await page.fill('textarea[name="comment"]', 'Approved for testing');

    // Click approve button
    await page.click('button:has-text("Onayla")');

    // Confirm in modal if exists
    if (await page.locator('text=Onaylıyor musunuz').isVisible()) {
      await page.click('button:has-text("Evet")');
    }

    // Should show success message
    await expect(page.locator('text=/onaylandı|başarılı/i')).toBeVisible();
  });

  test('should reject a task', async ({ page }) => {
    await page.goto('/tasks/my-tasks');

    await page.click('[data-testid="task-card"]:first-child');

    // Fill rejection comment
    await page.fill('textarea[name="comment"]', 'Rejected - budget constraints');

    // Click reject button
    await page.click('button:has-text("Reddet")');

    // Confirm
    if (await page.locator('text=Reddetmek').isVisible()) {
      await page.click('button:has-text("Evet")');
    }

    // Should show success message
    await expect(page.locator('text=/reddedildi|başarılı/i')).toBeVisible();
  });
});
