#target photoshop
app.displayDialogs = DialogModes.NO;
app.preferences.rulerUnits = Units.PIXELS;
app.preferences.typeUnits = TypeUnits.POINTS;

var scriptFile = new File($.fileName);
var root = scriptFile.parent.parent;
var job = new Folder(root.fsName + "/output/新春酒店促销海报_分层源文件");
var assetDir = new Folder(job.fsName + "/assets");
var bgFile = new File(assetDir.fsName + "/01_背景_客房底图.png");
var psdFile = new File(job.fsName + "/新春酒店促销海报_可编辑分层源文件.psd");
var previewFile = new File(job.fsName + "/新春酒店促销海报_预览.png");

function addPng(fileName, layerName) {
    var f = new File(assetDir.fsName + "/" + fileName);
    var source = app.open(f);
    // Duplicate the full-canvas RGBA pixel layer directly. Clipboard paste centers
    // nontransparent pixels and would destroy the intended poster coordinates.
    var added = source.activeLayer.duplicate(doc, ElementPlacement.PLACEATBEGINNING);
    source.close(SaveOptions.DONOTSAVECHANGES);
    app.activeDocument = doc;
    added.name = layerName;
}

function addText(layerName, content, x, y, size, colorHex, fontName, justification) {
    var layer = doc.artLayers.add();
    layer.kind = LayerKind.TEXT;
    layer.name = layerName;
    var t = layer.textItem;
    t.contents = content;
    t.position = [UnitValue(x, "px"), UnitValue(y, "px")];
    t.size = UnitValue(size, "pt");
    t.font = fontName;
    t.justification = justification || Justification.CENTER;
    t.antiAliasMethod = AntiAlias.SMOOTH;
    var col = new SolidColor();
    col.rgb.red = parseInt(colorHex.substr(1,2), 16);
    col.rgb.green = parseInt(colorHex.substr(3,2), 16);
    col.rgb.blue = parseInt(colorHex.substr(5,2), 16);
    t.color = col;
    return layer;
}

var doc = app.open(bgFile);
doc.activeLayer.name = "01_背景_酒店客房照片_独立底层";
doc.mode = ChangeMode.RGB;
doc.bitsPerChannel = BitsPerChannelType.EIGHT;
addPng("22_底色_顶部标题柔光.png", "01A_底色_标题顶部柔光_PNG透明");

// Lower field and decorative foreground. Every illustration remains an independent RGBA PNG layer.
addPng("12_底色_页脚酒红底.png", "02_底色_页脚酒红底_PNG透明");
addPng("13_装饰_底部红色绸带.png", "03_装饰_底部红色绸带_PNG透明");
addPng("22_装饰_底部金色流线.png", "03A_装饰_底部金色流线_PNG透明");
addPng("08_装饰_烟花_左下.png", "04_装饰_左下烟花_PNG透明");
addPng("09_装饰_烟花_右下.png", "05_装饰_右下烟花_PNG透明");
addPng("17_装饰_左侧祥云.png", "06_装饰_左侧祥云_PNG透明");
addPng("18_装饰_右侧祥云.png", "07_装饰_右侧祥云_PNG透明");
addPng("14_装饰_价格云朵牌框.png", "08_装饰_价格云朵牌框_PNG透明");
addPng("15_底色_元旦专享红条.png", "09_底色_元旦专享红条_PNG透明");
addPng("16_装饰_礼盒.png", "10_装饰_礼盒_PNG透明");
addPng("19_图标_酒店地址定位.png", "11_图标_酒店地址定位_PNG透明");
addPng("20_图标_电话听筒.png", "12_图标_电话听筒_PNG透明");
addPng("05_装饰_烟花_左上.png", "13_装饰_左上烟花_PNG透明");
addPng("06_装饰_烟花_顶部中.png", "14_装饰_顶部烟花_PNG透明");
addPng("07_装饰_烟花_右侧.png", "15_装饰_右侧烟花_PNG透明");
addPng("02_装饰_左上梅花枝.png", "16_装饰_左上梅花枝_PNG透明");
addPng("03_装饰_右上灯笼_小.png", "17_装饰_右上小灯笼_PNG透明");
addPng("04_装饰_右上灯笼_大.png", "18_装饰_右上大灯笼_PNG透明");
addPng("10_装饰_右侧如意吊牌底.png", "19_装饰_右侧如意吊牌底_PNG透明");
addPng("11_装饰_左侧福牌底.png", "20_装饰_左侧福牌底_PNG透明");
addPng("21_装饰_标题两侧金线.png", "21_装饰_标题两侧金线_PNG透明");

// All lettering is live Photoshop type. The numbered names keep each copy block easy to locate.
var mainTitle = addText("22_文字_主标题_云端臻享", "云端臻享", 544, 253, 174, "#B51E25", "KaiTi");
try { mainTitle.textItem.horizontalScale = 120; mainTitle.textItem.fauxBold = true; } catch (e) {}
addText("23_文字_副标题_新岁启程美好相伴", "新岁启程  ·  美好相伴", 544, 340, 44, "#8F151C", "STSongti-SC-Bold");
addText("24_文字_新年祝语", "住进更美好的新一年", 544, 400, 27, "#8C211E", "STSongti-SC-Regular");
addText("25_文字_如意吊牌_万", "万", 1044, 210, 23, "#FFF0D1", "STSongti-SC-Bold");
addText("25_文字_如意吊牌_事", "事", 1044, 252, 23, "#FFF0D1", "STSongti-SC-Bold");
addText("25_文字_如意吊牌_如", "如", 1044, 294, 23, "#FFF0D1", "STSongti-SC-Bold");
addText("25_文字_如意吊牌_意", "意", 1044, 336, 23, "#FFF0D1", "STSongti-SC-Bold");
addText("26_文字_福牌", "福", 113, 680, 56, "#FFE8B7", "STSongti-SC-Black");

addText("27_文字_优惠标题_限时特惠价", "限时特惠价", 544, 1046, 39, "#8F151C", "STSongti-SC-Bold");
addText("28_文字_价格_人民币符号", "￥", 404, 1191, 58, "#A71A21", "Arial-BoldMT");
addText("29_文字_价格_299", "299", 540, 1191, 105, "#A71A21", "Arial-BoldMT");
addText("30_文字_价格_起晚", "起/晚", 690, 1185, 42, "#A71A21", "STSongti-SC-Bold");
addText("31_文字_元旦专享信息", "元旦专享  |  数量有限  |  先到先得", 544, 1238, 27, "#FFF0D8", "STSongti-SC-Regular");

addText("32_文字_酒店地址", "酒店地址：XX市XX路XX号", 385, 1361, 25, "#FFF0D8", "STSongti-SC-Regular");
addText("33_文字_预订电话", "预订电话：400-888-XXXX", 851, 1361, 23, "#FFF0D8", "STSongti-SC-Regular");
addText("34_文字_页脚新年祝语", "新的一年  ·  更好的旅居体验", 544, 1423, 19, "#EBC987", "STSongti-SC-Regular");

var psdOptions = new PhotoshopSaveOptions();
psdOptions.layers = true;
psdOptions.embedColorProfile = true;
psdOptions.maximizeCompatibility = true;
doc.saveAs(psdFile, psdOptions, true, Extension.LOWERCASE);

var pngOptions = new PNGSaveOptions();
doc.saveAs(previewFile, pngOptions, true, Extension.LOWERCASE);
doc.close(SaveOptions.DONOTSAVECHANGES);
"PSD created: " + psdFile.fsName;
