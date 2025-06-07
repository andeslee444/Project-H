import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export class AccessibilityHelper {
  constructor(private page: Page) {}

  async checkPageAccessibility(options?: {
    includedImpacts?: string[];
    excludedRules?: string[];
    runOnly?: string[];
  }) {
    const results = await new AxeBuilder({ page: this.page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('.no-a11y-check') // Exclude elements with this class
      .analyze();

    // Filter violations based on options
    let violations = results.violations;

    if (options?.includedImpacts) {
      violations = violations.filter(v => 
        options.includedImpacts!.includes(v.impact!)
      );
    }

    if (options?.excludedRules) {
      violations = violations.filter(v => 
        !options.excludedRules!.includes(v.id)
      );
    }

    // Assert no violations
    expect(violations).toEqual([]);
  }

  async checkFormAccessibility(formSelector: string) {
    // Check form has proper labels
    const inputs = await this.page.$$(`${formSelector} input:not([type="hidden"])`);
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      
      if (!ariaLabel && !ariaLabelledby) {
        const label = await this.page.$(`label[for="${id}"]`);
        expect(label).toBeTruthy();
      }
    }

    // Check form has submit button
    const submitButton = await this.page.$(`${formSelector} button[type="submit"]`);
    expect(submitButton).toBeTruthy();

    // Run axe on the form
    await this.checkPageAccessibility({
      runOnly: ['forms', 'label', 'aria-allowed-attr', 'aria-required-attr']
    });
  }

  async checkKeyboardNavigation(selector: string) {
    // Focus on element
    await this.page.focus(selector);
    
    // Check element is focused
    const isFocused = await this.page.evaluate((sel) => {
      return document.querySelector(sel) === document.activeElement;
    }, selector);
    
    expect(isFocused).toBeTruthy();
  }

  async checkColorContrast() {
    await this.checkPageAccessibility({
      runOnly: ['color-contrast']
    });
  }

  async checkHeadingStructure() {
    // Get all headings
    const headings = await this.page.$$eval('h1, h2, h3, h4, h5, h6', elements => 
      elements.map(el => ({
        level: parseInt(el.tagName[1]),
        text: el.textContent?.trim()
      }))
    );

    // Check there's exactly one h1
    const h1Count = headings.filter(h => h.level === 1).length;
    expect(h1Count).toBe(1);

    // Check heading hierarchy
    let previousLevel = 0;
    for (const heading of headings) {
      // Headings should not skip levels
      expect(heading.level).toBeLessThanOrEqual(previousLevel + 1);
      previousLevel = heading.level;
    }
  }

  async checkAnnouncements(action: () => Promise<void>, expectedAnnouncement: string) {
    // Set up listener for live region updates
    const liveRegionPromise = this.page.waitForFunction(
      (announcement) => {
        const liveRegions = document.querySelectorAll('[role="alert"], [role="status"], [aria-live]');
        for (const region of liveRegions) {
          if (region.textContent?.includes(announcement)) {
            return true;
          }
        }
        return false;
      },
      expectedAnnouncement,
      { timeout: 5000 }
    );

    // Perform action
    await action();

    // Wait for announcement
    await liveRegionPromise;
  }

  async checkFocusManagement(modalSelector: string) {
    // Open modal
    const initialFocusedElement = await this.page.evaluate(() => document.activeElement?.tagName);
    
    // Check focus is trapped in modal
    await this.page.keyboard.press('Tab');
    const focusedInModal = await this.page.evaluate((selector) => {
      const modal = document.querySelector(selector);
      const focusedElement = document.activeElement;
      return modal?.contains(focusedElement);
    }, modalSelector);
    
    expect(focusedInModal).toBeTruthy();

    // Check focus returns after modal closes
    await this.page.keyboard.press('Escape');
    const finalFocusedElement = await this.page.evaluate(() => document.activeElement?.tagName);
    expect(finalFocusedElement).toBe(initialFocusedElement);
  }
}