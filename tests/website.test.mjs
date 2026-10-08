import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');

test('1. Core WordPress Theme files exist and are valid', () => {
  const themeDir = path.join(ROOT, 'wordpress', 'wp-content', 'themes', 'noody-oceanic');
  assert.ok(fs.existsSync(path.join(themeDir, 'style.css')), 'style.css exists');
  assert.ok(fs.existsSync(path.join(themeDir, 'theme.json')), 'theme.json exists');
  assert.ok(fs.existsSync(path.join(themeDir, 'functions.php')), 'functions.php exists');
  assert.ok(fs.existsSync(path.join(themeDir, 'assets', 'css', 'noody-animations.css')), 'noody-animations.css exists');
  assert.ok(fs.existsSync(path.join(themeDir, 'assets', 'js', 'noody-runtime.js')), 'noody-runtime.js exists');

  const themeJson = JSON.parse(fs.readFileSync(path.join(themeDir, 'theme.json'), 'utf8'));
  assert.equal(themeJson.title, 'NOODY.AI Oceanic');
  const palette = themeJson.settings.color.palette;
  assert.ok(palette.some(c => c.slug === 'turquoise' && c.color === '#08755c'), 'Turquoise palette defined');
  assert.ok(palette.some(c => c.slug === 'deep-ocean' && c.color === '#0a2239'), 'Deep ocean palette defined');
});

test('2. Core WordPress Integration Plugin files exist', () => {
  const pluginDir = path.join(ROOT, 'wordpress', 'wp-content', 'plugins', 'noody-core-connector');
  assert.ok(fs.existsSync(path.join(pluginDir, 'noody-core-connector.php')), 'Main plugin exists');
  assert.ok(fs.existsSync(path.join(pluginDir, 'includes', 'cpt-definitions.php')), 'CPT definitions exist');
  assert.ok(fs.existsSync(path.join(pluginDir, 'includes', 'api-client.php')), 'API client exists');
  assert.ok(fs.existsSync(path.join(pluginDir, 'includes', 'vendor-registration.php')), 'Vendor registration exists');
  assert.ok(fs.existsSync(path.join(pluginDir, 'includes', 'feedback-moderation.php')), 'Feedback moderation exists');
  assert.ok(fs.existsSync(path.join(pluginDir, 'includes', 'static-exporter.php')), 'Static exporter exists');
});

test('3. Public Static Website Pages exist', () => {
  const requiredPages = [
    'index.html',
    'islands.html',
    'services.html',
    'products.html',
    'gallery.html',
    'about.html',
    'feedback.html',
    'support.html',
    'terms.html',
    'privacy.html',
    'cancellation.html',
    'contact.html',
    'vendor-register.html',
    'admin-status.html'
  ];

  for (const page of requiredPages) {
    const pagePath = path.join(ROOT, page);
    assert.ok(fs.existsSync(pagePath), `Page ${page} must exist`);
    const content = fs.readFileSync(pagePath, 'utf8');
    assert.ok(content.includes('NOODY.AI'), `${page} must contain NOODY.AI branding`);
    assert.ok(content.includes('<!DOCTYPE html>'), `${page} must be valid HTML`);
  }
});

test('4. Oceanic Animations & Accessibility Safeguards are defined in CSS', () => {
  const css = fs.readFileSync(path.join(ROOT, 'assets', 'css', 'site.css'), 'utf8');
  assert.ok(css.includes('prefers-reduced-motion'), 'Reduced motion query must be supported');
  assert.ok(css.includes('ocean-wave-container'), 'Ocean wave animations must be defined');
  assert.ok(css.includes('flying-birds-canvas'), 'Flying bird animations must be defined');
  assert.ok(css.includes('--noody-turquoise: #08755c'), 'Brand turquoise must be defined');
  assert.ok(css.includes('--noody-deep-ocean: #0a2239'), 'Brand deep ocean blue must be defined');
});

test('5. Meta WhatsApp logic and official number are verified', () => {
  const js = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'site.js'), 'utf8');
  assert.ok(js.includes('919446944562'), 'Official WhatsApp phone number must match');
  assert.ok(js.includes('NOODY_SOURCE:WEBSITE'), 'Source WEBSITE token must be in payload');
  assert.ok(js.includes('NOODY_ISLAND:'), 'NOODY_ISLAND token must be in payload');
});

test('6. Live NOODY Core API health endpoint connectivity', async () => {
  const res = await fetch('https://noody-ai-production.up.railway.app/health', {
    signal: AbortSignal.timeout(10000)
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
  assert.equal(data.dependencies?.postgres, 'up');
  assert.equal(data.dependencies?.redis, 'up');
});
