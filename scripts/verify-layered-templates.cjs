const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');

const url = process.env.HOTEL_DEMO_URL || 'http://127.0.0.1:4174/';
const templates = [
  { id: 'daily-japanese-room', assets: ['jpTop', 'jpSeal', 'jpBottom', 'jpBamboo'] },
  { id: 'daily-art-design-room', assets: ['artArc', 'artSignature'] },
  { id: 'daily-french-room', assets: ['frenchTop', 'frenchBottom'] },
  { id: 'psd-admin-suite-landscape', assets: ['admin_suite_background', 'admin_suite_panel', 'admin_suite_logo_placeholder', 'admin_suite_divider', 'admin_suite_icon_area', 'admin_suite_icon_living', 'admin_suite_icon_window', 'admin_suite_icon_benefits', 'admin_suite_icon_fruit'], text: ['admin_suite_title', 'admin_suite_subtitle', 'admin_suite_area', 'admin_suite_living', 'admin_suite_window', 'admin_suite_benefits', 'admin_suite_fruit'], psd: true },
  { id: 'psd-breakfast-time-landscape', assets: ['breakfast_background', 'breakfast_info_panel', 'breakfast_top_ornament', 'breakfast_divider', 'breakfast_leaf_decor', 'breakfast_icon_time', 'breakfast_icon_location', 'breakfast_icon_card'], text: ['breakfast_title', 'breakfast_subtitle', 'breakfast_time', 'breakfast_location', 'breakfast_card_note'], psd: true },
  { id: 'psd-room-service-landscape', assets: ['room_service_background', 'room_service_panel', 'room_service_logo_placeholder', 'room_service_divider', 'room_service_divider_service_1', 'room_service_divider_service_2', 'room_service_icon_delivery', 'room_service_icon_frontdesk', 'room_service_icon_cleaning'], text: ['room_service_title', 'room_service_subtitle', 'room_service_cleaning', 'room_service_frontdesk', 'room_service_delivery'], psd: true },
];

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 1512, height: 982 } });
  await page.goto(url, { waitUntil: 'networkidle' });

  const dailyCount = await page.locator('[data-category="daily"] span').first().textContent();
  assert.equal(dailyCount.trim(), '13');

  for (const template of templates) {
    const format = template.id === 'psd-dinner-hotel-portrait' ? 'portrait' : 'landscape';
    await page.locator(`[data-format="${format}"]`).click();
    await page.locator(`[data-template="${template.id}"]`).click();
    await page.locator('#editorView:not(.hidden)').waitFor();

    const layers = await page.locator('#posterCanvas').evaluate((canvas) =>
      [...canvas.children].map((node) => ({
        key: node.dataset.layer,
        src: node.getAttribute('src') || '',
      }))
    );
    const keys = layers.map((layer) => layer.key);
    if (template.psd) {
      assert.equal(keys[0], 'admin_suite_background');
      template.text.forEach((key) => assert.ok(keys.includes(key), `${template.id} missing ${key}`));
    } else {
      assert.equal(keys[0], 'photo');
      assert.equal(keys[1], 'panel');
    }
    template.assets.forEach((key) => assert.ok(keys.includes(key), `${template.id} missing ${key}`));
    assert.ok(keys.indexOf('title') > Math.max(...template.assets.map((key) => keys.indexOf(key))));
    assert.equal(layers.some((layer) => /\.svg(?:$|\?)/i.test(layer.src)), false);

    if (template.id === 'daily-japanese-room') {
      await page.locator('.poster-title').click({ position: { x: 40, y: 20 } });
      await page.screenshot({ path: '/private/tmp/hotel-layered-template.png', fullPage: true });
    }

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#exportButton').click(),
    ]);
    const downloadPath = await download.path();
    assert.ok(downloadPath && fs.statSync(downloadPath).size > 100_000, `${template.id} export is empty`);
    await page.locator('#backButton').click();
    await page.locator('#libraryView:not(.hidden)').waitFor();
  }

  await browser.close();
  console.log('layered template verification passed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
