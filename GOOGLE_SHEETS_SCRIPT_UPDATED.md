# 📊 Google Sheets Script - مع تتبع GCLID

## السكربت المُحدث (مع الأعمدة الجديدة)

```javascript
// =====================================================
// FRANKENAUTOANKAUF24.DE - GOOGLE SHEETS (مع GCLID)
// =====================================================

const CONFIG = {
  TIMEZONE: 'Europe/Berlin',
  EMAIL_ENABLED: false,  // ❌ إيميل متوقف - Resend يرسل
  EMAIL_TO: 'info@frankenautoankauf24.de',

  COLORS: {
    PRIMARY: '#F97316',
    PRIMARY_DARK: '#EA580C',
    WHITE: '#FFFFFF',
    STATUS_NEU: '#FFF7ED',
    STATUS_KONTAKTIERT: '#FFEDD5',
    STATUS_TERMIN: '#FED7AA',
    STATUS_BESICHTIGT: '#FDBA74',
    STATUS_ANGEBOT: '#FB923C',
    STATUS_ABSCHLUSS: '#D1FAE5',
    STATUS_WARTET: '#F3F4F6',
    STATUS_ABGELEHNT: '#FEE2E2',
    // ألوان المصادر
    SOURCE_GOOGLE_ADS: '#DCFCE7',  // أخضر فاتح
    SOURCE_ORGANIC: '#DBEAFE',     // أزرق فاتح
    SOURCE_DIRECT: '#F3F4F6',      // رمادي فاتح
    SOURCE_WHATSAPP: '#D1FAE5',    // أخضر
    SOURCE_PHONE: '#FEF3C7'        // أصفر فاتح
  }
};

const STATUS_OPTIONS = ['🆕 Neu','📞 Kontaktiert','📅 Termin','👁️ Besichtigt','💰 Angebot','✅ Abgeschlossen','⏳ Wartet','❌ Abgelehnt'];

// ⭐ جديد: خيارات تقييم العميل
const RATING_OPTIONS = ['⭐ Gut', '⭐⭐ Sehr Gut', '⭐⭐⭐ Exzellent', '❌ Kein Interesse', '📵 Nicht erreicht', '🔄 Rückruf'];

function doPost(e) {
  var data = {};

  try {
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }
  } catch(err) {
    Logger.log('Parse error: ' + err);
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  ensureHeaders(sheet);

  var name = data.name || '-';
  var phone = data.phone || '-';
  var email = data.email || '-';
  var location = data.location || '-';
  var brand = data.brand || '-';
  var model = data.model || '-';
  var year = data.year || '-';
  var mileage = data.mileage || '-';
  var fuel = data.fuel || '-';
  var price = data.priceExpectation || '-';
  var message = data.message || '-';
  var images = data.image_urls || [];

  // ⭐ جديد: بيانات GCLID والتتبع
  var contactType = data.contact_type || '📝 Formular';
  var source = data.source || 'Direct';
  var gclid = data.gclid || '-';
  var landingPage = data.landing_page || '-';
  var utmSource = data.utm_source || '-';
  var utmMedium = data.utm_medium || '-';
  var utmCampaign = data.utm_campaign || '-';

  // استخدام التاريخ من البيانات إذا كان موجوداً
  var dateTime = data.date_time || Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'dd.MM.yyyy HH:mm:ss');

  var vehicle = '❓ Nicht angegeben';
  if (brand !== '-' && brand !== '') {
    var icon = getBrandIcon(brand);
    vehicle = icon + ' ' + brand;
    if (model !== '-' && model !== '') vehicle += ' ' + model;
    if (year !== '-' && year !== '') vehicle += ' (' + year + ')';
  }

  var kmFormatted = '-';
  if (mileage !== '-' && mileage !== '') {
    var km = parseInt(mileage);
    if (!isNaN(km)) {
      var f = km.toLocaleString('de-DE') + ' km';
      if (km < 50000) kmFormatted = '🟢 ' + f;
      else if (km < 100000) kmFormatted = '🟡 ' + f;
      else if (km < 150000) kmFormatted = '🟠 ' + f;
      else kmFormatted = '🔴 ' + f;
    }
  }

  var priceFormatted = '-';
  if (price !== '-' && price !== '') {
    var p = parseInt(price);
    if (!isNaN(p)) priceFormatted = '💰 ' + p.toLocaleString('de-DE') + ' €';
  }

  var priority = '🟢 Normal';
  var msg = (message || '').toLowerCase();
  if (msg.indexOf('sofort') > -1 || msg.indexOf('dringend') > -1 || msg.indexOf('heute') > -1) {
    priority = '🔴 SOFORT';
  } else if (msg.indexOf('schnell') > -1 || msg.indexOf('bald') > -1) {
    priority = '🟡 Hoch';
  }

  var imgCount = Array.isArray(images) ? images.length : 0;

  // ⭐ جديد: تنسيق المصدر مع أيقونة
  var sourceFormatted = formatSource(source);

  // ⭐ محدث: الصف الجديد مع الأعمدة الإضافية
  var row = [
    dateTime,                    // 1. Datum
    '🆕 Neu',                    // 2. Status
    contactType,                 // 3. ⭐ جديد: Kontaktart (📞/📝/💬)
    name,                        // 4. Name
    phone,                       // 5. Telefon
    email,                       // 6. E-Mail
    location,                    // 7. Ort
    vehicle,                     // 8. Fahrzeug
    kmFormatted,                 // 9. Kilometer
    fuel !== '-' ? fuel : '-',   // 10. Kraftstoff
    priceFormatted,              // 11. Preiswunsch
    priority,                    // 12. Priorität
    message,                     // 13. Nachricht
    '📷 ' + imgCount,            // 14. Bilder
    sourceFormatted,             // 15. ⭐ جديد: Quelle (Google Ads/Organic/Direct)
    gclid,                       // 16. ⭐ جديد: GCLID
    ''                           // 17. ⭐ جديد: Bewertung (فارغ للعملاء الجدد)
  ];

  sheet.appendRow(row);
  var lastRow = sheet.getLastRow();

  addDropdowns(sheet, lastRow);
  colorSourceCell(sheet, lastRow, source);
  sheet.getRange(lastRow, 1, 1, row.length).setBackground(CONFIG.COLORS.STATUS_NEU);

  // تسجيل في السجل
  Logger.log('✅ Lead added: ' + name + ' | Source: ' + source + ' | GCLID: ' + gclid);

  return ContentService.createTextOutput(JSON.stringify({success: true, row: lastRow}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput('✅ Frankenautoankauf24.de API aktiv! (mit GCLID Tracking)');
}

// ⭐ جديد: تنسيق المصدر
function formatSource(source) {
  switch(source) {
    case 'Google Ads':
      return '🎯 Google Ads';
    case 'Organic':
      return '🔍 Organic';
    case 'Direct':
      return '🔗 Direct';
    case 'Referral':
      return '🔄 Referral';
    case 'Social':
      return '📱 Social';
    default:
      return '🌐 ' + source;
  }
}

// ⭐ جديد: تلوين خلية المصدر
function colorSourceCell(sheet, row, source) {
  var cell = sheet.getRange(row, 15); // عمود Quelle
  var color = CONFIG.COLORS.SOURCE_DIRECT;

  switch(source) {
    case 'Google Ads':
      color = CONFIG.COLORS.SOURCE_GOOGLE_ADS;
      break;
    case 'Organic':
      color = CONFIG.COLORS.SOURCE_ORGANIC;
      break;
  }

  cell.setBackground(color);
}

function getBrandIcon(brand) {
  var icons = {'BMW':'🔵','Mercedes':'⭐','Mercedes-Benz':'⭐','Audi':'🔴','Volkswagen':'🔷','VW':'🔷','Porsche':'🏎️','Ford':'🔵','Opel':'⚡','Toyota':'🔴','Skoda':'🟢','Seat':'🟠','Renault':'🟡','Fiat':'🇮🇹','Hyundai':'🔷','Tesla':'⚡','Subaru':'🔵'};
  return icons[brand] || '🚗';
}

// ⭐ محدث: الهيدرات مع الأعمدة الجديدة
function ensureHeaders(sheet) {
  var currentHeader = sheet.getRange('A1').getValue();

  // تحقق إذا كانت الهيدرات القديمة (14 عمود) أو جديدة (17 عمود)
  if (currentHeader !== 'Datum' || sheet.getLastColumn() < 17) {
    sheet.clear();
    var h = [
      'Datum',        // 1
      'Status',       // 2
      'Kontaktart',   // 3 ⭐ جديد
      'Name',         // 4
      'Telefon',      // 5
      'E-Mail',       // 6
      'Ort',          // 7
      'Fahrzeug',     // 8
      'Kilometer',    // 9
      'Kraftstoff',   // 10
      'Preiswunsch',  // 11
      'Priorität',    // 12
      'Nachricht',    // 13
      'Bilder',       // 14
      'Quelle',       // 15 ⭐ جديد (Google Ads/Organic/Direct)
      'GCLID',        // 16 ⭐ جديد
      'Bewertung'     // 17 ⭐ جديد
    ];
    sheet.getRange(1, 1, 1, h.length).setValues([h]);
    sheet.getRange(1, 1, 1, h.length).setBackground(CONFIG.COLORS.PRIMARY).setFontColor(CONFIG.COLORS.WHITE).setFontWeight('bold');
    sheet.setFrozenRows(1);

    // عرض الأعمدة
    sheet.setColumnWidth(1, 140);  // Datum
    sheet.setColumnWidth(2, 130);  // Status
    sheet.setColumnWidth(3, 110);  // Kontaktart
    sheet.setColumnWidth(8, 200);  // Fahrzeug
    sheet.setColumnWidth(13, 250); // Nachricht
    sheet.setColumnWidth(15, 120); // Quelle
    sheet.setColumnWidth(16, 180); // GCLID
    sheet.setColumnWidth(17, 130); // Bewertung
  }
}

// ⭐ محدث: إضافة القوائم المنسدلة (Status + Bewertung)
function addDropdowns(sheet, row) {
  // قائمة الحالة
  var statusRule = SpreadsheetApp.newDataValidation().requireValueInList(STATUS_OPTIONS, true).build();
  sheet.getRange(row, 2).setDataValidation(statusRule);

  // ⭐ جديد: قائمة التقييم
  var ratingRule = SpreadsheetApp.newDataValidation().requireValueInList(RATING_OPTIONS, true).build();
  sheet.getRange(row, 17).setDataValidation(ratingRule);
}

function onEdit(e) {
  var r = e.range;
  var row = r.getRow();
  var col = r.getColumn();

  if (row <= 1) return;

  // تغيير لون الصف عند تغيير الحالة
  if (col === 2) {
    var colors = {
      '🆕 Neu': CONFIG.COLORS.STATUS_NEU,
      '📞 Kontaktiert': CONFIG.COLORS.STATUS_KONTAKTIERT,
      '📅 Termin': CONFIG.COLORS.STATUS_TERMIN,
      '👁️ Besichtigt': CONFIG.COLORS.STATUS_BESICHTIGT,
      '💰 Angebot': CONFIG.COLORS.STATUS_ANGEBOT,
      '✅ Abgeschlossen': CONFIG.COLORS.STATUS_ABSCHLUSS,
      '⏳ Wartet': CONFIG.COLORS.STATUS_WARTET,
      '❌ Abgelehnt': CONFIG.COLORS.STATUS_ABGELEHNT
    };
    var bgColor = colors[r.getValue()] || '#FFFFFF';
    e.source.getActiveSheet().getRange(row, 1, 1, 17).setBackground(bgColor);

    // الحفاظ على لون خلية المصدر
    var sourceCell = e.source.getActiveSheet().getRange(row, 15);
    var sourceValue = sourceCell.getValue();
    if (sourceValue.indexOf('Google Ads') > -1) {
      sourceCell.setBackground(CONFIG.COLORS.SOURCE_GOOGLE_ADS);
    } else if (sourceValue.indexOf('Organic') > -1) {
      sourceCell.setBackground(CONFIG.COLORS.SOURCE_ORGANIC);
    }
  }

  // ⭐ جديد: تسجيل عند تغيير التقييم
  if (col === 17) {
    var name = e.source.getActiveSheet().getRange(row, 4).getValue();
    var rating = r.getValue();
    Logger.log('📊 Rating changed: ' + name + ' → ' + rating);
  }
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('🚗 Autoankauf')
    .addItem('📋 Setup', 'setupSheet')
    .addItem('🧪 Test Lead', 'testLead')
    .addItem('🧪 Test Google Ads Lead', 'testGoogleAdsLead')
    .addItem('📊 Statistiken', 'showStats')
    .addToUi();
}

function setupSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.clear();
  ensureHeaders(sheet);
  SpreadsheetApp.getUi().alert('✅ Sheet bereit! (17 Spalten mit GCLID Tracking)');
}

// ⭐ جديد: اختبار Lead عادي
function testLead() {
  doPost({
    postData: {
      contents: JSON.stringify({
        name: 'Test Kunde',
        phone: '0176 12345678',
        email: 'test@test.de',
        location: 'Nürnberg',
        brand: 'BMW',
        model: '320d',
        year: '2020',
        mileage: '85000',
        fuel: 'Diesel',
        priceExpectation: '22000',
        message: 'Test Anfrage',
        image_urls: [],
        contact_type: '📝 Formular',
        source: 'Direct',
        gclid: '-'
      })
    }
  });
  SpreadsheetApp.getUi().alert('✅ Test Lead erstellt (Direct)!');
}

// ⭐ جديد: اختبار Lead من Google Ads
function testGoogleAdsLead() {
  doPost({
    postData: {
      contents: JSON.stringify({
        name: 'Google Ads Kunde',
        phone: '0176 98765432',
        email: 'gads@test.de',
        location: 'München',
        brand: 'Mercedes',
        model: 'C200',
        year: '2019',
        mileage: '45000',
        fuel: 'Benzin',
        priceExpectation: '28000',
        message: 'Ich möchte mein Auto sofort verkaufen!',
        image_urls: ['https://example.com/img1.jpg'],
        contact_type: '📝 Formular',
        source: 'Google Ads',
        gclid: 'CjwKCAjw_TEST_GCLID_123456789',
        landing_page: '/autoankauf/muenchen',
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'autoankauf_bayern'
      })
    }
  });
  SpreadsheetApp.getUi().alert('✅ Test Google Ads Lead erstellt (mit GCLID)!');
}

// ⭐ جديد: إحصائيات
function showStats() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    SpreadsheetApp.getUi().alert('❌ Keine Leads vorhanden!');
    return;
  }

  var data = sheet.getRange(2, 15, lastRow - 1, 1).getValues(); // عمود Quelle
  var googleAds = 0, organic = 0, direct = 0, other = 0;

  for (var i = 0; i < data.length; i++) {
    var src = data[i][0] || '';
    if (src.indexOf('Google Ads') > -1) googleAds++;
    else if (src.indexOf('Organic') > -1) organic++;
    else if (src.indexOf('Direct') > -1) direct++;
    else other++;
  }

  var total = lastRow - 1;
  var msg = '📊 Lead-Statistiken\n\n' +
    '📈 Gesamt: ' + total + ' Leads\n\n' +
    '🎯 Google Ads: ' + googleAds + ' (' + Math.round(googleAds/total*100) + '%)\n' +
    '🔍 Organic: ' + organic + ' (' + Math.round(organic/total*100) + '%)\n' +
    '🔗 Direct: ' + direct + ' (' + Math.round(direct/total*100) + '%)\n' +
    '🌐 Andere: ' + other + ' (' + Math.round(other/total*100) + '%)';

  SpreadsheetApp.getUi().alert(msg);
}
```

## 📋 الأعمدة الجديدة

| # | العمود | الوصف | مثال |
|---|--------|-------|------|
| 3 | Kontaktart | نوع التواصل | 📞 Anruf / 📝 Formular / 💬 WhatsApp |
| 15 | Quelle | مصدر الزيارة | 🎯 Google Ads / 🔍 Organic / 🔗 Direct |
| 16 | GCLID | معرف نقرة Google | CjwKCAjw... |
| 17 | Bewertung | تقييم العميل | ⭐ Gut / ⭐⭐ Sehr Gut / ⭐⭐⭐ Exzellent |

## 🎨 الألوان

### مصادر الزيارة
- **Google Ads**: أخضر فاتح `#DCFCE7`
- **Organic**: أزرق فاتح `#DBEAFE`
- **Direct**: رمادي فاتح `#F3F4F6`

### خيارات التقييم
- ⭐ Gut
- ⭐⭐ Sehr Gut
- ⭐⭐⭐ Exzellent
- ❌ Kein Interesse
- 📵 Nicht erreicht
- 🔄 Rückruf

## 🚀 التحديث

إذا كان لديك Sheet موجود:
1. افتح **🚗 Autoankauf → 📋 Setup**
2. سيتم إعادة إنشاء الأعمدة (⚠️ سيحذف البيانات القديمة)

أو يمكنك إضافة الأعمدة يدوياً:
1. أضف عمود "Kontaktart" بعد "Status"
2. أضف عمود "Quelle" بعد "Bilder"
3. أضف عمود "GCLID" بعد "Quelle"
4. أضف عمود "Bewertung" في النهاية
