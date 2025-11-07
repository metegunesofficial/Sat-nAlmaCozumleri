import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')
  })

  test('should display login form', async ({ page }) => {
    // Check if login form elements are visible
    await expect(page.getByRole('heading', { name: /giriş yap/i })).toBeVisible()
    await expect(page.getByLabel(/e-posta/i)).toBeVisible()
    await expect(page.getByLabel(/şifre/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /giriş yap/i })).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    // Click login button without filling form
    await page.getByRole('button', { name: /giriş yap/i }).click()

    // Check for validation errors
    await expect(page.getByText(/e-posta gerekli/i)).toBeVisible()
    await expect(page.getByText(/şifre gerekli/i)).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.getByLabel(/e-posta/i).fill('invalid@example.com')
    await page.getByLabel(/şifre/i).fill('wrongpassword')

    // Submit form
    await page.getByRole('button', { name: /giriş yap/i }).click()

    // Check for error message
    await expect(page.getByText(/kullanıcı bulunamadı|geçersiz şifre/i)).toBeVisible()
  })

  test('should redirect to dashboard on successful login', async ({ page }) => {
    // Mock successful login (you'll need to seed test data or use test credentials)
    await page.getByLabel(/e-posta/i).fill('test@example.com')
    await page.getByLabel(/şifre/i).fill('Test123!')

    // Submit form
    await page.getByRole('button', { name: /giriş yap/i }).click()

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard')

    // Verify we're on the dashboard
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel(/şifre/i)

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Click show password button
    await page.getByRole('button', { name: /göster|show/i }).click()

    // Password should now be visible
    await expect(passwordInput).toHaveAttribute('type', 'text')

    // Click hide password button
    await page.getByRole('button', { name: /gizle|hide/i }).click()

    // Password should be hidden again
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('should persist session after page reload', async ({ page, context }) => {
    // Login with valid credentials
    await page.getByLabel(/e-posta/i).fill('test@example.com')
    await page.getByLabel(/şifre/i).fill('Test123!')
    await page.getByRole('button', { name: /giriş yap/i }).click()

    // Wait for redirect
    await page.waitForURL('**/dashboard')

    // Reload page
    await page.reload()

    // Should still be on dashboard (not redirected to login)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.getByLabel(/e-posta/i).fill('test@example.com')
    await page.getByLabel(/şifre/i).fill('Test123!')
    await page.getByRole('button', { name: /giriş yap/i }).click()

    await page.waitForURL('**/dashboard')

    // Click logout button
    await page.getByRole('button', { name: /çıkış|logout/i }).click()

    // Should be redirected to login
    await page.waitForURL('**/login')
    await expect(page).toHaveURL(/\/login/)
  })

  test('should have proper accessibility', async ({ page }) => {
    // Check for proper labels
    const emailInput = page.getByLabel(/e-posta/i)
    const passwordInput = page.getByLabel(/şifre/i)

    await expect(emailInput).toHaveAttribute('type', 'email')
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Check for autocomplete attributes
    await expect(emailInput).toHaveAttribute('autocomplete', 'email')
    await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password')
  })

  test('should handle rate limiting gracefully', async ({ page }) => {
    // Attempt multiple failed logins
    for (let i = 0; i < 6; i++) {
      await page.getByLabel(/e-posta/i).fill('test@example.com')
      await page.getByLabel(/şifre/i).fill('wrongpassword')
      await page.getByRole('button', { name: /giriş yap/i }).click()
      await page.waitForTimeout(500)
    }

    // Should show rate limit error
    await expect(page.getByText(/çok fazla deneme|rate limit/i)).toBeVisible()
  })
})
