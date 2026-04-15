# 🎯 Google Ads Campaign V4 - Franken Region

## 📁 ملفات CSV للاستيراد

| الملف | الوصف | عدد الصفوف |
|-------|-------|------------|
| `V4_01_Campaigns.csv` | الحملة الرئيسية | 1 |
| `V4_02_Locations.csv` | المواقع الجغرافية | 8 |
| `V4_03_AdGroups.csv` | مجموعات الإعلانات | 15 |
| `V4_04_Keywords.csv` | الكلمات المفتاحية | 94 |
| `V4_05_NegativeKeywords.csv` | الكلمات السلبية | 35 |
| `V4_06_RSA_Ads.csv` | الإعلانات المتجاوبة | 15 |
| `V4_07_Assets_Sitelinks.csv` | روابط الموقع | 8 |
| `V4_08_Assets_Callouts.csv` | النصوص الإضافية | 12 |
| `V4_09_AdSchedule.csv` | جدول الإعلانات | 7 |
| `V4_10_DeviceBidAdjustments.csv` | تعديلات الأجهزة | 3 |

---

## 🚀 خطوات الاستيراد

### 1. إنشاء الحملة
```
Google Ads → Tools → Bulk Actions → Upload
رفع: V4_01_Campaigns.csv
```

### 2. إضافة المواقع
```
Google Ads → Campaign → Locations → Import
رفع: V4_02_Locations.csv
```

### 3. إنشاء مجموعات الإعلانات
```
Google Ads → Bulk Actions → Upload
رفع: V4_03_AdGroups.csv
```

### 4. إضافة الكلمات المفتاحية
```
Google Ads → Bulk Actions → Upload
رفع: V4_04_Keywords.csv
```

### 5. إضافة الكلمات السلبية
```
Google Ads → Bulk Actions → Upload
رفع: V4_05_NegativeKeywords.csv
```

### 6. إنشاء الإعلانات
```
Google Ads → Bulk Actions → Upload
رفع: V4_06_RSA_Ads.csv
```

### 7. إضافة الـ Assets
```
Google Ads → Assets → Sitelinks → Import
رفع: V4_07_Assets_Sitelinks.csv

Google Ads → Assets → Callouts → Import
رفع: V4_08_Assets_Callouts.csv
```

### 8. إعداد الجدولة (يدوياً)
```
Campaign → Settings → Ad Schedule
أضف الجدول من V4_09_AdSchedule.csv
```

### 9. تعديلات الأجهزة (يدوياً)
```
Campaign → Settings → Devices
أضف التعديلات من V4_10_DeviceBidAdjustments.csv
```

---

## 📊 ملخص الحملة

### الإعدادات الرئيسية
| الإعداد | القيمة |
|---------|--------|
| الميزانية | 80€/يوم |
| استراتيجية المزايدة | Target CPA |
| هدف CPA | 25€ |
| اللغة | الألمانية |
| الشبكة | Search |

### التغطية الجغرافية
- ✅ Mittelfranken (نورنبرغ، إرلانغن، فورث)
- ✅ Oberfranken (بامبرغ، بايرويت، هوف)
- ✅ Unterfranken (فورتسبورغ، شفاينفورت)
- ✅ Oberpfalz (ريغنسبورغ، أمبرغ)
- ✅ Ingolstadt

### مجموعات الإعلانات (15)
1. Autoankauf Nürnberg
2. Autoankauf Erlangen Fürth
3. Autoankauf Bamberg
4. Autoankauf Bayreuth Hof
5. Autoankauf Würzburg
6. Autoankauf Schweinfurt
7. Autoankauf Regensburg
8. Autoankauf Ingolstadt
9. Autoankauf Franken Allgemein
10. Auto Sofort Verkaufen
11. Unfallwagen Ankauf
12. Motorschaden Ankauf
13. Auto Ohne TÜV
14. Gebrauchtwagen Export
15. Premium Marken Ankauf

---

## 📈 الفرق بين V3 و V4

| المعيار | V3 (الحالي) | V4 (الجديد) |
|---------|-------------|-------------|
| النطاق | 60 كم من نورنبرغ | كل Franken |
| الميزانية | 50€/يوم | 80€/يوم |
| المزايدة | Maximize Clicks | Target CPA |
| مجموعات الإعلانات | 6 | 15 |
| الكلمات المفتاحية | 24 | 94 |
| المدن | نورنبرغ فقط | 8 مدن + Franken |

---

## ⚠️ ملاحظات مهمة

1. **قبل التفعيل**: تأكد من إيقاف الحملة القديمة V3
2. **Conversion Tracking**: يجب إعداد تتبع التحويلات لاستخدام Target CPA
3. **فترة التعلم**: اترك الحملة تعمل 2-3 أسابيع قبل التعديل
4. **المراقبة**: راقب CPA والتحويلات يومياً في البداية

---

## 🔗 الروابط المستخدمة

```
الرئيسية: https://frankenautoankauf24.de
نورنبرغ: https://frankenautoankauf24.de/autoankauf/nuernberg
إرلانغن: https://frankenautoankauf24.de/autoankauf/erlangen
فورث: https://frankenautoankauf24.de/autoankauf/fuerth
بامبرغ: https://frankenautoankauf24.de/autoankauf/bamberg
بايرويت: https://frankenautoankauf24.de/autoankauf/bayreuth
فورتسبورغ: https://frankenautoankauf24.de/autoankauf/wuerzburg
شفاينفورت: https://frankenautoankauf24.de/autoankauf/schweinfurt
ريغنسبورغ: https://frankenautoankauf24.de/autoankauf/regensburg
إنغولشتات: https://frankenautoankauf24.de/autoankauf/ingolstadt
```
