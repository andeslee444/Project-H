import { Page, Locator } from '@playwright/test';

export class PageObjects {
  constructor(private page: Page) {}

  // Navigation elements
  get userMenu(): Locator {
    return this.page.locator('[data-testid="user-menu"]');
  }

  get notificationBell(): Locator {
    return this.page.locator('[data-testid="notification-bell"]');
  }

  get mainNavigation(): Locator {
    return this.page.locator('[data-testid="main-navigation"]');
  }

  // Common form elements
  getInput(name: string): Locator {
    return this.page.locator(`[data-testid="${name}-input"]`);
  }

  getButton(name: string): Locator {
    return this.page.locator(`[data-testid="${name}-button"]`);
  }

  getError(field: string): Locator {
    return this.page.locator(`[data-testid="${field}-error"]`);
  }

  getSelect(name: string): Locator {
    return this.page.locator(`[data-testid="${name}-select"]`);
  }

  getCheckbox(name: string): Locator {
    return this.page.locator(`[data-testid="${name}-checkbox"]`);
  }

  // Loading states
  get loadingSpinner(): Locator {
    return this.page.locator('[data-testid="loading-spinner"]');
  }

  get loadingOverlay(): Locator {
    return this.page.locator('[data-testid="loading-overlay"]');
  }

  // Messages
  get successMessage(): Locator {
    return this.page.locator('[data-testid="success-message"]');
  }

  get errorMessage(): Locator {
    return this.page.locator('[data-testid="error-message"]');
  }

  get infoMessage(): Locator {
    return this.page.locator('[data-testid="info-message"]');
  }

  // Modals
  getModal(name: string): Locator {
    return this.page.locator(`[data-testid="${name}-modal"]`);
  }

  get modalOverlay(): Locator {
    return this.page.locator('[data-testid="modal-overlay"]');
  }

  get closeModalButton(): Locator {
    return this.page.locator('[data-testid="close-modal"]');
  }

  // Tables
  getTableRow(index: number): Locator {
    return this.page.locator(`[data-testid="table-row-${index}"]`);
  }

  getTableCell(row: number, column: string): Locator {
    return this.page.locator(`[data-testid="cell-${row}-${column}"]`);
  }

  // Pagination
  get nextPageButton(): Locator {
    return this.page.locator('[data-testid="next-page"]');
  }

  get previousPageButton(): Locator {
    return this.page.locator('[data-testid="previous-page"]');
  }

  get pageInfo(): Locator {
    return this.page.locator('[data-testid="page-info"]');
  }

  // Common actions
  async fillForm(data: Record<string, string>) {
    for (const [field, value] of Object.entries(data)) {
      await this.getInput(field).fill(value);
    }
  }

  async selectOptions(selections: Record<string, string>) {
    for (const [field, value] of Object.entries(selections)) {
      await this.getSelect(field).selectOption(value);
    }
  }

  async checkBoxes(boxes: string[]) {
    for (const box of boxes) {
      await this.getCheckbox(box).check();
    }
  }

  async waitForLoadingToComplete() {
    await this.loadingSpinner.waitFor({ state: 'hidden' });
    await this.loadingOverlay.waitFor({ state: 'hidden' });
  }

  async closeModal() {
    await this.closeModalButton.click();
    await this.modalOverlay.waitFor({ state: 'hidden' });
  }

  async expectSuccessMessage(text: string) {
    await this.successMessage.waitFor({ state: 'visible' });
    await this.page.waitForFunction(
      (expectedText) => {
        const element = document.querySelector('[data-testid="success-message"]');
        return element?.textContent?.includes(expectedText);
      },
      text
    );
  }

  async expectErrorMessage(text: string) {
    await this.errorMessage.waitFor({ state: 'visible' });
    await this.page.waitForFunction(
      (expectedText) => {
        const element = document.querySelector('[data-testid="error-message"]');
        return element?.textContent?.includes(expectedText);
      },
      text
    );
  }

  // Navigation helpers
  async navigateToSection(section: string) {
    await this.mainNavigation.locator(`[data-testid="nav-${section}"]`).click();
    await this.page.waitForURL(new RegExp(section));
  }

  async openUserMenu() {
    await this.userMenu.click();
    await this.page.waitForSelector('[data-testid="user-menu-dropdown"]', { state: 'visible' });
  }

  async openNotifications() {
    await this.notificationBell.click();
    await this.page.waitForSelector('[data-testid="notification-dropdown"]', { state: 'visible' });
  }
}

// Specific page objects for different sections
export class AppointmentPageObjects extends PageObjects {
  get appointmentList(): Locator {
    return this.page.locator('[data-testid="appointment-list"]');
  }

  get calendarWidget(): Locator {
    return this.page.locator('[data-testid="calendar-widget"]');
  }

  get timeSlots(): Locator {
    return this.page.locator('[data-testid="time-slots"]');
  }

  getAppointmentCard(id: string): Locator {
    return this.page.locator(`[data-testid="appointment-${id}"]`);
  }

  getTimeSlot(time: string): Locator {
    return this.page.locator(`[data-testid="time-slot-${time}"]`);
  }

  async selectAppointmentType(type: string) {
    await this.page.click(`[data-testid="appointment-type-${type}"]`);
  }

  async selectProvider(providerId: string) {
    await this.page.click(`[data-testid="provider-${providerId}"]`);
  }

  async selectDate(date: string) {
    await this.page.click(`[data-testid="date-${date}"]`);
  }
}

export class ProviderPageObjects extends PageObjects {
  get scheduleCalendar(): Locator {
    return this.page.locator('[data-testid="schedule-calendar"]');
  }

  get availabilitySettings(): Locator {
    return this.page.locator('[data-testid="availability-settings"]');
  }

  get appointmentRequests(): Locator {
    return this.page.locator('[data-testid="appointment-requests"]');
  }

  getDaySchedule(day: string): Locator {
    return this.page.locator(`[data-testid="schedule-${day}"]`);
  }

  async setAvailability(day: string, start: string, end: string) {
    await this.getInput(`${day}-start-time`).fill(start);
    await this.getInput(`${day}-end-time`).fill(end);
  }

  async blockTimeSlot(time: string, reason: string) {
    await this.page.click(`[data-testid="time-slot-${time}"]`);
    await this.page.click('[data-testid="block-time-option"]');
    await this.getInput('block-reason').fill(reason);
    await this.getButton('save-block').click();
  }
}

export class WaitlistPageObjects extends PageObjects {
  get waitlistStatus(): Locator {
    return this.page.locator('[data-testid="waitlist-status"]');
  }

  get waitlistPosition(): Locator {
    return this.page.locator('[data-testid="waitlist-position"]');
  }

  get preferencesForm(): Locator {
    return this.page.locator('[data-testid="waitlist-preferences-form"]');
  }

  async setWaitlistPreferences(preferences: {
    urgency: string;
    timePreference: string;
    days: string[];
    maxWaitTime: string;
    acceptShortNotice: boolean;
  }) {
    await this.getSelect('urgency-level').selectOption(preferences.urgency);
    await this.getSelect('time-preference').selectOption(preferences.timePreference);
    
    for (const day of preferences.days) {
      await this.getCheckbox(`day-${day}`).check();
    }
    
    await this.getSelect('max-wait-time').selectOption(preferences.maxWaitTime);
    
    if (preferences.acceptShortNotice) {
      await this.getCheckbox('accept-short-notice').check();
    }
  }
}