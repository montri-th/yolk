# Developer handoff · CityMETER: Yolk 1.9.7 · current bounded local review complete

[Full product + from-scratch plan](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.7.md) · [machine blueprint](contracts/full-product.v1.9.7.json) · [display/navigation extension](contracts/visual-refinement.v1.9.7.json) · [release](contracts/release.v1.9.7.json)

Current changes: exact DS treemap colors near verified logo primaries; near-Thailand map envelope; settled-host basemap recovery after Expand/Compact with only out-of-envelope camera clamping; four labeled icon controls in one row/two pairs; comma-separated displayed quantities. Original artwork, direct-source counts/share rules, Demand/Tier/eligible membership and criteria/ranking remain.

Artifact is a multi-file HTTP static preview with runtime/assets/data dependencies; keep the complete prototype tree and manifest. External map providers/attribution are required; tiles are not packaged. Preview storage is browser-local. Production T00–T24 remains complete: first map the real CityMETER stack, then shared APIs/auth/server RBAC/revision locks/outbox/private media.

Current bounded1.9.7 QA/native passed; publication/provider/live and ZIP generation pending. Physical device, full language/theme matrix and actual screen-reader/zoom coverage stay open until observed. Public allowlist excludes raw acquisition, private customers/media and credentials. Local package preparation, external delivery and acknowledgment are separate.
