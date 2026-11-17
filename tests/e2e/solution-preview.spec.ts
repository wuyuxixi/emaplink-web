import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

async function clickDescription(card: import('@playwright/test').Locator) {
  const position = await card.evaluate((element) => {
    const cardRect = element.getBoundingClientRect();
    const description = element.querySelector('p')!.getBoundingClientRect();
    return { x: description.left - cardRect.left + description.width / 2, y: description.top - cardRect.top + description.height / 2 };
  });
  // Click the description's screen position through the card's native button overlay.
  await card.click({ position });
}

test('solution cards switch from their description, padding and keyboard', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.solution-option');
  const panels = page.locator('[data-solution-panel]');
  await clickDescription(cards.nth(1));
  await expect(panels.nth(1)).toBeVisible();
  await cards.nth(2).click({ position: { x: 8, y: 8 } });
  await expect(panels.nth(2)).toBeVisible();
  const first = cards.first().locator('button');
  await first.focus();
  await page.keyboard.press('Space');
  await expect(first).toHaveAttribute('aria-pressed', 'true');
  await expect(panels.first()).toBeVisible();
  await cards.first().getByRole('link', { name: '查看解决方案' }).click();
  await expect(page).toHaveURL(/\/solutions\/multi-terminal-access\/$/);
});

test('scene image preview zooms, pans, resets and restores focus', async ({ page }) => {
  await page.goto('/');
  const dialog = page.locator('#image-preview-dialog');
  const stage = dialog.locator('[data-preview-stage]');
  const image = dialog.locator('img');
  const scale = dialog.locator('[data-zoom-level]');
  for (let index = 0; index < 3; index++) {
    await page.locator('[data-solution-choice]').nth(index).click();
    const opener = page.locator('[data-image-preview]').nth(index);
    const source = await opener.locator('img').getAttribute('src');
    await opener.click();
    await expect(dialog).toBeVisible();
    await expect(image).toHaveAttribute('src', new RegExp(source!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'));
    await expect(scale).toHaveText('100%');
    await stage.hover();
    const scroll = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, -400);
    await expect(scale).not.toHaveText('100%');
    expect(await scale.textContent()).toMatch(/1\d\d%/);
    expect(await page.evaluate(() => scrollY)).toBe(scroll);
    await page.mouse.wheel(0, 400);
    await expect(scale).toHaveText('100%');
    for (let count = 0; count < 9; count++) await dialog.getByRole('button', { name: '放大图片' }).click({ force: true });
    await expect(scale).toHaveText('500%');
    await expect(dialog.getByRole('button', { name: '放大图片' })).toBeDisabled();
    const box = await stage.boundingBox();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width / 2 + 80, box!.y + box!.height / 2 + 40);
    await page.mouse.up();
    await expect(image).not.toHaveCSS('transform', 'matrix(5, 0, 0, 5, 0, 0)');
    await dialog.getByRole('button', { name: '重置' }).click();
    await expect(scale).toHaveText('100%');
    await expect(image).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(opener).toBeFocused();
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
  }
});

test('mobile scene preview fits the viewport and closes with its button', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await clickDescription(page.locator('.solution-option').nth(1));
  await page.locator('[data-image-preview]').nth(1).click();
  const dialog = page.locator('#image-preview-dialog');
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(375);
  expect(box!.y + box!.height).toBeLessThanOrEqual(812);
  await dialog.getByRole('button', { name: '放大图片' }).click();
  await expect(dialog.locator('[data-zoom-level]')).toHaveText('125%');
  await dialog.getByRole('button', { name: '关闭图片预览' }).click();
  await expect(dialog).not.toBeVisible();
});
