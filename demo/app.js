// Imported from /Users/sigurd/Downloads/暑假特惠海报.psd (937 × 1679 px).
// Every visible non-text leaf is kept as an independent PNG in the original
// stacking order; Photoshop type layers are represented by editable HTML.
const psdPortraitAssetLayers = {
  psd_base_scene:{src:'./assets/psd-summer-portrait/psd_base_scene.png',x:50,y:50,w:100,h:100,zIndex:1,label:'7830eda3-dc39-476d-9466-5315ba8b15ab'},
  psd_room_photo:{src:'./assets/psd-summer-portrait/psd_room_photo.png',x:50,y:50,w:100,h:100,zIndex:2,label:'huaban-6709309711'},
  psd_texture:{src:'./assets/psd-summer-portrait/psd_texture.png',x:50,y:50,w:100,h:100,zIndex:3,label:'米色纹理蒙层_真实透明无格子'},
  psd_promo_bar:{src:'./assets/psd-summer-portrait/psd_promo_bar.png',x:49.8399,y:19.7439,w:59.9787,h:3.7522,zIndex:4,label:'主优惠条_独立'},
  psd_benefits_card:{src:'./assets/psd-summer-portrait/psd_benefits_card.png',x:88.1003,y:55.2710,w:16.9691,h:17.9869,zIndex:5,label:'直播权益卡底_独立'},
  psd_benefit_shuttle_bg:{src:'./assets/psd-summer-portrait/psd_benefit_shuttle_bg.png',x:88.1537,y:51.5485,w:13.0203,h:2.4419,zIndex:6,label:'免费接送按钮_独立'},
  psd_benefit_luggage_bg:{src:'./assets/psd-summer-portrait/psd_benefit_luggage_bg.png',x:88.1537,y:54.8243,w:13.0203,h:2.5610,zIndex:7,label:'行李基础按钮_独立'},
  psd_benefit_breakfast_bg:{src:'./assets/psd-summer-portrait/psd_benefit_breakfast_bg.png',x:88.1537,y:58.0703,w:13.0203,h:2.6206,zIndex:8,label:'包含早餐按钮_独立'},
  psd_benefit_expired_bg:{src:'./assets/psd-summer-portrait/psd_benefit_expired_bg.png',x:88.1537,y:61.6736,w:13.0203,h:3.3949,zIndex:9,label:'未核销过期退按钮_独立'},
  psd_discount_badge:{src:'./assets/psd-summer-portrait/psd_discount_badge.png',x:24.8132,y:94.2525,w:13.1270,h:2.6802,zIndex:10,label:'折后价标签_独立'},
  psd_diamond_top:{src:'./assets/psd-summer-portrait/psd_diamond_top.png',x:50.0534,y:5.9559,w:2.9883,h:1.6677,zIndex:11,label:'顶部花钿_独立'},
  psd_diamond_benefits:{src:'./assets/psd-summer-portrait/psd_diamond_benefits.png',x:87.6201,y:46.3371,w:2.5614,h:1.4294,zIndex:12,label:'权益卡花钿_独立'},
  psd_diamond_room_left:{src:'./assets/psd-summer-portrait/psd_diamond_room_left.png',x:24.7599,y:89.1007,w:2.3479,h:1.3103,zIndex:13,label:'房型左花钿_独立'},
  psd_diamond_room_right:{src:'./assets/psd-summer-portrait/psd_diamond_room_right.png',x:74.4931,y:89.1007,w:2.3479,h:1.3103,zIndex:14,label:'房型右花钿_独立'}
};
// Coordinates come directly from each Photoshop type layer's pixel bounds.
// x/y are centers so dragging and export use the same anchor.
const psdPortraitTextLayers = {
  psd_tcl_hotel:{label:'TCL HOTEL',value:'TCL HOTEL',x:51.5475,y:13.1626,w:86.0192,h:6.1942,fontSize:54,lineHeight:1.05,kind:'serif',weight:400,color:'#F7ECDF'},
  psd_brand_subtitle:{label:'品牌副标',value:'自  然  秘  境      诗  意  栖  居',x:50.1601,y:5.8666,w:35.4322,h:1.6081,fontSize:27,lineHeight:1.2,kind:'sans',weight:400,color:'#422919'},
  psd_main_title:{label:'主标题',value:'TCL酒店暑期特惠',x:49.6798,y:13.9964,w:66.9157,h:4.2883,fontSize:76,lineHeight:1.05,kind:'serif',weight:600,color:'#4A2B13'},
  psd_promo_copy:{label:'优惠条文字',value:'直播专享8.8折送专属入住礼',x:49.8399,y:19.7141,w:46.5315,h:1.9059,fontSize:34,lineHeight:1.1,kind:'sans',weight:400,color:'#FFFFFF'},
  psd_benefits_title:{label:'权益卡标题',value:'今日专属',x:87.9936,y:48.5408,w:12.2732,h:1.6677,fontSize:29,lineHeight:1.1,kind:'serif',weight:600,color:'#4B2E18'},
  psd_benefit_shuttle:{label:'免费接送',value:'免费接送',x:88.0470,y:51.5485,w:9.3917,h:1.2507,fontSize:22,lineHeight:1.1,kind:'sans',weight:400,color:'#FFFFFF'},
  psd_benefit_luggage:{label:'行李基础',value:'行李基础',x:87.9936,y:54.9434,w:9.2850,h:1.2507,fontSize:22,lineHeight:1.1,kind:'sans',weight:400,color:'#FFFFFF'},
  psd_benefit_breakfast:{label:'包含早餐',value:'包含早餐',x:88.0470,y:58.0703,w:9.3917,h:1.3103,fontSize:22,lineHeight:1.1,kind:'sans',weight:400,color:'#FFFFFF'},
  psd_benefit_expired:{label:'未核销过期退',value:'过期退',x:88.4739,y:61.6438,w:6.6169,h:1.1912,fontSize:21,lineHeight:1.1,kind:'sans',weight:400,color:'#FFFFFF'},
  psd_room_type:{label:'房型',value:'限定双人大床房3天2晚',x:50.2668,y:89.1007,w:43.9701,h:2.1441,fontSize:37,lineHeight:1.1,kind:'serif',weight:500,color:'#54351E'},
  psd_discount_copy:{label:'折后价',value:'折后价',x:24.7599,y:94.2228,w:6.6169,h:1.1912,fontSize:21,lineHeight:1.1,kind:'sans',weight:400,color:'#FFFFFF'},
  psd_currency:{label:'人民币符号',value:'¥',x:33.2444,y:94.4312,w:2.2412,h:1.4890,fontSize:34,lineHeight:1.05,kind:'serif',weight:400,color:'#54351E'},
  psd_price:{label:'主价格',value:'799',x:42.7428,y:94.0143,w:11.8463,h:3.1566,fontSize:78,lineHeight:1.0,kind:'serif',weight:600,color:'#54351E'},
  psd_unit:{label:'单位',value:'/套',x:53.4685,y:94.4908,w:5.3362,h:1.9655,fontSize:31,lineHeight:1.1,kind:'sans',weight:400,color:'#54351E'},
  psd_price_note:{label:'价格说明',value:'(周末 / 假日不加收)',x:70.2775,y:94.5801,w:22.7321,h:1.5485,fontSize:24,lineHeight:1.1,kind:'sans',weight:400,color:'#54351E'}
};
const psdPortraitTextPosition=Object.fromEntries(Object.entries(psdPortraitTextLayers).map(([key,spec])=>[key,{x:spec.x,y:spec.y,w:spec.w,h:spec.h}]));
const psdPortraitTextLayerKeys = new Set(Object.keys(psdPortraitTextLayers));

// Imported from 行政景观套房_严格分层_1920x1080_72DPI.psd.
// The original 1920 × 1080 / 72 DPI stacking order is kept exactly: the
// full-canvas scene is the protected bottom layer; every panel/detail is an
// independent transparent PNG; the seven Photoshop Type layers stay editable.
const psdAdminSuiteAssetLayers = {
  admin_suite_background:{src:'./assets/psd-admin-suite-landscape/admin_suite_background.png',x:50,y:50,w:100,h:100,zIndex:1,label:'BG_01_酒店套房实景_独立底层'},
  admin_suite_panel:{src:'./assets/psd-admin-suite-landscape/admin_suite_panel.png',x:26.822917,y:50,w:43.75,h:87.037037,zIndex:2,label:'UI_01_左侧深色半透明面板'},
  admin_suite_logo_placeholder:{src:'./assets/psd-admin-suite-landscape/admin_suite_logo_placeholder.png',x:27.239583,y:17.037037,w:5.208333,h:10.185185,zIndex:3,label:'LOGO_01_品牌占位标_ALPHA'},
  admin_suite_divider:{src:'./assets/psd-admin-suite-landscape/admin_suite_divider.png',x:26.822917,y:50.185185,w:30.729167,h:2.222222,zIndex:4,label:'DEC_02_标题分隔线_ALPHA'},
  admin_suite_icon_area:{src:'./assets/psd-admin-suite-landscape/admin_suite_icon_area.png',x:13.59375,y:59.259259,w:4.270833,h:7.592593,zIndex:5,label:'ICON_01_面积_ALPHA'},
  admin_suite_icon_living:{src:'./assets/psd-admin-suite-landscape/admin_suite_icon_living.png',x:30.78125,y:59.259259,w:4.270833,h:7.592593,zIndex:6,label:'ICON_02_独立客厅_ALPHA'},
  admin_suite_icon_window:{src:'./assets/psd-admin-suite-landscape/admin_suite_icon_window.png',x:13.59375,y:69.907407,w:4.270833,h:7.592593,zIndex:7,label:'ICON_03_全景落地窗_ALPHA'},
  admin_suite_icon_benefits:{src:'./assets/psd-admin-suite-landscape/admin_suite_icon_benefits.png',x:30.78125,y:69.907407,w:4.270833,h:7.592593,zIndex:8,label:'ICON_04_行政礼遇_ALPHA'},
  admin_suite_icon_fruit:{src:'./assets/psd-admin-suite-landscape/admin_suite_icon_fruit.png',x:13.59375,y:80.555556,w:4.270833,h:7.592593,zIndex:9,label:'ICON_05_欢迎水果_ALPHA'}
};
const psdAdminSuiteTextLayers = {
  admin_suite_title:{label:'TXT_01_主标题_可编辑',value:'行政景观套房',x:27.213542,y:30.324074,w:26.510417,h:7.5,fontSize:86,lineHeight:1.2,kind:'source-han-sans',weight:500,color:'#F8F5EE',letterSpacing:'0',pointText:true,zIndex:10},
  admin_suite_subtitle:{label:'TXT_02_副标题_可编辑',value:'宽境之上，尽享从容',x:26.822917,y:40.601852,w:18.958333,h:3.981481,fontSize:43,lineHeight:1.2,kind:'source-han-sans',weight:500,color:'#D3A66F',letterSpacing:'0',pointText:true,zIndex:11},
  admin_suite_area:{label:'TXT_03_面积_可编辑',value:'面积 68㎡',x:19.947917,y:59.444444,w:6.979167,h:2.777778,fontSize:31,lineHeight:1.2,kind:'source-han-sans',weight:500,color:'#F8F5EE',letterSpacing:'0',pointText:true,zIndex:12},
  admin_suite_living:{label:'TXT_04_独立客厅_可编辑',value:'独立客厅',x:36.796875,y:59.444444,w:6.40625,h:2.777778,fontSize:31,lineHeight:1.2,kind:'source-han-sans',weight:500,color:'#F8F5EE',letterSpacing:'0',pointText:true,zIndex:13},
  admin_suite_window:{label:'TXT_05_全景落地窗_可编辑',value:'全景落地窗',x:20.390625,y:70.092593,w:7.96875,h:2.777778,fontSize:31,lineHeight:1.2,kind:'source-han-sans',weight:500,color:'#F8F5EE',letterSpacing:'0',pointText:true,zIndex:14},
  admin_suite_benefits:{label:'TXT_06_行政礼遇_可编辑',value:'行政礼遇',x:36.822917,y:70.138889,w:6.354167,h:2.87037,fontSize:31,lineHeight:1.2,kind:'source-han-sans',weight:500,color:'#F8F5EE',letterSpacing:'0',pointText:true,zIndex:15},
  admin_suite_fruit:{label:'TXT_07_欢迎水果_可编辑',value:'欢迎水果',x:19.609375,y:80.740741,w:6.40625,h:2.777778,fontSize:31,lineHeight:1.2,kind:'source-han-sans',weight:500,color:'#F8F5EE',letterSpacing:'0',pointText:true,zIndex:16}
};
const psdAdminSuiteTextPosition=Object.fromEntries(Object.entries(psdAdminSuiteTextLayers).map(([key,spec])=>[key,{x:spec.x,y:spec.y,w:spec.w,h:spec.h}]));
const psdAdminSuiteTextLayerKeys = new Set(Object.keys(psdAdminSuiteTextLayers));

// Imported from 早餐时光_1920x1080_72DPI.psd and 客房服务_1920x1080_72DPI.psd.
// Each supplied PSD keeps its original leaf-layer order; only Photoshop Type
// layers become editable HTML text, while every other leaf remains an image.
const psdBreakfastAssetLayers = {
  breakfast_background:{src:'./assets/psd-breakfast-time-landscape/breakfast_background.png',x:46.328125,y:50,w:107.34375,h:100,zIndex:1,label:'图层 0'},
  breakfast_info_panel:{src:'./assets/psd-breakfast-time-landscape/breakfast_info_panel.png',x:26.5625,y:51.203704,w:39.895833,h:75.555556,zIndex:2,label:'早餐信息底框_原图比例复刻_透明外部'},
  breakfast_top_ornament:{src:'./assets/psd-breakfast-time-landscape/breakfast_top_ornament.png',x:27.65625,y:22.037037,w:15.625,h:6.481481,zIndex:3,label:'DEC_02_顶部花纹_ALPHA'},
  breakfast_divider:{src:'./assets/psd-breakfast-time-landscape/breakfast_divider.png',x:27.34375,y:49.537037,w:32.291667,h:2.777778,zIndex:4,label:'DEC_03_标题分隔线_ALPHA'},
  breakfast_leaf_decor:{src:'./assets/psd-breakfast-time-landscape/breakfast_leaf_decor.png',x:9.6875,y:83.703704,w:20.104167,h:43.518519,zIndex:5,label:'植物叶子_原图五叶复刻_透明底 (1)'},
  breakfast_icon_time:{src:'./assets/psd-breakfast-time-landscape/breakfast_icon_time.png',x:13.802083,y:60.648148,w:4.6875,h:8.333333,zIndex:6,label:'ICON_01_供应时间_ALPHA'},
  breakfast_icon_location:{src:'./assets/psd-breakfast-time-landscape/breakfast_icon_location.png',x:13.802083,y:69.907407,w:4.6875,h:8.333333,zIndex:7,label:'ICON_02_用餐地点_ALPHA'},
  breakfast_icon_card:{src:'./assets/psd-breakfast-time-landscape/breakfast_icon_card.png',x:13.802083,y:79.166667,w:4.6875,h:8.333333,zIndex:8,label:'ICON_03_房卡用餐_ALPHA'}
};
const psdBreakfastTextLayers = {
  breakfast_title:{label:'TXT_01_主标题_可编辑',value:'早餐时光',x:27.057292,y:32.962963,w:20.46875,h:8.703704,fontSize:100,lineHeight:1.2,kind:'source-han-sans',weight:500,color:'#846036',pointText:true,zIndex:9},
  breakfast_subtitle:{label:'TXT_02_副标题_可编辑',value:'开启元气满满的一天',x:27.057292,y:41.944444,w:20.46875,h:3.888889,fontSize:44,lineHeight:1.2,kind:'source-han-sans',weight:500,color:'#687355',pointText:true,zIndex:10},
  breakfast_time:{label:'TXT_03_供应时间_可编辑',value:'供应时间  07:00—10:00',x:27.083333,y:61.25,w:18.541667,h:3.055556,fontSize:34,lineHeight:1.2,kind:'source-han-sans',weight:500,color:'#687355',pointText:true,zIndex:11},
  breakfast_location:{label:'TXT_04_用餐地点_可编辑',value:'用餐地点  二楼全日餐厅',x:27.057292,y:70.509259,w:18.385417,h:3.055556,fontSize:34,lineHeight:1.2,kind:'source-han-sans',weight:500,color:'#687355',pointText:true,zIndex:12},
  breakfast_card_note:{label:'TXT_05_房卡提示_可编辑',value:'请凭房卡用餐',x:23.125,y:79.768519,w:10.520833,h:3.055556,fontSize:34,lineHeight:1.2,kind:'source-han-sans',weight:500,color:'#687355',pointText:true,zIndex:13}
};
const psdBreakfastTextPosition=Object.fromEntries(Object.entries(psdBreakfastTextLayers).map(([key,spec])=>[key,{x:spec.x,y:spec.y,w:spec.w,h:spec.h}]));
const psdBreakfastTextLayerKeys = new Set(Object.keys(psdBreakfastTextLayers));

const psdRoomServiceAssetLayers = {
  room_service_background:{src:'./assets/psd-room-service-landscape/room_service_background.png',x:50,y:50,w:100,h:100,zIndex:1,label:'BG_01_客房实景_独立底层'},
  room_service_panel:{src:'./assets/psd-room-service-landscape/room_service_panel.png',x:68.489583,y:49.814815,w:63.020833,h:100,zIndex:2,label:'UI_01_右侧弧形米白面板_ALPHA'},
  room_service_logo_placeholder:{src:'./assets/psd-room-service-landscape/room_service_logo_placeholder.png',x:89.713542,y:9.490741,w:12.760417,h:8.796296,zIndex:3,label:'LOGO_01_右上品牌占位标_ALPHA'},
  room_service_divider:{src:'./assets/psd-room-service-landscape/room_service_divider.png',x:73.958333,y:41.111111,w:33.333333,h:2.407407,zIndex:4,label:'DEC_01_标题分隔线_ALPHA'},
  room_service_divider_service_1:{src:'./assets/psd-room-service-landscape/room_service_divider_service_1.png',x:66.197917,y:70,w:.104167,h:23.148148,zIndex:5,label:'DEC_02_服务竖分隔线1_ALPHA'},
  room_service_divider_service_2:{src:'./assets/psd-room-service-landscape/room_service_divider_service_2.png',x:81.822917,y:70,w:.104167,h:23.148148,zIndex:6,label:'DEC_03_服务竖分隔线2_ALPHA'},
  room_service_icon_delivery:{src:'./assets/psd-room-service-landscape/room_service_icon_delivery.png',x:88.984375,y:64.907407,w:7.239583,h:12.962963,zIndex:7,label:'送物服务图标_原图提取_透明底'},
  room_service_icon_frontdesk:{src:'./assets/psd-room-service-landscape/room_service_icon_frontdesk.png',x:73.333333,y:64.907407,w:7.1875,h:12.962963,zIndex:8,label:'前台服务图标_原图提取_透明底'},
  room_service_icon_cleaning:{src:'./assets/psd-room-service-landscape/room_service_icon_cleaning.png',x:57.708333,y:64.907407,w:7.1875,h:12.962963,zIndex:9,label:'客房清洁图标_原图提取_透明底'}
};
const psdRoomServiceTextLayers = {
  room_service_title:{label:'TXT_01_主标题_可编辑',value:'客房服务',x:73.958333,y:31.203704,w:21.5625,h:9.259259,fontSize:105,lineHeight:1.2,kind:'source-han-sans',weight:500,color:'#313131',pointText:true,zIndex:10},
  room_service_subtitle:{label:'TXT_02_副标题_可编辑',value:'让每一次停留都更从容',x:70.46875,y:47.731481,w:22.291667,h:3.796296,fontSize:43,lineHeight:1.2,kind:'source-han-sans',weight:500,color:'#B98D56',pointText:true,zIndex:11},
  room_service_cleaning:{label:'TXT_03_客房清洁_可编辑',value:'客房清洁\n08:00—18:00',x:57.708333,y:77.777778,w:9.6875,h:5.925926,fontSize:31,lineHeight:1.2,kind:'source-han-sans',weight:500,color:'#343434',pointText:true,zIndex:12},
  room_service_frontdesk:{label:'TXT_04_前台电话_可编辑',value:'前台请拨 0',x:73.411458,y:77.777778,w:7.65625,h:2.777778,fontSize:31,lineHeight:1.2,kind:'source-han-sans',weight:500,color:'#343434',pointText:true,zIndex:13},
  room_service_delivery:{label:'TXT_05_送物服务_可编辑',value:'送物服务\n24小时',x:88.932292,y:78.564815,w:6.40625,h:6.203704,fontSize:31,lineHeight:1.2,kind:'source-han-sans',weight:500,color:'#343434',pointText:true,zIndex:14}
};
const psdRoomServiceTextPosition=Object.fromEntries(Object.entries(psdRoomServiceTextLayers).map(([key,spec])=>[key,{x:spec.x,y:spec.y,w:spec.w,h:spec.h}]));
const psdRoomServiceTextLayerKeys = new Set(Object.keys(psdRoomServiceTextLayers));

// Imported from /Users/sigurd/Downloads/满房海报.psd (1152 × 2048 px).
// The two non-text layers remain independent PNGs in the original order;
// all four Photoshop Type layers are rendered as editable HTML text.
const psdFullHouseAssetLayers = {
  full_house_background:{src:'./assets/psd-full-house-portrait/full_house_background.png',x:50,y:50,w:100,h:100,zIndex:1,label:'01_背景_无字酒店客房'},
  full_house_rule:{src:'./assets/psd-full-house-portrait/full_house_rule.png',x:50.0434,y:31.0059,w:8.9410,h:.3906,zIndex:2,label:'02_装饰_金色短横线_透明位图'}
};
const psdFullHouseTextLayers = {
  full_house_title:{label:'TXT_03_主标题_可编辑',value:'满房',x:50,y:17.4072,w:100,h:22.3145,fontSize:253.41552,lineHeight:1.2,kind:'serif',weight:400,color:'#FFF6E4',letterSpacing:'.035em',pointText:true,zIndex:3},
  full_house_english_title:{label:'TXT_04_英文标题_可编辑',value:'Full House',x:50,y:26.0254,w:100,h:10.1563,fontSize:115.07758,lineHeight:1.2,kind:'roman-italic',weight:400,color:'#FFF6E4',letterSpacing:'.020em',fontStyle:'italic',pointText:true,zIndex:4},
  full_house_note:{label:'TXT_05_说明_感谢厚爱今日满房_可编辑',value:'感谢厚爱 · 今日满房',x:50,y:34.6436,w:100,h:3.2715,fontSize:36.72689,lineHeight:1.2,kind:'serif',weight:400,color:'#FFF6E4',letterSpacing:'.120em',pointText:true,zIndex:5},
  full_house_next_note:{label:'TXT_06_说明_期待下一次与您相遇_可编辑',value:'期待下一次，与您相遇',x:50,y:37.8662,w:100,h:3.2715,fontSize:36.72689,lineHeight:1.2,kind:'serif',weight:400,color:'#FFF6E4',letterSpacing:'.100em',pointText:true,zIndex:6}
};
const psdFullHouseTextPosition=Object.fromEntries(Object.entries(psdFullHouseTextLayers).map(([key,spec])=>[key,{x:spec.x,y:spec.y,w:spec.w,h:spec.h}]));
const psdFullHouseTextLayerKeys = new Set(Object.keys(psdFullHouseTextLayers));

// Imported from /Users/sigurd/Downloads/TCL-Hotel-Dinner-Layered-72DPI.psd
// (941 × 1672 px).  The hidden clean-plate layer is intentionally omitted
// from the visible asset stack; all 19 visible non-text layers stay separate
// and the 10 Photoshop Type layers remain editable HTML text.
const psdDinnerAssetLayers = {
  dinner_scene:{src:'./assets/psd-dinner-portrait/dinner_scene.png',x:50.0531,y:50,w:100.3188,h:100,zIndex:1,label:'WechatIMG5619 1'},
  dinner_lower_panel:{src:'./assets/psd-dinner-portrait/dinner_lower_panel.png',x:50,y:67.4342,w:101.9129,h:65.4904,zIndex:2,label:'矩形 1'},
  dinner_gold_frame:{src:'./assets/psd-dinner-portrait/dinner_gold_frame.png',x:50,y:15.3409,w:100,h:30.6818,zIndex:3,label:'背景_金边蒙层_透明'},
  dinner_subtitle_rule_left:{src:'./assets/psd-dinner-portrait/dinner_subtitle_rule_left.png',x:10.6801,y:24.701,w:4.5696,h:.1196,zIndex:7,label:'05_装饰_副标题左线'},
  dinner_subtitle_rule_right:{src:'./assets/psd-dinner-portrait/dinner_subtitle_rule_right.png',x:54.2508,y:24.701,w:4.5696,h:.1196,zIndex:8,label:'06_装饰_副标题右线'},
  dinner_logo:{src:'./assets/psd-dinner-portrait/dinner_logo.png',x:88.1509,y:4.6053,w:14.9841,h:2.7512,zIndex:9,label:'07_LOGO_TCL'},
  dinner_icon_ring_environment:{src:'./assets/psd-dinner-portrait/dinner_icon_ring_environment.png',x:23.3794,y:85.4665,w:8.5016,h:4.7847,zIndex:10,label:'09_图形_环境图标圆环'},
  dinner_icon_ring_dishes:{src:'./assets/psd-dinner-portrait/dinner_icon_ring_dishes.png',x:47.9277,y:85.4665,w:8.5016,h:4.7847,zIndex:11,label:'10_图形_菜品图标圆环'},
  dinner_icon_ring_quality:{src:'./assets/psd-dinner-portrait/dinner_icon_ring_quality.png',x:72.4761,y:85.4665,w:8.5016,h:4.7847,zIndex:12,label:'11_图形_品质图标圆环'},
  dinner_icon_environment:{src:'./assets/psd-dinner-portrait/dinner_icon_environment.png',x:23.4325,y:85.317,w:4.7821,h:2.3325,zIndex:13,label:'12_图标_环境雅致_沙发落地灯'},
  dinner_icon_dishes:{src:'./assets/psd-dinner-portrait/dinner_icon_dishes.png',x:47.9277,y:85.1675,w:4.8884,h:2.1531,zIndex:14,label:'13_图标_菜品丰富_餐罩'},
  dinner_icon_quality:{src:'./assets/psd-dinner-portrait/dinner_icon_quality.png',x:72.4761,y:85.3768,w:5.101,h:2.5718,zIndex:15,label:'14_图标_品质优选_钻石'},
  dinner_feature_rule_left:{src:'./assets/psd-dinner-portrait/dinner_feature_rule_left.png',x:35.2816,y:87.1411,w:.2125,h:5.7416,zIndex:16,label:'15_分隔线_卖点左'},
  dinner_feature_rule_right:{src:'./assets/psd-dinner-portrait/dinner_feature_rule_right.png',x:60.7864,y:87.1411,w:.2125,h:5.7416,zIndex:17,label:'16_分隔线_卖点右'},
  dinner_contact_frame:{src:'./assets/psd-dinner-portrait/dinner_contact_frame.png',x:49.8937,y:94.4677,w:88.7354,h:5.323,zIndex:21,label:'20_边框_底部联系信息'},
  dinner_phone_ring:{src:'./assets/psd-dinner-portrait/dinner_phone_ring.png',x:11.1583,y:94.4378,w:4.2508,h:2.3923,zIndex:22,label:'21_图形_电话圆环'},
  dinner_location_ring:{src:'./assets/psd-dinner-portrait/dinner_location_ring.png',x:59.7237,y:94.4378,w:4.2508,h:2.3923,zIndex:23,label:'22_图形_定位圆环'},
  dinner_phone_icon:{src:'./assets/psd-dinner-portrait/dinner_phone_icon.png',x:11.1052,y:94.4677,w:2.8693,h:1.256,zIndex:24,label:'23_图标_电话'},
  dinner_location_icon:{src:'./assets/psd-dinner-portrait/dinner_location_icon.png',x:59.7237,y:94.378,w:2.1254,h:1.6746,zIndex:25,label:'24_图标_地址定位'}
};
const psdDinnerTextLayers = {
  dinner_title_brand:{label:'02_主标题_TCL酒店',value:'TCL酒店',x:32.3592,y:11.0945,w:49.4155,h:6.7584,fontSize:119,lineHeight:1.2,kind:'serif',weight:600,color:'#FFFBEA',letterSpacing:'0.000em',pointText:true,zIndex:4},
  dinner_title_dinner:{label:'03_主标题_自助晚餐',value:'自助晚餐',x:34.0595,y:18.8995,w:48.7779,h:6.6986,fontSize:116,lineHeight:1.2,kind:'serif',weight:600,color:'#FFFBEA',letterSpacing:'0.000em',pointText:true,zIndex:5},
  dinner_subtitle:{label:'04_副标题_品味精致_尊享美味',value:'品味精致  尊享美味',x:32.5186,y:24.6711,w:35.4942,h:1.9737,fontSize:33,lineHeight:1.2,kind:'serif',weight:400,color:'#FFFBEA',letterSpacing:'0.000em',pointText:true,zIndex:6},
  dinner_feature_environment:{label:'17_卖点文字_环境雅致',value:'环境雅致',x:23.2731,y:89.3242,w:13.1775,h:1.8541,fontSize:31,lineHeight:1.2,kind:'serif',weight:400,color:'#DFB67E',letterSpacing:'0.000em',pointText:true,zIndex:18},
  dinner_feature_dishes:{label:'18_卖点文字_菜品丰富',value:'菜品丰富',x:48.1403,y:89.3242,w:13.1775,h:1.8541,fontSize:31,lineHeight:1.2,kind:'serif',weight:400,color:'#DFB67E',letterSpacing:'0.000em',pointText:true,zIndex:19},
  dinner_feature_quality:{label:'19_卖点文字_品质优选',value:'品质优选',x:72.848,y:89.3242,w:13.0712,h:1.8541,fontSize:31,lineHeight:1.2,kind:'serif',weight:400,color:'#DFB67E',letterSpacing:'0.000em',pointText:true,zIndex:20},
  dinner_contact_hotline_label:{label:'25_联系文字_预约热线',value:'预约热线：',x:19.8725,y:94.4976,w:10.8395,h:1.555,fontSize:26,lineHeight:1.2,kind:'serif',weight:400,color:'#DFB67E',letterSpacing:'0.000em',pointText:true,zIndex:26},
  dinner_contact_hotline:{label:'26_联系文字_电话号码',value:'0512-56303777',x:40.1169,y:94.4079,w:25.186,h:1.4952,fontSize:33,lineHeight:1.2,kind:'serif',weight:600,color:'#DFB67E',letterSpacing:'0.000em',pointText:true,zIndex:27},
  dinner_contact_address_label:{label:'27_联系文字_地址标签',value:'地址：',x:65.6217,y:94.4677,w:5.2072,h:1.4952,fontSize:26,lineHeight:1.2,kind:'serif',weight:400,color:'#DFB67E',letterSpacing:'0.000em',pointText:true,zIndex:28},
  dinner_contact_address:{label:'28_联系文字_详细地址',value:'暨阳西路320号',x:80.2869,y:94.4976,w:18.5972,h:1.555,fontSize:26,lineHeight:1.2,kind:'serif',weight:400,color:'#DFB67E',letterSpacing:'0.000em',pointText:true,zIndex:29}
};
const psdDinnerTextPosition=Object.fromEntries(Object.entries(psdDinnerTextLayers).map(([key,spec])=>[key,{x:spec.x,y:spec.y,w:spec.w,h:spec.h}]));
const psdDinnerTextLayerKeys = new Set(Object.keys(psdDinnerTextLayers));

// All PSD-backed templates use their own text schema. Keeping the lookup on
// the template prevents the landscape PSD from changing either portrait PSD.
function psdTextSpecs(template){return template?.psdTextLayers||{}}
function psdTextKeys(template){return Object.keys(psdTextSpecs(template))}
function defaultPsdTextValues(template){return Object.fromEntries(Object.entries(psdTextSpecs(template)).map(([key,spec])=>[key,spec.value]))}
function isStrictPsdStackTemplate(template){return template?.id==='psd-dinner-hotel-portrait'||template?.id==='psd-mid-autumn-seaview-portrait'||template?.id==='psd-new-year-portrait'}

// Legacy PSD portrait template retained from the earlier template library.
// Its source file was already rasterized into individually movable PNG layers;
// keep it as a separate 2:3 template so adding the new summer PSD never
// replaces or hides it.
const psdLegacyPortraitAssetLayers = {
  legacy_background:{src:'./assets/psd-portrait/background.png',x:50,y:50,w:100,h:100,zIndex:1,label:'背景'},
  legacy_paper_texture:{src:'./assets/psd-portrait/paper-texture.png',x:50,y:50,w:100,h:100,zIndex:2,label:'纸张纹理'},
  legacy_room_photo:{src:'./assets/psd-portrait/room-photo.png',x:49.80,y:28.05,w:129.08,h:57.42,zIndex:3,label:'客房场景图'},
  legacy_wave_bottom_1:{src:'./assets/psd-portrait/wave-bottom-1.png',x:50.34,y:51.02,w:111.28,h:10.49,zIndex:4,label:'下边框底纹'},
  legacy_wave_bottom_2:{src:'./assets/psd-portrait/wave-bottom-2.png',x:50.00,y:50.55,w:117.92,h:8.72,zIndex:5,label:'下边框线 1'},
  legacy_wave_bottom_3:{src:'./assets/psd-portrait/wave-bottom-3.png',x:50.00,y:51.04,w:117.92,h:8.72,zIndex:6,label:'下边框线 2'},
  legacy_wave_bottom_4:{src:'./assets/psd-portrait/wave-bottom-4.png',x:50.00,y:51.54,w:117.92,h:8.70,zIndex:7,label:'下边框线 3'},
  legacy_wave_bottom_5:{src:'./assets/psd-portrait/wave-bottom-5.png',x:50.00,y:52.05,w:117.92,h:8.71,zIndex:8,label:'下边框线 4'},
  legacy_wave_top_1:{src:'./assets/psd-portrait/wave-top-1.png',x:50.36,y:5.86,w:91.42,h:18.03,zIndex:9,label:'上边框底纹'},
  legacy_wave_top_2:{src:'./assets/psd-portrait/wave-top-2.png',x:50.00,y:4.77,w:112.11,h:27.00,zIndex:10,label:'上边框线 1'},
  legacy_wave_top_3:{src:'./assets/psd-portrait/wave-top-3.png',x:50.00,y:5.25,w:112.11,h:27.00,zIndex:11,label:'上边框线 2'},
  legacy_wave_top_4:{src:'./assets/psd-portrait/wave-top-4.png',x:50.00,y:5.74,w:112.11,h:27.00,zIndex:12,label:'上边框线 3'},
  legacy_wave_top_5:{src:'./assets/psd-portrait/wave-top-5.png',x:50.00,y:6.23,w:112.11,h:27.00,zIndex:13,label:'上边框线 4'},
  legacy_top_slogan:{src:'./assets/psd-portrait/top-slogan.png',x:67.10,y:57.48,w:31.83,h:4.72,zIndex:20,label:'美好时光'},
  legacy_main_title:{src:'./assets/psd-portrait/main-title.png',x:50.49,y:66.02,w:85.52,h:8.90,zIndex:21,label:'休闲度假酒店'},
  legacy_star_cn:{src:'./assets/psd-portrait/star-hotel-cn.png',x:18.90,y:75.15,w:18.04,h:2.67,zIndex:22,label:'高星酒店'},
  legacy_star_en:{src:'./assets/psd-portrait/star-hotel-en.png',x:21.10,y:78.36,w:22.08,h:2.09,zIndex:23,label:'High star hotel'},
  legacy_star_body:{src:'./assets/psd-portrait/star-hotel-body.png',x:19.59,y:84.71,w:19.25,h:5.39,zIndex:24,label:'高星酒店介绍'},
  legacy_travel_cn:{src:'./assets/psd-portrait/travel-cn.png',x:49.17,y:75.18,w:17.83,h:2.66,zIndex:22,label:'出行便利'},
  legacy_travel_en:{src:'./assets/psd-portrait/travel-en.png',x:53.25,y:78.14,w:26.33,h:1.64,zIndex:23,label:'Convenient travel'},
  legacy_travel_body:{src:'./assets/psd-portrait/travel-body.png',x:52.42,y:84.74,w:22.69,h:5.33,zIndex:24,label:'出行便利介绍'},
  legacy_value_cn:{src:'./assets/psd-portrait/value-selection-cn.png',x:82.12,y:75.17,w:18.15,h:2.63,zIndex:22,label:'超值精选'},
  legacy_value_en:{src:'./assets/psd-portrait/value-selection-en.png',x:84.58,y:78.14,w:22.72,h:1.62,zIndex:23,label:'Value selection'},
  legacy_price_family:{src:'./assets/psd-portrait/price-family.png',x:84.14,y:82.41,w:20.91,h:2.06,zIndex:24,label:'家庭房价格'},
  legacy_price_standard:{src:'./assets/psd-portrait/price-standard.png',x:83.85,y:84.50,w:20.42,h:2.00,zIndex:24,label:'标准间价格'},
  legacy_price_king:{src:'./assets/psd-portrait/price-king.png',x:83.85,y:86.70,w:20.35,h:2.00,zIndex:24,label:'大床房价格'},
  legacy_rule_vertical_left:{src:'./assets/psd-portrait/rule-vertical-left.png',x:35.63,y:82.86,w:.57,h:17.72,zIndex:25,label:'左侧竖线'},
  legacy_rule_vertical_right:{src:'./assets/psd-portrait/rule-vertical-right.png',x:69.13,y:82.86,w:.58,h:17.72,zIndex:25,label:'右侧竖线'},
  legacy_rule_horizontal_left:{src:'./assets/psd-portrait/rule-horizontal-left.png',x:20.38,y:80.18,w:24.39,h:.79,zIndex:25,label:'左侧横线'},
  legacy_rule_horizontal_center:{src:'./assets/psd-portrait/rule-horizontal-center.png',x:52.25,y:80.18,w:27.58,h:.79,zIndex:25,label:'中间横线'},
  legacy_rule_horizontal_right:{src:'./assets/psd-portrait/rule-horizontal-right.png',x:84.12,y:80.18,w:24.36,h:.79,zIndex:25,label:'右侧横线'},
  legacy_dot_1:{src:'./assets/psd-portrait/dot-1.png',x:17.29,y:93.11,w:2.92,h:1.94,zIndex:26,label:'电话圆点'},
  legacy_dot_2:{src:'./assets/psd-portrait/dot-2.png',x:47.12,y:92.99,w:2.92,h:1.94,zIndex:26,label:'地址圆点'},
  legacy_qr:{src:'./assets/psd-portrait/qr-code.png',x:8.24,y:93.00,w:7.58,h:5.06,zIndex:26,label:'二维码'},
  legacy_phone:{src:'./assets/psd-portrait/phone.png',x:29.20,y:92.98,w:20.08,h:1.56,zIndex:27,label:'联系电话'},
  legacy_address:{src:'./assets/psd-portrait/address.png',x:67.10,y:92.86,w:36.17,h:2.00,zIndex:27,label:'酒店地址'}
};

const templates = [
  { id:'daily-warm-luxury', category:'daily', format:'landscape', name:'暖棕轻奢客房', description:'适合高级客房、品质住宿和舒适体验', image:'./assets/daily-warm-luxury.png', badge:'日常运营', style:'warm', layout:'left', decor:'branch', decorAsset:'./assets/decor-botanical.png', panelAsset:'./assets/panel-warm.png', decorSize:22, copy:{ kicker:'礼遇沉浸式客房体验', title:'奢适居所，\n静享从容旅居', body:'甄选高品质软装配置，开阔通透空间，兼顾休息舒适度与商务便利性。\n卸下旅途疲惫，于方寸之间感受细腻周到的居住礼遇。', tagline:'舒适睡眠  ·  惬意休息  ·  商务便利  ·  贴心礼遇' } },
  { id:'daily-night-bath', category:'daily', format:'landscape', name:'夜景浴缸套房', description:'适合夜景房、浴缸房和松弛感内容', image:'./assets/daily-night-bath.png', badge:'日常运营', style:'midnight', layout:'left', decor:'stars', decorAsset:'./assets/decor-midnight-stars.png', panelAsset:'./assets/panel-night-bath.png', decorSize:16, decorPosition:{x:28,y:22}, copy:{ kicker:'窗边浴缸｜夜色景观｜舒缓放松', title:'云景浴缸套房', body:'清透窗景与温润光线构成放松场域，空间层次在夜色中显得静谧而舒展。', tagline:'*景观与配置以实际客房为准' } },
  // 该模板严格对应 Figma 画板「01｜云境商务客房」：
  // 底层只放纯实景图；蒙层、分隔线/光点、三个图标和文字均为独立图层。
  { id:'daily-business-room', category:'daily', format:'landscape', name:'云境商务客房', description:'适合商务出行、城市景观和高效办公', image:'./assets/hotel-room-ai.jpg', preview:'./assets/daily-business-room-figma.png', badge:'日常运营', style:'business', layout:'left', panelWidth:37.5, overlayGradient:true, overlayTransparency:0, showRule:true,
    // Figma 中的三个线性图标已栅格化为透明 PNG，避免编辑器渲染 SVG 时出现
    // 描边粗细和缩放差异；每个图标仍保持独立图层，可单独移动或删除。
    iconAssets:{work:'./assets/business-icon-work.png',city:'./assets/business-icon-city.png',sleep:'./assets/business-icon-sleep.png'},
    iconPositions:{work:{x:7.64,y:55.05,w:3.59,h:7.31},city:{x:18.80,y:55.05,w:3.91,h:7.13},sleep:{x:28.70,y:55.05,w:3.59,h:7.04}},
    assetLayers:{businessRule:{src:'./assets/decor-business-rule.png',x:18.0,y:22.50,w:26.56,h:.10,zIndex:2},businessGlow:{src:'./assets/decor-business-glow.png',x:8.85,y:22.50,w:3.33,h:5.93,zIndex:2},businessDot:{src:'./assets/decor-business-dot.png',x:8.85,y:22.50,w:.63,h:1.11,zIndex:3}},
    logoPosition:{x:4.79,y:6.20},
    // Figma 文本框约 498px；浏览器中不同字库的字面宽度略有差异，
    // 这里给主标题留出 27% 的安全宽度，避免最后一个字被换行裁掉。
    textPosition:{brand:{x:3.02,y:4.35,w:12.50,h:4.50},rule:{x:4.69,y:22.50,w:26.56,h:.10},accentDot:{x:8.85,y:22.50},accentGlow:{x:8.85,y:22.50},title:{x:4.69,y:28.61,w:27.00,h:10.46},subtitle:{x:4.90,y:42.04,w:24.50,h:3.52},feature1:{x:5.47,y:59.63,w:4.38,h:2.69},feature2:{x:16.56,y:59.63,w:4.38,h:2.69},feature3:{x:26.61,y:59.63,w:4.38,h:2.69},body:{x:4.69,y:66.94,w:21.25,h:11.57},tagline:{x:4.79,y:91.85,w:24.00,h:3.40}},
    textDefaults:{brand:{fontSize:33,lineHeight:1.2},title:{fontSize:83,lineHeight:1.12},subtitle:{fontSize:28,lineHeight:1.35},feature1:{fontSize:21,lineHeight:1.2},feature2:{fontSize:21,lineHeight:1.2},feature3:{fontSize:21,lineHeight:1.2},body:{fontSize:24,lineHeight:1.92},tagline:{fontSize:18,lineHeight:1.35}},
    copy:{ brand:'T Hotel', title:'云境商务客房', subtitle:'高效办公  |  城市视野  |  舒适睡眠', feature1:'高效办公', feature2:'城市视野', feature3:'舒适睡眠', body:'办公与休憩区域清晰衔接，简洁动线\n与柔和灯光共同营造稳定、专注且放松\n的入住体验。', tagline:'*房间配置以实际入住安排为准' } },
  // 04｜雅韵庭居客房：场景图、纸张蒙版、竹叶与线稿装饰分别作为独立图层。
  { id:'daily-japanese-room', category:'daily', format:'landscape', name:'04｜雅韵庭居客房', description:'东方木色、留白纸张与静雅客房氛围', image:'./assets/scene-japanese-room.jpg', preview:'./assets/template-japanese-room.png', badge:'日常运营', style:'parchment', layout:'left', structured:true, textLayerKeys:['brand','title','subtitle','body'], hideTagline:true, showRule:false, panelAsset:'./assets/panel-japanese-visible.png',
    // 使用按 alpha 可见范围裁切的 PNG，选中框只包住实际蒙层，不再整屏显示。
    panelPosition:{x:0,y:47.037,w:55.573,h:52.963},
    assetLayers:{jpTop:{src:'./assets/decor-japanese-top.png',x:6.25,y:50.9,w:9.9,h:6.9,zIndex:2},jpSeal:{src:'./assets/decor-japanese-seal.png',x:4.5,y:69.3,w:3.75,h:9.45,zIndex:2},jpBottom:{src:'./assets/decor-japanese-bottom-line.png',x:4.0,y:90.7,w:8.0,h:6.2,zIndex:2},jpBamboo:{src:'./assets/decor-japanese-bamboo.png',x:29.4,y:94.6,w:26.8,h:21.0,zIndex:2}},
    // Keep the copy blocks close together like the supplied reference: the
    // subtitle begins just below the title and the body follows immediately,
    // without the large empty bands that made the previous layout feel loose.
    textPosition:{brand:{x:86.8,y:3.4,w:10.8,h:5},title:{x:7.6,y:58.5,w:34.5,h:9.5},subtitle:{x:7.5,y:69.4,w:34,h:5},body:{x:7.5,y:75.8,w:34,h:16},tagline:{x:2.8,y:92.6,w:36,h:4}},
    textDefaults:{brand:{fontSize:32,lineHeight:1.2},title:{fontSize:73,lineHeight:1.08},subtitle:{fontSize:27,lineHeight:1.25},body:{fontSize:23,lineHeight:1.75},tagline:{fontSize:18,lineHeight:1.35}},
    palette:{brand:'#44392f',title:'#44392f',subtitle:'#5e5043',body:'#5e5043',tagline:'#5e5043'},
    copy:{brand:'',title:'雅韵庭居客房',subtitle:'东方格调  |  温润木色  |  静雅休憩',body:'含蓄线条与木色肌理延展空间层次，\n安静灯光与素雅陈设营造平和、\n舒适的居停感受。',tagline:''} },
  // 05｜艺境设计客房：左侧曲线纸张与签名字样是透明 PNG，方便单独移动或删除。
  { id:'daily-art-design-room', category:'daily', format:'landscape', name:'05｜艺境设计客房', description:'艺术陈设、质感材质与沉浸式灯光氛围', image:'./assets/scene-art-room-v3.jpg', preview:'./assets/template-art-room.png', badge:'日常运营', style:'parchment', layout:'left', structured:true, showRule:true, panelAsset:'./assets/panel-art-template-visible.png',
    // 使用按 alpha 可见范围裁切的 PNG，选中框只包住左侧实际曲线蒙层。
    panelPosition:{x:0,y:0,w:45.417,h:100},
    assetLayers:{artArc:{src:'./assets/decor-art-arc.png',x:23.4,y:17.8,w:17.7,h:35.6,zIndex:2},artSignature:{src:'./assets/decor-art-signature.png',x:28.0,y:89.4,w:49.2,h:21.5,zIndex:2}},
    textPosition:{brand:{x:3.0,y:3.1,w:15,h:5},title:{x:3.0,y:38.0,w:38,h:10},subtitle:{x:3.2,y:52.1,w:36,h:5},rule:{x:3.2,y:59.9,w:3.3,h:.35},body:{x:3.2,y:64.0,w:35,h:16},tagline:{x:3.0,y:92.8,w:30,h:4}},
    textDefaults:{brand:{fontSize:32,lineHeight:1.2},title:{fontSize:80,lineHeight:1.12},subtitle:{fontSize:27,lineHeight:1.35},body:{fontSize:23,lineHeight:2},tagline:{fontSize:18,lineHeight:1.35}},
    palette:{brand:'#9c7b43',title:'#5a3f1c',subtitle:'#8b6b37',body:'#58432a',tagline:'#5a3f1c',rule:'#c39a4a'},
    copy:{brand:'',title:'艺境设计客房',subtitle:'艺术陈设  |  质感材质  |  沉浸氛围',body:'墙面肌理、灯光层次与精致软装共同构成\n富有个性的空间表情，兼具视觉品位与\n舒适体验。',tagline:'*软装细节以实际客房为准'} },
  // 03｜法式雅韵客房：严格对应 Figma node-id=11-3 的图层顺序。
  // hotel-room-photo 是最底层实景；canvas-image (69) (1) 1 已导出为
  // panel-french-figma.png，包含卡片边框、纸张质感及上下花饰；其余均为可编辑文字层。
  { id:'daily-french-room', category:'daily', format:'landscape', name:'03｜法式雅韵客房', description:'复古线条、柔和织物与优雅客房氛围', image:'./assets/scene-french-room.jpg', preview:'./assets/template-french-room-figma.png', badge:'日常运营', style:'classic', layout:'left', structured:true, showRule:false, panelAsset:'./assets/panel-french-figma.png', overlayTransparency:0,
    // Figma canvas-image (69) (1) 1：X=19，Y=248，W=735，H=648。
    panelPosition:{x:0.99,y:22.96,w:38.28,h:60.00},
    textAlign:{body:'center'},
    // 文字位置采用 Figma 画板上的绝对坐标换算为百分比。
    textPosition:{brand:{x:4.27,y:4.35,w:6.00,h:4.00},title:{x:9.79,y:37.96,w:26.00,h:9.35},subtitle:{x:7.63,y:49.54,w:27.50,h:3.43},body:{x:7.63,y:58.80,w:27.50,h:9.20},tagline:{x:15.26,y:71.76,w:13.50,h:2.31}},
    // Figma records letter spacing in design pixels.  Use em values here so
    // the spacing scales with the responsive canvas instead of becoming a
    // fixed 7px gap that clips Chinese glyphs in the browser preview.
    letterSpacing:{brand:'.18em',title:'.095em',subtitle:'.111em',body:'.052em',tagline:'.056em'},
    textDefaults:{brand:{fontSize:24,lineHeight:1.2},title:{fontSize:74,lineHeight:1.36},subtitle:{fontSize:27,lineHeight:1.37},body:{fontSize:23,lineHeight:2},tagline:{fontSize:18,lineHeight:1.39}},
    palette:{brand:'#5b3a28',title:'#5b3a28',subtitle:'#b38e77',body:'#674433',tagline:'#84634a'},
    copy:{brand:'T Hotel',title:'法式雅韵客房',subtitle:'复古线条  |  柔和织物  |  优雅氛围',body:'细腻线脚与温柔色调勾勒优雅轮廓，\n空间在复古与舒适之间保持恰到好处的松弛感。',tagline:'*软装细节以实际客房为准'} },
  // 《行政景观套房》：直接映射源 PSD 的 16 个叶子图层和原始顺序。
  { id:'psd-admin-suite-landscape', category:'daily', format:'landscape', ratioLabel:'横版 1920×1080', canvasSize:{width:1920,height:1080}, name:'PSD｜行政景观套房', description:'严格按 PSD 原图层还原，7 处文字可编辑', image:'./assets/psd-admin-suite-landscape/admin_suite_background.png', preview:'./assets/psd-admin-suite-landscape/preview.png', badge:'PSD 分层', style:'classic', layout:'left', structured:true, psdLayered:true, photoMode:'asset', replaceablePhotoLayer:'admin_suite_background', logoLayerKey:'admin_suite_logo_placeholder', skipPanel:true, overlayTransparency:0, assetLayers:psdAdminSuiteAssetLayers, psdTextLayers:psdAdminSuiteTextLayers, textPosition:psdAdminSuiteTextPosition,
    textLayerKeys:[], textDefaults:{}, copy:{brand:'',title:'',subtitle:'',body:'',tagline:''} },
  { id:'psd-breakfast-time-landscape', category:'daily', format:'landscape', ratioLabel:'横版 1920×1080', canvasSize:{width:1920,height:1080}, name:'PSD｜早餐时光', description:'严格按 PSD 原图层还原，5 处文字可编辑', image:'./assets/psd-breakfast-time-landscape/breakfast_background.png', preview:'./assets/psd-breakfast-time-landscape/preview.png', badge:'PSD 分层', style:'classic', layout:'left', structured:true, psdLayered:true, photoMode:'asset', replaceablePhotoLayer:'breakfast_background', hideGenericAssets:true, skipPanel:true, overlayTransparency:0, assetLayers:psdBreakfastAssetLayers, psdTextLayers:psdBreakfastTextLayers, textPosition:psdBreakfastTextPosition,
    textLayerKeys:[], textDefaults:{}, copy:{brand:'',title:'',subtitle:'',body:'',tagline:''} },
  { id:'psd-room-service-landscape', category:'daily', format:'landscape', ratioLabel:'横版 1920×1080', canvasSize:{width:1920,height:1080}, name:'PSD｜客房服务', description:'严格按 PSD 原图层还原，5 处文字可编辑', image:'./assets/psd-room-service-landscape/room_service_background.png', preview:'./assets/psd-room-service-landscape/preview.png', badge:'PSD 分层', style:'classic', layout:'right', structured:true, psdLayered:true, photoMode:'asset', replaceablePhotoLayer:'room_service_background', logoLayerKey:'room_service_logo_placeholder', hideGenericAssets:true, skipPanel:true, overlayTransparency:0, assetLayers:psdRoomServiceAssetLayers, psdTextLayers:psdRoomServiceTextLayers, textPosition:psdRoomServiceTextPosition,
    textLayerKeys:[], textDefaults:{}, copy:{brand:'',title:'',subtitle:'',body:'',tagline:''} },
  // 旧版模板库中的 PSD 还原海报：保留原卡片和全部独立 PNG 图层。
  // 它与新的暑假 PSD 使用不同画幅，不能复用同一个 canvas class。
  { id:'psd-legacy-resort-portrait', category:'daily', format:'portrait', ratioLabel:'竖版 2:3', canvasSize:{width:1200,height:1800}, canvasClass:'psd-legacy-portrait', name:'PSD｜休闲度假酒店', description:'按 PSD 原始分层还原的竖版海报', image:'./assets/psd-portrait/room-photo.png', preview:'./assets/psd-portrait/preview.png', badge:'PSD 还原', style:'classic', layout:'left', structured:true, rasterOnly:true, textLayerKeys:[], photoMode:'asset', replaceablePhotoLayer:'legacy_room_photo', skipPanel:true, overlayTransparency:0, assetLayers:psdLegacyPortraitAssetLayers, copy:{brand:'',title:'',subtitle:'',body:'',tagline:''} },
  // 《满房海报.psd》：1152 × 2048 竖版原始图层，2 个像素层 + 4 个可编辑文字层。
  { id:'psd-full-house-portrait', category:'daily', format:'portrait', ratioLabel:'竖版 9:16', canvasSize:{width:1152,height:2048}, canvasClass:'psd-full-house-portrait', name:'PSD｜满房海报', description:'严格按 PSD 原图层还原，4 处文字可编辑', image:'./assets/psd-full-house-portrait/full_house_background.png', preview:'./assets/psd-full-house-portrait/preview.png', badge:'PSD 分层', style:'classic', layout:'left', structured:true, psdLayered:true, photoMode:'asset', replaceablePhotoLayer:'full_house_background', hideGenericAssets:true, skipPanel:true, overlayTransparency:0, assetLayers:psdFullHouseAssetLayers, psdTextLayers:psdFullHouseTextLayers, textPosition:psdFullHouseTextPosition, textLayerKeys:[], textDefaults:{}, textAlign:{full_house_title:'center',full_house_english_title:'center',full_house_note:'center',full_house_next_note:'center'}, copy:{brand:'',title:'',subtitle:'',body:'',tagline:''} },
  // 《TCL-Hotel-Dinner-Layered-72DPI.psd》：941 × 1672 竖版原始图层。
  // 隐藏的无字修复背景保持在 metadata 中；19 个可见非文字图层和
  // 10 个 Type 图层均按原始图层顺序导入，文字仍可双击编辑。
  { id:'psd-dinner-hotel-portrait', category:'daily', format:'portrait', ratioLabel:'竖版 941×1672', canvasSize:{width:941,height:1672}, canvasClass:'psd-dinner-portrait', name:'PSD｜TCL酒店自助晚餐', description:'严格按 PSD 原图层还原，10 处文字可编辑', image:'./assets/psd-dinner-portrait/dinner_scene.png', preview:'./assets/psd-dinner-portrait/preview.png', badge:'PSD 分层', style:'classic', layout:'left', structured:true, psdLayered:true, photoMode:'asset', replaceablePhotoLayer:'dinner_scene', logoLayerKey:'dinner_logo', hideGenericAssets:true, skipPanel:true, overlayTransparency:0, assetLayers:psdDinnerAssetLayers, psdTextLayers:psdDinnerTextLayers, textPosition:psdDinnerTextPosition, textLayerKeys:[], textDefaults:{}, textAlign:{dinner_title_brand:'center',dinner_title_dinner:'center',dinner_subtitle:'center',dinner_feature_environment:'center',dinner_feature_dishes:'center',dinner_feature_quality:'center',dinner_contact_hotline_label:'center',dinner_contact_hotline:'center',dinner_contact_address_label:'center',dinner_contact_address:'center'}, copy:{brand:'',title:'',subtitle:'',body:'',tagline:''} },
  { id:'psd-mid-autumn-seaview-portrait', category:'festival', format:'portrait', ratioLabel:'竖版 2048×3072', canvasSize:{width:2048,height:3072}, canvasClass:'psd-mid-autumn-portrait', name:'PSD｜中秋海景酒店', description:'中秋海景酒店节日促销海报，37 处文字可编辑', image:'./assets/psd-mid-autumn-seaview-portrait/mid_autumn_01.png', preview:'./assets/psd-mid-autumn-seaview-portrait/preview.png?v=detail-dom-1', badge:'节日运营', style:'classic', layout:'left', structured:true, psdLayered:true, photoMode:'asset', replaceablePhotoLayer:'mid_autumn_01', hideGenericAssets:true, skipPanel:true, overlayTransparency:0, assetLayers:psdMidAutumnAssetLayers, psdTextLayers:psdMidAutumnTextLayers, textPosition:psdMidAutumnTextPosition, hiddenLayers:psdMidAutumnHiddenLayers, textLayerKeys:[], textDefaults:{}, textAlign:Object.fromEntries(Object.keys(psdMidAutumnTextLayers).map(key=>[key,'center'])), copy:{brand:'',title:'',subtitle:'',body:'',tagline:''} },
  { id:'psd-new-year-portrait', category:'festival', format:'portrait', ratioLabel:'竖版 2048×3072', canvasSize:{width:2048,height:3072}, canvasClass:'psd-new-year-portrait', name:'PSD｜元旦海报', description:'元旦节日促销海报，15 处文字可编辑', image:'./assets/psd-new-year-portrait/new_year_01.png', preview:'./assets/psd-new-year-portrait/preview.png?v=new-year-20260923', badge:'节日运营', style:'classic', layout:'left', structured:true, psdLayered:true, photoMode:'asset', replaceablePhotoLayer:'new_year_01', hideGenericAssets:true, skipPanel:true, overlayTransparency:0, assetLayers:psdNewYearAssetLayers, psdTextLayers:psdNewYearTextLayers, textPosition:psdNewYearTextPosition, hiddenLayers:psdNewYearHiddenLayers, textLayerKeys:[], textDefaults:{}, textAlign:Object.fromEntries(Object.keys(psdNewYearTextLayers).map(key=>[key,'center'])), copy:{brand:'',title:'',subtitle:'',body:'',tagline:''} },
  { id:'room-daily-portrait', category:'daily', format:'portrait', name:'客房氛围海报', description:'竖版构图，适合朋友圈和社交媒体', image:'./assets/room-clean.png', badge:'日常运营', title:'住进一场\n好好休息' },
  // 《暑假特惠海报.psd》：原文件 937 × 1679，按 Photoshop 图层原顺序
  // 导入。像素/智能对象保持独立 PNG；全部 Type 图层在画布中双击可编辑。
  { id:'psd-summer-hotel-portrait', category:'daily', format:'portrait', ratioLabel:'竖版 937×1679', canvasSize:{width:937,height:1679}, canvasClass:'psd-portrait', name:'PSD｜暑假特惠海报', description:'严格按 PSD 分层还原，全部文字可编辑', image:'./assets/psd-summer-portrait/psd_room_photo.png', preview:'./assets/psd-summer-portrait/preview.png', badge:'PSD 分层', style:'classic', layout:'left', structured:true, psdLayered:true, photoMode:'asset', replaceablePhotoLayer:'psd_room_photo', skipPanel:true, overlayTransparency:0, assetLayers:psdPortraitAssetLayers, psdTextLayers:psdPortraitTextLayers, textPosition:psdPortraitTextPosition,
    textLayerKeys:[], textDefaults:{}, textAlign:{psd_tcl_hotel:'center',psd_brand_subtitle:'center',psd_main_title:'center',psd_promo_copy:'center',psd_benefits_title:'center',psd_benefit_shuttle:'center',psd_benefit_luggage:'center',psd_benefit_breakfast:'center',psd_benefit_expired:'center',psd_room_type:'center',psd_discount_copy:'center'}, copy:{brand:'',title:'',subtitle:'',body:'',tagline:''} },
  { id:'room-festival-landscape', category:'festival', format:'landscape', name:'节日入住推荐', description:'节日活动、礼遇信息和限时推广', image:'./assets/bedroom.jpg', badge:'节日运营', title:'把假期\n留给自己' },
  { id:'room-festival-portrait', category:'festival', format:'portrait', name:'假期好眠计划', description:'适合节假日预订和客房促销', image:'./assets/bedroom.jpg', badge:'节日运营', title:'睡个好觉\n再出发' },
  { id:'bath-daily-portrait', category:'daily', format:'portrait', name:'浴室松弛时刻', description:'柔和留白，适合生活方式内容', image:'./assets/bathroom.jpg', badge:'日常运营', title:'洗去疲惫\n慢慢放松' },
];

// 模板卡片需要展示完整效果图，但编辑器底层只能使用纯实景照片。
// 这里把两类素材明确分开，避免把带有文字/装饰的模板成品误当成场景图。
const sceneAssets = {
  'daily-warm-luxury':'./assets/scene-warm-luxury.png',
  'daily-night-bath':'./assets/scene-night-bath.png',
  // v2 uses the clean bedroom scene; the new filename also prevents an older
  // cached TV-room asset from being reused by an already-open file page.
  'daily-business-room':'./assets/hotel-room-ai.jpg'
};

templates.forEach(template => {
  if (sceneAssets[template.id]) {
    template.preview = template.preview || template.image;
    template.image = sceneAssets[template.id];
  }
});

// 风格参考图是独立的纯海报位图，不使用包含操作界面的演示截图。
const styleReferenceAssets = {
  'daily-warm-luxury': './assets/style-warm-luxury-reference.png'
};
templates.forEach(template => {
  if (styleReferenceAssets[template.id]) template.preview = styleReferenceAssets[template.id];
});

// 顶部精选风格卡走 AI 做同款：模型参考风格图与用户素材生成一张完整海报。
// 下方全部酒店运营模板走本地拆分图层编辑，保证文字清晰可编辑。
const stylePacks = [
  { id:'smart', referenceId:'daily-warm-luxury', style:'smart', name:'智能推荐', note:'根据实景与需求自动匹配色调和版式', tags:['AI 自动判断','推荐'] },
  { id:'daily-warm-luxury', excludeFromLibrary:true, name:'暖棕轻奢', note:'柔和暖光 · 低饱和棕色 · 高级客房', tags:['暖调','高级感','客房'] },
  { id:'daily-night-bath', excludeFromLibrary:true, name:'夜景松弛', note:'深蓝夜景 · 金色细节 · 安静氛围', tags:['深色','夜景','松弛感'] },
  { id:'daily-japanese-room', name:'日式留白', note:'原木、米白与克制留白，适合静雅空间', tags:['原木','留白','静谧'] },
  { id:'daily-french-room', name:'法式雅韵', note:'柔和奶油色、复古线条与精致细节', tags:['法式','柔和','生活方式'] },
  { id:'daily-business-room', name:'现代商务', note:'深蓝渐变、清晰信息层级与城市视野', tags:['商务','城市','效率'] },
  { id:'daily-art-design-room', name:'艺术画廊', note:'材质肌理、沉浸光影与更大胆的构图', tags:['艺术','质感','设计感'] }
];
const stylePackIds = new Set(stylePacks.filter(pack=>pack.excludeFromLibrary).map(pack=>pack.id));
templates.forEach(template => { template.styleGenerator = stylePackIds.has(template.id); });
// 正式部署时将此地址指向你的服务端代理，由服务端安全调用图片模型。
// 默认不再把本地 Canvas 合成冒充成 AI 生图；只有明确设置 HOTEL_ALLOW_LOCAL_FALLBACK=true 才会开启离线演示。
//
// Demo 经常会出现一个旧的静态页面（例如 4173）和一个真正的模型服务（4174/4175/4180）
// 同时打开的情况。不要把接口地址永远锁死在当前页面的相对路径上，否则旧页面会只显示
// 浏览器原生的 “Failed to fetch”。在本机 Demo 中按顺序尝试当前页面、4174-4178、4180。
const MODEL_GENERATE_ENDPOINT = window.HOTEL_MODEL_ENDPOINT || '';
const MODEL_SERVICE_PORTS = [4174, 4175, 4176, 4177, 4178, 4180];
const ALLOW_LOCAL_FALLBACK = window.HOTEL_ALLOW_LOCAL_FALLBACK === true;

function modelEndpointCandidates(){
  if (MODEL_GENERATE_ENDPOINT) return [MODEL_GENERATE_ENDPOINT];
  const candidates=[];
  const pageProtocol=window.location.protocol;
  const pageHost=window.location.hostname;
  if (pageProtocol !== 'file:') candidates.push('/api/generate-poster');
  if (pageProtocol === 'http:' || pageProtocol === 'https:' || pageProtocol === 'file:') {
    const host=pageHost === 'localhost' ? 'localhost' : '127.0.0.1';
    MODEL_SERVICE_PORTS.forEach(port=>candidates.push(`http://${host}:${port}/api/generate-poster`));
  }
  return [...new Set(candidates)];
}

// 配置弹窗和模型生成共用同一组本地服务探测地址，支持用户直接双击
// 打开的 file:// 页面，也支持从 4174-4178 或 4180 任一端口启动的本地服务。
function modelServiceEndpointCandidates(pathname){
  const path=String(pathname||'/api/config');
  const candidates=[];
  if(MODEL_GENERATE_ENDPOINT){
    try{
      const custom=new URL(MODEL_GENERATE_ENDPOINT,window.location.href);
      custom.pathname=path; custom.search=''; custom.hash='';
      candidates.push(custom.toString());
    }catch{}
  }
  if(window.location.protocol!=='file:')candidates.push(path);
  if(['file:','http:','https:'].includes(window.location.protocol)){
    const host=window.location.hostname==='localhost'?'localhost':'127.0.0.1';
    MODEL_SERVICE_PORTS.forEach(port=>candidates.push(`http://${host}:${port}${path}`));
  }
  return [...new Set(candidates)];
}

const apiConfigState={provider:'company',configured:false,model:'gpt-image-2',apiBaseUrl:'https://coding.efficient.center/api/v1',videoModel:'doubao-seedance-2-5-260628',videoApiBaseUrl:'https://live-turing.cn.llm.tcljd.com/api/v1',audioModel:'turing/tts-1',editModel:'turing/gpt-4o-mini',asrModel:'',actorAuthorization:'image-generation',quality:'medium',endpoint:''};
function apiProviderLabel(provider){return provider==='doubao'?'豆包 Seedream':'公司 GPT‑Image（公司会员）'}
function setApiConfigMessage(message,isError=false){const node=$('#apiConfigMessage');if(!node)return;node.textContent=message||'';node.classList.toggle('is-error',Boolean(isError))}
function friendlyApiConfigError(error){
  const message=String(error?.message||'');
  if(/failed to fetch|networkerror|load failed|网络错误/i.test(message))return window.location.protocol==='file:'?'无法连接本地 API 服务。你现在打开的是 file:// 页面，请先双击 demo/start-local.command，再刷新页面后保存配置。':'无法连接本地 API 服务，请重新启动 demo/start-local.command 后再保存配置。';
  return message||'API 配置失败，请确认本地服务已启动。';
}
function syncPrivacyForApi(){
  const privacy=$('#privacyStatus'); if(!privacy)return;
  if(apiConfigState.configured)privacy.textContent=`已配置${apiProviderLabel(apiConfigState.provider)} · 图片、视频和音频共用 API Key，Key 仅保存在本机`;
  else if(activeWorkspace==='templates')privacy.textContent='本地编辑 · 素材不上传';
  else privacy.textContent='本地处理 · 素材不上传';
}
function syncApiConfigButton(){
  const button=$('#apiConfigButton'),status=$('#apiConfigStatus'); if(!button||!status)return;
  button.classList.toggle('is-configured',Boolean(apiConfigState.configured));
  status.textContent=apiConfigState.configured?'已配置':'未配置';
  button.title=apiConfigState.configured?`图片、视频与音频共用 API Key · 点击查看配置`:'配置图片、视频与音频共用的 API Key';
  syncPrivacyForApi();
}
function syncApiConfigFields(){
  const provider=$('#apiProviderInput')?.value||apiConfigState.provider;
  const company=provider==='company';
  const actor=$('#apiActorField'); if(actor)actor.hidden=!company;
  const key=$('#apiKeyInput'); if(key){key.placeholder=apiConfigState.configured?'图片、视频和音频共用 Key 已配置；留空可继续使用，替换时重新粘贴':'粘贴公司平台发放的 API Key，不要包含 Bearer'}
  const model=$('#apiModelInput'); if(model&&!model.value)model.value=company?'gpt-image-2':'doubao-seedream-5-0-260128';
  const base=$('#apiBaseUrlInput'); if(base&&!base.value)base.value=company?'https://coding.efficient.center/api/v1':'https://ark.cn-beijing.volces.com/api/v3';
  const videoModel=$('#apiVideoModelInput'); if(videoModel&&!videoModel.value)videoModel.value=apiConfigState.videoModel;
  const videoBase=$('#apiVideoBaseUrlInput'); if(videoBase&&!videoBase.value)videoBase.value=apiConfigState.videoApiBaseUrl;
  const audioModel=$('#apiAudioModelInput'); if(audioModel&&!audioModel.value)audioModel.value=apiConfigState.audioModel;
  const editModel=$('#apiEditModelInput'); if(editModel&&!editModel.value)editModel.value=apiConfigState.editModel;
  const asrModel=$('#apiAsrModelInput'); if(asrModel&&!asrModel.value)asrModel.value=apiConfigState.asrModel;
}
function applyApiConfigToForm(status={}){
  apiConfigState.provider=status.provider||apiConfigState.provider;
  apiConfigState.configured=Boolean(status.configured);
  apiConfigState.model=status.model|| (apiConfigState.provider==='doubao'?'doubao-seedream-5-0-260128':'gpt-image-2');
  apiConfigState.apiBaseUrl=status.apiBaseUrl|| (apiConfigState.provider==='doubao'?'https://ark.cn-beijing.volces.com/api/v3':'https://coding.efficient.center/api/v1');
  apiConfigState.videoModel=status.videoModel||'doubao-seedance-2-5-260628';
  apiConfigState.videoApiBaseUrl=status.videoApiBaseUrl||'https://live-turing.cn.llm.tcljd.com/api/v1';
  apiConfigState.audioModel=status.audioModel||'turing/tts-1';
  apiConfigState.editModel=status.editModel||'turing/gpt-4o-mini';
  apiConfigState.asrModel=status.asrModel||'';
  apiConfigState.actorAuthorization=status.actorAuthorization||'image-generation';
  apiConfigState.quality=status.quality||'medium';
  const provider=$('#apiProviderInput'),model=$('#apiModelInput'),base=$('#apiBaseUrlInput'),videoModel=$('#apiVideoModelInput'),videoBase=$('#apiVideoBaseUrlInput'),audioModel=$('#apiAudioModelInput'),editModel=$('#apiEditModelInput'),asrModel=$('#apiAsrModelInput'),actor=$('#apiActorInput');
  if(provider)provider.value=apiConfigState.provider;
  if(model)model.value=apiConfigState.model;
  if(base)base.value=apiConfigState.apiBaseUrl;
  if(videoModel)videoModel.value=apiConfigState.videoModel;
  if(videoBase)videoBase.value=apiConfigState.videoApiBaseUrl;
  if(audioModel)audioModel.value=apiConfigState.audioModel;
  if(editModel)editModel.value=apiConfigState.editModel;
  if(asrModel)asrModel.value=apiConfigState.asrModel;
  if(actor)actor.value=apiConfigState.actorAuthorization;
  syncApiConfigFields(); syncApiConfigButton();
}
async function fetchApiConfigStatus({silent=false}={}){
  let lastError=null;
  for(const endpoint of modelServiceEndpointCandidates('/api/config')){
    try{
      const response=await fetch(endpoint,{cache:'no-store'});
      if([404,405,501].includes(response.status))continue;
      const payload=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(payload?.error||`本地服务返回 ${response.status}`);
      apiConfigState.endpoint=endpoint.replace(/\/api\/config\/?$/,'');
      applyApiConfigToForm(payload);
      return payload;
    }catch(error){lastError=error}
  }
  if(!silent)setApiConfigMessage('找不到本地服务。请先双击 start-local.command 启动应用，再保存配置。',true);
  return null;
}
async function postApiConfig(payload){
  let lastError=null;
  for(const endpoint of modelServiceEndpointCandidates('/api/config')){
    try{
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      if([404,405,501].includes(response.status))continue;
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data?.error||`本地服务返回 ${response.status}`);
      apiConfigState.endpoint=endpoint.replace(/\/api\/config\/?$/,'');
      return data;
    }catch(error){lastError=error}
  }
  throw lastError||new Error('无法连接本地服务');
}
async function deleteApiConfig(){
  let lastError=null;
  for(const endpoint of modelServiceEndpointCandidates('/api/config')){
    try{
      const response=await fetch(endpoint,{method:'DELETE'});
      if([404,405,501].includes(response.status))continue;
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data?.error||`本地服务返回 ${response.status}`);
      return data;
    }catch(error){lastError=error}
  }
  throw lastError||new Error('无法连接本地服务');
}
function openApiConfig(){
  const modal=$('#apiConfigModal'); if(!modal)return;
  modal.hidden=false; modal.setAttribute('aria-hidden','false'); document.body.classList.add('api-modal-open');
  setApiConfigMessage('正在读取本机服务状态…');
  const key=$('#apiKeyInput'); if(key){key.value='';key.type='password'}
  const toggle=$('#apiKeyToggle'); if(toggle)toggle.textContent='显示';
  fetchApiConfigStatus().then(status=>{if(status)setApiConfigMessage(status.configured?`当前图片模型：${apiProviderLabel(status.provider)} · ${status.model}；音频模型：${status.audioModel||'turing/tts-1'}。`:'尚未配置，请输入图片、视频和音频共用的 API Key。')});
  window.setTimeout(()=>key?.focus(),50);
}
function closeApiConfig(){const modal=$('#apiConfigModal');if(!modal)return;modal.hidden=true;modal.setAttribute('aria-hidden','true');document.body.classList.remove('api-modal-open');setApiConfigMessage('')}
async function saveApiConfigFromForm(){
  const provider=$('#apiProviderInput')?.value||'company';
  const apiKey=$('#apiKeyInput')?.value.trim()||'';
  const model=$('#apiModelInput')?.value.trim()||'';
  const apiBaseUrl=$('#apiBaseUrlInput')?.value.trim()||'';
  const videoModel=$('#apiVideoModelInput')?.value.trim()||'';
  const videoApiBaseUrl=$('#apiVideoBaseUrlInput')?.value.trim()||'';
  const audioModel=$('#apiAudioModelInput')?.value.trim()||'';
  const editModel=$('#apiEditModelInput')?.value.trim()||'';
  const asrModel=$('#apiAsrModelInput')?.value.trim()||'';
  const actorAuthorization=$('#apiActorInput')?.value.trim()||'';
  if(!model){setApiConfigMessage('请填写模型 ID。',true);$('#apiModelInput')?.focus();return}
  if(!videoModel){setApiConfigMessage('请填写视频模型 ID。',true);$('#apiVideoModelInput')?.focus();return}
  if(!audioModel){setApiConfigMessage('请填写音频模型 ID。',true);$('#apiAudioModelInput')?.focus();return}
  if(!apiConfigState.configured&&!apiKey){
    setApiConfigMessage('请输入图片、视频和音频共用的公司 API Key。',true);$('#apiKeyInput')?.focus();return
  }
  const button=$('#apiSaveButton');if(button){button.disabled=true;button.textContent='连接中…'}setApiConfigMessage('正在把配置发送到本机服务…');
  try{
    const status=await postApiConfig({provider,apiKey,model,apiBaseUrl,videoModel,videoApiBaseUrl,audioModel,editModel,asrModel,actorAuthorization});
    applyApiConfigToForm(status);setApiConfigMessage(`图片、视频和音频接口已保存；API Key 将由本机钥匙串自动恢复。`);
    if(button){button.textContent='已保存 ✓';window.setTimeout(()=>{if(button)button.textContent='保存并连接'},1200)}
  }catch(error){setApiConfigMessage(friendlyApiConfigError(error),true);if(button)button.textContent='保存并连接'}finally{if(button)button.disabled=false}
}
async function clearApiConfigFromForm(){
  const button=$('#apiClearButton');if(button)button.disabled=true;setApiConfigMessage('正在清除本机服务中的运行时 Key…');
  try{const status=await deleteApiConfig();applyApiConfigToForm(status);const key=$('#apiKeyInput');if(key)key.value='';setApiConfigMessage('已清除当前运行时配置和本机钥匙串中的 API Key。')}catch(error){setApiConfigMessage(friendlyApiConfigError(error),true)}finally{if(button)button.disabled=false}
}
function bindApiConfig(){
  $('#apiConfigButton')?.addEventListener('click',openApiConfig);
  $('#apiConfigClose')?.addEventListener('click',closeApiConfig); $('#apiCancelButton')?.addEventListener('click',closeApiConfig); $('[data-api-close]')?.addEventListener('click',closeApiConfig);
  $('#apiProviderInput')?.addEventListener('change',()=>{const provider=$('#apiProviderInput')?.value||'company';const model=$('#apiModelInput'),base=$('#apiBaseUrlInput'),actor=$('#apiActorInput');if(model)model.value=provider==='company'?'gpt-image-2':'doubao-seedream-5-0-260128';if(base)base.value=provider==='company'?'https://coding.efficient.center/api/v1':'https://ark.cn-beijing.volces.com/api/v3';if(actor)actor.value='image-generation';syncApiConfigFields();setApiConfigMessage('图片、视频和音频继续共用同一把 API Key；切换服务商只改变图片模型。')});
  $('#apiKeyToggle')?.addEventListener('click',()=>{const key=$('#apiKeyInput');const toggle=$('#apiKeyToggle');if(!key||!toggle)return;const visible=key.type==='text';key.type=visible?'password':'text';toggle.textContent=visible?'显示':'隐藏'});
  $('#apiSaveButton')?.addEventListener('click',saveApiConfigFromForm); $('#apiClearButton')?.addEventListener('click',clearApiConfigFromForm);
  $('#apiConfigModal')?.addEventListener('keydown',event=>{if(event.key==='Escape')closeApiConfig()});
  syncApiConfigFields(); syncApiConfigButton(); fetchApiConfigStatus({silent:true});
}

function friendlyModelError(error){
  if (error?.name === 'AbortError') return 'AI 图片生成超时，请检查模型服务后重试';
  const message=String(error?.message||'');
  if (/failed to fetch|networkerror|load failed|网络错误/i.test(message)) {
    return '无法连接图片模型服务。请先启动本地服务，再点击右上角「配置 API」输入公司会员 Key。';
  }
  return message || '模型生成失败，请检查图片模型服务后重试';
}

const layerLabels = { photo:'酒店场景图（纯实景底层）', panel:'蒙层', decor:'装饰元素', 'icon-work':'办公图标', 'icon-city':'城市图标', 'icon-sleep':'睡眠图标', jpTop:'顶部线稿', jpSeal:'品牌印章', jpBottom:'底部线稿', jpBamboo:'竹叶装饰', artArc:'弧线装饰', artSignature:'签名装饰', frenchTop:'顶部花饰', frenchBottom:'底部花饰', businessRule:'分隔线', businessDot:'分隔点', businessGlow:'分隔光晕', accentDot:'分隔点', accentGlow:'分隔光晕', kicker:'顶部小标题', title:'主标题', rule:'分隔线', body:'介绍文案', tagline:'底部标语', logo:'品牌 Logo', qr:'二维码' };
Object.assign(layerLabels,{brand:'品牌名',subtitle:'副标题',feature1:'卖点一',feature2:'卖点二',feature3:'卖点三',tagline:'页脚说明'});
Object.entries(psdPortraitTextLayers).forEach(([key,spec])=>{layerLabels[key]=spec.label||spec.value});
Object.entries(psdAdminSuiteTextLayers).forEach(([key,spec])=>{layerLabels[key]=spec.label||spec.value});
layerLabels.admin_suite_logo_placeholder='品牌 Logo';
Object.entries(psdBreakfastAssetLayers).forEach(([key,spec])=>{layerLabels[key]=spec.label||key});
Object.entries(psdBreakfastTextLayers).forEach(([key,spec])=>{layerLabels[key]=spec.label||spec.value});
Object.entries(psdRoomServiceAssetLayers).forEach(([key,spec])=>{layerLabels[key]=spec.label||key});
Object.entries(psdRoomServiceTextLayers).forEach(([key,spec])=>{layerLabels[key]=spec.label||spec.value});
Object.entries(psdFullHouseAssetLayers).forEach(([key,spec])=>{layerLabels[key]=spec.label||key});
Object.entries(psdFullHouseTextLayers).forEach(([key,spec])=>{layerLabels[key]=spec.label||spec.value});
Object.entries(psdDinnerAssetLayers).forEach(([key,spec])=>{layerLabels[key]=spec.label||key});
Object.entries(psdDinnerTextLayers).forEach(([key,spec])=>{layerLabels[key]=spec.label||spec.value});
Object.entries(psdMidAutumnAssetLayers).forEach(([key,spec])=>{layerLabels[key]=spec.label||key});
Object.entries(psdMidAutumnTextLayers).forEach(([key,spec])=>{layerLabels[key]=spec.label||spec.value});
Object.entries(psdNewYearAssetLayers).forEach(([key,spec])=>{layerLabels[key]=spec.label||key});
Object.entries(psdNewYearTextLayers).forEach(([key,spec])=>{layerLabels[key]=spec.label||spec.value});
const idleDragHint='蒙层可拖动；文字重叠或编辑时出现小手，优先移动文字';
const textLayers = new Set(['brand','kicker','title','subtitle','feature1','feature2','feature3','body','tagline',...psdPortraitTextLayerKeys,...psdAdminSuiteTextLayerKeys,...psdBreakfastTextLayerKeys,...psdRoomServiceTextLayerKeys,...psdFullHouseTextLayerKeys,...psdDinnerTextLayerKeys,...psdMidAutumnTextLayerKeys,...psdNewYearTextLayerKeys]);
const textResizeEdges=['nw','n','ne','e','se','s','sw','w'];
const fontFamilies = {
  sans:'"Microsoft YaHei","PingFang SC","Noto Sans SC",Arial,sans-serif',
  brand:'"Inter","Helvetica Neue",Arial,sans-serif',
  serif:'"Noto Serif","Noto Serif CJK SC","Songti SC","STSong","SimSun",serif',
  'roman-italic':'"Times New Roman","Nimbus Roman No9 L","Songti SC",serif',
  'source-han-sans':'"Source Han Sans SC","Source Han Sans CN","Noto Sans CJK SC","PingFang SC","Microsoft YaHei",sans-serif',
  'source-han-serif':'"Source Han Serif SC","Source Han Serif CN","Noto Serif CJK SC","Songti SC","STSong","SimSun",serif'
};
const typographyPresets = {
  warm:{kicker:{kind:'sans',weight:500},title:{kind:'serif',weight:600},body:{kind:'sans',weight:400},tagline:{kind:'sans',weight:500}},
  midnight:{kicker:{kind:'sans',weight:500},title:{kind:'serif',weight:600},body:{kind:'sans',weight:400},tagline:{kind:'sans',weight:500}},
  parchment:{kicker:{kind:'sans',weight:500},title:{kind:'serif',weight:600},body:{kind:'sans',weight:400},tagline:{kind:'sans',weight:500}},
  business:{brand:{kind:'brand',weight:400},kicker:{kind:'sans',weight:500},title:{kind:'sans',weight:700},subtitle:{kind:'sans',weight:400},feature1:{kind:'sans',weight:400},feature2:{kind:'sans',weight:400},feature3:{kind:'sans',weight:400},body:{kind:'sans',weight:400},tagline:{kind:'sans',weight:400}},
  family:{kicker:{kind:'sans',weight:500},title:{kind:'serif',weight:600},body:{kind:'sans',weight:400},tagline:{kind:'sans',weight:500}},
  classic:{brand:{kind:'sans',weight:400},kicker:{kind:'sans',weight:500},title:{kind:'serif',weight:400},subtitle:{kind:'serif',weight:400},body:{kind:'serif',weight:400},tagline:{kind:'serif',weight:400}}
};
const textGradientStops = {
  // 仅对参考图中明确存在渐变的主标题启用；未配置的文字保持纯色。
  'daily-warm-luxury':{title:['#e2bc78','#fff4df']},
  'daily-business-room':{title:['#EECAB5','#CC9E7B']}
};
// Demo 还没有正式登录系统，因此通过页面注入的当前账号信息模拟角色权限。
// 正式版可由登录接口写入 window.HOTEL_CURRENT_ACCOUNT；模板管理入口只对 admin 显示。
const currentAccount = Object.freeze({
  id:String(window.HOTEL_CURRENT_ACCOUNT?.id||'sigurd-admin'),
  name:String(window.HOTEL_CURRENT_ACCOUNT?.name||'当前账号'),
  role:String(window.HOTEL_CURRENT_ACCOUNT?.role||'admin')
});
const TEMPLATE_DEFAULTS_STORAGE_KEY=`hotel-material-template-defaults-v1:${currentAccount.id.replace(/[^a-zA-Z0-9_-]/g,'-')}`;
const DELETED_TEMPLATES_STORAGE_KEY=`hotel-material-deleted-templates-v1:${currentAccount.id.replace(/[^a-zA-Z0-9_-]/g,'-')}`;
const state = {
  category:'daily', format:'landscape', template:templates[0], templateBase:templates[0], roomSrc:templates[0].image, logoSrc:'', qrSrc:'',
  adminMode:false,
  assetOverrides:{},
  savedAssetOverrides:{},
  templateHistory:[],
  templateCopyOverrides:null,
  generatorMode:false,
  generated:false,
  generatedSource:'none',
  roomUploaded:false,
  outputFormat:'landscape',
  positions:null, hiddenLayers:new Set(), selectedLayer:'', manualTextBoxWidths:new Set(), imageAdjust:{brightness:100,saturation:100}, overlayTransparency:22, layerTransparency:{}, undoStack:[],
  psdTextValues:defaultPsdTextValues(templates[0]),
  textAdjust:{ kicker:{fontSize:22,lineHeight:1.4}, title:{fontSize:58,lineHeight:1.1}, body:{fontSize:21,lineHeight:1.85}, tagline:{fontSize:20,lineHeight:1.4} }
};
const aiPosterState = {
  sceneSrc:'',
  sceneName:'',
  stylePackId:stylePacks[0]?.id||'daily-warm-luxury',
  ratio:'landscape',
  resultUrl:'',
  history:[],
  busy:false
};
let activeWorkspace='tools';
let templateMode='local';
let adminAutoSaveTimer=0;
let pendingAdminChange='调整模板';
// 模板库卡片会在静态封面加载后，用同一套图层合成器生成一张缩略图。
// 这些状态只在后台渲染期间短暂使用，用户进入编辑器时会立即取消并恢复。
let coverRenderToken=0;
let activeCoverPreview=null;
let renderCopyOverride=null;
// The library card and the editor must always use the same flattened poster
// state.  Keep the most recent editor render in memory so returning to the
// library does not briefly show the old static preview while the default
// cover renderer is still running.
const liveTemplateCovers=Object.create(null);
let liveCoverRenderToken=0;
let liveCoverRenderTimer=0;
let liveCoverRenderBusy=false;
let liveCoverRenderQueued=false;
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
function renderCopyValue(key){
  if(renderCopyOverride)return String(renderCopyOverride[key]??'');
  return $(`#${key}Input`)?.value||'';
}
function psdCopyLabel(key,spec={}){
  const raw=String(spec.label||layerLabels[key]||key);
  const cleaned=raw.replace(/^TXT_\d+_/,'').replace(/_可编辑$/,'').replace(/_独立.*$/,'').trim();
  return cleaned||key;
}
function syncPsdCopyFields(){
  $$('#psdCopyFields [data-psd-text-input]').forEach(input=>{
    const key=input.dataset.psdTextInput;
    if(key&&Object.prototype.hasOwnProperty.call(state.psdTextValues||{},key))input.value=state.psdTextValues[key]??'';
  });
}
function renderPsdCopyFields(){
  const container=$('#psdCopyFields');
  if(!container)return;
  container.innerHTML='';
  if(state.template?.rasterOnly){
    const note=document.createElement('p');
    note.className='psd-copy-note';
    note.textContent='该模板的文字和装饰暂不可直接替换；如需调整，可在画布中移动独立素材。';
    container.appendChild(note);
    return;
  }
  Object.entries(psdTextSpecs(state.template)).forEach(([key,spec])=>{
    const value=String(state.psdTextValues?.[key]??spec.value??'');
    const label=document.createElement('label');
    label.className='field-label';
    label.htmlFor=`psd-${key}-input`;
    label.append(document.createTextNode(psdCopyLabel(key,spec)));
    const hint=document.createElement('span');
    hint.id=`psd-${key}-hint`;
    hint.textContent=`可编辑 · 最多 ${value.includes('\n')?100:40} 字`;
    label.appendChild(hint);
    const input=value.includes('\n')||value.length>22||/title|subtitle|body/i.test(key)?document.createElement('textarea'):document.createElement('input');
    input.id=`psd-${key}-input`;
    input.className=`text-input${/title|subtitle/i.test(key)?' title-input':''}`;
    input.dataset.psdTextInput=key;
    input.setAttribute('aria-describedby',hint.id);
    input.maxLength=100;
    input.value=value;
    if(input.tagName==='TEXTAREA'){
      input.rows=2;
      input.setAttribute('aria-label',psdCopyLabel(key,spec));
    }else{
      input.type='text';
      input.setAttribute('aria-label',psdCopyLabel(key,spec));
    }
    input.addEventListener('input',()=>{
      if(input.dataset.undoCaptured!=='true'){pushUndoSnapshot();input.dataset.undoCaptured='true'}
      state.psdTextValues[key]=input.value.replace(/\r/g,'');
      updatePoster();
      queueTemplateAutoSave(`编辑${psdCopyLabel(key,spec)}`);
    });
    input.addEventListener('pointerdown',()=>resetUndoInput(input));
    input.addEventListener('change',()=>resetUndoInput(input));
    container.append(label,input);
  });
  if(!container.children.length){
    const note=document.createElement('p');
    note.className='psd-copy-note';
    note.textContent='当前模板未提供可编辑文字图层。';
    container.appendChild(note);
  }
}
function defaultCopyForTemplate(template){
  return {...(template?.copy||{kicker:'HOTEL STAY  /  ROOM NOTES',title:template?.title||'治愈感拉满的\n舒适客房',body:'色调柔和高级，整体干净又通透\n超大软床躺上去瞬间卸下赶路的疲惫\n窗边摆放休闲桌椅，闲坐喝茶发呆刚刚好\n暖调壁灯氛围感十足，细节处处用心\n出差旅行住这里，睡个好觉就是最大的幸福感',tagline:'舒适 · 安静 · 好好休息'})};
}
function readTemplateCopy(){
  return Object.fromEntries(['brand','kicker','title','subtitle','feature1','feature2','feature3','body','tagline'].map(key=>[key,$(`#${key}Input`)?.value||'']));
}
const undoableTextInputIds=['brandInput','kickerInput','titleInput','subtitleInput','feature1Input','feature2Input','feature3Input','bodyInput','taglineInput'];
function clonePositions(source){return Object.fromEntries(Object.entries(source||{}).map(([key,value])=>[key,{...value}]))}
function cloneTextAdjustments(source){return Object.fromEntries(Object.entries(source||{}).map(([key,value])=>[key,{...value}]))}
function cloneLayerTransparency(source){return Object.fromEntries(Object.entries(source||{}).map(([key,value])=>[key,clamp(Number(value)||0,0,100)]))}
function layerTransparencyValue(key){
  if(!key)return 0;
  const value=state.layerTransparency?.[key];
  if(Number.isFinite(Number(value)))return clamp(Number(value),0,100);
  // Backward compatibility for templates saved before per-layer opacity was
  // introduced: the old overlay value remains the panel's value.
  return key==='panel'?clamp(Number(state.overlayTransparency)||0,0,100):0;
}
function setLayerTransparency(key,value){
  if(!key||isLockedLayerKey(key))return;
  const normalized=clamp(Number(value)||0,0,100);
  if(!state.layerTransparency)state.layerTransparency={};
  state.layerTransparency[key]=normalized;
  if(key==='panel')state.overlayTransparency=normalized;
}
function normalizePsdSeparatorWidths(){
  // Kept as a migration hook for locally saved PSD defaults. The current
  // summer poster uses the exact source bounds for every layer.
  if(!state.template?.psdLayered)return;
}
function canManageTemplates(){return currentAccount.role==='admin'}
function readDeletedTemplateIds(){
  try{
    const raw=window.localStorage.getItem(DELETED_TEMPLATES_STORAGE_KEY);
    const parsed=raw?JSON.parse(raw):[];
    return new Set(Array.isArray(parsed)?parsed.filter(id=>typeof id==='string'):[]);
  }catch(error){console.warn('读取已删除模板列表失败',error);return new Set()}
}
function persistDeletedTemplateIds(ids){
  try{
    window.localStorage.setItem(DELETED_TEMPLATES_STORAGE_KEY,JSON.stringify([...ids]));
    return true;
  }catch(error){
    console.error('保存已删除模板列表失败',error);
    return false;
  }
}
function isTemplateDeleted(id){return Boolean(id&&readDeletedTemplateIds().has(id))}
function cleanTextAdjustments(source){return Object.fromEntries(Object.entries(source||{}).map(([key,value])=>[key,{fontSize:Number(value.fontSize),lineHeight:Number(value.lineHeight)}]))}
function readTemplateDefaults(){
  try{
    const raw=window.localStorage.getItem(TEMPLATE_DEFAULTS_STORAGE_KEY);
    const parsed=raw?JSON.parse(raw):{};
    return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{};
  }catch(error){console.warn('读取模板默认配置失败',error);return{}}
}
function applySavedTemplateDefaults(){
  const saved=readTemplateDefaults()[state.template.id];
  state.assetOverrides={}; state.savedAssetOverrides={}; state.templateHistory=[]; state.templateCopyOverrides=null;
  if(!saved||typeof saved!=='object')return false;
  Object.entries(saved.positions||{}).forEach(([key,value])=>{
    if(!value||typeof value!=='object')return;
    state.positions[key]={...(state.positions[key]||{}),...value};
  });
  const mergedText=cloneTextAdjustments(state.textAdjust);
  Object.entries(saved.textAdjust||{}).forEach(([key,value])=>{mergedText[key]={...(mergedText[key]||{}),...value}});
  state.textAdjust=normalizeTextAdjustments(mergedText);
  if(saved.imageAdjust)state.imageAdjust={...state.imageAdjust,...saved.imageAdjust};
  state.layerTransparency=cloneLayerTransparency(saved.layerTransparency||{});
  if(Number.isFinite(Number(saved.overlayTransparency))){
    state.overlayTransparency=Number(saved.overlayTransparency);
    if(!Object.prototype.hasOwnProperty.call(state.layerTransparency,'panel'))state.layerTransparency.panel=state.overlayTransparency;
  }
  state.hiddenLayers=new Set(Array.isArray(saved.hiddenLayers)?saved.hiddenLayers:(state.template?.hiddenLayers||[]));
  state.manualTextBoxWidths=new Set(Array.isArray(saved.manualTextBoxWidths)?saved.manualTextBoxWidths:[]);
  if(saved.assetOverrides&&typeof saved.assetOverrides==='object')state.assetOverrides={...saved.assetOverrides};
  state.savedAssetOverrides={...state.assetOverrides};
  state.templateHistory=Array.isArray(saved.history)?saved.history.slice(-30):[];
  if(saved.copy&&typeof saved.copy==='object')state.templateCopyOverrides={...saved.copy};
  if(saved.psdTextValues&&typeof saved.psdTextValues==='object')state.psdTextValues={...state.psdTextValues,...saved.psdTextValues};
  if(state.assetOverrides.photo)state.roomSrc=state.assetOverrides.photo;
  // PSD templates replace the photo in a named asset layer rather than the
  // generic `photo` layer.  Keep the editor's scene thumbnail in sync with
  // the layer that the compositor will actually draw.
  const photoLayer=state.template.replaceablePhotoLayer;
  if(photoLayer&&state.assetOverrides[photoLayer]){
    state.roomSrc=state.assetOverrides[photoLayer];
    state.roomUploaded=true;
    state.hiddenLayers.delete(photoLayer);
  }
  if(state.assetOverrides.panel)state.template.panelAsset=state.assetOverrides.panel;
  if(state.assetOverrides.decor)state.template.decorAsset=state.assetOverrides.decor;
  // Older local admin records stored panelAsset layers as a full-canvas
  // rectangle. When a template now exposes the real visible PNG bounds,
  // migrate that legacy frame so the selection box hugs the actual mask.
  const configuredPanel=state.template.panelPosition;
  const currentPanel=state.positions?.panel;
  const isLegacyFullPanel=currentPanel&&Number(currentPanel.w)>=99&&Number(currentPanel.h)>=99;
  if(configuredPanel&&isLegacyFullPanel&&!state.assetOverrides.panel){
    state.positions.panel={...configuredPanel,x:Number(currentPanel.x||0)+Number(configuredPanel.x||0),y:Number(currentPanel.y||0)+Number(configuredPanel.y||0)};
  }
  return true;
}
function updateAdminHistoryUI(){
  const status=$('#adminAssetStatus');
  const count=state.templateHistory?.length||0;
  const latest=state.templateHistory?.[count-1];
  const latestText=latest?.type?` · 最近：${latest.type}`:'';
  if(status)status.textContent=`仅当前管理员账号可见 · 调整会自动保存 · 已记录 ${count} 次${latestText}`;
  const historyPanel=$('#adminHistory'),historyList=$('#adminHistoryList');
  if(!historyPanel||!historyList)return;
  const items=(state.templateHistory||[]).slice(-5).reverse();
  historyPanel.classList.toggle('hidden',items.length===0);
  historyList.innerHTML=items.map(item=>{
    const time=item?.at?new Date(item.at).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}):'';
    return `<li><span>${item?.type||'调整模板'}</span><time>${time}</time></li>`;
  }).join('');
}
function saveCurrentTemplateDefaults({silent=false,changeType=pendingAdminChange}={}){
  if(!canManageTemplates()||!state.adminMode||state.generatorMode)return{ok:false,message:'仅管理员可保存本地拆分模板'};
  const defaults=readTemplateDefaults();
  const previous=defaults[state.template.id]||{};
  const history=Array.isArray(previous.history)?previous.history.slice(-29):((state.templateHistory||[]).slice(-29));
  history.push({type:changeType||'调整模板',at:new Date().toISOString()});
  defaults[state.template.id]={
    positions:clonePositions(state.positions),
    textAdjust:cleanTextAdjustments(state.textAdjust),
    overlayTransparency:Number(state.overlayTransparency),
    layerTransparency:cloneLayerTransparency(state.layerTransparency),
    imageAdjust:{...state.imageAdjust},
    hiddenLayers:[...state.hiddenLayers],
    manualTextBoxWidths:[...state.manualTextBoxWidths],
    assetOverrides:{...state.assetOverrides},
    copy:readTemplateCopy(),
    psdTextValues:{...state.psdTextValues},
    history,
    savedAt:new Date().toISOString(),
    savedBy:currentAccount.id
  };
  try{
    window.localStorage.setItem(TEMPLATE_DEFAULTS_STORAGE_KEY,JSON.stringify(defaults));
    state.savedAssetOverrides={...state.assetOverrides};
    state.templateCopyOverrides=readTemplateCopy();
    state.templateHistory=history;
    updateAdminHistoryUI();
    return{ok:true,message:silent?'':`模板默认参数和素材已保存到本机 · 已记录 ${history.length} 次修改`};
  }catch(error){
    console.error('保存模板默认配置失败',error);
    const quota=/quota|storage/i.test(String(error?.name||error?.message||''));
    return{ok:false,message:quota?'替换素材体积过大，本机存储空间不足，请换用更小的 PNG':'模板默认保存失败，请重试'};
  }
}
function queueTemplateAutoSave(changeType='调整模板'){
  if(!canManageTemplates()||!state.adminMode||state.generatorMode)return;
  pendingAdminChange=changeType;
  window.clearTimeout(adminAutoSaveTimer);
  adminAutoSaveTimer=window.setTimeout(()=>{
    adminAutoSaveTimer=0;
    const result=saveCurrentTemplateDefaults({silent:true,changeType:pendingAdminChange});
    if(result.ok)renderAdminAssetControls();
    if(!result.ok){const status=$('#generationStatus');if(status){status.classList.add('is-error');status.textContent=result.message}}
  },280);
}
function flushTemplateAutoSave(){
  if(!adminAutoSaveTimer)return;
  window.clearTimeout(adminAutoSaveTimer); adminAutoSaveTimer=0;
  if(canManageTemplates()&&state.adminMode&&!state.generatorMode)saveCurrentTemplateDefaults({silent:true,changeType:pendingAdminChange});
}
function createUndoSnapshot(){
  const textValues={};
  undoableTextInputIds.forEach(id=>{const input=$(`#${id}`);if(input)textValues[id]=input.value});
  return {positions:clonePositions(state.positions),hiddenLayers:[...state.hiddenLayers],selectedLayer:state.selectedLayer,manualTextBoxWidths:[...state.manualTextBoxWidths],imageAdjust:{...state.imageAdjust},overlayTransparency:state.overlayTransparency,layerTransparency:cloneLayerTransparency(state.layerTransparency),textAdjust:cloneTextAdjustments(state.textAdjust),psdTextValues:{...state.psdTextValues},assetOverrides:{...state.assetOverrides},roomSrc:state.roomSrc,roomUploaded:state.roomUploaded,logoSrc:state.logoSrc,qrSrc:state.qrSrc,textValues};
}
function syncUndoButton(){
  const button=$('#restoreLayersButton'); if(!button)return;
  const enabled=!state.generatorMode&&state.undoStack.length>0;
  button.disabled=!enabled;
  button.textContent='返回上一步';
  button.title=enabled?'撤销最近一次编辑':'暂无可撤销操作';
}
function pushUndoSnapshot(){
  if(state.generatorMode)return;
  state.undoStack.push(createUndoSnapshot());
  if(state.undoStack.length>30)state.undoStack.shift();
  syncUndoButton();
}
function restoreUndoSnapshot(){
  if(!state.undoStack.length){syncUndoButton();return}
  const snapshot=state.undoStack.pop();
  state.positions=clonePositions(snapshot.positions);
  state.hiddenLayers=new Set(snapshot.hiddenLayers||[]);
  state.selectedLayer=snapshot.selectedLayer||'';
  state.manualTextBoxWidths=new Set(snapshot.manualTextBoxWidths||[]);
  state.imageAdjust={...snapshot.imageAdjust};
  state.overlayTransparency=snapshot.overlayTransparency;
  state.layerTransparency=cloneLayerTransparency(snapshot.layerTransparency||{panel:state.overlayTransparency});
  state.textAdjust=cloneTextAdjustments(snapshot.textAdjust);
  state.psdTextValues={...defaultPsdTextValues(state.template),...(snapshot.psdTextValues||{})};
  state.assetOverrides={...(snapshot.assetOverrides||{})};
  state.template.panelAsset=state.assetOverrides.panel||state.templateBase?.panelAsset||'';
  state.template.decorAsset=state.assetOverrides.decor||state.templateBase?.decorAsset||'';
  state.roomSrc=snapshot.roomSrc;
  state.roomUploaded=Boolean(snapshot.roomUploaded);
  state.logoSrc=snapshot.logoSrc||'';
  state.qrSrc=snapshot.qrSrc||'';
  Object.entries(snapshot.textValues||{}).forEach(([id,value])=>{const input=$(`#${id}`);if(input)input.value=value});
  syncPsdCopyFields();
  const roomThumb=$('#roomThumb'); if(roomThumb)roomThumb.src=state.roomSrc;
  syncAdjustmentLabels(); updateGeneratorAttachments(); updatePoster(); renderAdminAssetControls(); syncUndoButton(); queueTemplateAutoSave('撤销操作');
  const status=$('#generationStatus'); if(status&&!state.generatorMode){status.classList.remove('is-error');status.textContent='已撤销上一步修改'}
}
function recordUndoForInput(input){
  if(!input||state.generatorMode||input.dataset.undoCaptured==='true')return;
  pushUndoSnapshot(); input.dataset.undoCaptured='true';
}
function resetUndoInput(input){if(input)input.dataset.undoCaptured='false'}
function normalizeTextAdjustments(source){
  const defaults={brand:{fontSize:22,lineHeight:1.2},kicker:{fontSize:24,lineHeight:1.35},title:{fontSize:78,lineHeight:1.08},subtitle:{fontSize:18,lineHeight:1.35},feature1:{fontSize:15,lineHeight:1.2},feature2:{fontSize:15,lineHeight:1.2},feature3:{fontSize:15,lineHeight:1.2},body:{fontSize:22,lineHeight:1.75},tagline:{fontSize:20,lineHeight:1.4}};
  Object.entries(psdTextSpecs(state.template)).forEach(([key,spec])=>{defaults[key]={fontSize:spec.fontSize,lineHeight:spec.lineHeight}});
  const input=source||defaults;
  return Object.fromEntries([...textLayers].map(key=>[key,{...(defaults[key]||{}),...(input[key]||{}),effectiveFontSize:null}]));
}

function makeDefaultPositions(format,layout='left',style=''){
  const portrait=format==='portrait';
  if(format==='square') return { photo:{x:50,y:50}, panel:{x:0,y:58,w:100,h:42}, decor:{x:84,y:66}, brand:{x:8,y:61,w:84,h:5}, kicker:{x:8,y:66,w:84,h:7}, title:{x:8,y:70,w:84,h:18}, subtitle:{x:8,y:80,w:84,h:6}, feature1:{x:8,y:84,w:25,h:6}, feature2:{x:37,y:84,w:25,h:6}, feature3:{x:66,y:84,w:25,h:6}, rule:{x:8,y:82}, body:{x:8,y:88,w:84,h:18}, tagline:{x:8,y:96,w:84,h:7}, logo:{x:90,y:8}, qr:{x:88,y:91} };
  if(layout==='right'&&!portrait) return { photo:{x:50,y:50}, panel:{x:70,y:0,w:30,h:100}, decor:{x:78,y:48}, kicker:{x:75,y:10,w:21,h:7}, title:{x:75,y:22,w:21,h:19}, rule:{x:75,y:40}, body:{x:75,y:49,w:21,h:31}, tagline:{x:75,y:92,w:21,h:7}, logo:{x:90,y:8}, qr:{x:88,y:91} };
  return portrait
    ? { photo:{x:50,y:50}, panel:{x:0,y:55,w:100,h:45}, decor:{x:50,y:78}, brand:{x:8,y:59,w:84,h:5}, kicker:{x:8,y:64,w:84,h:7}, title:{x:8,y:68,w:84,h:19}, subtitle:{x:8,y:79,w:84,h:6}, feature1:{x:8,y:83,w:25,h:6}, feature2:{x:37,y:83,w:25,h:6}, feature3:{x:66,y:83,w:25,h:6}, rule:{x:8,y:82}, body:{x:8,y:87,w:84,h:28}, tagline:{x:8,y:96,w:84,h:7}, logo:{x:90,y:8}, qr:{x:88,y:91} }
    : { photo:{x:50,y:50}, panel:{x:0,y:0,w:({warm:42,midnight:42,parchment:42,business:34,family:34}[style]||34),h:100}, decor:{x:31,y:44}, brand:{x:6,y:6,w:34,h:5}, kicker:{x:6,y:12,w:34,h:7}, title:{x:6,y:23,w:34,h:20}, subtitle:{x:6,y:46,w:34,h:6}, feature1:{x:7,y:55,w:10,h:7}, feature2:{x:19,y:55,w:10,h:7}, feature3:{x:31,y:55,w:10,h:7}, rule:{x:6,y:43}, body:{x:6,y:64,w:34,h:29}, tagline:{x:6,y:92,w:34,h:7}, logo:{x:90,y:9}, qr:{x:89,y:90} };
}
function applyTemplateIconPositions(format){
  if(!state.template?.iconAssets)return;
  const configured=format==='landscape'&&state.template.iconPositions?state.template.iconPositions:{
    work:{x:25,y:72,w:11,h:10},city:{x:50,y:72,w:11,h:10},sleep:{x:75,y:72,w:11,h:10}
  };
  Object.entries(configured).forEach(([name,position])=>{state.positions[`icon-${name}`]={...position}});
}
function effectiveAssetSource(key,fallback=''){
  return state.assetOverrides?.[key]||fallback||'';
}
function templateLogoLayerKey(template=state.template){
  if(template?.logoLayerKey&&template.assetLayers?.[template.logoLayerKey])return template.logoLayerKey;
  return Object.entries(template?.assetLayers||{}).find(([key,asset])=>/(?:^|[_\s-])logo(?:[_\s-]|$)|品牌占位标/i.test(`${key} ${asset?.label||''}`))?.[0]||'';
}
function templateAssetSource(key,asset){
  // PSD photo layers stay in the original layer stack. A user upload replaces
  // the source of that layer instead of creating a new bottom-most photo that
  // would be covered by the PSD background/texture layers.
  if(state.template?.replaceablePhotoLayer===key&&state.roomUploaded&&state.roomSrc)return state.roomSrc;
  // A detected Logo is replaced in-place, so it keeps the PSD layer's exact
  // coordinates, dimensions and stack order instead of adding a new layer.
  if(templateLogoLayerKey()===key&&state.logoSrc)return state.logoSrc;
  return effectiveAssetSource(key,asset?.src||'');
}
function isPsdEditableTextLayer(key){
  return Boolean(state.template?.psdLayered&&Object.prototype.hasOwnProperty.call(psdTextSpecs(state.template),key));
}
function adminAssetEntries(){
  const template=state.template||{};
  const entries=[];
  const replaceablePhotoLayer=template.replaceablePhotoLayer;
  if(template.photoMode==='asset'&&replaceablePhotoLayer&&template.assetLayers?.[replaceablePhotoLayer]){
    entries.push({key:replaceablePhotoLayer,label:'酒店场景底图',base:template.assetLayers[replaceablePhotoLayer].src,accept:'image/png,image/jpeg'});
  }else{
    entries.push({key:'photo',label:'酒店场景底图',base:template.image,accept:'image/png,image/jpeg'});
  }
  if(!template.skipPanel){entries.push({key:'panel',label:'蒙层',base:template.panelAsset||'',accept:'image/png'});}
  if(template.decorAsset){entries.push({key:'decor',label:'装饰元素',base:template.decorAsset,accept:'image/png'});}
  Object.entries(template.assetLayers||{}).forEach(([key,asset])=>{
    if(key===replaceablePhotoLayer||isPsdEditableTextLayer(key))return;
    entries.push({key,label:asset.label||layerLabels[key]||'PNG 图层',base:asset.src,accept:'image/png'});
  });
  Object.entries(template.iconAssets||{}).forEach(([name,src])=>{
    const key=`icon-${name}`;
    entries.push({key,label:layerLabels[key]||`${name}图标`,base:src,accept:'image/png'});
  });
  return entries;
}
function renderAdminAssetControls(){
  const section=$('#adminAssetSection'),list=$('#adminAssetList');
  if(!section||!list)return;
  const visible=canManageTemplates()&&state.adminMode&&!state.generatorMode&&!$('#editorView')?.classList.contains('hidden');
  section.classList.toggle('hidden',!visible);
  if(!visible){list.innerHTML='';return}
  const entries=adminAssetEntries();
  list.innerHTML=entries.map(entry=>{
    const source=effectiveAssetSource(entry.key,entry.base);
    const thumb=source?`<img class="admin-asset-thumb" src="${source}" alt="${entry.label}" />`:'<span class="admin-asset-thumb admin-asset-empty">暂无</span>';
    const isOverride=Boolean(state.assetOverrides?.[entry.key]);
    const hasSavedOverride=Object.prototype.hasOwnProperty.call(state.savedAssetOverrides||{},entry.key);
    const isPersisted=isOverride&&state.savedAssetOverrides?.[entry.key]===state.assetOverrides[entry.key];
    const assetStatus=isOverride?(isPersisted?'已替换 · 已保存':'已替换 · 未保存'):(hasSavedOverride?'已恢复内置 · 未保存':'使用模板内置素材');
    return `<div class="admin-asset-row" data-admin-asset-row="${entry.key}">${thumb}<div class="admin-asset-meta"><strong>${entry.label}</strong><small>${assetStatus}</small></div><div class="admin-asset-actions"><label class="admin-asset-upload">更换<input type="file" accept="${entry.accept}" data-admin-asset-input="${entry.key}" /></label><button type="button" class="admin-asset-reset" data-admin-asset-reset="${entry.key}" ${isOverride?'':'disabled'}>恢复内置</button></div></div>`;
  }).join('');
  $$('[data-admin-asset-input]').forEach(input=>input.addEventListener('change',()=>{
    const file=input.files?.[0],key=input.dataset.adminAssetInput;
    if(!file||!key)return;
    const reader=new FileReader();
    reader.onload=()=>{
      pushUndoSnapshot();
      state.assetOverrides[key]=String(reader.result);
      if(key==='photo'||key===state.template.replaceablePhotoLayer){state.roomSrc=String(reader.result);state.roomUploaded=false;state.hiddenLayers.delete(key)}
      if(key==='panel')state.template.panelAsset=String(reader.result);
      if(key==='decor')state.template.decorAsset=String(reader.result);
      updatePoster(); renderAdminAssetControls(); queueTemplateAutoSave('替换模板素材');
      const status=$('#generationStatus'); if(status)status.textContent=`已替换${layerLabels[key]||'模板素材'} · 正在自动保存默认配置`;
    };
    reader.readAsDataURL(file);
  }));
  $$('[data-admin-asset-reset]').forEach(button=>button.addEventListener('click',()=>{
    const key=button.dataset.adminAssetReset;
    if(!key)return;
    pushUndoSnapshot();
    delete state.assetOverrides[key];
    if(key==='photo'){state.roomSrc=state.templateBase.image;state.template.image=state.templateBase.image;state.roomUploaded=false}
    if(key===state.template.replaceablePhotoLayer){state.roomSrc=state.template.image;state.roomUploaded=false;state.hiddenLayers.delete(key)}
    if(key==='panel')state.template.panelAsset=state.templateBase.panelAsset||'';
    if(key==='decor')state.template.decorAsset=state.templateBase.decorAsset||'';
    updatePoster(); renderAdminAssetControls(); queueTemplateAutoSave('恢复内置素材');
    const status=$('#generationStatus'); if(status)status.textContent='已恢复内置素材 · 如需保留请重新保存模板默认';
  }));
}
function deleteCurrentTemplate(){
  if(!canManageTemplates()||!state.adminMode||state.generatorMode||!state.template?.id)return;
  const templateId=state.template.id;
  const templateName=state.template.name||'当前模板';
  const confirmed=window.confirm(`确定删除“${templateName}”吗？\n删除后会从当前账号的模板库中隐藏，且不会影响其他账号。`);
  if(!confirmed)return;
  // 先把最后一次拖拽/文字调整写入本机，再移除该模板的默认配置，
  // 避免遗留一条无法再访问的管理员记录。
  flushTemplateAutoSave();
  const deletedTemplateIds=readDeletedTemplateIds();
  deletedTemplateIds.add(templateId);
  if(!persistDeletedTemplateIds(deletedTemplateIds)){
    const status=$('#generationStatus');
    if(status){status.classList.add('is-error');status.textContent='删除状态保存失败，请检查浏览器本地存储后重试'}
    return;
  }
  try{
    const defaults=readTemplateDefaults();
    if(Object.prototype.hasOwnProperty.call(defaults,templateId)){
      delete defaults[templateId];
      window.localStorage.setItem(TEMPLATE_DEFAULTS_STORAGE_KEY,JSON.stringify(defaults));
    }
  }catch(error){
    // 模板已经成功从库中隐藏；默认配置清理失败不会阻断用户继续使用。
    console.warn('清理已删除模板的默认配置失败',error);
  }
  delete liveTemplateCovers[templateId];
  window.clearTimeout(adminAutoSaveTimer);
  adminAutoSaveTimer=0;
  state.selectedLayer='';
  returnToLibrary();
}
function syncTemplateAdminUI(){
  const button=$('#templateAdminButton'),saveButton=$('#saveTemplateDefaultsButton');
  if(!canManageTemplates()){
    state.adminMode=false;
    button?.classList.add('hidden');
    saveButton?.classList.add('hidden');
    document.body.classList.remove('template-admin-mode');
    renderAdminAssetControls();
    return;
  }
  const editorOpen=!$('#editorView')?.classList.contains('hidden');
  if(button){button.classList.toggle('hidden',activeWorkspace!=='templates');button.classList.toggle('is-active',state.adminMode);button.setAttribute('aria-pressed',String(state.adminMode));button.textContent=state.adminMode?'退出模板调整':'管理员 · 模板调整';button.title=state.adminMode?'退出当前管理员模板调试模式':'仅当前管理员账号可进入模板调整模式'}
  document.body.classList.toggle('template-admin-mode',state.adminMode);
  saveButton?.classList.toggle('hidden',!(state.adminMode&&editorOpen&&!state.generatorMode));
  if(state.adminMode&&!state.generatorMode&&editorOpen){
    const status=$('#generationStatus');
    if(status&&!status.classList.contains('is-error'))status.textContent=`${currentAccount.name} · 管理员模板调试 · 配置仅保存到本机`;
  }
  updateAdminHistoryUI();
  renderAdminAssetControls();
}
function syncTemplateModeUI(){
  const isAI=templateMode==='ai';
  const localPanel=$('#localTemplatePanel'),aiPanel=$('#aiPosterStudio');
  localPanel?.classList.toggle('hidden',isAI);
  aiPanel?.classList.toggle('hidden',!isAI);
  localPanel?.setAttribute('aria-hidden',String(isAI));
  aiPanel?.setAttribute('aria-hidden',String(!isAI));
  $$('[data-template-mode]').forEach(button=>{
    const active=button.dataset.templateMode===templateMode;
    button.classList.toggle('is-active',active);
    button.setAttribute('aria-selected',String(active));
  });
}
function bindTemplateMode(){
  $$('[data-template-mode]').forEach(button=>button.addEventListener('click',()=>{
    templateMode=button.dataset.templateMode==='ai'?'ai':'local';
    syncTemplateModeUI();
    if(templateMode==='local')renderLibrary();
    window.scrollTo({top:0,behavior:'smooth'});
  }));
  syncTemplateModeUI();
}
// Keep implementation provenance out of the customer-facing template cards.
// PSD remains an internal template capability, but users only need the
// template name, its purpose and the action they can take.
function userTemplateName(template){
  return String(template?.name||'当前模板').replace(/^PSD\s*[｜|:]\s*/i,'').trim()||'当前模板';
}
function userTemplateBadge(template){
  const badge=String(template?.badge||'').trim();
  return /^PSD\b/i.test(badge)?'':badge;
}
function userTemplateDescription(template){
  const name=userTemplateName(template);
  const raw=String(template?.description||'').trim();
  if(!/^PSD\b/i.test(String(template?.name||''))&&!/^PSD\b/i.test(String(template?.badge||'')))return raw;
  // Drop source-file and layer-count language from imported templates. The
  // resulting copy still explains the use case without exposing production
  // details that do not help a customer choose a template.
  const clean=raw
    .replace(/^(?:严格按|按)\s*PSD(?:\s+原图层|\s+原始分层|\s+分层)?还原(?:的)?[，,]?\s*/i,'')
    .replace(/^(?:全部|\d+\s*处)文字可编辑[，,]?\s*/,'')
    .replace(/[，,]?\s*(?:全部|\d+\s*处)文字可编辑[。.]?$/,'')
    .trim();
  return clean||`${name}，适合酒店运营内容发布`;
}
function renderLibrary(){
  // 模板卡片使用从详情页实时 DOM 画布直接截取的封面。不再二次调用
  // Canvas 导出器重排文字，避免价格牌等复杂图层与详情页出现偏差。
  cancelCoverPreviewRender();
  const grid=$('#templateGrid');
  const deletedTemplateIds=readDeletedTemplateIds();
  const visible=templates.filter(t=>!deletedTemplateIds.has(t.id)&&t.category===state.category&&t.format===state.format&&!stylePackIds.has(t.id));
  visible.sort((a,b)=>(a.id==='daily-business-room'?-1:0)-(b.id==='daily-business-room'?-1:0));
  const actionLabel=canManageTemplates()&&state.adminMode?'调试模板 →':'本地编辑 →';
  grid.innerHTML=visible.map(t=>{const name=userTemplateName(t),badge=userTemplateBadge(t),description=userTemplateDescription(t);return `<article class="template-card"><div class="template-thumb ${t.format==='portrait'?'is-portrait':''} ${t.canvasClass||''}"><img data-template-cover="${t.id}" src="${templateCoverSource(t)}" alt="${name}可编辑模板预览"/>${badge?`<span class="template-badge">${badge}</span>`:''}</div><div class="template-info"><h3>${name}</h3><p>${description}</p><div class="template-meta"><span>${t.format==='landscape'?'横版 16:9':(t.ratioLabel||'竖版 3:4')}</span><button class="use-template" data-template="${t.id}">${actionLabel}</button></div></div></article>`}).join('');
  $$('.use-template').forEach(button=>button.addEventListener('click',()=>openEditor(button.dataset.template,'template')));
}
function prepareTemplateCoverState(template){
  state.generatorMode=false;
  state.generated=false;
  state.generatedSource='none';
  state.roomUploaded=false;
  state.undoStack=[];
  state.templateBase=template;
  state.template={...template};
  state.outputFormat=template.format;
  state.roomSrc=template.image;
  state.logoSrc='';
  state.qrSrc='';
  state.assetOverrides={};
  state.savedAssetOverrides={};
  state.positions=makeDefaultPositions(template.format,template.layout,template.style);
  if(template.decorPosition)state.positions.decor={...state.positions.decor,...template.decorPosition};
  applyTemplateIconPositions(template.format);
  if(template.assetLayers){
    Object.entries(template.assetLayers).forEach(([key,asset])=>{
      state.positions[key]={x:asset.x??50,y:asset.y??50,w:asset.w??10,h:asset.h??10};
    });
  }
  if(template.replaceablePhotoLayer&&template.assetLayers?.[template.replaceablePhotoLayer]){
    state.positions.photo={...state.positions[template.replaceablePhotoLayer]};
  }
  if(template.logoPosition)state.positions.logo={...state.positions.logo,...template.logoPosition};
  if(template.textPosition){
    Object.entries(template.textPosition).forEach(([key,position])=>{
      state.positions[key]={...state.positions[key],...position};
    });
  }
  if(template.panelAsset)state.positions.panel={...(template.panelPosition||{x:0,y:0,w:100,h:100})};
  else if(template.panelWidth)state.positions.panel.w=template.panelWidth;
  state.hiddenLayers=new Set(template.hiddenLayers||[]);
  state.selectedLayer='';
  state.manualTextBoxWidths=new Set();
  state.imageAdjust={brightness:100,saturation:100};
  state.overlayTransparency=template.overlayTransparency??(template.style?0:22);
  state.layerTransparency={panel:state.overlayTransparency};
  state.textAdjust=normalizeTextAdjustments(template.textDefaults);
  state.psdTextValues=defaultPsdTextValues(template);
  applySavedTemplateDefaults();
  normalizePsdSeparatorWidths();
  // PSD templates replace the original photo layer in-place. Mark that layer
  // as uploaded for the compositor without showing it as a user upload.
  const photoLayer=template.replaceablePhotoLayer;
  if(photoLayer&&state.assetOverrides?.[photoLayer]){
    state.roomSrc=state.assetOverrides[photoLayer];
    state.roomUploaded=true;
    state.hiddenLayers.delete(photoLayer);
  }
  renderCopyOverride={...defaultCopyForTemplate(state.template),...(state.templateCopyOverrides||{})};
  fitDefaultTextBoxWidths(renderCopyOverride);
}
function snapshotCoverEditorState(){
  const snapshot={};
  Object.keys(state).forEach(key=>{snapshot[key]=state[key]});
  return snapshot;
}
function restoreCoverEditorState(snapshot){
  if(!snapshot)return;
  Object.entries(snapshot).forEach(([key,value])=>{state[key]=value});
}
function cancelCoverPreviewRender(){
  coverRenderToken++;
  const active=activeCoverPreview;
  if(active){
    active.cancelled=true;
    active.restore();
    activeCoverPreview=null;
  }
  renderCopyOverride=null;
}
function templateCoverSource(template){
  return liveTemplateCovers[template?.id]||template?.preview||template?.image||'';
}
function setActiveWorkspaceNav(view){
  $$('[data-workspace-view]').forEach(button=>{
    const active=button.dataset.workspaceView===view;
    button.classList.toggle('active',active);
    if(active)button.setAttribute('aria-current','page'); else button.removeAttribute('aria-current');
  });
}
function showWorkspace(view){
  const next=view==='templates'?'templates':view==='ai-video'?'ai-video':'tools';
  if(next==='tools'||next==='ai-video')flushTemplateAutoSave();
  document.body?.classList.toggle('templates-bg',next==='templates');
  activeWorkspace=next;
  setActiveWorkspaceNav(next);
  const toolsView=$('#toolsView'),libraryView=$('#libraryView'),editorView=$('#editorView'),toolWorkspace=$('#toolWorkspaceView'),title=$('#workspaceTitle'),privacy=$('#privacyStatus');
  if(next==='tools'){
    state.adminMode=false;
    editorView?.classList.add('hidden');
    libraryView?.classList.add('hidden');
    toolsView?.classList.remove('hidden');
    toolWorkspace?.classList.add('hidden');
    if(title)title.textContent='图片 / 视频工具';
    if(privacy)privacy.textContent='本地处理 · 素材不上传';
  }else if(next==='ai-video'){
    state.adminMode=false;
    editorView?.classList.add('hidden');
    libraryView?.classList.add('hidden');
    toolsView?.classList.add('hidden');
    toolWorkspace?.classList.remove('hidden');
    toolWorkspace?.querySelectorAll('.tool-page').forEach(page=>{page.hidden=page.dataset.kind!=='ai-video'});
    if(title)title.textContent='本地工具 · AI 自动成片';
    if(privacy)privacy.textContent='浏览器本地预览 · 点击导出下载';
  }else{
    editorView?.classList.add('hidden');
    toolsView?.classList.add('hidden');
    toolWorkspace?.classList.add('hidden');
    libraryView?.classList.remove('hidden');
    state.generatorMode=false;
    if(title)title.textContent='酒店运营图模板库';
    if(privacy)privacy.textContent='本地编辑 · 素材不上传';
    renderLibrary();
  }
  syncApiConfigButton();
  syncTemplateAdminUI();
  window.scrollTo({top:0,behavior:'smooth'});
}
function selectTool(toolKey){
  const names={
    'boot-kit':'开机三件套','boot-video':'开机视频转换','logo-cutout':'Logo 黑白扣取',
    'image-compress':'图片裁剪压缩','video-compress':'视频压缩','watermark-removal':'一键去水印','scene-retouch':'一键精修场景图',
    'ai-cutout':'AI 抠图','erase':'擦除','mark-edit':'标记改图','expand':'扩图','enhance':'变清晰','ai-video':'AI 自动成片'
  };
  const name=names[toolKey]||'工具';
  if(typeof window.openLocalTool==='function'){
    window.openLocalTool(toolKey);
    return;
  }
  $$('.tool-card').forEach(card=>card.classList.toggle('is-selected',card.querySelector(`[data-tool="${toolKey}"]`)!==null));
  const status=$('#toolSelectionStatus');
  if(status)status.innerHTML=`<span class="status-check">✓</span><strong>已选择：${name}</strong><span>下一步将打开本地处理面板；素材不会上传到云端。</span>`;
}
function filterToolGroups(filterKey){
  const next=['all','basic','advanced'].includes(filterKey)?filterKey:'all';
  $$('[data-tool-filter]').forEach(button=>{
    const active=button.dataset.toolFilter===next;
    button.classList.toggle('is-active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  $$('[data-tool-group]').forEach(group=>{
    const visible=next==='all'||group.dataset.toolGroup===next;
    group.classList.toggle('is-filter-hidden',!visible);
    group.setAttribute('aria-hidden',String(!visible));
  });
}
function bindWorkspaceNavigation(){
  $$('[data-workspace-view]').forEach(button=>button.addEventListener('click',()=>{
    if(button.dataset.workspaceView==='ai-video'&&typeof window.openLocalTool==='function'){
      window.openLocalTool('ai-video');
      return;
    }
    showWorkspace(button.dataset.workspaceView);
  }));
  $$('[data-tool]').forEach(button=>button.addEventListener('click',()=>selectTool(button.dataset.tool)));
  $$('[data-tool-filter]').forEach(button=>button.addEventListener('click',()=>filterToolGroups(button.dataset.toolFilter)));
}
function scheduleCurrentTemplateCoverSync(){
  // Generator mode intentionally produces a separate, single flattened
  // result.  Only local template editing should rewrite a library card.
  if(state.generatorMode||!state.template?.id)return;
  // This template's authoritative cover is a direct DOM capture of the
  // detail canvas. The generic exporter lays out its price text differently,
  // so it must never overwrite that exact snapshot in memory.
  if(state.template.id==='psd-mid-autumn-seaview-portrait')return;
  const templateId=state.template.id;
  const token=++liveCoverRenderToken;
  liveCoverRenderQueued=true;
  window.clearTimeout(liveCoverRenderTimer);
  liveCoverRenderTimer=window.setTimeout(()=>{
    liveCoverRenderTimer=0;
    runCurrentTemplateCoverSync(templateId,token);
  },180);
}
async function runCurrentTemplateCoverSync(templateId,token){
  if(liveCoverRenderBusy)return;
  liveCoverRenderBusy=true;
  liveCoverRenderQueued=false;
  try{
    const canvas=document.createElement('canvas');
    await composePosterToCanvas(canvas);
    // A drag or text edit may have happened while images/fonts were loading;
    // discard that stale render and let the newest scheduled pass win.
    if(token!==liveCoverRenderToken||state.template?.id!==templateId||state.generatorMode)return;
    liveTemplateCovers[templateId]=canvas.toDataURL('image/jpeg',0.90);
    const image=$(`[data-template-cover="${templateId}"]`);
    if(image)image.src=liveTemplateCovers[templateId];
  }catch(error){
    console.warn('实时更新模板封面失败，保留当前封面',error);
  }finally{
    liveCoverRenderBusy=false;
    if(liveCoverRenderQueued&&!liveCoverRenderTimer){
      const nextId=state.template?.id;
      if(nextId)scheduleCurrentTemplateCoverSync();
    }
  }
}
async function refreshTemplateCoverPreviews(visible){
  const token=coverRenderToken;
  const savedState=snapshotCoverEditorState();
  const previousCopyOverride=renderCopyOverride;
  const owner={
    token,
    cancelled:false,
    restored:false,
    restore(){
      if(this.restored)return;
      this.restored=true;
      restoreCoverEditorState(savedState);
      renderCopyOverride=previousCopyOverride;
    }
  };
  activeCoverPreview=owner;
  try{
    for(const template of visible){
      if(owner.cancelled||token!==coverRenderToken)return;
      if($('#libraryView')?.classList.contains('hidden'))return;
      // A live editor snapshot is already the authoritative cover for this
      // template.  Do not overwrite it with the static/default render.
      if(liveTemplateCovers[template.id])continue;
      prepareTemplateCoverState(template);
      const canvas=document.createElement('canvas');
      await composePosterToCanvas(canvas);
      if(owner.cancelled||token!==coverRenderToken)return;
      const image=$(`[data-template-cover="${template.id}"]`);
      if(image)image.src=canvas.toDataURL('image/jpeg',0.86);
    }
  }catch(error){
    // Keep the original static cover when a local asset cannot be loaded.
    console.warn('模板封面合成失败，保留静态封面',error);
  }finally{
    if(activeCoverPreview===owner){
      owner.restore();
      activeCoverPreview=null;
    }
  }
}
function renderStylePacks(){
  const grid=$('#stylePackGrid'); if(!grid)return;
  const deletedTemplateIds=readDeletedTemplateIds();
  grid.innerHTML=stylePacks.filter(pack=>!deletedTemplateIds.has(pack.id)).map(pack=>{const template=templates.find(item=>item.id===pack.id);if(!template)return '';return `<article class="style-pack"><div class="style-pack-image"><img src="${template.preview||template.image}" alt="${pack.name} AI 风格参考图"/><span>AI 风格参考</span></div><div class="style-pack-body"><div><h3>${pack.name}</h3><p>${pack.note}</p></div><button class="style-pack-use" data-style-pack="${pack.id}">AI 做同款 →</button><div class="style-pack-tags">${pack.tags.map(tag=>`<span>${tag}</span>`).join('')}</div></div></article>`}).join('');
  $$('.style-pack-use').forEach(button=>button.addEventListener('click',()=>openEditor(button.dataset.stylePack,'generator')));
}
function aiPosterStylePack(id){
  return stylePacks.find(pack=>pack.id===id)||stylePacks[0]||{id:'daily-warm-luxury',name:'暖棕轻奢',note:'柔和暖光 · 低饱和棕色 · 高级客房'};
}
function aiPosterStyleTemplate(id){
  const pack=aiPosterStylePack(id);
  return templates.find(template=>template.id===(pack.referenceId||pack.id))||templates[0];
}
function syncAIStyleUI(){
  const pack=aiPosterStylePack(aiPosterState.stylePackId),template=aiPosterStyleTemplate(aiPosterState.stylePackId);
  const thumb=$('#aiPosterStyleThumb'),name=$('#aiPosterStyleName');
  if(thumb){
    const isSmart=pack.id==='smart';
    thumb.classList.toggle('is-smart',isSmart);
    if(isSmart){
      thumb.innerHTML='<span class="ai-style-smart-icon" aria-hidden="true">✦</span>';
      thumb.setAttribute('aria-label','智能推荐');
    }else{
      thumb.innerHTML='';
      const image=document.createElement('img');
      image.src=template.preview||template.image;
      image.alt=`${pack.name}风格参考`;
      thumb.appendChild(image);
      thumb.setAttribute('aria-label',`${pack.name}风格参考`);
    }
  }
  if(name)name.textContent=pack.name;
  $$('#aiStyleOptions [data-ai-style]').forEach(button=>{const active=button.dataset.aiStyle===aiPosterState.stylePackId;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active))});
}
function renderAIStyleOptions(){
  const container=$('#aiStyleOptions'); if(!container)return;
  const deletedTemplateIds=readDeletedTemplateIds();
  const available=stylePacks.filter(pack=>!deletedTemplateIds.has(pack.id));
  container.innerHTML=available.map(pack=>{const template=aiPosterStyleTemplate(pack.id);const visual=pack.id==='smart'?'<span class="ai-style-smart-icon">✦</span>':`<img src="${template.preview||template.image}" alt=""/>`;return `<button type="button" class="ai-style-option" data-ai-style="${pack.id}" aria-pressed="${pack.id===aiPosterState.stylePackId}">${visual}<span>${pack.name}</span></button>`}).join('');
  $$('#aiStyleOptions [data-ai-style]').forEach(button=>button.addEventListener('click',()=>{aiPosterState.stylePackId=button.dataset.aiStyle;syncAIStyleUI()}));
  if(!available.some(pack=>pack.id===aiPosterState.stylePackId)&&available[0])aiPosterState.stylePackId=available[0].id;
  syncAIStyleUI();
}
function appendAIPosterMessage(role,heading,body){
  const container=$('#aiPosterMessages'); if(!container)return;
  const message=document.createElement('div');message.className=`ai-chat-message ${role}`;
  const avatar=document.createElement('span');avatar.className='ai-message-avatar';avatar.textContent=role==='user'?'你':'AI';
  const content=document.createElement('div');
  const title=document.createElement('strong');title.textContent=heading;content.appendChild(title);
  if(body){const copy=document.createElement('p');copy.textContent=body;content.appendChild(copy)}
  message.append(avatar,content);container.appendChild(message);container.scrollTop=container.scrollHeight;
  return message;
}
function setAIPosterPreview(mode){
  const empty=$('#aiPosterPreviewEmpty'),loading=$('#aiPosterLoading'),result=$('#aiPosterResult');
  empty?.classList.toggle('hidden',mode!=='empty');loading?.classList.toggle('hidden',mode!=='loading');result?.classList.toggle('hidden',mode!=='result');
}
function setAIPosterDraftStatus(text,isError=false){
  const meta=$('#aiPosterPreviewMeta');if(meta){meta.textContent=text;meta.classList.toggle('is-error',isError)}
}
async function generateConversationalPoster(event){
  event?.preventDefault();
  if(aiPosterState.busy)return;
  const prompt=$('#aiPosterPrompt')?.value.trim()||'';
  const sceneChip=$('.ai-scene-chip');
  if(!prompt){setAIPosterDraftStatus('请先写下你想要的画面',true);$('#aiPosterPrompt')?.focus();return}
  sceneChip?.classList.remove('needs-attention');
  const pack=aiPosterStylePack(aiPosterState.stylePackId),template=aiPosterStyleTemplate(aiPosterState.stylePackId),button=$('#aiPosterGenerateButton');
  aiPosterState.busy=true;button&&(button.disabled=true,button.querySelector('span').textContent='生成中…');
  appendAIPosterMessage('user','你的创作指令',prompt.length>92?`${prompt.slice(0,92)}…`:prompt);
  setAIPosterPreview('loading');setAIPosterDraftStatus('AI 正在整理画面…');
  const canvas=document.createElement('canvas');
  const contextBrief=aiPosterState.history.length?`此前对话：\n${aiPosterState.history.slice(-3).join('\n')}\n本轮调整：\n${prompt}`:prompt;
  try{
    await requestModelPoster(canvas,{referenceUrl:template.preview||template.image,sceneUrl:aiPosterState.sceneSrc,ratio:aiPosterState.ratio,style:pack.style||template.style||'classic',templateId:'ai-conversation',brief:contextBrief,title:'',description:'',applyWarmOverlay:false});
    aiPosterState.resultUrl=canvas.toDataURL('image/png');
    const result=$('#aiPosterResult');if(result)result.src=aiPosterState.resultUrl;
    setAIPosterPreview('result');setAIPosterDraftStatus(`${pack.name} · ${aiPosterState.ratio==='portrait'?'竖版 3:4':aiPosterState.ratio==='square'?'方版 1:1':'横版 16:9'} · 已生成`);
    $('#aiPosterDownloadButton')?.removeAttribute('hidden');
    aiPosterState.history.push(`用户：${prompt}`);if(aiPosterState.history.length>6)aiPosterState.history=aiPosterState.history.slice(-6);
    const promptInput=$('#aiPosterPrompt');if(promptInput)promptInput.value='';
    appendAIPosterMessage('assistant','海报已生成','如果想继续调整，可以直接说“标题更醒目一点”或“换成更安静的夜景氛围”。');
  }catch(error){
    console.error('AI 对话海报生成失败：',error);setAIPosterPreview('empty');setAIPosterDraftStatus(friendlyModelError(error),true);appendAIPosterMessage('assistant','这次没有生成成功',friendlyModelError(error));
  }finally{
    aiPosterState.busy=false;if(button){button.disabled=false;button.querySelector('span').textContent='生成海报'}
  }
}
function bindAIPosterStudio(){
  const form=$('#aiPosterForm');if(!form)return;
  renderAIStyleOptions();
  form.addEventListener('submit',generateConversationalPoster);
  $('#aiPosterPrompt')?.addEventListener('keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.key==='Enter'){event.preventDefault();form.requestSubmit()}});
  $('#aiPosterSceneInput')?.addEventListener('change',()=>{
    const input=$('#aiPosterSceneInput'),file=input?.files?.[0];if(!file)return;
    readFileDataUrl(file).then(src=>{aiPosterState.sceneSrc=src;aiPosterState.sceneName=file.name;const name=$('#aiPosterSceneName'),meta=$('#aiPosterSceneMeta'),thumb=$('#aiPosterSceneThumb');if(name)name.textContent=file.name;if(meta)meta.textContent='已添加 · 点击可替换';if(thumb){thumb.src=src;thumb.classList.remove('hidden');}$('.ai-scene-chip')?.classList.add('has-image');$('.ai-scene-chip')?.classList.remove('needs-attention');setAIPosterDraftStatus('参考图片已就绪 · 可以开始描述');appendAIPosterMessage('assistant','已收到参考图片',`我会把它作为画面参考，融入「${aiPosterStylePack(aiPosterState.stylePackId).name}」风格。`)}).catch(error=>{console.error(error);setAIPosterDraftStatus('图片读取失败，请重试',true)})
  });
  $$('[data-ai-ratio]').forEach(button=>button.addEventListener('click',()=>{aiPosterState.ratio=button.dataset.aiRatio;$$('[data-ai-ratio]').forEach(item=>{const active=item===button;item.classList.toggle('is-active',active);item.setAttribute('aria-pressed',String(active))});setAIPosterDraftStatus(`已选择${button.textContent.trim()}画布`)}));
  $('#aiPosterDownloadButton')?.addEventListener('click',()=>{if(!aiPosterState.resultUrl)return;const link=document.createElement('a');link.href=aiPosterState.resultUrl;link.download=`酒店运营海报-${Date.now()}.png`;link.click()});
}
function openEditor(id,mode='template'){
  cancelCoverPreviewRender();
  activeWorkspace='templates';
  setActiveWorkspaceNav('templates');
  $('#toolsView')?.classList.add('hidden');
  $('#toolWorkspaceView')?.classList.add('hidden');
  $('#libraryView')?.classList.add('hidden');
  if($('#workspaceTitle'))$('#workspaceTitle').textContent='酒店运营图模板编辑';
  if(state.template?.id===id){window.clearTimeout(adminAutoSaveTimer);adminAutoSaveTimer=0}else flushTemplateAutoSave();
  state.generatorMode=mode==='generator';
  state.generated=false;
  state.generatedSource='none';
  state.roomUploaded=false;
  state.undoStack=[];
  state.templateBase=templates.find(t=>t.id===id)||templates[0];
  // 只克隆当前模板的顶层，管理员替换蒙层/装饰时不会污染模板库定义。
  state.template={...state.templateBase};
  state.outputFormat=state.template.format;
  state.roomSrc=state.template.image;
  state.logoSrc=''; state.qrSrc='';
  state.assetOverrides={};
  state.positions=makeDefaultPositions(state.outputFormat,state.template.layout,state.template.style);
  if(state.template.decorPosition)state.positions.decor={...state.positions.decor,...state.template.decorPosition};
  applyTemplateIconPositions(state.outputFormat);
  if(state.template.assetLayers)Object.entries(state.template.assetLayers).forEach(([key,asset])=>{state.positions[key]={x:asset.x??50,y:asset.y??50,w:asset.w??10,h:asset.h??10}});
  if(state.template.replaceablePhotoLayer&&state.template.assetLayers?.[state.template.replaceablePhotoLayer])state.positions.photo={...state.positions[state.template.replaceablePhotoLayer]};
  if(state.template.logoPosition)state.positions.logo={...state.positions.logo,...state.template.logoPosition};
  if(state.template.textPosition)Object.entries(state.template.textPosition).forEach(([key,position])=>{state.positions[key]={...state.positions[key],...position}});
  if(state.template.panelAsset)state.positions.panel={...(state.template.panelPosition||{x:0,y:0,w:100,h:100})}; else if(state.template.panelWidth)state.positions.panel.w=state.template.panelWidth;
  state.hiddenLayers=new Set(state.template.hiddenLayers||[]); state.selectedLayer=''; state.manualTextBoxWidths=new Set();
  state.imageAdjust={brightness:100,saturation:100};
  state.overlayTransparency=state.template.overlayTransparency??(state.template.style?0:22);
  state.layerTransparency={panel:state.overlayTransparency};
  state.textAdjust=normalizeTextAdjustments(state.template.textDefaults);
  state.psdTextValues=defaultPsdTextValues(state.template);
  const loadedTemplateDefaults=applySavedTemplateDefaults();
  normalizePsdSeparatorWidths();
  // Keep the right-side scene thumbnail aligned with a saved named photo
  // layer (notably the PSD portrait template).
  const savedPhotoLayer=state.template.replaceablePhotoLayer;
  if(savedPhotoLayer&&state.assetOverrides?.[savedPhotoLayer]){
    state.roomSrc=state.assetOverrides[savedPhotoLayer];
    state.roomUploaded=true;
    state.hiddenLayers.delete(savedPhotoLayer);
  }
  const copy={...defaultCopyForTemplate(state.template),...(state.templateCopyOverrides||{})};
  fitDefaultTextBoxWidths(copy);
  $('#libraryView').classList.add('hidden'); $('#editorView').classList.remove('hidden'); $('#editorView').classList.toggle('generator-mode',state.generatorMode); $('#editorTemplateName').textContent=state.template.name; $('#editorFlowLabel').textContent=state.generatorMode?'AI 生成':'模板编辑'; $('#previewModeLabel').textContent=state.generatorMode?'AI 生成预览 · 单张合成图':'实时预览 · 可编辑图层'; $('#dragHint').textContent=idleDragHint; $('#posterCanvas').className=`poster-canvas ${state.outputFormat} layout-${state.template.layout||'left'} style-${state.template.style||'classic'} decor-${state.template.decor||'plain'} ${state.template.canvasClass||''}`; $('#templatePreviewStage').src=state.template.preview||state.template.image; $('#templatePreviewStage').className=`template-preview-stage ${state.outputFormat} ${state.template.canvasClass||''}`; const previewSize=outputDimensions(); $('#previewSize').textContent=`${previewSize.width} × ${previewSize.height} px`;
  $('#exportButton').disabled=state.generatorMode;
  $('#resetButton').classList.toggle('hidden',state.generatorMode);
  $('#panelTabs').classList.toggle('hidden',state.generatorMode);
  $('#generatorBanner').classList.toggle('hidden',!state.generatorMode); $('#generatorSteps').classList.toggle('hidden',!state.generatorMode); $('#layerLegend').classList.add('hidden'); $('#layerToolbar').classList.toggle('hidden',state.generatorMode); $('#advancedImageControls').classList.toggle('hidden',state.generatorMode); $('#kickerField').classList.toggle('hidden',state.generatorMode); $('#kickerInput').classList.toggle('hidden',state.generatorMode); $('#taglineField').classList.toggle('hidden',state.generatorMode||state.template.hideTagline); $('#taglineInput').classList.toggle('hidden',state.generatorMode||state.template.hideTagline); $('#textAdjustPanel').classList.toggle('hidden',state.generatorMode); $('#copySection').classList.toggle('hidden',!state.generatorMode&&state.template.psdLayered); if(state.generatorMode){$('#privacyStatus').textContent='模型生成 · 素材仅发送至配置的模型服务';$('#styleRefThumb').src=state.template.preview||state.template.image;$('#styleRefName').textContent=stylePacks.find(pack=>pack.id===state.template.id)?.name||state.template.name;$('#styleRefMeta').textContent='参考图决定视觉方向；由图片模型直接输出一张扁平海报';$('#mediaSectionTitle').textContent='上传生成素材';$('#mediaSectionSub').textContent='场景、风格与文案会一次合成';$('#copySectionTitle').textContent='填写海报文案';$('#copySectionSub').textContent='模型会参考风格图自动安排版式';$('#assetNote').textContent='这里不会拆分或替换模板图层；提交后由图片模型参考风格图直接生成一张完整海报。';$('#applyButton').textContent='AI 生成海报';$('#generationStatus').textContent='将调用图片模型生成 · 请先上传场景图';$('#previewTip').textContent='进入后先查看模板预览；上传自己的场景图并填写文案后，点击「AI 生成海报」，将通过配置的模型服务输出一张完整成品。'}else{$('#privacyStatus').textContent='本地编辑 · 素材不上传';$('#mediaSectionTitle').textContent='画面素材';$('#mediaSectionSub').textContent=state.template.psdLayered?'替换后保留 PSD 原始照片层位置':'替换后会自动套用模板构图';$('#assetNote').textContent=state.template.psdLayered?'上传图片会直接替换 PSD 中的客房照片层，保留原始位置、尺寸和层级；所有文字图层只读。':'模板预览只用于模板库展示；编辑区底层始终使用纯实景图，文字、蒙层和装饰会独立叠加。';$('#copySectionTitle').textContent='替换文案';$('#copySectionSub').textContent='字体、字号、颜色由模板统一控制';$('#generationStatus').textContent='本地 Demo · 不会上传素材';$('#applyButton').textContent='应用修改';$('#previewTip').textContent='直接点击预览中的文字编辑；选中后可在右侧「文字样式」调整字号和行高，也可拖动文字、蒙层及其他元素调整位置。'}
  // 文案和文字样式在管理员调试时始终保持可见，便于保存默认文案与字号。
  if(!state.generatorMode&&state.template.psdLayered)$('#assetNote').textContent='上传图片会直接替换 PSD 中的客房照片层，保留原始位置、尺寸和层级；PSD 中的所有文字图层均可双击编辑。';
  if(!state.generatorMode&&state.template.rasterOnly)$('#assetNote').textContent='上传图片会直接替换旧 PSD 中的客房照片层，保留原始位置、尺寸和层级；其余 PSD 图层保持独立。';
  // The editor keeps the source-specific state internally, but presents the
  // same plain-language copy as the template library.
  $('#editorTemplateName').textContent=userTemplateName(state.template);
  if(!state.generatorMode&&state.template.psdLayered)$('#assetNote').textContent='上传图片会直接替换模板中的客房照片层，保留原始位置、尺寸和层级；文字图层保持独立。';
  if(!state.generatorMode&&state.template.rasterOnly)$('#assetNote').textContent='上传图片会直接替换模板中的客房照片层，保留原始位置、尺寸和层级；其余元素保持独立。';
  const isPsdCopyTemplate=Boolean(state.template.psdLayered||state.template.rasterOnly);
  $('#genericCopyFields')?.classList.toggle('hidden',isPsdCopyTemplate);
  $('#psdCopyFields')?.classList.toggle('hidden',!isPsdCopyTemplate);
  if(!state.generatorMode&&state.template.psdLayered){
    $('#copySectionTitle').textContent='替换文案';
    $('#copySectionSub').textContent='可在这里编辑，也可以双击画布文字';
  }
  if(!state.generatorMode&&state.template.rasterOnly){
    $('#copySectionTitle').textContent='替换文案';
    $('#copySectionSub').textContent='该模板文字暂不可直接替换';
  }
  $('#copySection').classList.remove('hidden');
  renderPsdCopyFields();
  const isBusinessTemplate=state.template.id==='daily-business-room'&&!state.generatorMode;
  const isStructuredTemplate=Boolean(state.template.structured)&&!state.template.rasterOnly||isBusinessTemplate;
  ['brandField','brandInput','subtitleField','subtitleInput'].forEach(id=>$('#'+id)?.classList.toggle('hidden',!isStructuredTemplate));
  ['feature1Field','feature1Input','feature2Field','feature2Input','feature3Field','feature3Input'].forEach(id=>$('#'+id)?.classList.toggle('hidden',!isBusinessTemplate));
  $('#kickerField').classList.toggle('hidden',state.generatorMode||isStructuredTemplate); $('#kickerInput').classList.toggle('hidden',state.generatorMode||isStructuredTemplate);
  $('#generatorPromptCard').classList.toggle('hidden',!state.generatorMode);
  updateGeneratorAttachments();
  $('#roomThumb').src=state.roomSrc; $('#brandInput').value=state.generatorMode?'':(copy.brand||''); $('#kickerInput').value=copy.kicker||''; $('#titleInput').value=state.generatorMode?'':(copy.title||''); $('#subtitleInput').value=state.generatorMode?'':(copy.subtitle||''); $('#feature1Input').value=state.generatorMode?'':(copy.feature1||''); $('#feature2Input').value=state.generatorMode?'':(copy.feature2||''); $('#feature3Input').value=state.generatorMode?'':(copy.feature3||''); $('#bodyInput').value=state.generatorMode?'':(copy.body||''); $('#taglineInput').value=copy.tagline||''; $('#brightnessInput').value=state.imageAdjust.brightness; $('#saturationInput').value=state.imageAdjust.saturation; $('#overlayInput').value=layerTransparencyValue('panel'); syncAdjustmentLabels(); updatePoster(); syncTemplateAdminUI(); window.scrollTo({top:0,behavior:'smooth'});
  $('#dragHint').textContent=idleDragHint;
  if(!state.generatorMode&&$('#previewTip'))$('#previewTip').textContent=state.template.psdLayered?'PSD 中的所有文字均为可编辑图层：双击文字编辑，拖动文字可移动，蓝色控制点可调整文本框大小；蒙层可拖动，与文字重叠时优先移动文字，编辑状态下拖动小手区域也会移动文字。':state.template.rasterOnly?'旧版 PSD 中的文字和装饰已按原图层作为独立素材还原，可分别拖动；场景照片可替换。':'点击文字即可在画布上编辑，插入光标会落在点击位置；拖动文字、蒙层、装饰和上传元素可移动，蓝色控制点可调整文本框大小；文字与蒙层重叠时优先移动文字，编辑状态下拖动小手区域也会移动文字。';
  if(!state.generatorMode&&(state.template.psdLayered||state.template.rasterOnly)){
    $('#mediaSectionSub').textContent=state.template.rasterOnly?'替换后保留原照片位置':'替换后保留照片位置';
    $('#previewTip').textContent=state.template.rasterOnly?'文字和装饰已作为独立素材还原，可分别拖动；场景照片可替换。':'文字均为独立可编辑图层：双击文字编辑，拖动文字可移动，蓝色控制点可调整文本框大小；蒙层可拖动，与文字重叠时优先移动文字。';
  }
  if(state.generatorMode&&!state.template.preview)prepareTemplatePreview();
}
// 预留锁定图层判断，当前模板中的蒙层也允许拖动；当蒙层与文字
// 框重叠时，bindLayerDrag() 会优先把指针交给文字层。
function isLockedLayerKey(key){
  // The hotel scene is always a protected bottom layer. Users can replace it
  // through the upload control, but must not accidentally select, delete or
  // drag the photo underneath the design layers.
  return key==='photo'||Boolean(key&&state.template?.replaceablePhotoLayer===key);
}
function layerMarkup(key,tag,attrs=''){
  if(state.hiddenLayers.has(key))return'';
  const isText=textLayers.has(key);
  const className=`poster-layer ${isText?'is-text-layer':''} ${key==='photo'?'poster-photo':''} ${key==='panel'?'poster-panel':''} ${isLockedLayerKey(key)?'is-locked':''} poster-${key}`;
  const lockedAttr=isLockedLayerKey(key)?' data-locked="true" aria-readonly="true"':'';
  if(tag==='img')return`<img class="${className}" data-layer="${key}"${lockedAttr}${isLockedLayerKey(key)?' draggable="false"':''} ${attrs} />`;
  const editableAttrs=isText?` contenteditable="false" spellcheck="false" aria-label="${layerLabels[key]||key}"`:'';
  const editHint=isText?' title="双击编辑文字 · 拖动移动 · 蓝色控制点调整文本框大小"':'';
  const resizeHandles=isText?textResizeEdges.map(edge=>`<span class="text-resize-handle handle-${edge}" data-resize-for="${key}" data-resize-edge="${edge}" contenteditable="false" title="拖动调整文本框大小" aria-label="拖动调整文本框大小"></span>`).join(''):'';
  const layerLabel=layerLabels[key]||key;
  return`<${tag} class="${className}" data-layer="${key}" data-layer-label="${layerLabel}"${lockedAttr}${editableAttrs}${editHint} ${attrs}>${resizeHandles}</${tag}>`;
}
function templateAssetEntries(){return Object.entries(state.template?.assetLayers||{}).map(([key,asset])=>({key,asset:{...asset,src:templateAssetSource(key,asset)}}));}
function templateAssetMarkup(){return templateAssetEntries().filter(({key})=>!isPsdEditableTextLayer(key)).map(({key,asset})=>{
    const source=templateAssetSource(key,asset);
    // The Figma rule is a 512×4 PNG. Render it as a 1px bitmap inside a
    // larger transparent div so the hit area stays easy to select.
    if(key==='businessRule')return layerMarkup(key,'div',`role="img" aria-label="${asset.label||'分隔线'}" data-asset-source="${source}" title="拖动调整${asset.label||'分隔线'}位置"`);
    const title=isLockedLayerKey(key)?'酒店场景图｜最底层（已锁定，请从右侧上传替换）':`拖动调整${asset.label||'装饰元素'}位置`;
    return layerMarkup(key,'img',`src="${source}" alt="${asset.label||'PNG 装饰元素'}" title="${title}"`);
  }).join('')}
function setTextLayer(key,value){const node=$(`.poster-${key}`);if(!node)return;node.textContent=value;ensureTextResizeHandles(node,key)}
function updatePoster(){
  $('#bodyCount').textContent=`${$('#bodyInput').value.length} / 100`;
  if(state.generatorMode){renderFlatPreview();return}
  $('#templatePreviewStage')?.classList.add('hidden'); $('#flatPreview')?.classList.add('hidden'); $('#flatPreviewEmpty')?.classList.add('hidden'); $('#posterCanvas')?.classList.remove('hidden');
  const canvas=$('#posterCanvas'); if(!state.positions)state.positions=makeDefaultPositions(state.outputFormat||state.template.format,state.template.layout,state.template.style);
  const isBusiness=state.template.id==='daily-business-room';
  const isStructured=Boolean(state.template.structured)||isBusiness;
  const structuredTextKeys=state.template.textLayerKeys||['brand','title','subtitle','body','tagline'];
  const textMarkup=state.template.rasterOnly
    ? ''
    : state.template.psdLayered
      ? psdTextKeys(state.template).map(key=>layerMarkup(key,'div')).join('')
    : isBusiness
      ? ['brand','title','subtitle','feature1','feature2','feature3','body','tagline'].map(key=>layerMarkup(key,'div')).join('')
      : isStructured
        ? [...structuredTextKeys,...(state.template.showRule?['rule']:[])].map(key=>layerMarkup(key,'div')).join('')
        : [layerMarkup('kicker','div'),layerMarkup('title','div'),layerMarkup('rule','div'),layerMarkup('body','div'),layerMarkup('tagline','div')].join('');
  const businessIconMarkup=isBusiness&&state.template.iconAssets
    ? ['work','city','sleep'].map(name=>layerMarkup(`icon-${name}`,'img',`src="${effectiveAssetSource(`icon-${name}`,state.template.iconAssets[name])}" alt="${layerLabels[`icon-${name}`]}" title="拖动调整${layerLabels[`icon-${name}`]}位置"`)).join('')
    : '';
  const decorMarkup=isBusiness||isStructured?'':layerMarkup('decor','img',`src="${effectiveAssetSource('decor',state.template.decorAsset||'./assets/decor-ornament.png')}" alt="装饰元素 PNG" title="拖动调整装饰元素位置"`);
  // Asset-based templates (notably the PSD poster) already include their
  // scene photo as a real layer. Do not add a second generic bottom layer
  // after upload; it would sit below the PSD background and appear empty.
  const basePhotoMarkup=state.template.photoMode!=='asset'?layerMarkup('photo','div','title="酒店场景图｜最底层"'):'';
  const basePanelMarkup=state.template.skipPanel?'':layerMarkup('panel','div',`title="${state.template.panelAsset?'专用蒙层 PNG':(state.template.overlayGradient?'渐变蒙层':'纯色蒙层')}｜可拖动"`);
  const hideGenericAssets=Boolean(state.template.hideGenericAssets||templateLogoLayerKey());
  const genericLogoMarkup=hideGenericAssets?'':layerMarkup('logo','img','alt="Logo" title="拖动调整 Logo 位置"');
  const genericQrMarkup=hideGenericAssets?'':layerMarkup('qr','img','alt="二维码" title="拖动调整二维码位置"');
  canvas.innerHTML=[basePhotoMarkup,basePanelMarkup,decorMarkup,templateAssetMarkup(),businessIconMarkup,textMarkup,genericLogoMarkup,genericQrMarkup].join('');
  $$('.poster-layer').forEach(layer=>{layer.dataset.layerLabel=layerLabels[layer.dataset.layer]||layer.dataset.layer});
  const photo=$('.poster-photo'); if(photo){photo.style.backgroundImage=`url("${state.roomSrc}")`; photo.style.filter=`brightness(${state.imageAdjust.brightness}%) saturate(${state.imageAdjust.saturation}%)`}
  const textValues=isBusiness
    ? {brand:$('#brandInput')?.value||'',title:$('#titleInput').value,subtitle:$('#subtitleInput')?.value||'',feature1:$('#feature1Input')?.value||'',feature2:$('#feature2Input')?.value||'',feature3:$('#feature3Input')?.value||'',body:$('#bodyInput').value,tagline:$('#taglineInput').value}
    : isStructured
      ? {brand:$('#brandInput')?.value||'',title:$('#titleInput').value,subtitle:$('#subtitleInput')?.value||'',body:$('#bodyInput').value,tagline:$('#taglineInput').value}
      : {kicker:$('#kickerInput').value,title:$('#titleInput').value,body:$('#bodyInput').value,tagline:$('#taglineInput').value};
  Object.entries(textValues).forEach(([key,value])=>setTextLayer(key,value));
  if(state.template.psdLayered)Object.entries(state.psdTextValues||{}).forEach(([key,value])=>setTextLayer(key,value));
  if(state.logoSrc&&!templateLogoLayerKey()&&$('.poster-logo')){$('.poster-logo').src=state.logoSrc;$('.poster-logo').style.display='block'} if(state.qrSrc&&$('.poster-qr')){$('.poster-qr').src=state.qrSrc;$('.poster-qr').style.display='block'}
  const brandNode=$('.poster-brand'); if(brandNode)brandNode.style.display=state.logoSrc&&!templateLogoLayerKey()?'none':'block';
  applyLayerPositions(); applyTextAdjustments(); applyTypography(); bindLayerDrag(); bindTextResize(); bindTextEditing(); bindCanvasDeselect(); syncSelectionControls(); syncUndoButton();
  syncLogoUploadCard();
  scheduleCurrentTemplateCoverSync();
}
function panelAssetBackground(panelAsset,crop){
  if(!panelAsset||!crop)return `url("${panelAsset}") center/100% 100% no-repeat`;
  const sizeX=(100/Math.max(crop.w,.0001)).toFixed(4),sizeY=(100/Math.max(crop.h,.0001)).toFixed(4);
  const posX=crop.w>=.9999?0:(crop.x/Math.max(1-crop.w,.0001))*100;
  const posY=crop.h>=.9999?0:(crop.y/Math.max(1-crop.h,.0001))*100;
  return `url("${panelAsset}") ${posX.toFixed(4)}% ${posY.toFixed(4)}% / ${sizeX}% ${sizeY}% no-repeat`;
}
function applyLayerPositions(){
  const p=state.positions,canvas=$('#posterCanvas');
  const assetLayers=state.template?.assetLayers||{};
  $$('.poster-layer').forEach(layer=>{const key=layer.dataset.layer; const point=p[key]; if(!point)return; layer.style.left=`${point.x}%`; layer.style.top=`${point.y}%`; layer.style.opacity=String(1-layerTransparencyValue(key)/100); if(textLayers.has(key)){layer.style.width=`${point.w||34}%`;layer.style.height=`${point.h||20}%`;layer.style.overflow=psdTextSpecs(state.template)[key]?.pointText?'visible':'hidden';layer.style.transform=isPsdEditableTextLayer(key)?'translate(-50%,-50%)':'';if(isStrictPsdStackTemplate(state.template)&&psdTextSpecs(state.template)[key]?.zIndex!=null)layer.style.setProperty('z-index',String(psdTextSpecs(state.template)[key].zIndex),'important');if(canvas)layer.dataset.sizeLabel=`${Math.round(canvas.clientWidth*(point.w||34)/100)} × ${Math.round(canvas.clientHeight*(point.h||20)/100)}`} if(key==='rule'&&point.w){layer.style.width=`${point.w}%`;layer.style.height=`${point.h||.35}%`;layer.style.zIndex='5'} if(key==='panel'){layer.style.width=`${point.w}%`;layer.style.height=`${point.h}%`; const alpha=1-layerTransparencyValue('panel')/100; const panelAsset=effectiveAssetSource('panel',state.template.panelAsset||''); if(panelAsset){layer.style.background=panelAssetBackground(panelAsset,state.template.panelAssetCrop);layer.style.opacity=String(alpha)}else{layer.style.opacity='1';layer.style.background=overlayBackground(alpha)}} if(key==='decor'){layer.style.width=`${state.template.decorSize||18}%`;layer.style.height='auto'} if(/^icon-/.test(key)){layer.style.width=`${point.w||4}%`;layer.style.height=`${point.h||7}%`;layer.style.transform='translate(-50%,-50%)';layer.style.objectFit='contain'} if(assetLayers[key]){layer.style.width=`${point.w||assetLayers[key].w||10}%`;layer.style.height=`${point.h||assetLayers[key].h||10}%`;layer.style.transform='translate(-50%,-50%)';layer.style.objectFit=state.template.replaceablePhotoLayer===key&&state.roomUploaded?'cover':'contain';layer.style.zIndex=String(assetLayers[key].zIndex??2);if(key==='businessRule'){const source=layer.dataset.assetSource||templateAssetSource(key,assetLayers[key]);if(source){layer.style.backgroundImage=`url("${source}")`;layer.style.backgroundPosition='center';layer.style.backgroundSize='100% 1px';layer.style.backgroundRepeat='no-repeat'}}if(state.template.replaceablePhotoLayer===key){layer.style.filter=state.roomUploaded?`brightness(${state.imageAdjust.brightness}%) saturate(${state.imageAdjust.saturation}%)`:''}} if(key==='accentDot'){layer.style.transform='translate(-50%,-50%)';layer.style.width='5px';layer.style.height='5px'} if(key==='accentGlow'){layer.style.transform='translate(-50%,-50%)';layer.style.width='28px';layer.style.height='28px'} });
  const photo=$('.poster-photo'); if(photo){if(state.template.replaceablePhotoLayer){const point=p.photo||{x:50,y:50,w:100,h:100};photo.style.left=`${point.x-point.w/2}%`;photo.style.top=`${point.y-point.h/2}%`;photo.style.width=`${point.w}%`;photo.style.height=`${point.h}%`;photo.style.backgroundSize='cover';photo.style.backgroundPosition='50% 50%'}else{photo.style.left='0';photo.style.top='0';photo.style.backgroundPosition=`${p.photo.x}% ${p.photo.y}%`}}
}
function overlayBackground(alpha){
  const {rgb,start,mid,end,midAt}=overlayPalette(); const layout=state.template.layout||'left'; const a=value=>(Number(value)*alpha).toFixed(3);
  // 后备蒙层默认使用纯色；只有模板明确声明 overlayGradient 才绘制渐变。
  // 这样不会把参考图中没有渐变的模板强制处理成渐变。
  if(!state.template.overlayGradient)return `rgba(${rgb},${a(start)})`;
  // Figma「01｜云境商务客房」的 left-panel 是 720px 的对角渐变矢量，
  // 不是旧版带几何线条的 PNG。这里保留同样的两端颜色和透明度。
  if(state.template.id==='daily-business-room')return `linear-gradient(to bottom right,rgba(34,58,82,${(0.97*alpha).toFixed(3)}),rgba(48,78,104,${(0.91*alpha).toFixed(3)}))`;
  const gradient=mid==null?`rgba(${rgb},${a(start)}),rgba(${rgb},${a(end)})`:`rgba(${rgb},${a(start)}) 0%,rgba(${rgb},${a(mid)}) ${midAt||80}%,rgba(${rgb},${a(end)}) 100%`; if(layout==='right')return `linear-gradient(90deg,${mid==null?`rgba(${rgb},${a(end)}),rgba(${rgb},${a(start)})`:`rgba(${rgb},${a(end)}) 0%,rgba(${rgb},${a(mid)}) ${midAt||80}%,rgba(${rgb},${a(start)}) 100%`})`; return `linear-gradient(90deg,${gradient})`;
}
function overlayPalette(){
  // Keep the fade subtle and opaque enough to fully cover baked-in text from the reference preview.
  const palettes={warm:{rgb:'57,31,13',start:.99,mid:.96,midAt:82,end:.70},midnight:{rgb:'5,22,49',start:1,mid:.98,midAt:82,end:.72},parchment:{rgb:'247,240,222',start:.98,mid:.96,midAt:82,end:.78},business:{rgb:'34,58,82',start:.97,mid:null,midAt:82,end:.91},family:{rgb:'255,247,234',start:.98,mid:.96,midAt:82,end:.78},classic:{rgb:'36,22,13',start:.98,mid:.95,midAt:82,end:.74}};
  return palettes[state.template.style||'classic']||palettes.classic;
}
function textPalette(){
  if(state.template?.psdLayered)return Object.fromEntries(Object.entries(psdTextSpecs(state.template)).map(([key,spec])=>[key,spec.color||'#716961']));
  const light={kicker:'#d9ad60',title:'#fff3df',body:'#f2e7d3',tagline:'#d9ad60',rule:'#d9ad60'};
  if(state.template?.palette)return{...light,...state.template.palette};
  if(state.template.style==='business')return{brand:'#f3bd7b',title:'#f1c19e',subtitle:'#f4f7fb',feature1:'#f4f7fb',feature2:'#f4f7fb',feature3:'#f4f7fb',body:'#d9e4ee',tagline:'#d9e3ed',rule:'rgba(238,245,250,.42)'};
  if(state.template.style==='parchment'||state.template.style==='family')return{kicker:'#a46f31',title:'#54371f',body:'#604a38',tagline:'#a46f31',rule:'#b88b47'};
  return light;
}
function typographyFor(style,key){
  if(state.template?.psdLayered&&psdTextSpecs(state.template)[key]){
    const spec=psdTextSpecs(state.template)[key];
    const fontName=String(spec.fontName||'');
    const kind=/SourceHanSerif/i.test(fontName)?'source-han-serif':(/SourceHanSans/i.test(fontName)?'source-han-sans':(spec.kind||'sans'));
    return {kind,weight:spec.weight||400,fontStyle:spec.fontStyle||'normal'};
  }
  const preset=typographyPresets[style]||typographyPresets.classic;
  // Structured templates can expose brand/subtitle/feature fields that are
  // intentionally omitted from a more minimal preset. Always return a
  // complete spec so one missing field cannot abort the whole typography pass.
  return preset[key]||typographyPresets.classic[key]||{
    kind:key==='title'?'serif':'sans',
    weight:key==='title'?600:400
  };
}
function gradientFor(style,key){return textGradientStops[state.template?.id]?.[key]||null}
function cssGradient(stops){return stops?`linear-gradient(180deg,${stops[0]} 0%,${stops[1]} 100%)`:''}
function canvasTextFill(ctx,style,key,x,y,height){const stops=gradientFor(style,key);if(!stops){ctx.fillStyle=textPalette()[key]||'#fff';return}const gradient=ctx.createLinearGradient(x,y,x,y+height);gradient.addColorStop(0,stops[0]);gradient.addColorStop(1,stops[1]);ctx.fillStyle=gradient}
function canvasFont(style,key,size){const spec=typographyFor(style,key);return `${spec.fontStyle&&spec.fontStyle!=='normal'?`${spec.fontStyle} `:''}${spec.weight} ${size}px ${fontFamilies[spec.kind]||fontFamilies.sans}`}
function textLetterSpacingPixels(key,size){
  const style=state.template?.style||'classic';
  const businessSpacing={brand:'.02em',title:'.024em',subtitle:'.107em',feature1:'0',feature2:'0',feature3:'0',body:'.05em',tagline:'.033em'};
  const configured=state.template?.letterSpacing?.[key]??(state.template?.psdLayered?(psdTextSpecs(state.template)[key]?.letterSpacing||'0'):(style==='business'?(businessSpacing[key]||'0'):(key==='title'?'-.04em':key==='kicker'?'.04em':'0')));
  const value=String(configured||'0').trim();
  if(value.endsWith('em'))return Number.parseFloat(value)*size||0;
  if(value.endsWith('px'))return Number.parseFloat(value)||0;
  return Number.parseFloat(value)||0;
}
function fitDefaultTextBoxWidths(copy={}){
  if(!state.positions||!state.textAdjust||state.generatorMode)return;
  const dimensions=outputDimensions();
  const measureCanvas=document.createElement('canvas');
  const ctx=measureCanvas.getContext('2d');
  if(!ctx)return;
  const manual=state.manualTextBoxWidths||new Set();
  textLayers.forEach(key=>{
    const point=state.positions[key],adjust=state.textAdjust[key];
    // 正文是段落版式，必须保留设计稿给出的换行宽度；其他文字默认收紧到
    // 当前内容的最长一行，用户第一次拖拽后则记录为手动宽度。
    if(!point||!adjust||manual.has(key)||key==='body'||/_body$/.test(key)||isPsdEditableTextLayer(key))return;
    const value=state.template?.psdLayered?state.psdTextValues?.[key]:(copy[key]??renderCopyValue(key));
    const text=String(value??'').replace(/\r/g,'');
    if(!text.trim())return;
    const fontSize=Number(adjust.fontSize)||18;
    ctx.font=canvasFont(state.template?.style||'classic',key,fontSize);
    const spacing=textLetterSpacingPixels(key,fontSize);
    // The wrapping routine measures the raw glyph width. Negative tracking
    // can reduce the visual width, but it must never make the default box
    // narrower than that raw width or a title will wrap unexpectedly and
    // collide with the following text block.
    const longest=text.split('\n').reduce((max,line)=>{
      const raw=ctx.measureText(line).width;
      const tracked=raw+Math.max(0,[...line].length-1)*spacing;
      return Math.max(max,raw,tracked);
    },0);
    if(!longest)return;
    const padding=Math.max(12,fontSize*.16);
    const desired=Math.min(Number(point.w)||34,(longest+padding)/dimensions.width*100);
    if(desired>0&&desired<(Number(point.w)||34)-.2)point.w=Math.max(1,Number(desired.toFixed(3)));
  });
}
function selectLayer(key){
  if(isLockedLayerKey(key))return;
  // 切换到其他图层时结束旧文字编辑，避免旧文字框仍显示为可编辑，
  // 让用户误以为点击命中了背景或同时选中了多个图层。
  $$('.poster-layer.is-editing').forEach(layer=>{
    if(layer.dataset.layer===key)return;
    layer.dataset.editing='false';
    layer.contentEditable='false';
    layer.classList.remove('is-editing');
  });
  state.selectedLayer=key;
  $$('.poster-layer').forEach(layer=>layer.classList.toggle('layer-selected',layer.dataset.layer===key));
  syncSelectionControls();
}
function syncElementTransparencyControl(){
  const input=$('#overlayInput'),value=$('#overlayValue'),label=$('#overlayLabel');
  const key=state.selectedLayer;
  const enabled=Boolean(key&&!isLockedLayerKey(key));
  if(input){input.disabled=!enabled;input.value=enabled?String(layerTransparencyValue(key)):0}
  if(value)value.textContent=enabled?`${layerTransparencyValue(key)}%`:'—';
  if(label)label.firstChild&&(label.firstChild.nodeValue=enabled?'元素透明度 ':'元素透明度（先选择元素） ');
}
function syncSelectionControls(){
  // 历史快照或旧版本地配置可能残留 photo 选中状态。场景图是受保护的
  // 底层，只能通过右侧上传替换，不应显示为可编辑或可删除图层。
  if(isLockedLayerKey(state.selectedLayer))state.selectedLayer='';
  const label=$('#selectedLayerLabel'); const deleteButton=$('#deleteLayerButton');
  $$('.poster-layer').forEach(layer=>layer.classList.toggle('layer-selected',layer.dataset.layer===state.selectedLayer));
  const selectedAsset=state.template?.assetLayers?.[state.selectedLayer];
  const selectedLabel=selectedAsset?.label||layerLabels[state.selectedLayer]||state.selectedLayer;
  if(label)label.textContent=state.selectedLayer?`已选中：${selectedLabel}`:'点击预览中的元素进行选择';
  if(deleteButton)deleteButton.disabled=!state.selectedLayer||isLockedLayerKey(state.selectedLayer);
  syncTextControls(); syncElementTransparencyControl()
}
function placeTextCaretAtPoint(layer,clientX,clientY){
  // 使用浏览器的命中测试，把插入点放到用户实际点击的字符位置。
  let range=null;
  if(document.caretRangeFromPoint)range=document.caretRangeFromPoint(clientX,clientY);
  else if(document.caretPositionFromPoint){
    const position=document.caretPositionFromPoint(clientX,clientY);
    if(position){range=document.createRange();range.setStart(position.offsetNode,position.offset);range.collapse(true)}
  }
  if(!range||!layer.contains(range.startContainer)||range.startContainer.closest?.('.text-resize-handle')){
    range=document.createRange();
    const resizeHandle=layer.querySelector('.text-resize-handle');
    if(resizeHandle)range.setStartBefore(resizeHandle);
    else{range.selectNodeContents(layer);range.collapse(false)}
    range.collapse(true);
  }
  const selection=window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}
function beginTextEditing(layer,key,clientX,clientY){
  if(!layer||!textLayers.has(key))return;
  selectLayer(key);
  layer.dataset.editing='true';
  layer.dataset.undoCaptured='false';
  layer.contentEditable='true';
  layer.classList.add('is-editing');
  layer.focus();
  placeTextCaretAtPoint(layer,clientX,clientY);
  const hint=$('#dragHint');
  if(hint)hint.textContent=`正在编辑：${layerLabels[key]} · 光标跟随点击位置 · 修改后点击画布外完成`;
}
function applyTextAdjustments(){
  const canvas=$('#posterCanvas'); if(!canvas)return; const scale=canvas.clientWidth/outputDimensions().width;
  textLayers.forEach(key=>{const node=$(`.poster-${key}`);if(!node)return;const spec=psdTextSpecs(state.template)[key];if(isPsdEditableTextLayer(key)&&spec?.scaleX){node.style.transform=`translate(-50%,-50%) scaleX(${Number(spec.scaleX)||1})`}});
  // 文本框只负责位置、宽高和换行，字号始终由右侧字号控件控制。
  // 不再根据 scrollHeight 自动缩小文字，避免拖拽文本框时文字变小。
  textLayers.forEach(key=>{const node=$(`.poster-${key}`); const adjust=state.textAdjust[key]; const point=state.positions?.[key]; if(!node||!adjust||!point)return; const size=adjust.fontSize*scale; node.style.fontSize=`${size}px`; node.style.lineHeight=String(adjust.lineHeight); node.style.width=`${point.w||34}%`; node.style.height=`${point.h||20}%`; adjust.effectiveFontSize=adjust.fontSize})
}
function ensureTextResizeHandles(layer,key){
  textResizeEdges.forEach(edge=>{
    if(layer.querySelector(`.handle-${edge}`))return;
    const handle=document.createElement('span');
    handle.className=`text-resize-handle handle-${edge}`;
    handle.dataset.resizeFor=key;
    handle.dataset.resizeEdge=edge;
    handle.contentEditable='false';
    handle.title='拖动调整文本框大小';
    handle.setAttribute('aria-label','拖动调整文本框大小');
    layer.appendChild(handle);
  });
}
function bindTextResize(){
  const canvas=$('#posterCanvas');
  if(!canvas||canvas.dataset.resizeBound==='true')return;
  canvas.dataset.resizeBound='true';
  canvas.addEventListener('pointerdown',event=>{
    const handle=event.target.closest?.('.text-resize-handle');
    if(!handle)return;
    event.preventDefault(); event.stopPropagation(); const key=handle.dataset.resizeFor,edge=handle.dataset.resizeEdge||'se',layer=$(`.poster-${key}`),point=state.positions[key]; if(!layer||!point)return; selectLayer(key); layer.classList.add('is-resizing'); layer.setPointerCapture?.(event.pointerId); const startX=event.clientX,startY=event.clientY,startW=point.w||34,startH=point.h||20,startLeft=point.x,startTop=point.y,rect=canvas.getBoundingClientRect(); let undoCaptured=false; $('#dragHint').textContent=`正在调整：${layerLabels[key]} · 松开鼠标完成`;
    const move=moveEvent=>{const dx=(moveEvent.clientX-startX)/rect.width*100,dy=(moveEvent.clientY-startY)/rect.height*100;let nextW=startW,nextH=startH,nextX=startLeft,nextY=startTop;if(edge.includes('e'))nextW=clamp(startW+dx,10,90);if(edge.includes('w')){nextW=clamp(startW-dx,10,90);nextX=clamp(startLeft+dx,-30,100-nextW)}if(edge.includes('s'))nextH=clamp(startH+dy,5,80);if(edge.includes('n')){nextH=clamp(startH-dy,5,80);nextY=clamp(startTop+dy,-30,100-nextH)}if(!undoCaptured&&(dx||dy)){pushUndoSnapshot();undoCaptured=true;state.manualTextBoxWidths?.add(key)}point.x=nextX;point.y=nextY;point.w=nextW;point.h=nextH;applyLayerPositions();applyTextAdjustments();scheduleCurrentTemplateCoverSync()};
    const up=()=>{layer.releasePointerCapture?.(event.pointerId);layer.classList.remove('is-resizing');if(undoCaptured)queueTemplateAutoSave('调整文本框');$('#dragHint').textContent=idleDragHint;document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);document.removeEventListener('pointercancel',up)};
    document.addEventListener('pointermove',move);document.addEventListener('pointerup',up,{once:true});document.addEventListener('pointercancel',up,{once:true});
  },true);
}
function bindTextEditing(){
  $$('.poster-layer').forEach(layer=>{
    const key=layer.dataset.layer;
    if(!textLayers.has(key))return;
    layer.addEventListener('dblclick',event=>{
      if(event.target.closest?.('.text-resize-handle'))return;
      event.preventDefault();
      event.stopPropagation();
      beginTextEditing(layer,key,event.clientX,event.clientY);
    });
    layer.addEventListener('input',()=>{
      if(layer.dataset.editing!=='true')return;
      const input=$(`#${key}Input`);
      if(layer.dataset.undoCaptured!=='true'){pushUndoSnapshot();layer.dataset.undoCaptured='true'}
      const value=layer.innerText.replace(/\u00a0/g,' ').replace(/\r/g,'');
      if(input)input.value=value;
      if(isPsdEditableTextLayer(key)){state.psdTextValues[key]=value;syncPsdCopyFields()}
      if(key==='body')$('#bodyCount').textContent=`${value.length} / 100`;
      ensureTextResizeHandles(layer,key);
      applyTextAdjustments(); scheduleCurrentTemplateCoverSync(); queueTemplateAutoSave('编辑文字');
    });
    layer.addEventListener('keydown',event=>{
      if(event.key==='Escape'){
        event.preventDefault();
        layer.blur();
      }else if(event.key==='Enter'&&!['title','body'].includes(key)){
        event.preventDefault();
        layer.blur();
      }
    });
    layer.addEventListener('blur',()=>{
      if(layer.dataset.editing!=='true')return;
      layer.dataset.editing='false';
      layer.contentEditable='false';
      layer.classList.remove('is-editing');
      const hint=$('#dragHint');
      if(hint)hint.textContent=idleDragHint;
      syncSelectionControls();
    });
  });
}
function clearLayerSelection(){
  const editing=$('.poster-layer.is-editing');
  if(editing){editing.dataset.editing='false';editing.contentEditable='false';editing.classList.remove('is-editing')}
  state.selectedLayer='';
  syncSelectionControls();
  const hint=$('#dragHint');
  if(hint)hint.textContent=idleDragHint;
}
function bindCanvasDeselect(){
  const workArea=$('.canvas-wrap');
  if(!workArea||workArea.dataset.deselectBound==='true')return;
  workArea.dataset.deselectBound='true';
  workArea.addEventListener('pointerdown',event=>{
    if(event.target.closest?.('.poster-layer'))return;
    clearLayerSelection();
  });
}
function applyTypography(){
  const palette=textPalette(); const style=state.template.style||'classic';
  textLayers.forEach(key=>{const node=$(`.poster-${key}`);if(!node)return;const spec=typographyFor(style,key);node.style.fontFamily=fontFamilies[spec.kind]||fontFamilies.sans;node.style.fontWeight=String(spec.weight);
    node.style.fontStyle=spec.fontStyle||'normal';
    const businessSpacing={brand:'.02em',title:'.024em',subtitle:'.107em',feature1:'0',feature2:'0',feature3:'0',body:'.05em',tagline:'.033em'};
    node.style.whiteSpace=psdTextSpecs(state.template)[key]?.pointText?'pre':(isPsdEditableTextLayer(key)?'pre-wrap':'pre-line');
    node.style.letterSpacing=state.template.letterSpacing?.[key]??(state.template.psdLayered?(psdTextSpecs(state.template)[key]?.letterSpacing||'0'):(style==='business'?(businessSpacing[key]||'0'):(key==='title'?'-.04em':key==='kicker'?'.04em':'0')));
    node.style.textAlign=state.template.textAlign?.[key]||(/^feature[1-3]$/.test(key)?'center':'left');
    const gradient=cssGradient(gradientFor(style,key));if(gradient){node.style.backgroundImage=gradient;node.style.backgroundClip='text';node.style.webkitBackgroundClip='text';node.style.color='transparent';node.style.webkitTextFillColor='transparent'}else{node.style.backgroundImage='none';node.style.backgroundClip='border-box';node.style.webkitBackgroundClip='border-box';node.style.color=palette[key]||'#fff';node.style.webkitTextFillColor=''} });
}
function syncTextControls(){
  const selected=state.selectedLayer; const enabled=textLayers.has(selected); const panel=$('#textAdjustPanel'); const label=$('#selectedTextLabel'); const sizeInput=$('#fontSizeInput'); const lineInput=$('#lineHeightInput');
  if(panel)panel.classList.toggle('is-disabled',!enabled); if(label)label.textContent=enabled?`正在调整：${layerLabels[selected]}`:'先点击预览中的文字'; if(sizeInput)sizeInput.disabled=!enabled; if(lineInput)lineInput.disabled=!enabled;
  if(enabled){const adjust=state.textAdjust[selected]; if(sizeInput)sizeInput.value=adjust.fontSize; if(lineInput)lineInput.value=adjust.lineHeight; if($('#fontSizeValue'))$('#fontSizeValue').textContent=`${adjust.fontSize}px`; if($('#lineHeightValue'))$('#lineHeightValue').textContent=adjust.lineHeight.toFixed(2)}else{if($('#fontSizeValue'))$('#fontSizeValue').textContent='—';if($('#lineHeightValue'))$('#lineHeightValue').textContent='—'}
}
function startLayerDrag(layer,event,canvas){
  const key=layer?.dataset.layer;
  if(!layer)return false;
  if(isLockedLayerKey(key)){
    // Consume pointer events on the protected scene layer so they do not
    // fall through and accidentally select or drag another layer underneath.
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
  if(event.button!==undefined&&event.button!==0)return false;
  if(!state.positions[key]||event.target.closest?.('.text-resize-handle'))return false;

  // 文字采用“点击编辑、拖动移动”的判定：没有明显位移时进入编辑并在点击处放置光标，
  // 超过 4px 的位移则按原有逻辑移动图层，避免点击编辑与拖动相互冲突。
  // 不根据 event.detail 提前返回：双击拖动的第二次 pointerdown 也必须被文字层拦截，
  // 否则事件会冒泡到下面的 PSD 背景层，导致用户拖动文字时误移动背景。
  const isText=textLayers.has(key);
  event.preventDefault();
  event.stopPropagation();
  selectLayer(key);
  const startX=event.clientX,startY=event.clientY,start={...state.positions[key]},rect=canvas.getBoundingClientRect();
  let moved=false;
  const move=moveEvent=>{
    const deltaX=moveEvent.clientX-startX,deltaY=moveEvent.clientY-startY;
    if(isText&&!moved&&Math.hypot(deltaX,deltaY)<4)return;
    if(!moved){
      moved=true;
      pushUndoSnapshot();
      // contenteditable 会把后续指针移动解释为选中文字。确认用户
      // 真正开始拖动后，立即退出编辑状态并清除选区，让文字和图片
      // 图层使用同一套移动逻辑。
      if(isText&&layer.dataset.editing==='true'){
        layer.dataset.editing='false';
        layer.contentEditable='false';
        layer.classList.remove('is-editing');
        window.getSelection?.().removeAllRanges();
      }
      layer.classList.add('is-dragging');
      $('#dragHint').textContent=`正在调整：${layerLabels[key]} · 松开鼠标完成`;
    }
    const dx=deltaX/rect.width*100,dy=deltaY/rect.height*100;
    state.positions[key].x=clamp(start.x+dx,-30,130);
    state.positions[key].y=clamp(start.y+dy,-30,130);
    applyLayerPositions();
    scheduleCurrentTemplateCoverSync();
  };
  const up=()=>{
    layer.releasePointerCapture?.(event.pointerId);
    document.removeEventListener('pointermove',move);
    document.removeEventListener('pointerup',up);
    document.removeEventListener('pointercancel',up);
    layer.classList.remove('is-dragging');
    if(moved){
      window.getSelection?.().removeAllRanges();
      queueTemplateAutoSave(`移动${layerLabels[key]||'图层'}`);
    }
    if(isText&&!moved)beginTextEditing(layer,key,event.clientX,event.clientY);
    else $('#dragHint').textContent=idleDragHint;
  };
  layer.setPointerCapture?.(event.pointerId);
  document.addEventListener('pointermove',move);
  document.addEventListener('pointerup',up,{once:true});
  document.addEventListener('pointercancel',up,{once:true});
  return true;
}
function layerHitPadding(layer){
  const key=layer?.dataset.layer||'';
  if(!layer||textLayers.has(key)||key==='photo'||key==='panel')return 0;
  const rect=layer.getBoundingClientRect();
  // Keep the visual bitmap untouched, but make narrow/short assets easy to
  // select on a trackpad. Padding is used only by the pointer router below;
  // it never changes the exported poster or the layer's visible bounds.
  if(/^psdrule_vertical_/.test(key))return 12;
  if(/^psdrule_horizontal_/.test(key))return 10;
  if(/^psddot_/.test(key)||/^icon-/.test(key)||key==='accentDot'||key==='accentGlow')return 10;
  if(rect.width<24||rect.height<24)return 10;
  if(rect.width<56||rect.height<18)return 8;
  return 4;
}
function nearestSmallAsset(event,targetLayer){
  const candidates=$$('.poster-layer').filter(layer=>{
    const key=layer.dataset.layer||'';
    return !textLayers.has(key)&&key!=='photo'&&key!=='panel'&&!isLockedLayerKey(key)&&Boolean(state.positions?.[key]);
  }).map(layer=>{
    const rect=layer.getBoundingClientRect(),pad=layerHitPadding(layer);
    const inside=event.clientX>=rect.left-pad&&event.clientX<=rect.right+pad&&event.clientY>=rect.top-pad&&event.clientY<=rect.bottom+pad;
    if(!inside)return null;
    const dx=Math.max(rect.left-event.clientX,0,event.clientX-rect.right);
    const dy=Math.max(rect.top-event.clientY,0,event.clientY-rect.bottom);
    const z=Number.parseInt(getComputedStyle(layer).zIndex,10)||0;
    return {layer,distance:dx*dx+dy*dy,z};
  }).filter(Boolean);
  candidates.sort((a,b)=>b.z-a.z||a.distance-b.distance);
  return candidates[0]?.layer||null;
}
function bindLayerDrag(){
  const canvas=$('#posterCanvas');
  if(!canvas)return;
  // 文字框之间偶尔会有视觉重叠，浏览器可能把点击报告给蒙层或另一个
  // 文字框。捕获阶段先按已选中的文字框做一次命中兜底，确保拖动不会
  // 误移动背景；如果没有已选文字，再使用命中的文字框本身。
  if(canvas.dataset.layerDragRouterBound!=='true'){
    canvas.dataset.layerDragRouterBound='true';
    canvas.addEventListener('pointerdown',event=>{
      if(event.button!==undefined&&event.button!==0)return;
      if(event.target.closest?.('.text-resize-handle'))return;
      const targetLayer=event.target.closest?.('.poster-layer');
      // 文字处于 contenteditable 编辑状态时，选框底部会显示一个带
      // 小手光标的尺寸提示。该提示是伪元素，不会出现在 DOM 命中测试
      // 中；因此在捕获阶段把文字框和提示下方区域一起视为文字拖拽区，
      // 即使事件表面上命中了蒙层，也必须优先移动当前文字。
      const editingText=$$('.is-text-layer.is-editing').find(layer=>{
        const rect=layer.getBoundingClientRect();
        return event.clientX>=rect.left-12&&event.clientX<=rect.right+12&&event.clientY>=rect.top-12&&event.clientY<=rect.bottom+40;
      });
      if(editingText){
        startLayerDrag(editingText,event,canvas);
        return;
      }
      const candidates=$$('.is-text-layer').filter(layer=>{
        const rect=layer.getBoundingClientRect();
        return event.clientX>=rect.left&&event.clientX<=rect.right&&event.clientY>=rect.top&&event.clientY<=rect.bottom;
      });
      if(candidates.length){
        const selected=candidates.find(layer=>layer.classList.contains('layer-selected')||layer.classList.contains('is-editing'));
        const targetIsText=targetLayer?.classList.contains('is-text-layer');
        // 命中一个未选中的文字层时交给它自己的监听器；命中蒙层/照片但落在
        // 文字框范围内时，优先启动当前选中的文字拖动。
        if(targetIsText&&!selected)return;
        const layer=selected||candidates[candidates.length-1];
        if(layer===targetLayer)return;
        startLayerDrag(layer,event,canvas);
        return;
      }
      // 锁定的酒店底图不参与“小元素命中优化”。否则 PSD 模板中覆盖
      // 全画布的纸张纹理等图层会在点击底图时被误选中。
      if(targetLayer&&isLockedLayerKey(targetLayer.dataset.layer))return;
      // PNG rules, dots and small icons can be only a few CSS pixels wide.
      // If the pointer lands just beside one of them (usually on the panel or
      // scene layer), route the gesture to that asset's transparent hit area.
      // Text candidates above still win, so a nearby text box is never stolen.
      const nearbyAsset=nearestSmallAsset(event,targetLayer);
      if(nearbyAsset&&nearbyAsset!==targetLayer)startLayerDrag(nearbyAsset,event,canvas);
    },true);
  }
  $$('.poster-layer').forEach(layer=>{
    if(layer.dataset.layerDragBound==='true')return;
    layer.dataset.layerDragBound='true';
    layer.addEventListener('pointerdown',event=>startLayerDrag(layer,event,canvas));
  });
}
function deleteSelectedLayer(){if(!state.selectedLayer||isLockedLayerKey(state.selectedLayer))return;pushUndoSnapshot();state.hiddenLayers.add(state.selectedLayer);state.selectedLayer='';updatePoster();queueTemplateAutoSave('删除图层');$('#dragHint').textContent='元素已删除，可点击“返回上一步”撤销'}
function restoreLayers(){restoreUndoSnapshot()}
function syncAdjustmentLabels(){if($('#brightnessValue'))$('#brightnessValue').textContent=`${state.imageAdjust.brightness}%`;if($('#saturationValue'))$('#saturationValue').textContent=`${state.imageAdjust.saturation}%`;const key=state.selectedLayer,enabled=Boolean(key&&!isLockedLayerKey(key));if($('#overlayValue'))$('#overlayValue').textContent=enabled?`${layerTransparencyValue(key)}%`:'—'}
function readFile(input,callback){const file=input.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>callback(reader.result);reader.readAsDataURL(file)}
function readFileDataUrl(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||''));reader.onerror=()=>reject(reader.error||new Error('Logo 文件读取失败'));reader.readAsDataURL(file)})}
function medianChannel(values){const sorted=values.slice().sort((a,b)=>a-b);return sorted[Math.floor(sorted.length/2)]??255}
function sampleLogoBorder(data,width,height){
  const channels=[[],[],[]],stepX=Math.max(1,Math.floor(width/48)),stepY=Math.max(1,Math.floor(height/48));
  const sample=(x,y)=>{const index=(y*width+x)*4;if(data[index+3]<16)return;channels[0].push(data[index]);channels[1].push(data[index+1]);channels[2].push(data[index+2])};
  for(let x=0;x<width;x+=stepX){sample(x,0);sample(x,height-1)}
  for(let y=0;y<height;y+=stepY){sample(0,y);sample(width-1,y)}
  return channels.map(medianChannel);
}
async function extractLogoDataUrl(source){
  const image=await loadImage(source),maxSide=1800,scale=Math.min(1,maxSide/Math.max(image.naturalWidth,image.naturalHeight));
  const width=Math.max(1,Math.round(image.naturalWidth*scale)),height=Math.max(1,Math.round(image.naturalHeight*scale));
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,width,height);
  const pixels=ctx.getImageData(0,0,width,height),data=pixels.data,total=width*height;
  let transparent=0;for(let i=3;i<data.length;i+=4)if(data[i]<245)transparent++;
  // Existing transparent PNGs only need clean-edge trimming. Opaque JPG/PNG
  // files use their median border colour as the removable background.
  if(transparent/total<.02){
    const background=sampleLogoBorder(data,width,height),threshold=32;
    for(let i=0;i<data.length;i+=4){
      const distance=Math.hypot(data[i]-background[0],data[i+1]-background[1],data[i+2]-background[2]);
      const alpha=clamp(Math.round((distance-threshold)*12),0,255);
      data[i+3]=Math.min(data[i+3],alpha);
      if(!data[i+3])data[i]=data[i+1]=data[i+2]=0;
    }
    ctx.putImageData(pixels,0,0);
  }
  let minX=width,minY=height,maxX=-1,maxY=-1,visible=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){const alpha=data[(y*width+x)*4+3];if(alpha<=4)continue;visible++;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y)}
  if(maxX<0||visible<Math.max(8,total*.0005))throw new Error('未识别到可保留的 Logo，请使用背景更纯净的 PNG 或 JPG');
  const padding=2,sx=Math.max(0,minX-padding),sy=Math.max(0,minY-padding),sw=Math.min(width-1,maxX+padding)-sx+1,sh=Math.min(height-1,maxY+padding)-sy+1;
  const output=document.createElement('canvas');output.width=sw;output.height=sh;output.getContext('2d').drawImage(canvas,sx,sy,sw,sh,0,0,sw,sh);
  return output.toDataURL('image/png');
}
async function resolveCanvasImageSource(source){
  const sourceText=String(source||'');
  // data/blob URLs are already safe to draw. Remote URLs are left untouched;
  // model responses are converted to blob/data URLs before reaching here.
  if(!sourceText||sourceText.startsWith('data:')||sourceText.startsWith('blob:')||/^https?:/i.test(sourceText)){
    return {url:sourceText,revoke:false};
  }
  if(window.location.protocol!=='file:')return {url:sourceText,revoke:false};

  // A page opened by double-click has a file:// origin. Loading ./assets/*
  // directly makes the canvas origin-unsafe in Chromium, so read the same
  // asset through the local demo server and draw an object URL instead.
  const relativePath=sourceText.replace(/^\.\//,'').replace(/^\//,'');
  let lastError=null;
  for(const port of MODEL_SERVICE_PORTS){
    try{
      const response=await fetch(`http://127.0.0.1:${port}/${relativePath}`);
      if(!response.ok){lastError=new Error(`素材读取失败（${response.status}）`);continue}
      const blob=await response.blob();
      return {url:URL.createObjectURL(blob),revoke:true};
    }catch(error){lastError=error}
  }
  throw lastError||new Error('无法读取本地素材，请先启动项目服务');
}
function loadImage(src){return new Promise(async(resolve,reject)=>{
  let resolved;
  try{resolved=await resolveCanvasImageSource(src)}catch(error){reject(error);return}
  const image=new Image();
  const cleanup=()=>{if(resolved?.revoke)URL.revokeObjectURL(resolved.url)};
  image.onload=()=>{cleanup();resolve(image)};
  image.onerror=error=>{cleanup();reject(error)};
  image.src=resolved.url;
})}
function canvasToBlob(canvas,type='image/png'){
  return new Promise((resolve,reject)=>{
    try{canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('浏览器无法生成 PNG 文件')),type)}
    catch(error){reject(error)}
  });
}
function drawCover(ctx,image,width,height,position,adjust){const scale=Math.max(width/image.naturalWidth,height/image.naturalHeight),dw=image.naturalWidth*scale,dh=image.naturalHeight*scale,px=(position?.x??50)/100,py=(position?.y??50)/100;ctx.save();ctx.filter=`brightness(${adjust?.brightness??100}%) saturate(${adjust?.saturation??100}%)`;ctx.drawImage(image,(width-dw)*px,(height-dh)*py,dw,dh);ctx.restore()}
function drawPanelAsset(ctx,image,width,height,position){
  const dx=width*(position?.x||0)/100,dy=height*(position?.y||0)/100,dw=width*(position?.w||100)/100,dh=height*(position?.h||100)/100;
  const crop=state.template?.panelAssetCrop;
  ctx.save();
  if(crop){
    const sx=image.naturalWidth*crop.x,sy=image.naturalHeight*crop.y,sw=image.naturalWidth*crop.w,sh=image.naturalHeight*crop.h;
    ctx.drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh);
  }else ctx.drawImage(image,dx,dy,dw,dh);
  ctx.restore();
}
function drawCoverIntoRect(ctx,image,width,height,position,adjust){const rectW=width*(position?.w??100)/100,rectH=height*(position?.h??100)/100;const scale=Math.max(rectW/image.naturalWidth,rectH/image.naturalHeight),dw=image.naturalWidth*scale,dh=image.naturalHeight*scale,cx=width*(position?.x??50)/100,cy=height*(position?.y??50)/100;ctx.save();ctx.filter=`brightness(${adjust?.brightness??100}%) saturate(${adjust?.saturation??100}%)`;ctx.beginPath();ctx.rect(cx-rectW/2,cy-rectH/2,rectW,rectH);ctx.clip();ctx.drawImage(image,cx-dw/2,cy-dh/2,dw,dh);ctx.restore()}
function regionLuminance(ctx,x,y,width,height){
  // 只采样少量像素用于判断模型是否已经生成了深色面板，避免对输出图做过度压暗。
  const sampleWidth=Math.max(1,Math.min(96,Math.floor(width))),sampleHeight=Math.max(1,Math.min(96,Math.floor(height)));
  const data=ctx.getImageData(Math.max(0,Math.floor(x)),Math.max(0,Math.floor(y)),sampleWidth,sampleHeight).data;
  let total=0,count=0;
  for(let i=0;i<data.length;i+=16){total+=data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722;count++}
  return count?total/count:0;
}
function finishGeneratedWarmOverlay(ctx,width,height){
  // AI 有时会忽略参考图中的蒙层。暖棕横版模板在输出后做一次轻量兜底，
  // 只在左侧没有明显比右侧更暗时补画，已存在蒙层的结果不会被重复压黑。
  if(state.template.style!=='warm'||state.outputFormat!=='landscape')return;
  let leftLuma=0,rightLuma=0;
  try{leftLuma=regionLuminance(ctx,0,0,width*.38,height);rightLuma=regionLuminance(ctx,width*.62,0,width*.28,height)}catch(error){
    // 某些模型会返回跨域图片 URL；这类画布无法读取像素，跳过兜底但不能阻断出图。
    console.warn('无法检查生成图蒙层，保留模型原图',error);return;
  }
  if(leftLuma<rightLuma-28)return;
  const endX=width*.68; const gradient=ctx.createLinearGradient(0,0,endX,0);
  gradient.addColorStop(0,'rgba(25,18,14,.52)');
  gradient.addColorStop(.42,'rgba(25,18,14,.38)');
  gradient.addColorStop(.72,'rgba(25,18,14,.16)');
  gradient.addColorStop(1,'rgba(25,18,14,0)');
  ctx.save();ctx.fillStyle=gradient;ctx.fillRect(0,0,endX,height);ctx.restore();
}
function drawWrapped(ctx,text,x,y,maxWidth,lineHeight,maxLines){const lines=[];String(text||'').split('\n').forEach(paragraph=>{let line='';for(const char of paragraph){const next=line+char;if(ctx.measureText(next).width>maxWidth&&line){lines.push(line);line=char}else line=next}lines.push(line||'')});lines.slice(0,maxLines||lines.length).forEach((line,index)=>ctx.fillText(line,x,y+index*lineHeight))}
function drawTrackedTextLine(ctx,text,x,y,spacing,align='left'){
  const chars=[...String(text||'')];
  if(!chars.length)return;
  const widths=chars.map(char=>ctx.measureText(char).width);
  const total=widths.reduce((sum,width)=>sum+width,0)+Math.max(0,chars.length-1)*spacing;
  let cursor=align==='center'?x-total/2:align==='right'?x-total:x;
  const previousAlign=ctx.textAlign;
  ctx.textAlign='left';
  chars.forEach((char,index)=>{ctx.fillText(char,cursor,y);cursor+=widths[index]+spacing});
  ctx.textAlign=previousAlign;
}
function drawCanvasTextLayer(ctx,key,text,width,height,maxLines){
  const point=state.positions?.[key]; if(!point||state.hiddenLayers.has(key)||!String(text||'').trim()||(key==='brand'&&state.logoSrc))return;
  const adjust=state.textAdjust[key]||{fontSize:18,lineHeight:1.35}; const size=adjust.effectiveFontSize||adjust.fontSize; const lineHeight=size*(adjust.lineHeight||1.35); const maxWidth=width*(point.w||34)/100; const rectHeight=height*(point.h||20)/100; const centered=/^feature[1-3]$/.test(key)||state.template.textAlign?.[key]==='center'; const centeredAsset=isPsdEditableTextLayer(key); const anchorX=width*point.x/100; const anchorY=height*point.y/100; const x=centeredAsset?anchorX-maxWidth/2:anchorX; const y=centeredAsset?anchorY-rectHeight/2:anchorY; const drawX=centered?x+maxWidth/2:x;
  ctx.save(); ctx.globalAlpha=1-layerTransparencyValue(key)/100; ctx.textBaseline='top'; ctx.textAlign=centered?'center':'left'; ctx.font=canvasFont(state.template.style,key,size); canvasTextFill(ctx,state.template.style,key,drawX,y,lineHeight*(maxLines||4));
  const psdSpec=psdTextSpecs(state.template)[key];
  if(psdSpec?.pointText){
    const spacing=textLetterSpacingPixels(key,size);
    String(text||'').split(/\r?\n/).slice(0,maxLines||4).forEach((line,index)=>spacing?drawTrackedTextLine(ctx,line,drawX,y+index*lineHeight,spacing,centered?'center':'left'):ctx.fillText(line,drawX,y+index*lineHeight));
  }else drawWrapped(ctx,text,drawX,y,maxWidth,lineHeight,maxLines);
  ctx.restore();
}
function drawCanvasRule(ctx,width,height){const point=state.positions?.rule||{x:8,y:22};ctx.save();ctx.globalAlpha=1-layerTransparencyValue('rule')/100;ctx.fillStyle=state.template.id==='daily-business-room'?'rgba(175,196,214,.55)':(textPalette().rule||'#d9ad60');ctx.fillRect(width*point.x/100,height*point.y/100,width*(point.w||5)/100,state.template.id==='daily-business-room'?Math.max(1,Math.round(width/1920)):Math.max(2,Math.round(width/640)));ctx.restore()}
async function drawDecorImage(ctx,width,height){const asset=effectiveAssetSource('decor',state.template.decorAsset||'');if(!asset)return;const image=await loadImage(asset);const p=state.positions.decor||{x:26,y:44};const maxW=width*(state.template.decorSize||18)/100;const scale=maxW/image.naturalWidth;const dw=image.naturalWidth*scale,dh=image.naturalHeight*scale;ctx.save();ctx.globalAlpha=1-layerTransparencyValue('decor')/100;ctx.drawImage(image,width*p.x/100-dw/2,height*p.y/100-dh/2,dw,dh);ctx.restore()}
async function drawTemplateAsset(ctx,width,height,key,asset){
  if(state.hiddenLayers.has(key)||isPsdEditableTextLayer(key))return;
  const point=state.positions?.[key],source=templateAssetSource(key,asset);
  if(!source||!point)return;
  const image=await loadImage(source);
  ctx.save();ctx.globalAlpha=1-layerTransparencyValue(key)/100;
  if(state.template.replaceablePhotoLayer===key&&state.roomUploaded){
    // Keep an uploaded scene inside the exact PSD photo-layer rectangle,
    // cropping it like CSS object-fit: cover while preserving layer order.
    drawCoverIntoRect(ctx,image,width,height,point,state.imageAdjust);
    ctx.restore();return;
  }
  const dw=width*(point.w||asset.w||10)/100;
  const dh=height*(point.h||asset.h||10)/100;
  if(key===templateLogoLayerKey()&&state.logoSrc){
    const scale=Math.min(dw/image.naturalWidth,dh/image.naturalHeight);
    const logoWidth=image.naturalWidth*scale,logoHeight=image.naturalHeight*scale;
    ctx.drawImage(image,width*point.x/100-logoWidth/2,height*point.y/100-logoHeight/2,logoWidth,logoHeight);ctx.restore();return;
  }
  ctx.drawImage(image,width*point.x/100-dw/2,height*point.y/100-dh/2,dw,dh);ctx.restore();
}
async function drawTemplateAssets(ctx,width,height){
  for(const {key,asset} of templateAssetEntries())await drawTemplateAsset(ctx,width,height,key,asset);
}
async function drawPsdLayerStack(ctx,width,height){
  const textSpecs=psdTextSpecs(state.template),values=state.psdTextValues||{};
  const stack=[
    ...templateAssetEntries().map(({key,asset})=>({key,asset,zIndex:asset.zIndex??0,type:'asset'})),
    ...Object.entries(textSpecs).map(([key,spec])=>({key,spec,zIndex:spec.zIndex??0,type:'text'})),
  ].sort((a,b)=>a.zIndex-b.zIndex);
  const maxLines={dinner_title_brand:1,dinner_title_dinner:1,dinner_subtitle:1,dinner_feature_environment:1,dinner_feature_dishes:1,dinner_feature_quality:1,dinner_contact_hotline_label:1,dinner_contact_hotline:1,dinner_contact_address_label:1,dinner_contact_address:1};
  for(const item of stack){
    if(item.type==='asset')await drawTemplateAsset(ctx,width,height,item.key,item.asset);
    else drawCanvasTextLayer(ctx,item.key,values[item.key],width,height,maxLines[item.key]||1);
  }
}
async function drawBusinessIcons(ctx,width,height){
  if(state.template.id!=='daily-business-room'||!state.template.iconAssets)return;
  for(const name of ['work','city','sleep']){
    const key=`icon-${name}`; if(state.hiddenLayers.has(key))continue;
    const asset=effectiveAssetSource(key,state.template.iconAssets[name]),point=state.positions?.[key]; if(!asset||!point)continue;
    const image=await loadImage(asset),dw=width*(point.w||4)/100,dh=height*(point.h||7)/100;
    ctx.save();ctx.globalAlpha=1-layerTransparencyValue(key)/100;ctx.drawImage(image,width*point.x/100-dw/2,height*point.y/100-dh/2,dw,dh);ctx.restore();
  }
}
function drawCanvasAccent(ctx,width,height){
  const p=state.positions||{};
  const dot=p.accentDot||{x:8.85,y:22.5};
  if(!state.hiddenLayers.has('accentGlow')){const x=width*dot.x/100,y=height*dot.y/100,r=Math.max(10,width/1920*14);const glow=ctx.createRadialGradient(x,y,0,x,y,r);glow.addColorStop(0,'rgba(243,250,255,.28)');glow.addColorStop(1,'rgba(243,250,255,0)');ctx.save();ctx.globalAlpha=1-layerTransparencyValue('accentGlow')/100;ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore()}
  if(!state.hiddenLayers.has('accentDot')){const x=width*dot.x/100,y=height*dot.y/100,r=Math.max(1.5,width/1920*2.6);ctx.save();ctx.globalAlpha=1-layerTransparencyValue('accentDot')/100;ctx.fillStyle='#F3FAFF';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore()}
}
function drawStructuredTemplateText(ctx,width,height){
  const values={brand:renderCopyValue('brand'),title:renderCopyValue('title'),subtitle:renderCopyValue('subtitle'),feature1:renderCopyValue('feature1'),feature2:renderCopyValue('feature2'),feature3:renderCopyValue('feature3'),body:renderCopyValue('body'),tagline:renderCopyValue('tagline'),...(state.psdTextValues||{})};
  const keys=state.template.rasterOnly?[]:(state.template.psdLayered?psdTextKeys(state.template):(state.template.id==='daily-business-room'?['brand','title','subtitle','feature1','feature2','feature3','body','tagline']:(state.template.textLayerKeys||['brand','title','subtitle','body','tagline'])));
  const maxLines={brand:1,title:2,subtitle:2,feature1:1,feature2:1,feature3:1,body:6,tagline:2,psdtravel_body:3,psdstar_hotel_body:3,admin_suite_title:1,admin_suite_subtitle:1,admin_suite_area:1,admin_suite_living:1,admin_suite_window:1,admin_suite_benefits:1,admin_suite_fruit:1,breakfast_title:1,breakfast_subtitle:1,breakfast_time:1,breakfast_location:1,breakfast_card_note:1,room_service_title:1,room_service_subtitle:1,room_service_cleaning:2,room_service_frontdesk:1,room_service_delivery:2};
  keys.forEach(key=>drawCanvasTextLayer(ctx,key,values[key],width,height,maxLines[key]||2));
  // businessRule 已经是独立 PNG 图层；其余带分隔线的模板仍按文字/线条图层绘制。
  if(state.template.showRule&&!state.hiddenLayers.has('rule')&&!state.template.assetLayers?.businessRule)drawCanvasRule(ctx,width,height);
}
function outputDimensions(format=state.outputFormat||state.template.format){
  if(state.template?.canvasSize&&format===state.template.format)return {...state.template.canvasSize};
  return format==='landscape'?{width:1920,height:1080}:format==='square'?{width:1200,height:1200}:{width:1200,height:1600};
}
function formatClassName(base=''){return [base,state.outputFormat||state.template?.format,state.template?.canvasClass||''].filter(Boolean).join(' ')}
function dataUrlToBlob(dataUrl){const [meta,encoded]=String(dataUrl).split(',');if(!meta||!encoded)throw new Error('素材格式无法读取');const mime=(meta.match(/data:([^;]+)/)||[])[1]||'application/octet-stream';const binary=atob(encoded);const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return new Blob([bytes],{type:mime})}
async function sourceToBlob(source){
  const sourceText=String(source);
  if(sourceText.startsWith('data:'))return dataUrlToBlob(sourceText);
  const candidates=[];
  // file:// 页面不能通过 fetch() 读取本地文件；启动脚本提供的本地 HTTP 服务
  // 同时托管了 assets，因此从服务端读取同一份素材后再提交给模型。
  if(window.location.protocol==='file:'){
    const relativePath=sourceText.replace(/^\.\//,'').replace(/^\//,'');
    MODEL_SERVICE_PORTS.forEach(port=>candidates.push(`http://127.0.0.1:${port}/${relativePath}`));
  }else candidates.push(sourceText);
  let lastError=null;
  for(const candidate of candidates){
    try{const response=await fetch(candidate);if(response.ok)return response.blob();lastError=new Error(`素材读取失败（${response.status}）`)}catch(error){lastError=error}
  }
  throw lastError||new Error('素材读取失败');
}
async function requestModelPoster(target,options={}){
  const outputFormat=options.ratio||state.outputFormat||'landscape';
  const referenceUrl=options.referenceUrl||state.template.preview||state.template.image;
  // Keep the conversational flow image-optional: an explicitly empty
  // sceneUrl means the user chose not to upload a hotel photo. The editor's
  // current scene is only the fallback for the legacy generator flow.
  const sceneUrl=Object.prototype.hasOwnProperty.call(options,'sceneUrl')?options.sceneUrl:state.roomSrc;
  const title=String(options.title??$('#titleInput')?.value??'').trim();
  const description=String(options.description??$('#bodyInput')?.value??'').trim();
  const brief=String(options.brief||'').trim();
  const selectedStyle=options.style||state.template.style||'classic';
  const templateId=options.templateId||state.template.id;
  const [referenceBlob,sceneBlob]=await Promise.all([sourceToBlob(referenceUrl),sceneUrl?sourceToBlob(sceneUrl):Promise.resolve(null)]);
  const form=new FormData(); form.append('style_reference',referenceBlob,'style-reference.png'); if(sceneBlob)form.append('scene_image',sceneBlob,'hotel-scene');
  form.append('title',title); form.append('description',description); form.append('brief',brief); form.append('ratio',outputFormat); form.append('template_id',templateId); form.append('style',selectedStyle);
  const sceneInstruction=sceneUrl?'将 scene_image 作为酒店实景主体，保留其真实空间、主要家具和摄影视角。':'本次未提供 scene_image，请根据用户对话需求生成合适的酒店场景，不要复制参考图的原图内容。';
  form.append('instruction',`请严格参考 style_reference 的整体视觉风格、构图层级、留白、色彩和装饰关系，${sceneInstruction} 自动整理 title 与 description，直接输出一张完整酒店运营海报。暖棕横版必须保留左侧约 38% 的深炭灰/深棕半透明渐变文字面板，从左侧较深向右侧平滑过渡到透明；所有文字必须在该面板内并使用高对比的白色、暖白或浅金色，禁止把文字放到实景亮部，禁止省略蒙层。不要输出图层，不要保留原参考图文字。参考图中的品牌 Logo、二维码及文字仅用于理解风格，不能直接复制；如果本请求没有上传 Logo 或二维码，成品中禁止生成任何 Logo、二维码、占位框或为它们预留空白，需根据实际提交的素材自然重新平衡版式；如果有上传，请原样清晰保留。`);
  if(state.logoSrc)form.append('logo',await sourceToBlob(state.logoSrc),'logo'); if(state.qrSrc)form.append('qr_code',await sourceToBlob(state.qrSrc),'qr-code');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),120000);let response=null;let lastError=null;let fallbackResponse=null;try{
    for(const endpoint of modelEndpointCandidates()){
      try{
        const candidate=await fetch(endpoint,{method:'POST',body:form,signal:controller.signal});
        // 404/405/501 通常表示当前页面只是静态服务，继续尝试真正的本地模型端口。
        if([404,405,501].includes(candidate.status)){fallbackResponse=candidate;continue}
        response=candidate;break;
      }catch(error){
        if(error?.name==='AbortError')throw error;
        lastError=error;
      }
    }
  }finally{window.clearTimeout(timeout)}
  if(!response){if(fallbackResponse)response=fallbackResponse;else throw lastError||new Error('无法连接图片模型服务')}
  if(!response.ok){let message='';try{const payload=await response.json();message=payload?.error||''}catch{}if(response.status===501||response.status===405)message='当前是静态文件服务，不能调用图片模型；请双击 demo/start-doubao.command 启动模型服务';if(response.status===404)message='模型路由不存在；请双击 demo/start-doubao.command 启动模型服务';throw new Error(message||`图片模型接口返回 ${response.status}`)}
  let outputUrl='';const type=response.headers.get('content-type')||'';if(type.includes('image/')){outputUrl=URL.createObjectURL(await response.blob())}else{const payload=await response.json();outputUrl=payload.imageUrl||payload.image_url||payload.url||payload.image||payload.data?.[0]?.url||payload.data?.[0]?.b64_json||'';if(outputUrl&&payload.data?.[0]?.b64_json&&!String(outputUrl).startsWith('data:'))outputUrl=`data:image/png;base64,${outputUrl}`}
  if(!outputUrl)throw new Error('模型未返回图片');const image=await loadImage(outputUrl);const dimensions=options.canvasSize||({landscape:{width:1920,height:1080},portrait:{width:1200,height:1600},square:{width:1200,height:1200}}[outputFormat]||{width:1920,height:1080});const {width,height}=dimensions;target.width=width;target.height=height;target.className=`flat-preview ${outputFormat}`;const ctx=target.getContext('2d');ctx.clearRect(0,0,width,height);drawCover(ctx,image,width,height,{x:50,y:50},{brightness:100,saturation:100});if(options.applyWarmOverlay!==false)finishGeneratedWarmOverlay(ctx,width,height);if(outputUrl.startsWith('blob:'))URL.revokeObjectURL(outputUrl);return true;
}
async function composePosterToCanvas(target){
  const {width,height}=outputDimensions(); target.width=width; target.height=height; target.className=`flat-preview ${state.outputFormat} ${state.template.canvasClass||''}`;
  const ctx=target.getContext('2d'); ctx.clearRect(0,0,width,height); if(state.template.photoMode!=='asset'){const room=await loadImage(state.roomSrc);drawCover(ctx,room,width,height,state.positions.photo,state.imageAdjust)}
  const p=state.positions;if(!state.template.skipPanel&&!state.hiddenLayers.has('panel')){const panel=p.panel,panelX=width*panel.x/100,panelY=height*panel.y/100,panelW=width*panel.w/100,panelH=height*panel.h/100,alpha=1-layerTransparencyValue('panel')/100;if(state.template.panelAsset){const panelImage=await loadImage(state.template.panelAsset);ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(panelImage,panelX,panelY,panelW,panelH);ctx.restore()}else{const palette=overlayPalette();if(state.template.overlayGradient){const gradient=state.template.id==='daily-business-room'?ctx.createLinearGradient(panelX,panelY,panelX+panelW,panelY+panelH):ctx.createLinearGradient(panelX,panelY,panelX+panelW,panelY);gradient.addColorStop(0,`rgba(${palette.rgb},${(palette.start*alpha).toFixed(3)})`);if(palette.mid!=null)gradient.addColorStop((palette.midAt||80)/100,`rgba(${palette.rgb},${(palette.mid*alpha).toFixed(3)})`);gradient.addColorStop(1,`rgba(${palette.rgb},${(palette.end*alpha).toFixed(3)})`);ctx.fillStyle=gradient}else{ctx.fillStyle=`rgba(${palette.rgb},${(palette.start*alpha).toFixed(3)})`}ctx.fillRect(panelX,panelY,panelW,panelH)}}
  const isBusiness=state.template.id==='daily-business-room';
  const isStructured=Boolean(state.template.structured)||isBusiness;
  if(isStructured&&isStrictPsdStackTemplate(state.template))await drawPsdLayerStack(ctx,width,height);else if(isStructured)await drawTemplateAssets(ctx,width,height);else if(!isStructured&&!state.hiddenLayers.has('decor'))await drawDecorImage(ctx,width,height);
  if(isBusiness)await drawBusinessIcons(ctx,width,height);
  if(isStructured){
    if(isStrictPsdStackTemplate(state.template)){}else drawStructuredTemplateText(ctx,width,height);
  }else{
    const isLandscape=state.outputFormat==='landscape',textWidth=width*(state.template.layout==='right'?.21:(isLandscape?.32:.84)),ta=state.textAdjust;
    if(!state.hiddenLayers.has('kicker')){canvasTextFill(ctx,state.template.style,'kicker',width*p.kicker.x/100,height*p.kicker.y/100,ta.kicker.fontSize*ta.kicker.lineHeight*2);ctx.font=canvasFont(state.template.style,'kicker',ta.kicker.fontSize);drawWrapped(ctx,renderCopyValue('kicker'),width*p.kicker.x/100,height*p.kicker.y/100,textWidth,ta.kicker.fontSize*ta.kicker.lineHeight,2)}
    if(!state.hiddenLayers.has('title')){canvasTextFill(ctx,state.template.style,'title',width*p.title.x/100,height*p.title.y/100,ta.title.fontSize*ta.title.lineHeight*3);ctx.font=canvasFont(state.template.style,'title',ta.title.fontSize);drawWrapped(ctx,renderCopyValue('title'),width*p.title.x/100,height*p.title.y/100,textWidth,ta.title.fontSize*ta.title.lineHeight,3)}
    if(!state.hiddenLayers.has('rule')){ctx.fillStyle=textPalette().rule;ctx.fillRect(width*p.rule.x/100,height*p.rule.y/100,86,4)}
    if(!state.hiddenLayers.has('body')){canvasTextFill(ctx,state.template.style,'body',width*p.body.x/100,height*p.body.y/100,ta.body.fontSize*ta.body.lineHeight*8);ctx.font=canvasFont(state.template.style,'body',ta.body.fontSize);drawWrapped(ctx,renderCopyValue('body'),width*p.body.x/100,height*p.body.y/100,textWidth,ta.body.fontSize*ta.body.lineHeight,isLandscape?8:7)}
    if(!state.hiddenLayers.has('tagline')){canvasTextFill(ctx,state.template.style,'tagline',width*p.tagline.x/100,height*p.tagline.y/100,ta.tagline.fontSize*ta.tagline.lineHeight*2);ctx.font=canvasFont(state.template.style,'tagline',ta.tagline.fontSize);drawWrapped(ctx,renderCopyValue('tagline'),width*p.tagline.x/100,height*p.tagline.y/100,textWidth,ta.tagline.fontSize*ta.tagline.lineHeight,2)}
  }
  if(state.logoSrc&&!templateLogoLayerKey()&&!state.hiddenLayers.has('logo')){const logo=await loadImage(state.logoSrc),max=width*.12,scale=Math.min(max/logo.naturalWidth,max/logo.naturalHeight),lw=logo.naturalWidth*scale,lh=logo.naturalHeight*scale;ctx.save();ctx.globalAlpha=1-layerTransparencyValue('logo')/100;ctx.drawImage(logo,width*p.logo.x/100-lw/2,height*p.logo.y/100-lh/2,lw,lh);ctx.restore()}
  if(state.qrSrc&&!state.hiddenLayers.has('qr')){const qr=await loadImage(state.qrSrc),max=width*.13,scale=Math.min(max/qr.naturalWidth,max/qr.naturalHeight),qw=qr.naturalWidth*scale,qh=qr.naturalHeight*scale;ctx.save();ctx.globalAlpha=1-layerTransparencyValue('qr')/100;ctx.drawImage(qr,width*p.qr.x/100-qw/2,height*p.qr.y/100-qh/2,qw,qh);ctx.restore()}
  return target;
}
async function renderFlatPreview(){
  const flat=$('#flatPreview'),empty=$('#flatPreviewEmpty'),poster=$('#posterCanvas'),templatePreview=$('#templatePreviewStage'); if(!flat||!empty||!poster||!templatePreview)return;
  if(!state.generatorMode){flat.classList.add('hidden');empty.classList.add('hidden');templatePreview.classList.add('hidden');poster.classList.remove('hidden');return}
  poster.classList.add('hidden'); templatePreview.classList.toggle('hidden',state.generated); flat.classList.toggle('hidden',!state.generated); empty.classList.add('hidden');
  if(state.generated&&state.generatedSource!=='model'){try{await composePosterToCanvas(flat)}catch(error){console.error(error);state.generated=false;state.generatedSource='none';flat.classList.add('hidden');empty.classList.remove('hidden');}}
}
function updateGeneratorAttachments(){
  const styleThumb=$('#promptStyleThumb'),sceneThumb=$('#promptSceneThumb'),scenePlaceholder=$('#promptScenePlaceholder'),sceneLabel=$('#promptSceneLabel');
  if(styleThumb)styleThumb.src=state.template.preview||state.template.image;
  updateRoomUploadCard();
  if(sceneThumb){
    sceneThumb.classList.toggle('hidden',!state.roomUploaded);
    if(state.roomUploaded)sceneThumb.src=state.roomSrc;
  }
  if(scenePlaceholder)scenePlaceholder.classList.toggle('hidden',state.roomUploaded);
  if(sceneLabel)sceneLabel.textContent=state.roomUploaded?'酒店实景':'待上传酒店实景';
}
function updateRoomUploadCard(){
  const thumb=$('#roomThumb'),placeholder=$('#roomUploadPlaceholder');
  if(!thumb)return;
  const hasScene=state.generatorMode?state.roomUploaded:Boolean(state.roomSrc);
  thumb.classList.toggle('hidden',!hasScene);
  if(hasScene)thumb.src=state.roomSrc;
  if(placeholder)placeholder.classList.toggle('hidden',hasScene);
}
function syncLogoUploadCard({busy=false}={}){
  const group=$('#logoUploadGroup'),thumb=$('#logoThumb'),placeholder=$('#logoUploadPlaceholder'),title=$('#logoUploadTitle'),meta=$('#logoUploadMeta'),reset=$('#logoResetButton');
  if(!group)return;
  const visible=Boolean(templateLogoLayerKey()&&!state.generatorMode&&!$('#editorView')?.classList.contains('hidden'));
  group.classList.toggle('hidden',!visible);
  if(!visible)return;
  const hasLogo=Boolean(state.logoSrc);
  thumb?.classList.toggle('hidden',!hasLogo); placeholder?.classList.toggle('hidden',hasLogo);
  if(hasLogo&&thumb)thumb.src=state.logoSrc;
  if(title)title.textContent=busy?'正在自动抠取 Logo…':'点击更换 Logo';
  if(meta)meta.textContent=busy?'正在去除背景并保留透明边缘':'PNG / JPG · 自动抠取透明背景';
  reset?.classList.toggle('hidden',!hasLogo||busy);
}
async function prepareTemplatePreview(){
  const stage=$('#templatePreviewStage'),flat=$('#flatPreview'); if(!stage||!flat||!state.generatorMode||state.template.preview)return;
  const templateId=state.template.id; try{await composePosterToCanvas(flat); if(state.template.id!==templateId||!state.generatorMode||state.generated)return; stage.src=flat.toDataURL('image/png'); stage.className=`template-preview-stage ${state.outputFormat}`}catch(error){console.error('模板预览生成失败',error)}
}
async function exportPosterPng(){
  const button=$('#exportButton'),outputFormat=state.outputFormat||state.template.format,{width,height}=outputDimensions();button.disabled=true;button.textContent='生成 PNG…';
  try{if(state.generatorMode&&state.generated){const flat=$('#flatPreview');const blob=await canvasToBlob(flat,'image/png');const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`${state.template.name}-AI生成.png`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);button.textContent='已导出 PNG ✓';setTimeout(()=>button.textContent='导出 PNG',1400);return}const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');if(state.template.photoMode!=='asset'){const room=await loadImage(state.roomSrc);if(!state.hiddenLayers.has('photo'))drawCover(ctx,room,width,height,state.positions.photo,state.imageAdjust)}
    const isBusiness=state.template.id==='daily-business-room';
    const isStructured=Boolean(state.template.structured)||isBusiness;
    const p=state.positions;
    if(isStructured){
      // 结构化模板的所有非文字装饰都来自独立 PNG 图层；导出顺序与画布保持一致。
      if(!state.hiddenLayers.has('panel')){const panel=p.panel,panelX=width*panel.x/100,panelY=height*panel.y/100,panelW=width*panel.w/100,panelH=height*panel.h/100,alpha=1-layerTransparencyValue('panel')/100;if(state.template.panelAsset){const panelImage=await loadImage(state.template.panelAsset);ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(panelImage,panelX,panelY,panelW,panelH);ctx.restore()}else{const palette=overlayPalette();if(state.template.overlayGradient){const gradient=isBusiness?ctx.createLinearGradient(panelX,panelY,panelX+panelW,panelY+panelH):ctx.createLinearGradient(panelX,panelY,panelX+panelW,panelY);gradient.addColorStop(0,`rgba(${palette.rgb},${(palette.start*alpha).toFixed(3)})`);if(palette.mid!=null)gradient.addColorStop((palette.midAt||80)/100,`rgba(${palette.rgb},${(palette.mid*alpha).toFixed(3)})`);gradient.addColorStop(1,`rgba(${palette.rgb},${(palette.end*alpha).toFixed(3)})`);ctx.fillStyle=gradient}else{ctx.fillStyle=`rgba(${palette.rgb},${(palette.start*alpha).toFixed(3)})`}ctx.fillRect(panelX,panelY,panelW,panelH)}}
      if(isStrictPsdStackTemplate(state.template))await drawPsdLayerStack(ctx,width,height);else{await drawTemplateAssets(ctx,width,height);if(isBusiness)await drawBusinessIcons(ctx,width,height);drawStructuredTemplateText(ctx,width,height)}
    }else{
      if(!state.hiddenLayers.has('panel')){const panel=p.panel,panelX=width*panel.x/100,panelY=height*panel.y/100,panelW=width*panel.w/100,panelH=height*panel.h/100,alpha=1-layerTransparencyValue('panel')/100;if(state.template.panelAsset){const panelImage=await loadImage(state.template.panelAsset);ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(panelImage,panelX,panelY,panelW,panelH);ctx.restore()}else{const palette=overlayPalette();if(state.template.overlayGradient){const gradient=ctx.createLinearGradient(panelX,panelY,panelX+panelW,panelY);gradient.addColorStop(0,`rgba(${palette.rgb},${(palette.start*alpha).toFixed(3)})`);if(palette.mid!=null)gradient.addColorStop((palette.midAt||80)/100,`rgba(${palette.rgb},${(palette.mid*alpha).toFixed(3)})`);gradient.addColorStop(1,`rgba(${palette.rgb},${(palette.end*alpha).toFixed(3)})`);ctx.fillStyle=gradient}else{ctx.fillStyle=`rgba(${palette.rgb},${(palette.start*alpha).toFixed(3)})`}ctx.fillRect(panelX,panelY,panelW,panelH)}}
      if(!state.hiddenLayers.has('decor'))await drawDecorImage(ctx,width,height);
      const textWidth=width*(state.template.layout==='right'?.21:(isLandscape?.32:.84)),ta=state.textAdjust;if(!state.hiddenLayers.has('kicker')){canvasTextFill(ctx,state.template.style,'kicker',width*p.kicker.x/100,height*p.kicker.y/100,ta.kicker.fontSize*ta.kicker.lineHeight*2);ctx.font=canvasFont(state.template.style,'kicker',ta.kicker.fontSize);drawWrapped(ctx,renderCopyValue('kicker'),width*p.kicker.x/100,height*p.kicker.y/100,textWidth,ta.kicker.fontSize*ta.kicker.lineHeight,2)}if(!state.hiddenLayers.has('title')){canvasTextFill(ctx,state.template.style,'title',width*p.title.x/100,height*p.title.y/100,ta.title.fontSize*ta.title.lineHeight*3);ctx.font=canvasFont(state.template.style,'title',ta.title.fontSize);drawWrapped(ctx,renderCopyValue('title'),width*p.title.x/100,height*p.title.y/100,textWidth,ta.title.fontSize*ta.title.lineHeight,3)}if(!state.hiddenLayers.has('rule')){ctx.fillStyle=textPalette().rule;ctx.fillRect(width*p.rule.x/100,height*p.rule.y/100,86,4)}if(!state.hiddenLayers.has('body')){canvasTextFill(ctx,state.template.style,'body',width*p.body.x/100,height*p.body.y/100,ta.body.fontSize*ta.body.lineHeight*8);ctx.font=canvasFont(state.template.style,'body',ta.body.fontSize);drawWrapped(ctx,renderCopyValue('body'),width*p.body.x/100,height*p.body.y/100,textWidth,ta.body.fontSize*ta.body.lineHeight,isLandscape?8:7)}if(!state.hiddenLayers.has('tagline')){canvasTextFill(ctx,state.template.style,'tagline',width*p.tagline.x/100,height*p.tagline.y/100,ta.tagline.fontSize*ta.tagline.lineHeight*2);ctx.font=canvasFont(state.template.style,'tagline',ta.tagline.fontSize);drawWrapped(ctx,renderCopyValue('tagline'),width*p.tagline.x/100,height*p.tagline.y/100,textWidth,ta.tagline.fontSize*ta.tagline.lineHeight,2)}
    }
    if(state.logoSrc&&!templateLogoLayerKey()&&!state.hiddenLayers.has('logo')){const logo=await loadImage(state.logoSrc),max=width*.12,scale=Math.min(max/logo.naturalWidth,max/logo.naturalHeight),lw=logo.naturalWidth*scale,lh=logo.naturalHeight*scale;ctx.save();ctx.globalAlpha=1-layerTransparencyValue('logo')/100;ctx.drawImage(logo,width*p.logo.x/100-lw/2,height*p.logo.y/100-lh/2,lw,lh);ctx.restore()}if(state.qrSrc&&!state.hiddenLayers.has('qr')){const qr=await loadImage(state.qrSrc),max=width*.13,scale=Math.min(max/qr.naturalWidth,max/qr.naturalHeight),qw=qr.naturalWidth*scale,qh=qr.naturalHeight*scale;ctx.save();ctx.globalAlpha=1-layerTransparencyValue('qr')/100;ctx.drawImage(qr,width*p.qr.x/100-qw/2,height*p.qr.y/100-qh/2,qw,qh);ctx.restore()}
    const blob=await canvasToBlob(canvas,'image/png');const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`${state.template.name}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);button.textContent='已导出 PNG ✓';setTimeout(()=>button.textContent='导出 PNG',1400)
  }catch(error){console.error('PNG 导出失败：',error);const status=$('#generationStatus');if(status){status.classList.add('is-error');status.textContent=error?.name==='SecurityError'?'浏览器限制了本地页面导出，请用项目服务地址打开':'导出失败：'+(error?.message||'请检查素材后重试')}button.textContent='导出失败，请重试';setTimeout(()=>button.textContent='导出 PNG',2400)}finally{button.disabled=false}
}

function markGeneratorDirty(){if(!state.generatorMode){updatePoster();queueTemplateAutoSave('编辑文字');return}state.generated=false;state.generatedSource='none';$('#exportButton').disabled=true;$('#generationStatus').textContent='素材或文案已更新 · 点击「AI 生成海报」重新合成';updatePoster()}
$$('.filter-chip').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.category){state.category=button.dataset.category;$$('[data-category]').forEach(b=>b.classList.toggle('active',b===button))}else{state.format=button.dataset.format;$$('[data-format]').forEach(b=>b.classList.toggle('active',b===button))}renderLibrary()}));
['brandInput','kickerInput','titleInput','subtitleInput','feature1Input','feature2Input','feature3Input','bodyInput','taglineInput'].forEach(id=>$('#'+id)?.addEventListener('input',markGeneratorDirty));
$('#roomInput').addEventListener('change',()=>{if(!$('#roomInput').files?.[0])return;pushUndoSnapshot();readFile($('#roomInput'),src=>{state.roomSrc=src;if(state.adminMode&&!state.generatorMode){const key=state.template.replaceablePhotoLayer||'photo';state.assetOverrides[key]=src;state.roomUploaded=false;state.hiddenLayers.delete(key);if(key==='photo')state.template.image=src;$('#roomThumb').src=src;updateGeneratorAttachments();updatePoster();renderAdminAssetControls();queueTemplateAutoSave('替换模板场景')}else{state.roomUploaded=true;if(state.template.replaceablePhotoLayer){state.hiddenLayers.delete(state.template.replaceablePhotoLayer)}$('#roomThumb').src=src;updateGeneratorAttachments();markGeneratorDirty()}})});
$('#logoInput')?.addEventListener('change',async()=>{
  const file=$('#logoInput').files?.[0],logoLayer=templateLogoLayerKey();
  if(!file||!logoLayer)return;
  pushUndoSnapshot(); syncLogoUploadCard({busy:true});
  const status=$('#generationStatus');
  if(status){status.classList.remove('is-error');status.textContent='正在自动抠取 Logo · 仅在本地处理，不会上传原图';}
  try{
    const source=await readFileDataUrl(file);
    state.logoSrc=await extractLogoDataUrl(source);
    state.hiddenLayers.delete(logoLayer);
    updatePoster();
    if(status)status.textContent='Logo 已自动抠取并替换占位图层 · 可拖动调整位置';
  }catch(error){
    console.error('Logo 自动抠图失败',error);
    if(status){status.classList.add('is-error');status.textContent=error?.message||'Logo 抠图失败，请换用更清晰的图片重试';}
    syncLogoUploadCard();
  }finally{
    const input=$('#logoInput');if(input)input.value='';
    syncLogoUploadCard();
  }
});
$('#logoResetButton')?.addEventListener('click',()=>{
  const logoLayer=templateLogoLayerKey();if(!logoLayer||!state.logoSrc)return;
  pushUndoSnapshot();state.logoSrc='';state.hiddenLayers.delete(logoLayer);updatePoster();
  const status=$('#generationStatus');if(status){status.classList.remove('is-error');status.textContent='已恢复内置 Logo 占位图层';}
});
$('#brightnessInput').addEventListener('input',event=>{recordUndoForInput(event.currentTarget);state.imageAdjust.brightness=Number(event.target.value);syncAdjustmentLabels();updatePoster();queueTemplateAutoSave('调整图片亮度')});$('#saturationInput').addEventListener('input',event=>{recordUndoForInput(event.currentTarget);state.imageAdjust.saturation=Number(event.target.value);syncAdjustmentLabels();updatePoster();queueTemplateAutoSave('调整图片饱和度')});$('#overlayInput').addEventListener('input',event=>{const key=state.selectedLayer;if(!key||isLockedLayerKey(key))return;recordUndoForInput(event.currentTarget);setLayerTransparency(key,event.target.value);syncAdjustmentLabels();syncElementTransparencyControl();applyLayerPositions();scheduleCurrentTemplateCoverSync();queueTemplateAutoSave(`调整${layerLabels[key]||'元素'}透明度`)});
$('#fontSizeInput').addEventListener('input',event=>{if(!textLayers.has(state.selectedLayer))return;recordUndoForInput(event.currentTarget);state.textAdjust[state.selectedLayer].fontSize=Number(event.target.value);syncTextControls();applyTextAdjustments();scheduleCurrentTemplateCoverSync();queueTemplateAutoSave('调整文字字号')});$('#lineHeightInput').addEventListener('input',event=>{if(!textLayers.has(state.selectedLayer))return;recordUndoForInput(event.currentTarget);state.textAdjust[state.selectedLayer].lineHeight=Number(event.target.value);syncTextControls();applyTextAdjustments();scheduleCurrentTemplateCoverSync();queueTemplateAutoSave('调整文字行高')});
['brightnessInput','saturationInput','overlayInput','fontSizeInput','lineHeightInput'].forEach(id=>{const input=$(`#${id}`);if(!input)return;input.addEventListener('pointerdown',()=>resetUndoInput(input));input.addEventListener('change',()=>resetUndoInput(input))});
function runGeneration(){
  const button=$('#applyButton'),status=$('#generationStatus');
  if(!state.generatorMode){updatePoster();button.textContent='已应用 ✓';setTimeout(()=>button.textContent='应用修改',1300);return}
  if(!state.roomUploaded){status.classList.add('is-error');status.textContent='请先上传自己的酒店场景图，再开始生成';return}
  if(!$('#titleInput').value.trim()||!$('#bodyInput').value.trim()){status.classList.add('is-error');status.textContent='请填写主标题和介绍文案，再开始生成';return}
  button.disabled=true;$('#exportButton').disabled=true;button.textContent='AI 图片生成中…';status.classList.remove('is-error');status.textContent='正在通过图片模型参考风格图、识别场景并合成完整海报…';
  window.setTimeout(async()=>{let usedModel=false;try{usedModel=await requestModelPoster($('#flatPreview'))}catch(error){console.error('模型生成失败：',error);if(ALLOW_LOCAL_FALLBACK){try{await composePosterToCanvas($('#flatPreview'));state.generated=true;state.generatedSource='local';await renderFlatPreview();status.classList.remove('is-error');status.textContent='模型接口不可用，已显式开启离线演示';button.disabled=false;$('#exportButton').disabled=false;button.textContent='已生成 ✓';window.setTimeout(()=>button.textContent='AI 生成海报',1300);return}catch(composeError){console.error(composeError)}}state.generated=false;state.generatedSource='none';await renderFlatPreview();status.classList.add('is-error');status.textContent=friendlyModelError(error);button.disabled=false;button.textContent='AI 生成海报';return}state.generated=true;state.generatedSource=usedModel?'model':'local';await renderFlatPreview();status.classList.remove('is-error');status.textContent='已完成 AI 图片生成 · 输出为单张扁平图片';button.disabled=false;$('#exportButton').disabled=false;button.textContent='已生成 ✓';window.setTimeout(()=>button.textContent='AI 生成海报',1300)},120);
}
function returnToLibrary(){
  flushTemplateAutoSave();
  showWorkspace('templates');
}
$('#deleteLayerButton').addEventListener('click',deleteSelectedLayer);
$('#restoreLayersButton').addEventListener('click',restoreUndoSnapshot);
$('#backButton').addEventListener('click',returnToLibrary);
$('#applyButton').addEventListener('click',runGeneration);
$('#resetButton').addEventListener('click',()=>openEditor(state.template.id,state.generatorMode?'generator':'template'));
$('#exportButton').addEventListener('click',exportPosterPng);
$('#templateAdminButton').addEventListener('click',()=>{
  if(!canManageTemplates())return;
  state.adminMode=!state.adminMode;
  syncTemplateAdminUI();
  renderLibrary();
});
$('#deleteTemplateButton').addEventListener('click',deleteCurrentTemplate);
$('#saveTemplateDefaultsButton').addEventListener('click',()=>{
  window.clearTimeout(adminAutoSaveTimer);adminAutoSaveTimer=0;
  const result=saveCurrentTemplateDefaults({changeType:'手动保存'});
  const status=$('#generationStatus');
  if(status){status.classList.toggle('is-error',!result.ok);status.textContent=result.message}
  if(result.ok)renderAdminAssetControls();
  if(result.ok){const button=$('#saveTemplateDefaultsButton');button.textContent='已保存 ✓';window.setTimeout(()=>{if(button)button.textContent='保存为模板默认'},1400)}
});
window.addEventListener('beforeunload',flushTemplateAutoSave);
bindWorkspaceNavigation();
bindTemplateMode();
bindApiConfig();
bindAIPosterStudio();
renderStylePacks();
renderLibrary();
showWorkspace('tools');
