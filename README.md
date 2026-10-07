# NOODY.AI Public Website

Live customer website: https://brownnoodyai-sketch.github.io/

## Locked role

This repository is the **customer information + WhatsApp enquiry website only**.

It is intentionally independent from the private NOODY Core Software database.

- Website does not fetch Core service/product records.
- Website does not create orders.
- Website does not handle payments, OTP, vendor routing, commission, stock authority or settlements.
- Core Software + official Meta WhatsApp API / LAK Bot remain the operational system.
- Website Service/Product pages are manually created in the Website Studio.
- A public Website item link may be pasted into the matching Core Software Service/Product as a reference only.

Customer flow:

Website information → Enquire on WhatsApp → official NOODY WhatsApp / LAK Bot → Core Software operations.

## Full Website Studio

Open:

https://brownnoodyai-sketch.github.io/studio.html

The Studio provides:
- full manual Service/Product creation
- island selection
- customer-facing price/availability text
- English / Malayalam / Hindi content
- up to 30 photos per item
- arbitrary custom sections (story, itinerary, safety, inclusions, ingredients, sizes, FAQ, pickup notes, etc.)
- manual customer review display
- homepage custom sections
- live page preview
- visual website design editor
- full GitHub source access for changes beyond the visual builder

Drafts stay on the owner's device until exported. Use **Download website update**, extract the ZIP, upload the generated files/folders to this GitHub repository, then commit changes.

## Website data

Manual website data is stored in `website-data.json`.

It contains only public customer-facing content and the official WhatsApp number. Never put Core credentials, vendor private data, customer private data, Meta tokens, payment secrets or database credentials in this public repository.

## WhatsApp handoff

The website creates a prepared WhatsApp enquiry containing:
- Website source
- island
- Service/Product name
- website-only item identity
- customer page link

It deliberately does **not** send a Core item ID. LAK Bot / Core performs its own operational matching.

