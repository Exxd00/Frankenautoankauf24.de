# 📊 مراجعة نظام التتبع - Tracking System Review

## ✅ نظام التتبع الحالي

### 1. التقاط GCLID
```
📍 الموقع: src/lib/gclidTracking.ts
📍 التفعيل: src/app/ClientBody.tsx

✅ يعمل:
- يلتقط gclid من URL تلقائياً عند تحميل الصفحة
- يحفظ في localStorage لمدة 90 يوم
- يكتشف مصدر الزيارة (Google Ads / Organic / Direct / Referral)
- يحفظ معلومات UTM (source, medium, campaign)
```

### 2. تتبع الأحداث
```
📍 الموقع: src/lib/leadTracking.ts
📍 API: src/app/api/track-event/route.ts

✅ الأحداث المُتتبعة:
- phone_click → 📞 Anruf
- whatsapp_click → 💬 WhatsApp
- form_submit → 📝 Formular

✅ البيانات المُرسلة:
- contact_type (نوع التواصل)
- date_time (التاريخ والوقت)
- source (المصدر)
- gclid (معرف النقرة)
- landing_page (صفحة الهبوط)
- utm_source, utm_medium, utm_campaign
- device_type (نوع الجهاز)
```

### 3. إرسال النموذج
```
📍 الموقع: src/app/page.tsx
📍 API: src/app/api/send-inquiry/route.ts

✅ البيانات المُرسلة مع النموذج:
- بيانات العميل (name, phone, email, location)
- بيانات السيارة (brand, model, year, mileage, fuel)
- بيانات GCLID (source, gclid, landing_page, utm_*)
- الصور (image_urls)
```

### 4. التأكيد المزدوج (جديد)
```
📍 الموقع: src/components/FloatingButtons.tsx

✅ الخطوات:
1. الضغط على الزر → يظهر Modal التأكيد الأول
2. "Ja, weiter" → يظهر Modal التأكيد الثاني
3. "Jetzt anrufen/schreiben" → يُسجل الحدث ويُنفذ الإجراء

✅ التتبع:
- phone_button_click (step: initial)
- phone_button_click (step: first_confirm)
- phone_call_confirmed (step: final_confirm) ← هنا يُرسل إلى Sheets
```

---

## 📋 تدفق البيانات

```
┌─────────────────────────────────────────────────────────────┐
│                    زائر من Google Ads                       │
│              example.com?gclid=CjwKCAjw...                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ClientBody.tsx                           │
│              captureGclid() يلتقط ويحفظ                     │
│                                                             │
│  localStorage: {                                            │
│    gclid: "CjwKCAjw...",                                   │
│    source: "Google Ads",                                    │
│    landingPage: "/autoankauf/nuernberg",                   │
│    capturedAt: 1713196800000                               │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   📞 اتصال       │ │   💬 واتساب      │ │   📝 نموذج       │
│ FloatingButtons  │ │ FloatingButtons  │ │    page.tsx      │
└──────────────────┘ └──────────────────┘ └──────────────────┘
         │                   │                     │
         ▼                   ▼                     ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  تأكيد أول       │ │  تأكيد أول       │ │  ملء النموذج     │
│  "Ja, weiter"    │ │  "Ja, weiter"    │ │  + الصور        │
└──────────────────┘ └──────────────────┘ └──────────────────┘
         │                   │                     │
         ▼                   ▼                     ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  تأكيد ثاني      │ │  تأكيد ثاني      │ │  إرسال          │
│  "Jetzt anrufen" │ │  "Jetzt schreiben"│ │  "Senden"       │
└──────────────────┘ └──────────────────┘ └──────────────────┘
         │                   │                     │
         └───────────────────┼─────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    trackToSheets()                          │
│                 /api/track-event أو /api/send-inquiry       │
│                                                             │
│  payload: {                                                 │
│    date_time: "15.04.2026, 14:32:05",                      │
│    contact_type: "📞 Anruf",                               │
│    name: "Max Mustermann",                                  │
│    phone: "+49 176 12345678",                              │
│    source: "Google Ads",                                    │
│    gclid: "CjwKCAjw...",                                   │
│    rating: ""                                               │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Google Sheets                            │
│                                                             │
│  | Datum/Uhrzeit | Kontaktart | Name | ... | Quelle | GCLID│
│  |---------------|------------|------|-----|--------|------|
│  | 15.04.2026    | 📞 Anruf   | Max  | ... | G.Ads  | Cjw..│
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 نقاط المراجعة

### ✅ يعمل بشكل صحيح:
1. التقاط GCLID من URL
2. حفظ البيانات في localStorage
3. إرسال البيانات مع النموذج
4. تتبع النقرات على الأزرار
5. التأكيد المزدوج للاتصال والواتساب

### ⚠️ يحتاج تحسين:
1. إضافة Retry mechanism عند فشل الإرسال
2. تخزين الأحداث offline وإرسالها لاحقاً
3. إضافة timeout للـ API calls

### 📊 يحتاج تكوين:
1. SHEETS_WEBHOOK_URL في .env.local
2. سكربت Google Apps Script
3. صلاحيات Web App

---

## 🧪 اختبار النظام

### اختبار 1: التقاط GCLID
```
1. افتح: https://frankenautoankauf24.de/?gclid=test123
2. افتح Console (F12)
3. اكتب: localStorage.getItem('faa_gclid_data')
4. يجب أن ترى: {"gclid":"test123","source":"Google Ads",...}
```

### اختبار 2: إرسال نموذج
```
1. املأ النموذج
2. راقب Network tab
3. ابحث عن POST /api/send-inquiry
4. تحقق من payload يحتوي gclid و source
```

### اختبار 3: زر الاتصال
```
1. اضغط على زر الاتصال
2. يجب أن يظهر Modal التأكيد الأول
3. اضغط "Ja, weiter"
4. يجب أن يظهر Modal التأكيد الثاني
5. اضغط "Jetzt anrufen"
6. راقب Network tab - يجب أن يُرسل POST /api/track-event
```

---

## 📝 التكامل مع Google Ads

### 1. Offline Conversion Import
```
لربط العملاء المؤهلين بالإعلانات:

1. صدّر من Google Sheets:
   - GCLID
   - Conversion Time
   - Conversion Value (حسب التقييم)

2. استورد في Google Ads:
   Tools → Conversions → Upload
```

### 2. قيم التحويل المقترحة:
```
⭐ Gut = 10€
⭐⭐ Sehr Gut = 25€
⭐⭐⭐ Exzellent = 50€
❌ Kein Interesse = 0€
📵 Nicht erreicht = 0€
```

### 3. Enhanced Conversions
```javascript
// يمكن إضافته لاحقاً لتحسين Attribution
gtag('set', 'user_data', {
  'email': email,
  'phone_number': phone
});
```

---

## ✅ الخلاصة

النظام جاهز للعمل مع:
- ✅ التقاط GCLID تلقائياً
- ✅ تتبع جميع أنواع التواصل
- ✅ إرسال البيانات إلى Google Sheets
- ✅ تأكيد مزدوج للاتصال والواتساب
- ⏳ يحتاج: إعداد Google Sheets Webhook
