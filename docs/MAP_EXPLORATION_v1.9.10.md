# Yolk 1.9.10 · สำรวจแผนที่ได้ชัดขึ้น

รายงานวันที่ 9 ตุลาคม 2026 สำหรับ Product, Design และ Dev/Interns ใช้คู่กับ [สัญญาการทำงานของแผนที่](../contracts/map-exploration.v1.9.10.json) และ [Product statement + implementation ฉบับเต็ม](../CityMETER_Yolk_Full_Product_and_Implementation_v1.9.10.md)

รุ่นนี้ปรับสี่จุด: ข้อมูล hover ไม่บังพื้นที่ที่กำลังสำรวจ, จุดสาขาที่มีจำนวนน้อยแสดงโลโก้ได้ทุกระดับพื้นที่, มี Satellite พร้อมระบุแหล่งภาพ และแยก “ศูนย์” จาก “ไม่มีข้อมูล” ด้วยรูปแบบที่อ่านได้ทั้งสองธีม

## 1. Hover อ่านข้อมูลได้โดยคลิกแผนที่ต่อได้

เมื่อชี้หรือใช้ keyboard focus บนพื้นที่ ชื่อขอบเขตที่คลิกได้และค่าที่สำคัญจะแสดงในแถบข้อมูลสูง **34 px นอก canvas แผนที่** ใกล้ breadcrumb แถบนี้อยู่ใน flow ปกติและจองความสูงไว้ แม้ไม่มีข้อมูล hover จึงไม่ทำให้แผนที่กระโดดหรือย่อขณะชี้พื้นที่

เส้นสีเหลืองยังเน้น **ขอบเขตจริงที่คลิกได้** จาก source polygon เดิม แม้สี choropleth จะแสดงพื้นที่ย่อยกว่า เส้นนี้ไม่มี fill และไม่รับคลิก ไม่มี tooltip ของพื้นที่หรือ treemap ลอยตาม pointer มาบังแผนที่

ในหน้า Supply รายละเอียดส่วนแบ่งสาขาและ treemap แสดงใน side panel เดิม พร้อมชื่อ “พื้นที่ที่ชี้อยู่” เพื่อให้รู้ว่ากำลังอ่านขอบเขตใด เมื่อเลิกชี้ เปลี่ยน context หรือปิดการสำรวจ panel จะกลับไปแสดงขอบเขตที่เลือกอยู่ ค่า aggregate ยังคงมาจาก source ตาม grain ของพื้นที่ ไม่ใช้จำนวน POI ที่มองเห็นแทนยอดสาขา

กด **Escape** เพื่อซ่อนข้อมูล hover และเส้นเน้น โดยไม่ย้ายกล้องหรือทำ keyboard focus หาย บนจอแคบแถบข้อมูลอยู่เหนือแผนที่ใน flow ปกติ ไม่สร้าง card ขนาดใหญ่แบบ fixed

## 2. จุดน้อยแสดงโลโก้จริงได้ทุกระดับพื้นที่

การเลือกว่าจะใช้โลโก้หรือจุด Canvas พิจารณา **จำนวนพิกัดที่ถูกต้อง ผ่าน filter และอยู่ในมุมมองปัจจุบัน** ไม่ผูกกับ zoom หรือระดับ drilldown

| ความกว้างพื้นที่แผนที่ | จำนวนสูงสุดที่แสดงโลโก้ทุกจุด |
| --- | ---: |
| ตั้งแต่ 600 px | 120 |
| น้อยกว่า 600 px | 60 |

เมื่อจำนวนไม่เกินเกณฑ์ แสดง original logo ทุกจุดที่มี artwork โดยรักษารูปทรงและสัดส่วน หากไม่มี artwork ใช้ fallback ที่มีชื่อแบรนด์เดิม ไม่สร้างตราแบรนด์ขึ้นเอง เกณฑ์นี้ใช้ได้ทั้งมุมมองประเทศ จังหวัด อำเภอ และทำเล

เมื่อจุดหนาแน่น ใช้ Canvas แสดงทุกพิกัดที่อยู่ในมุมมองอย่างต่อเนื่อง ไม่มีการตัดจำนวนรายการหรือบังคับ cluster อัตโนมัติ จุดที่ซ้อนกันยังเลือกอ่านแต่ละสาขาผ่าน overlap chooser ได้ การเปลี่ยนรูปแบบการวาดไม่เปลี่ยน source IDs, พิกัด, ยอด Supply, เกณฑ์ หรือข้อมูลที่ทีมบันทึก

## 3. Satellite กลับมา พร้อมแหล่งภาพที่ตรงกับสิ่งที่เห็น

ตัวเลือก Satellite ในแผนที่ใช้ภาพ natural colour จาก **ESA WorldCover / Sentinel-2 cloudless ปี 2021 ความละเอียด 10 m** ผ่าน Terrascope พร้อม attribution และปีภาพ ข้อมูลนี้ช่วยอ่านบริบทภูมิประเทศและสิ่งปลูกสร้าง ภาพปี 2021 ไม่ยืนยันสถานะเปิดบริการหรือสภาพปัจจุบันของสาขา

ภาพมี native zoom สูงสุด 14; การซูมมากกว่านี้ขยายภาพเดิม ไม่เพิ่มความละเอียดต้นฉบับ provider ส่งภาพที่มีพื้นที่โปร่งใสได้ แม้คำขอสำเร็จ จึงวางแผนที่ถนนแบบ Simplified รองใต้ภาพและแจ้งว่า “พื้นที่ไม่มีภาพใช้แผนที่ถนนรอง” ช่องที่ไม่มีภาพนี้เป็นข้อจำกัด coverage ของ provider ไม่สรุปว่าเป็นพื้นที่น้ำหรือเป็น bug ของ Expand สีภาพ Satellite เดิมไม่ถูกปรับด้วย filter ของแผนที่ถนนรอง

มีทางเลือก **เปิด Google Maps Satellite** ใน tab ใหม่ โดยตั้งศูนย์กลางตามมุมมองแผนที่ที่กำลังดูอยู่

Satellite ของ Landometer เดิมพบว่าใช้ Google hybrid การคืน provider เดิมแบบ embedded ยังเป็นงานเปิดที่ต้องตั้งค่า API integration ที่ได้รับอนุญาต รุ่นนี้จึงระบุ provider ที่ใช้จริง และไม่อ้างว่าได้คืน original embedded Google hybrid แล้ว ดู [เอกสาร WMTS ของ Terrascope](https://docs.terrascope.be/Developers/WebServices/OGC/WMTSv2.html)

## 4. ศูนย์กับไม่มีข้อมูลแยกกันตาม LDS 0.9.7

ใช้กฎ **EVID-05** และ exact `machine.tokens.dataState.valueStates` ของ LDS 0.9.7 รวมถึง evidence rules ของ Location Intelligence Profile สีตัวเลขจาก LUT 41 ค่าเดิมไม่เปลี่ยนตามธีม และไม่ใช้ opacity เปลี่ยนสีข้อมูลเพื่อแก้ contrast

| สถานะ | สิ่งที่ผู้ใช้เห็น | ความหมาย |
| --- | --- | --- |
| ศูนย์ที่ทราบค่า | สี lowest LUT เดิม + เส้นทึบ 2 px จาก DS zero token + ค่า `0` | มีข้อมูลและค่าที่วัดได้เป็นศูนย์ |
| ไม่มีข้อมูล / null | ลายเฉียง 135° + เส้นเน้น + label ไม่มีข้อมูล | ยังไม่มีค่าที่ใช้ได้ ไม่ใช่ศูนย์ |
| รอตรวจ | พื้นกลาง + เส้นจุด + เครื่องหมายคำถาม | หลักฐานยังต้องตรวจ |
| ปกปิดค่า | พื้นกลาง + เส้นประ + label ปกปิดค่า | ไม่แสดงตัวเลขที่ถูกปกปิด |
| นอกขอบเขต | เห็น basemap + label นอกขอบเขต | ไม่อยู่ใน scope ของการวิเคราะห์นี้ |
| ยังไม่ถึงรอบข้อมูล | พื้น pending + เส้นจุด + label | ยังไม่ได้รับข้อมูลของรอบนี้ |
| Demand ต่ำกว่าเกณฑ์ | พื้นโปร่งใส + legend แยก | ทราบสถานะว่าต่ำกว่า cutoff ไม่ใช่ null หรือค่าตัวเลขศูนย์ |

ตัวอย่าง share: `0 สาขาเรา / (0 เรา + 0 คู่แข่ง)` เป็น **คำนวณไม่ได้** ส่วน `0 / (0 + 20)` เป็น **0% ที่ทราบค่า** ทั้ง label, legend และ cue ที่ไม่พึ่งสีต้องรักษาความต่างนี้

## หลักฐานการตรวจอัตโนมัติ

การรัน integrated หลัง runtime freeze รวม Satellite road-map underlay ผ่าน **41 suites / 680 test cases** เริ่ม `2026-10-09T11:11:11.658384+00:00` และจบ `2026-10-09T11:12:08.321845+00:00` จาก [receipt ของรุ่นนี้](../evidence/automated-v1.9.10.json) ทุก suite รันใหม่สำหรับ 1.9.10 จำนวนนี้นับ test cases ที่รายงาน ไม่ใช่จำนวน assertion และไม่ได้ยกผลรุ่นเก่ามารวม

| Suite ที่เกี่ยวข้อง | Cases | ขอบเขตที่ตรวจ |
| --- | ---: | --- |
| [map-hover](../evidence/automated-v1.9.10/check-map-hover.log) | 21 | นอก canvas, ไม่สร้าง tooltip, คลิกผ่านได้, geometry จริง, keyboard/Escape, context และ cleanup |
| [map-clarity](../evidence/automated-v1.9.10/check-map-clarity.log) | 14 | ขอบเขตคลิกกับพื้นที่สีแยกกัน, native totals, ภาษา, panel composition และ reduced motion |
| [workspace-map](../evidence/automated-v1.9.10/check-workspace-map.log) | 31 | map instance/camera, basemap selector, attribution ปี 2021, underlay lifecycle และ navigation |
| [unclustered-poi](../evidence/automated-v1.9.10/check-unclustered-poi.log) | 16 | โลโก้ตามจำนวน visible/filtered, resize, ทุก valid ID, dense Canvas และ overlap chooser |
| [map-evidence-states](../evidence/automated-v1.9.10/check-map-evidence-states.log) | 8 | exact DS tokens, zero/null, 0/0, suppression, hatch และ legend |
| [map-hierarchy](../evidence/automated-v1.9.10/check-map-hierarchy.log) | 12 | ระดับขอบเขตและการ drilldown ตาม source |
| [map-lut41](../evidence/automated-v1.9.10/check-map-lut41.log) | 22 | exact analytical LUT 41 ค่าและ semantics ที่คงเดิม |
| [map-recovery](../evidence/automated-v1.9.10/check-map-recovery.log) | 17 | resize, recovery, camera, scope fit และสถานะ loading/error |

Automated receipt SHA-256: `4fffdc627d6fc1a342aa99ca4fc80faf7d588a7311c5aef9eb3158c4bd439043` หลักฐานนี้ครอบคลุม controller/runtime ผ่าน adapters และ source-backed regression ไม่ใช่ browser FPS, การตรวจทุกขอบเขต, physical-device certification หรือการรับรอง provider availability

## Native review ปัจจุบัน

Release owner ตรวจการใช้งานจริงแบบ bounded บน localhost Chrome ผ่าน **9 checks** มีภาพ JPG 8 ภาพที่ viewport 1440×900, 390×844 และ 320×760 ผลและขอบเขตผูกกับ [QA receipt ปัจจุบัน](../evidence/qa-v1.9.10.json), [native browser receipt](../evidence/browser-v1.9.10/native-browser-review.json) และภาพใน [ตัวอย่างภาพมือถือ](../evidence/browser-v1.9.10/mobile-th-light-dock.jpg) ไม่ขยายผลเป็นทุกพื้นที่ ทุก provider หรือ physical-device certification

| Check ID | สิ่งที่ต้องเห็นใน browser | สถานะ |
| --- | --- | --- |
| `external_hover_focus` | Hover พะเยาแสดง 113 สาขา / share เรา 54.9% ใน dock 34 px; tooltip พื้นที่บน canvas เป็นศูนย์ | PASS bounded |
| `native_pointer_unblocked` | คลิกขอบเขตพะเยาได้และ drilldown จริงโดยไม่มี hover card บัง | PASS bounded |
| `escape_scope_restore` | Escape ล้างการสำรวจ hover และคืน scope ที่เลือก | PASS bounded |
| `sparse_any_zoom_logos` | มุมมองจังหวัดตราด scale 20 km มี 85 DOM markers / 170 images โหลดครบ | PASS bounded |
| `zero_null_theme_first_draw` | ศูนย์ของหนองสนใช้ `#F4F0E7` เดิมทั้งธีม + เส้น DS 2 px; 6 fine areas ไม่มีข้อมูลมี hatch | PASS bounded |
| `satellite_expand_tiles` | หลัง Expand โหลด 72/72 tiles: ESA 36 + OSM underlay 36; ปีและ attribution สอง provider ชัดเจน | PASS bounded |
| `mobile_map_details` | Thai/English จอ 390 และ English 320 เลื่อนถึงรายละเอียดได้ใน flow ปกติ ไม่มี horizontal overflow | PASS bounded |
| `dense_canvas_performance` | Non-bank 13,564 พิกัดใช้ Canvas ทั้งหมด; sprites 3; last frame 18.3 ms / warm start 885.9 ms ที่ localhost Chrome | PASS bounded |
| `whole_site_navigation` | Demand, Supply, โอกาส, Shortlist, เกณฑ์ และความเคลื่อนไหวใน TH/EN ใช้ map เดิมหนึ่ง instance | PASS bounded |

การวัดเวลาเป็นตัวอย่างจาก browser/session นี้ ไม่ใช่ FPS guarantee หรือ device SLA Publication/provider/live-byte attestation เป็นหลักฐานอีกชุดหนึ่ง สถานะในเอกสารนี้ยังเป็น **source ผ่านตรวจ ก่อนเผยแพร่** ต้องผูกกับ Release จริงหลัง seal การตรวจ viewport จอแคบไม่เท่ากับการตรวจ iPhone/Android จริง และยังไม่อ้างผล screen-reader speech หรือทุก browser/device

## ขั้นตอนตรวจสำหรับ Dev/Interns

1. เปิด [current entry](../START_HERE.md) และอ่าน contract; ห้ามปรับเกณฑ์หรือข้อมูลต้นทางเพื่อให้ภาพดูดีขึ้น
2. เปิด Supply แบบสีพื้นที่ ชี้ประเทศ→จังหวัด และจังหวัด→อำเภอ ตรวจชื่อ/ค่าใน dock กับเส้นขอบที่คลิกได้ จากนั้นคลิก drilldown และกด Escape
3. อ่าน treemap ใน side panel ตรวจว่าชื่อพื้นที่ตรงกับ hover และกลับไปพื้นที่ที่เลือกเมื่อออกจาก hover ยอด panel ต้องมาจาก native source ไม่ใช่จำนวนหมุด
4. สลับจุดสาขาและ filter จนจำนวนในมุมมองต่ำกว่าเกณฑ์ ตรวจโลโก้จริงที่ zoom ต่ำ; เพิ่มจำนวนจนเป็น Canvas แล้วเปิดสาขาที่พิกัดซ้อนกัน
5. สลับ Satellite, Expand/Compact และดู Google Maps external link ตรวจ provider/year/center พร้อมการโหลดและกล้องเดิม
6. สลับ light/dark แล้วตรวจ source ที่มี zero, null และ review จริง อ่าน label และเส้น/ลายประกอบ เติม native receipt ตาม check IDs; รัน suites ของรุ่นนี้และตรวจไม่มี runtime source drift ก่อน seal

## Machine-readable report

```json
{
  "schemaVersion": "yolk.map-exploration-report/1.0",
  "version": "1.9.10",
  "date": "2026-10-09",
  "locale": "th",
  "authority": "contracts/map-exploration.v1.9.10.json",
  "changes": {
    "hover": {
      "presentation": "outside_leaflet_canvas_normal_flow_dock",
      "dockHeightPx": 34,
      "idleSpaceReserved": true,
      "areaMapOverlayTooltipCount": 0,
      "outline": "exact_source_clickable_scope_unfilled_noninteractive_yolk_yellow",
      "fullSupplyTreemap": "existing_side_panel",
      "clear": "restore_selected_scope_breakdown",
      "escape": "dismiss_without_camera_or_focus_change",
      "aggregateBasis": "direct_native_source_grain_not_visible_POI_count"
    },
    "sparseLogos": {
      "countBasis": "visible_filtered_valid_coordinate_records",
      "thresholds": [
        {"mapHostWidthAtLeastPx": 600, "maximumRecords": 120},
        {"mapHostWidthBelowPx": 600, "maximumRecords": 60}
      ],
      "minimumZoom": null,
      "drilldownIndependent": true,
      "artwork": "original_bytes_and_aspect_ratio",
      "missingArtwork": "existing_named_brand_fallback",
      "denseFallback": "canvas_all_visible_coordinates_no_inventory_cap",
      "overlapChooser": true
    },
    "satellite": {
      "embeddedProvider": "ESA WorldCover via Terrascope WMTS",
      "imagery": "Sentinel-2 cloudless natural-colour RGB",
      "imageryYear": 2021,
      "resolutionMetres": 10,
      "maximumNativeZoom": 14,
      "attributionAndYearVisible": true,
      "coverageFallback": "simplified_road_map_underlay_beneath_provider_transparent_pixels",
      "coverageCaption": "areas_without_imagery_use_underlying_road_map",
      "transparentPixelMeaning": "provider_coverage_limitation_no_water_or_Expand_bug_inference",
      "satelliteColoursTransformed": false,
      "externalAlternative": "Google Maps satellite at displayed view centre",
      "originalLandometerEmbeddedGoogleHybrid": "open_authorized_API_integration_required",
      "operatingStatusVerification": false
    },
    "evidenceStates": {
      "designSystem": "LDS 0.9.7",
      "rule": "EVID-05",
      "machineAuthority": "machine.tokens.dataState.valueStates",
      "zero": "exact_lowest_LUT_fill_plus_solid_2px_DS_zero_stroke_and_0_label",
      "null": "DS_135deg_hatch_plus_emphasis_border_and_no_data_label",
      "review": "neutral_surface_dotted_border_question_cue",
      "suppressed": "neutral_surface_dashed_border_no_number_disclosure",
      "outOfScope": "bare_basemap_explicit_label",
      "notYet": "pending_surface_dotted_border_explicit_label",
      "belowDemandCriteria": "transparent_known_category_separate_legend",
      "analyticalLUT": "exact_41_values_same_HEX_and_direction_both_themes",
      "zeroDenominator": "undefined_not_0_percent"
    }
  },
  "automatedEvidence": {
    "status": "PASS",
    "suiteCount": 41,
    "passedCaseCount": 680,
    "countDefinition": "reported_test_cases_not_individual_assertions",
    "testedAt": "2026-10-09T11:11:11.658384+00:00",
    "completedAt": "2026-10-09T11:12:08.321845+00:00",
    "receipt": "evidence/automated-v1.9.10.json",
    "receiptSha256": "4fffdc627d6fc1a342aa99ca4fc80faf7d588a7311c5aef9eb3158c4bd439043",
    "focusedSuites": [
      {"script": "scripts/check-map-hover.cjs", "cases": 21},
      {"script": "scripts/check-map-clarity.cjs", "cases": 14},
      {"script": "scripts/check-workspace-map.cjs", "cases": 31},
      {"script": "scripts/check-unclustered-poi.cjs", "cases": 16},
      {"script": "scripts/check-map-evidence-states.cjs", "cases": 8},
      {"script": "scripts/check-map-hierarchy.cjs", "cases": 12},
      {"script": "scripts/check-map-lut41.cjs", "cases": 22},
      {"script": "scripts/check-map-recovery.cjs", "cases": 17}
    ],
    "scope": "fresh_runtime_controller_and_source_backed_regression_with_adapters",
    "browserFPSOrDeviceSLAClaimed": false
  },
  "nativeEvidence": {
    "status": "PASS_BOUNDED_NATIVE_BROWSER_REVIEW",
    "receipt": "evidence/browser-v1.9.10/native-browser-review.json",
    "receiptSha256": "2b103838b50a3217ff9e1933d86c6561ff9f58eb73311f391612e740aa0eba57",
    "integratedReceipt": "evidence/qa-v1.9.10.json",
    "reviewedAt": "2026-10-09T11:16:31.466Z",
    "checkCount": 9,
    "screenshotCount": 8,
    "viewports": [[1440, 900], [390, 844], [320, 760]],
    "checkIds": [
      "external_hover_focus",
      "native_pointer_unblocked",
      "escape_scope_restore",
      "sparse_any_zoom_logos",
      "zero_null_theme_first_draw",
      "satellite_expand_tiles",
      "mobile_map_details",
      "dense_canvas_performance",
      "whole_site_navigation"
    ],
    "results": [
      {"id": "external_hover_focus", "status": "PASS", "area": "Phayao", "branches": 113, "ownSharePercent": 54.9, "dockHeightPx": 34, "mapAreaTooltipCount": 0},
      {"id": "native_pointer_unblocked", "status": "PASS", "area": "Phayao", "actualDrilldown": true},
      {"id": "escape_scope_restore", "status": "PASS"},
      {"id": "sparse_any_zoom_logos", "status": "PASS", "area": "Trat", "scaleKilometres": 20, "DOMMarkers": 85, "loadedImages": 170},
      {"id": "zero_null_theme_first_draw", "status": "PASS", "area": "Nong Son", "zeroFillBothThemes": "#F4F0E7", "zeroStrokePx": 2, "sourceFineNoDataHatched": 6},
      {"id": "satellite_expand_tiles", "status": "PASS", "loadedTiles": 72, "totalTiles": 72, "ESAImageryTiles": 36, "OSMUnderlayTiles": 36, "imageryYear": 2021, "bothProvidersAttributed": true},
      {"id": "mobile_map_details", "status": "PASS", "normalDocumentFlow": true, "horizontalOverflow": false},
      {"id": "dense_canvas_performance", "status": "PASS", "records": 13564, "renderer": "Canvas", "sprites": 3, "lastFrameMs": 18.3, "warmStartMs": 885.9, "scope": "single_bounded_localhost_Chrome_session_not_FPS_or_device_SLA"},
      {"id": "whole_site_navigation", "status": "PASS", "scope": "actual_cases_in_current_QA_receipt"}
    ],
    "requiredFields": ["browser", "viewport", "mapHostWidth", "theme", "screenshot", "receipt"],
    "scope": "observed_current_browser_cases_no_physical_device_full_matrix_or_all_provider_inference"
  },
  "publicationEvidence": {
    "status": "source_prepublication_separate_attestation_pending",
    "receipt": null
  },
  "remaining": [
    "authorized_original_embedded_Google_hybrid_integration",
    "physical_device_and_assistive_technology_matrix",
    "provider_network_availability_and_live_release_attestation"
  ],
  "protected": [
    "source_snapshot_bytes",
    "numerical_brand_presets",
    "Demand_eligible_IDs",
    "exact_analytical_LUTs",
    "original_brand_artwork",
    "source_coordinates",
    "persistent_map_camera_and_context",
    "browser_local_drafts_and_saved_decision_evidence"
  ]
}
```
