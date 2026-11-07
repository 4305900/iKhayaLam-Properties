# iKhayaLam Properties — Master V6 CSS

**Application:** Oracle APEX Application 103  
**File:** `ikhayalam_master_v6.css`  
**Version:** V6 — 06 November 2026  
**Purpose:** The COMPLETE application-level stylesheet. This is a replacement for V5, not a second CSS file to append.

## Install V6

1. Back up or export Application 103, and keep a copy of your V5 CSS file.
2. Open **Oracle APEX → App Builder → Application 103 → Shared Components → Static Application Files**.
3. Upload **`ikhayalam_master_v6.css`**.
4. Open **Shared Components → User Interface Attributes → CSS → File URLs**. The exact tab label can vary by APEX version.
5. **Replace** the previous master CSS file reference with:

   ```text
   #APP_FILES#ikhayalam_master_v6.css?v=6
   ```

6. Remove other application-level references to the older V2, V3, V4, V5 and `ikhayalam_final_polish.css` files. Keep one master-file reference, so the old styles do not override V6. Do **not** remove the built-in Oracle Universal Theme styles.
7. Save, run the application and perform a hard refresh (Ctrl+Shift+R or clear the browser cache).

**Important:** Leave the Infobip widget embed code, APEX Dynamic Actions, HTML data substitutions, AJAX callbacks, SQL reports, Zapier integrations, authentication and page processes untouched. CSS does not replace these functionalities or repair integration errors. Do not put this file inside the HTML Code region, the JavaScript code editor or SQL Workshop.

## Required CSS Classes

Add each class in **Page Designer → Region → Appearance → CSS Classes**, retaining any current class names. These classes were used by the V5 design, and V6 continues to support them.

| Page | Region | CSS Class |
| --- | --- | --- |
| 1 | Find Your Next Home | `ik-search` |
| 1 | Available Properties | `ik-listings` |
| 2 | Property Details | `ik-details` |
| 2 | Property Images | `ik-gallery` |
| 3 | Bulk Property Image Uploader | `ik-upload` |
| 4 | Buying Property / image upload | `ik-upload` |
| 5 | Welcome to iKhayaLam Properties | `ik-welcome` |
| 6 | Find Your Home to Buy | `ik-search` |
| 6 | Available Properties for Sale | `ik-listings` |
| 7 | Buying Property Details | `ik-details` |
| 7 | Property_photo | `ik-gallery` |
| 8 | Dashboard (Cards) | `ik-dashboard` |
| 8 | Scheduled Property Viewings | `ik-viewings` |
| 9 | Manage Viewing | `ik-manage` |
| 10 | Client Leads | `ik-leads` |
| 11 | Frequently Asked Questions | `ik-faq` |
| 9999 | iKhayaLam Estate Agent Portal | `ik-login` |
| 10000, 10010–10014 | Administrator regions (optional) | `ik-admin` |

**Button classes:** Page 5 Buy_Property → `ik-action-buy`; RENT_PROPERTY → `ik-action-rent`. Page 2 interested_viewing and Page 7 ENQUIRE_BUYING → `ik-book-button`. Page 8 VIEW_CLIENT_LEADS and Page 10 BACK_TO_DASHBOARD → `ik-secondary-button`. Page 9 Apply Changes → `ik-save-button`; CANCEL → `ik-secondary-button`. Keep existing actions and IDs.

## V6 visual coverage

- **Global UI:** Translucent dark-teal header and sidebar; no horizontal separator lines; clean logo and navigation; page headings; rounded regions; accessible buttons and forms.
- **Page 5:** Dark teal gradient welcome hero, display typography, readable Buy and Rent buttons, gentle movement.
- **Pages 1/6:** Frameless filter panel, readable controls and lifting property image cards.
- **Pages 2/7:** Property story sections, larger details and price, image gallery, enquiry/viewing button styling.
- **Pages 3/4:** Styled file upload regions.
- **Page 8:** SQL-backed Cards dashboard with visibly larger metric totals; report row refinement.
- **Page 9:** Separate readable label/value blocks, appropriate spacing for status and follow-up notes, less 'squished' layout.
- **Page 10:** Curved, separated Client Leads table rows, hover and focused client names (where the V5 optional column HTML expression is configured).
- **Page 11:** Accessible FAQ accordions and jump links, hover effects and refined contact section.
- **Page 9999 and admin:** Login and administration visual styling, including access-control regions when classes are applied.
- **Mobile:** Responsive text, cards, controls, horizontal report scrolling and reduced-motion support.

## Test after uploading

1. **Home and navigation:** Both light/dark header interactions work, sidebar links still navigate, no unwanted divider lines remain.
2. **Welcome Page 5:** Buy and Rent buttons show clear high-contrast labels and both navigate correctly.
3. **Pages 1 and 6:** Filters and property card buttons still search/navigate, images still load and hover smoothly.
4. **Pages 2 and 7:** Selected property values, photos and Book a Viewing buttons remain correct, with working Infobip launch.
5. **Page 8:** The four metric numbers match live SQL and belong to the logged-in agent. The viewings report is scrollable and edit buttons still work.
6. **Page 9:** Label/value text never overlaps, select controls and follow-up notes are editable, and Apply Changes still saves.
7. **Page 10:** Client Leads records render and Back to Dashboard works.
8. **Page 11:** FAQ links and expandable questions work; cancellation and rescheduling information remains informational only.
9. **Mobile and keyboard:** Test at narrow widths, hover-independent touch interaction and keyboard focus.

**Note:** CSS syntax was checked. Real appearance must still be visually verified on your deployed Oracle APEX Universal Theme and against your region classes. If a page still contains older embedded `<style>` rules, those may override the master stylesheet; review before removing them.
