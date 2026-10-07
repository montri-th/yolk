# Implementation plan · CityMETER: Yolk v1.9.0

ฉบับเต็มตั้งแต่ product statement จนถึง schema/API/tasks/acceptance อยู่ไฟล์เดียว:

[CityMETER_Yolk_Full_Product_and_Implementation_v1.9.0.md](CityMETER_Yolk_Full_Product_and_Implementation_v1.9.0.md)

Machine contract: [full-product.v1.9.0.json](contracts/full-product.v1.9.0.json)

ทำ T00–T24 ทีละงานตาม dependencies ใน §12 ใช้ existingCityMETERstack หลังT00, source/profiles/DSassets ที่ระบุ และmax3choices ทุกจุด เกณฑ์Demandเป็นผู้กำหนดeligibleIDs; Supply/weights/Strategyไม่เปลี่ยนDemand/Tier

P0ทำได้จากข้อมูลที่มี: Demand+source-scopeSupply+strategyresearchqueues1/3/5/7 และmissing-evidenceguides2/4/6/8. P1เพิ่มanchor/offering/site/cluster evidence; P2routes/futuremilestones; P3privateoperationalcalibration. ระบบsharedauth/RBAC/datastore/outboxเป็นproductionworkอีกแกนหนึ่ง ยังไม่เกิดจากstaticpreview

เริ่ม coding ด้วยPromptใน§12 และคืนoutputs/AC/tests/evidenceต่อtask อย่าถือgeneratedcodeหรือoldreleasepassesเป็นcurrentDone. CurrentreleaseQA/browser/provider/live-byte statusอ่านหลักฐานreleaseปัจจุบัน แผนนี้ไม่ยืนยันว่าได้publishแล้ว
