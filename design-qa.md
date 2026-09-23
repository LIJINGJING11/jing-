# Design QA

- Source visual truth: `/var/folders/r9/vw9xxp7104x2dhn2609sf9480000gn/T/codex-clipboard-d4729769-150a-4d20-b0d1-bf8be5196ed8.png`
- Implementation: `/Users/sigurd/Documents/ChatGPT/酒店素材工坊/demo/index.html`
- Implementation screenshot: unavailable — the browser security policy blocks automated access to the local `file://` page.
- Viewport: source crop 486 × 118; implementation target is the existing 9:16 video preview.
- State: generated-video preview with title emphasis and lower caption enabled.

## Full-view comparison evidence

Blocked. The source image was opened and inspected, but an implementation screenshot could not be captured through the permitted browser surface.

## Focused region comparison evidence

The source title uses a compact centered lockup, a substantially larger central keyword, smaller supporting words, a cool blue-white treatment, strong dark-background contrast, and a restrained micro-copy line. The implementation now encodes those same hierarchy rules in both the DOM preview and Canvas export path. A rendered comparison is still required.

## Findings

- P1 — Rendered fidelity cannot be confirmed. Browser automation rejected the local file URL, so wrapping, visual scale, and overlap with arbitrary hotel imagery could not be judged from pixels.
- Static checks passed: JavaScript syntax, HTML parsing, required element IDs, and primary/backup file parity.

## Comparison history

- Initial implementation: replaced the single-size title with support / keyword / support typography, added a micro-label and restrained accent rule, reduced the lower caption hierarchy, and mirrored the layout in Canvas export.
- Post-fix visual evidence: unavailable because the implementation screenshot capture is blocked.

## Implementation checklist

- Refresh the existing local page.
- Generate a video from representative short and long Chinese copy.
- Confirm the emphasized keyword remains readable over bright and dark footage.
- Confirm the downloaded WebM matches the preview hierarchy.

final result: blocked
