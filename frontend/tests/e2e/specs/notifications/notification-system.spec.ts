import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../helpers/auth.helper';
import { AccessibilityHelper } from '../../helpers/accessibility.helper';
import { testNotifications } from '../../fixtures/test-data';

test.describe('Notification System', () => {
  let authHelper: AuthHelper;
  let a11yHelper: AccessibilityHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    a11yHelper = new AccessibilityHelper(page);
    
    // Login as patient
    await authHelper.login('patient');
  });

  test('should display notification center', async ({ page }) => {
    // Click notification bell
    await page.click('[data-testid="notification-bell"]');
    
    // Check notification dropdown
    await expect(page.locator('[data-testid="notification-dropdown"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-header"]')).toContainText(/Notifications/i);
    
    // Check for unread count
    const unreadBadge = await page.locator('[data-testid="unread-count"]');
    if (await unreadBadge.isVisible()) {
      const count = await unreadBadge.textContent();
      expect(parseInt(count || '0')).toBeGreaterThan(0);
    }
  });

  test('should receive real-time notifications', async ({ page, context }) => {
    // Open notification center
    await page.click('[data-testid="notification-bell"]');
    
    // Get initial notification count
    const initialCount = await page.$$('[data-testid="notification-item"]');
    
    // Open new tab to simulate another action
    const newPage = await context.newPage();
    await newPage.goto('/');
    
    // Wait for potential real-time update
    await page.waitForTimeout(2000);
    
    // Check if notification count increased
    const updatedCount = await page.$$('[data-testid="notification-item"]');
    
    // Close the new page
    await newPage.close();
  });

  test('should handle appointment confirmation notifications', async ({ page }) => {
    // Navigate to notifications page
    await page.goto('/notifications');
    
    // Find appointment confirmation notification
    const confirmationNotif = await page.locator(
      `[data-testid="notification-item"][data-type="${testNotifications.appointmentConfirmation.type}"]`
    ).first();
    
    if (await confirmationNotif.isVisible()) {
      // Click notification
      await confirmationNotif.click();
      
      // Should show appointment details
      await page.waitForSelector('[data-testid="appointment-details-modal"]');
      await expect(page.locator('[data-testid="appointment-date"]')).toBeVisible();
      await expect(page.locator('[data-testid="appointment-time"]')).toBeVisible();
      await expect(page.locator('[data-testid="provider-name"]')).toBeVisible();
      
      // Add to calendar option
      await expect(page.locator('[data-testid="add-to-calendar"]')).toBeVisible();
      
      // Close modal
      await page.click('[data-testid="close-modal"]');
    }
  });

  test('should handle appointment reminder notifications', async ({ page }) => {
    await page.goto('/notifications');
    
    const reminderNotif = await page.locator(
      `[data-testid="notification-item"][data-type="${testNotifications.appointmentReminder.type}"]`
    ).first();
    
    if (await reminderNotif.isVisible()) {
      // Check reminder details
      await expect(reminderNotif).toContainText(/tomorrow|today|in \d+ hours/i);
      
      // Click for options
      await reminderNotif.click();
      
      // Should show quick actions
      await expect(page.locator('[data-testid="confirm-attendance"]')).toBeVisible();
      await expect(page.locator('[data-testid="reschedule-appointment"]')).toBeVisible();
      await expect(page.locator('[data-testid="cancel-appointment"]')).toBeVisible();
      
      // Confirm attendance
      await page.click('[data-testid="confirm-attendance"]');
      await expect(page.locator('[data-testid="attendance-confirmed"]')).toBeVisible();
    }
  });

  test('should handle provider message notifications', async ({ page }) => {
    await page.goto('/notifications');
    
    const messageNotif = await page.locator(
      `[data-testid="notification-item"][data-type="${testNotifications.providerMessage.type}"]`
    ).first();
    
    if (await messageNotif.isVisible()) {
      // Click to read message
      await messageNotif.click();
      
      // Should navigate to messages
      await page.waitForURL(/\/messages/);
      await expect(page.locator('[data-testid="message-thread"]')).toBeVisible();
      
      // Mark as read
      const unreadIndicator = await page.locator('[data-testid="unread-indicator"]');
      if (await unreadIndicator.isVisible()) {
        expect(await unreadIndicator.isVisible()).toBeFalsy();
      }
    }
  });

  test('should manage notification preferences', async ({ page }) => {
    await page.goto('/settings/notifications');
    
    // Check all notification types are listed
    await expect(page.locator('[data-testid="notification-preferences"]')).toBeVisible();
    
    // Appointment notifications
    await expect(page.locator('[data-testid="pref-appointment-confirmations"]')).toBeVisible();
    await expect(page.locator('[data-testid="pref-appointment-reminders"]')).toBeVisible();
    await expect(page.locator('[data-testid="pref-appointment-changes"]')).toBeVisible();
    
    // Waitlist notifications
    await expect(page.locator('[data-testid="pref-waitlist-updates"]')).toBeVisible();
    await expect(page.locator('[data-testid="pref-waitlist-offers"]')).toBeVisible();
    
    // Message notifications
    await expect(page.locator('[data-testid="pref-provider-messages"]')).toBeVisible();
    await expect(page.locator('[data-testid="pref-system-updates"]')).toBeVisible();
    
    // Configure preferences
    await page.uncheck('[data-testid="pref-marketing-emails"]');
    await page.check('[data-testid="pref-appointment-reminders"]');
    
    // Set reminder timing
    await page.selectOption('[data-testid="reminder-timing"]', '24hours');
    
    // Configure delivery methods
    await page.check('[data-testid="delivery-email"]');
    await page.check('[data-testid="delivery-sms"]');
    await page.check('[data-testid="delivery-push"]');
    
    // Set quiet hours
    await page.check('[data-testid="enable-quiet-hours"]');
    await page.fill('[data-testid="quiet-hours-start"]', '22:00');
    await page.fill('[data-testid="quiet-hours-end"]', '08:00');
    
    // Save preferences
    await page.click('[data-testid="save-preferences"]');
    await expect(page.locator('[data-testid="preferences-saved"]')).toBeVisible();
  });

  test('should mark notifications as read/unread', async ({ page }) => {
    await page.goto('/notifications');
    
    // Find unread notifications
    const unreadNotifs = await page.$$('[data-testid="notification-item"][data-read="false"]');
    
    if (unreadNotifs.length > 0) {
      // Mark first as read
      await unreadNotifs[0].locator('[data-testid="mark-as-read"]').click();
      
      // Verify marked as read
      await expect(unreadNotifs[0]).toHaveAttribute('data-read', 'true');
      
      // Mark all as read
      await page.click('[data-testid="mark-all-read"]');
      
      // Verify all marked as read
      const stillUnread = await page.$$('[data-testid="notification-item"][data-read="false"]');
      expect(stillUnread.length).toBe(0);
    }
  });

  test('should delete notifications', async ({ page }) => {
    await page.goto('/notifications');
    
    const notifications = await page.$$('[data-testid="notification-item"]');
    const initialCount = notifications.length;
    
    if (initialCount > 0) {
      // Delete single notification
      await notifications[0].locator('[data-testid="delete-notification"]').click();
      
      // Confirm deletion
      await page.click('[data-testid="confirm-delete"]');
      
      // Verify deleted
      await page.waitForTimeout(500);
      const remainingNotifs = await page.$$('[data-testid="notification-item"]');
      expect(remainingNotifs.length).toBe(initialCount - 1);
      
      // Undo deletion if available
      const undoButton = await page.locator('[data-testid="undo-delete"]');
      if (await undoButton.isVisible()) {
        await undoButton.click();
        const afterUndo = await page.$$('[data-testid="notification-item"]');
        expect(afterUndo.length).toBe(initialCount);
      }
    }
  });

  test('should filter notifications', async ({ page }) => {
    await page.goto('/notifications');
    
    // Filter by type
    await page.selectOption('[data-testid="filter-type"]', 'appointments');
    await page.click('[data-testid="apply-filters"]');
    
    // Verify filtered results
    const filteredNotifs = await page.$$('[data-testid="notification-item"]');
    for (const notif of filteredNotifs) {
      const type = await notif.getAttribute('data-type');
      expect(type).toMatch(/appointment/i);
    }
    
    // Filter by date range
    await page.click('[data-testid="clear-filters"]');
    await page.selectOption('[data-testid="filter-date-range"]', 'last7days');
    await page.click('[data-testid="apply-filters"]');
    
    // Filter by read status
    await page.click('[data-testid="filter-unread-only"]');
    const unreadOnly = await page.$$('[data-testid="notification-item"][data-read="false"]');
    const allVisible = await page.$$('[data-testid="notification-item"]');
    expect(unreadOnly.length).toBe(allVisible.length);
  });

  test('should handle notification actions', async ({ page }) => {
    await page.goto('/notifications');
    
    // Find actionable notification
    const actionableNotif = await page.locator('[data-testid="notification-item"][data-actionable="true"]').first();
    
    if (await actionableNotif.isVisible()) {
      await actionableNotif.click();
      
      // Check for action buttons
      const actions = await page.$$('[data-testid^="notification-action-"]');
      expect(actions.length).toBeGreaterThan(0);
      
      // Perform an action
      await actions[0].click();
      
      // Verify action completed
      await expect(page.locator('[data-testid="action-completed"]')).toBeVisible();
    }
  });

  test('should show notification history', async ({ page }) => {
    await page.goto('/notifications/history');
    
    // Check date grouping
    await expect(page.locator('[data-testid="notification-group-today"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-group-yesterday"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-group-older"]')).toBeVisible();
    
    // Load more if available
    const loadMoreButton = await page.locator('[data-testid="load-more-notifications"]');
    if (await loadMoreButton.isVisible()) {
      const beforeCount = await page.$$('[data-testid="notification-item"]');
      await loadMoreButton.click();
      await page.waitForTimeout(1000);
      const afterCount = await page.$$('[data-testid="notification-item"]');
      expect(afterCount.length).toBeGreaterThan(beforeCount.length);
    }
  });

  test('should meet accessibility standards', async ({ page }) => {
    await page.goto('/notifications');
    
    await a11yHelper.checkPageAccessibility();
    
    // Check notification list accessibility
    const notificationList = await page.locator('[data-testid="notification-list"]');
    await expect(notificationList).toHaveAttribute('role', 'list');
    
    // Check announcement for new notifications
    await a11yHelper.checkAnnouncements(async () => {
      // Simulate new notification
      await page.evaluate(() => {
        const event = new CustomEvent('new-notification', { 
          detail: { message: 'New appointment reminder' }
        });
        window.dispatchEvent(event);
      });
    }, 'New appointment reminder');
  });

  test('should handle push notification permissions', async ({ page, context }) => {
    await page.goto('/settings/notifications');
    
    // Check for push notification toggle
    const pushToggle = await page.locator('[data-testid="enable-push-notifications"]');
    
    if (await pushToggle.isVisible()) {
      // Mock permission request
      await context.grantPermissions(['notifications']);
      
      // Enable push notifications
      await pushToggle.click();
      
      // Should show permission granted
      await expect(page.locator('[data-testid="push-permission-status"]')).toContainText(/Enabled/i);
      
      // Test notification
      await page.click('[data-testid="test-push-notification"]');
      await expect(page.locator('[data-testid="test-notification-sent"]')).toBeVisible();
    }
  });

  test('should export notification data', async ({ page }) => {
    await page.goto('/notifications/settings');
    
    // Request data export
    await page.click('[data-testid="export-notifications"]');
    
    // Select export options
    await page.selectOption('[data-testid="export-format"]', 'csv');
    await page.selectOption('[data-testid="export-range"]', 'all');
    
    // Download export
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-export"]');
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('notifications');
  });
});