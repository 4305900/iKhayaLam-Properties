# iKhayaLam Properties — CSS setup & class assignment guide

**Version:** 2.0 (4 November 2026)  
**Application:** 103, Oracle APEX / OCI  
**Scope:** styling only. Leave Infobip/FAQ navigation on hold; do not change authentication, SQL, PL/SQL, Dynamic Actions, booking, or report queries.

## Install one stylesheet for the whole application

1. Back up or export Application 103 first. Copy your existing CSS to a safe place.
2. Go to **Application 103 → Shared Components → Static Application Files**.
3. Upload `ikhayalam_master_v2.css` (keep the filename unchanged).
4. Go to **Shared Components → User Interface Attributes → CSS → File URLs**.
5. Add `#APP_FILES#ikhayalam_master_v2.css?v=2` on its own line. Keep any existing file URLs. Save.
6. In Page Designer, select each region/button, find **CSS Classes** using the property search, and **append** the class in the mapping below. Do not change an existing **Static ID**, as it might be used by JavaScript or Dynamic Actions.
7. Run the page and hard-refresh browser (Ctrl+Shift+R) or increment `v=2` to `v=3` after edits.

**Why not one CSS Inline field?** Page Designer's **Page → CSS → Inline** usually affects that page only. To load one stylesheet on every page, use the application-wide File URLs setting and an uploaded CSS file. You still maintain just **one file**. If your APEX version provides an application-wide Inline field, you may paste the file's contents there, but do not duplicate it across individual pages.

## Exact class assignments from the screenshots

| Page | Component you select in Page Designer | CSS Classes to append |
|---|---|---|
| 0 | Global Page | **No classes required**; leave `FAQ Browser Loader`, `FAQ Automatic Navigation`, and Infobip JavaScript untouched |
| 1 | **Find Your Next Home** region | `ik-search` |
| 1 | **Available Properties** Cards region | `ik-listings` |
| 2 | **Property Details** region | `ik-details` |
| 2 | **Property Images** region | `ik-gallery` |
| 2 | **interested_viewing** button | `ik-book-button` |
| 3 | **Bulk Property Image Uploader** region | `ik-upload` |
| 4 | **Buying Property** region | `ik-upload` |
| 5 | **Welcome to iKhayaLam Properties** region | `ik-welcome` |
| 5 | **Buy_Property** button | `ik-action-buy` |
| 5 | **RENT_PROPERTY** button | `ik-action-rent` |
| 6 | **Find Your Home to Buy** region | `ik-search` |
| 6 | **Available Properties for Sale** Cards region | `ik-listings` |
| 7 | **Buying Property Details** region | `ik-details` |
| 7 | **Property_photo** region | `ik-gallery` |
| 7 | **ENQUIRE_BUYING** button | `ik-book-button` |
| 8 | **Dashboard** region | `ik-dashboard` |
| 8 | **Scheduled Property Viewings** report | `ik-viewings` |
| 8 | **VIEW_CLIENT_LEADS** button | `ik-secondary-button` |
| 9 | **Manage Viewing** region | `ik-manage` |
| 9 | **SAVE** / **Apply Changes** button (actual existing save action) | `ik-save-button` |
| 9 | **CANCEL** button | `ik-secondary-button` |
| 9 | **DELETE** button | `ik-danger-button` |
| 10 | **Client Leads** Interactive Report region | `ik-leads` |
| 10 | **BACK_TO_DASHBOARD** button | `ik-secondary-button` |
| 11 | **Frequently Asked Questions** HTML region | `ik-faq` |
| 9999 | **iKhayaLam Estate Agent Portal** login region | `ik-login` |
| 10000 | **Access Control** region | `ik-admin` |
| 10010 | **Access Control Configuration** region | `ik-admin` |
| 10011 | **Manage User Access** region | `ik-admin` |
| 10012 | **Form on Manage User Access** region | `ik-admin` |
| 10013 | **Wizard Container** region | `ik-admin` |
| 10014 | **Wizard Container** region | `ik-admin` |

**Do not create new regions to match old placeholder names.** The classes above were specifically rewritten to match the actual Page Designer trees shown in the screenshots.

### Page 5: center the Buy and Rent buttons

In your actual page, `Buy_Property` and `RENT_PROPERTY` are under **Below Region [Legacy]** within the Welcome region. CSS targets the APEX `.t-Region-buttons--bottom` container. You do **not** need separate Buy/Rent card regions. After adding `ik-welcome` and both button classes, run Page 5 and check their position on desktop and mobile. The CSS only changes presentation; the original button targets remain untouched.

### Page 1 / 6: property photos

Both pages have existing **Cards** regions. The master CSS gives cards rounded corners, unified 16:10 photos, shadows, hover and better card actions. It does **not** change the database image URL or Cards attributes. If any image is already rendered using a custom HTML expression rather than a Cards media slot, a final HTML-specific selector may be needed after visual testing.

### Pages 2 / 7: property details

The screenshot confirms the details use hidden `P2_*` and `P7_*` fields and HTML display regions. **Do not unhide or modify those items.** The master CSS styles the visible regions, galleries and enquiry/viewing buttons. Custom HTML markup may need optional additional selectors after comparing before/after screenshots.

### Page 8: dashboard metrics

The live page displays four statistics across the top and a viewing report below. Apply `ik-dashboard` to **Dashboard** and `ik-viewings` to **Scheduled Property Viewings**. The CSS deliberately does not force the report's HTML table into CSS grid, because that could break data alignment.

### Page 9: manage viewing

Page 9 displays many read-only fields and three editable follow-up controls. The CSS improves the contrast of read-only fields, sizes of selects and textarea, and the form's general spacing. `#P9_CLIENT_FIRST_NAME_CONTAINER`, `#P9_VIEWING_START_CONTAINER` and `#P9_BOOKING_STATUS_CONTAINER` (standard item container IDs) receive subtle separators if those IDs exist in your running APEX version. Save/Delete button presentation does not change their server-side processing.

### Page 11: leave the integration alone

The FAQ page already has a strong custom teal header and accordion HTML. The master CSS only refines spacing, focus and subtle shadows. It does not remove or hide the visible Infobip authentication error; that error remains a separate functional issue.

### Page 10: Invalid Slot [Not Rendered]

This appears in the Page Designer tree for `BACK_TO_DASHBOARD`, but the live screenshot shows the button rendering. CSS will style it, but whether a layout slot is valid is an APEX page configuration issue and cannot be fixed by CSS alone.

## Verify after applying

- Run Page 5, check hero text and both action buttons, ensure Buy/Rent navigation still works.
- Run Pages 1/6, check property images, card links, search/clear controls, pagination and filter labels.
- Run Pages 2/7, check gallery, details and Book a Viewing / Enquire button.
- Run Pages 8–10 while signed in, check reports, edit links, status controls, Save, Cancel and Back to Dashboard.
- Run Page 11, check all FAQ sections, in-page tabs, and accordion expansion.
- Run login page as a signed-out user; verify typing, Remember Me and sign-in.
- Inspect desktop and mobile widths. Avoid claiming the styles are visually verified until you see the actual post-install screens.

**Temporary troubleshooting:** To revert, remove `#APP_FILES#ikhayalam_master_v2.css?v=2` from the application-wide CSS File URLs. This restores the previous layout without changing application data or processing.
