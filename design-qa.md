# Design QA — CMS product cards

- Source visual truth: `C:\Users\Maindsoft\.codex\generated_images\019f90fc-0b7c-7d90-b7d3-508a6f7a91ad\call_DfN6V7ULhv7F3QmTQpBOAqAD.png`
- Source pixels: 1536 × 1060
- Intended implementation viewport: 1440 × 1024 desktop, plus responsive checks at 1024, 768 and 375 CSS px
- Intended state: Products module with populated cards
- Implementation screenshot: unavailable
- Density normalization: not applicable because the implementation capture is blocked

**Findings**

- [P1] Browser-rendered comparison is unavailable
  - Location: `/admin`
  - Evidence: the local in-app browser cannot resolve the workspace preview host, while the deployed CMS requires a signed-in private session.
  - Impact: typography, spacing, menu layering and final viewport overflow cannot be certified visually against the selected concept.
  - Fix: open the protected deployment in an authenticated in-app browser session, capture the products state at the same viewport and run the visual comparison.

**Required fidelity surfaces**

- Fonts and typography: Quicksand remains configured; browser evidence pending.
- Spacing and layout rhythm: implemented from the selected card proportions; browser evidence pending.
- Colors and visual tokens: neutral surfaces and state colors preserved; the generated red active-edge treatment was intentionally excluded by the user's global rule.
- Image quality and asset fidelity: existing real product images and Berel logo are preserved; browser crop evidence pending.
- Copy and content: Spanish product labels and “Editar producto” match the selected direction.

**Full-view comparison evidence**

Blocked: no browser-rendered implementation screenshot is available.

**Focused region comparison evidence**

Blocked for the same reason; the product-card action area requires an authenticated rendered capture.

**Comparison history**

- Initial implementation: replaced the detached black footer with a continuous editorial action row, moved deletion into the contextual menu, stabilized two-line titles, increased touch targets and added overflow containment.
- Post-fix visual evidence: unavailable because browser access is blocked.

**Implementation Checklist**

- Capture `/admin` while authenticated at 1440 × 1024.
- Verify the three-column card grid and contextual menu.
- Repeat at 1024, 768 and 375 CSS px.
- Confirm zero horizontal overflow and no clipped dropdowns.

**Follow-up Polish**

- None classified until browser-rendered evidence is available.

final result: blocked
