# 📊 Google Sheets GCLID Tracking - Einrichtungsanleitung

Diese Anleitung erklärt, wie Sie Google Sheets für das GCLID-Tracking einrichten, um Google Ads-Kampagnen mit Leads zu verknüpfen.

## 🎯 Was wird erfasst?

| Spalte | Beschreibung | Beispiel |
|--------|--------------|----------|
| Datum/Uhrzeit | Zeitpunkt des Kontakts | 15.04.2026, 14:32:05 |
| Kontaktart | Art der Kontaktaufnahme | 📞 Anruf / 📝 Formular / 💬 WhatsApp |
| Name | Name des Kunden | Max Mustermann |
| Telefon | Telefonnummer | +49 176 12345678 |
| Quelle | Traffic-Quelle | Google Ads / Organic / Direct |
| GCLID | Google Click Identifier | CjwKCAjw... |
| Bewertung | Qualität des Leads (manuell) | Gut / Sehr Gut / Exzellent |

## 📋 Google Apps Script Code

Erstellen Sie ein neues Google Sheet und fügen Sie folgenden Apps Script Code ein:

```javascript
/**
 * GCLID Tracking Script für Frankenautoankauf24.de
 * Version: 2.0
 *
 * Dieses Script empfängt Leads mit GCLID-Tracking-Daten
 * und speichert sie in Google Sheets.
 */

// Webhook-Funktion für POST-Anfragen
function doPost(e) {
  try {
    // Parse JSON data
    const data = JSON.parse(e.postData.contents);

    // Get or create the main sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Leads');

    if (!sheet) {
      sheet = ss.insertSheet('Leads');
      setupHeaders(sheet);
    }

    // Add the lead data
    addLead(sheet, data);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Setup headers for the sheet
function setupHeaders(sheet) {
  const headers = [
    'Datum/Uhrzeit',
    'Kontaktart',
    'Name',
    'Telefon',
    'Quelle',
    'GCLID',
    'Bewertung',
    'E-Mail',
    'Ort',
    'Marke',
    'Modell',
    'Baujahr',
    'Kilometerstand',
    'Kraftstoff',
    'Preisvorstellung',
    'Nachricht',
    'Landing Page',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'Bilder'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#EA580C');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');

  // Set column widths
  sheet.setColumnWidth(1, 150); // Datum/Uhrzeit
  sheet.setColumnWidth(2, 120); // Kontaktart
  sheet.setColumnWidth(3, 150); // Name
  sheet.setColumnWidth(4, 140); // Telefon
  sheet.setColumnWidth(5, 100); // Quelle
  sheet.setColumnWidth(6, 200); // GCLID
  sheet.setColumnWidth(7, 100); // Bewertung

  // Freeze header row
  sheet.setFrozenRows(1);
}

// Add a lead to the sheet
function addLead(sheet, data) {
  const row = [
    data.date_time || new Date().toLocaleString('de-DE'),
    data.contact_type || '📝 Formular',
    data.name || '-',
    data.phone || '-',
    data.source || 'Direct',
    data.gclid || '-',
    data.rating || '', // Empty for new leads
    data.email || '-',
    data.location || '-',
    data.brand || '-',
    data.model || '-',
    data.year || '-',
    data.mileage || '-',
    data.fuel || '-',
    data.priceExpectation || '-',
    data.message || '-',
    data.landing_page || '-',
    data.utm_source || '-',
    data.utm_medium || '-',
    data.utm_campaign || '-',
    (data.image_urls || []).join('\n') || '-'
  ];

  // Insert at top (after header)
  sheet.insertRowAfter(1);
  sheet.getRange(2, 1, 1, row.length).setValues([row]);

  // Color code based on source
  const sourceCell = sheet.getRange(2, 5);
  if (data.source === 'Google Ads') {
    sourceCell.setBackground('#DCFCE7'); // Light green
  } else if (data.source === 'Organic') {
    sourceCell.setBackground('#DBEAFE'); // Light blue
  }

  // Add dropdown for rating
  const ratingCell = sheet.getRange(2, 7);
  const ratingRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Gut', 'Sehr Gut', 'Exzellent', 'Kein Interesse', 'Nicht erreicht'])
    .build();
  ratingCell.setDataValidation(ratingRule);

  // Send notification email for Google Ads leads
  if (data.source === 'Google Ads' && data.gclid) {
    sendNotification(data);
  }
}

// Send email notification for high-value leads
function sendNotification(data) {
  const email = Session.getActiveUser().getEmail();
  const subject = `🎯 Neuer Google Ads Lead: ${data.name || 'Unbekannt'}`;

  const body = `
Neuer Lead von Google Ads!

📊 GCLID: ${data.gclid}
📞 Kontaktart: ${data.contact_type}
👤 Name: ${data.name || '-'}
📱 Telefon: ${data.phone || '-'}

🚗 Fahrzeug: ${data.brand || '-'} ${data.model || '-'} (${data.year || '-'})
📍 Ort: ${data.location || '-'}

---
Automatisch generiert von Frankenautoankauf24.de
  `;

  try {
    MailApp.sendEmail(email, subject, body);
  } catch (e) {
    console.log('Email notification failed:', e);
  }
}

// Menu for manual setup
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🚗 Autoankauf')
    .addItem('📊 Dashboard erstellen', 'createDashboard')
    .addItem('📧 E-Mail Test', 'testEmail')
    .addItem('🔄 Sheet einrichten', 'setupSheet')
    .addToUi();
}

// Setup sheet manually
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Leads');

  if (!sheet) {
    sheet = ss.insertSheet('Leads');
  }

  setupHeaders(sheet);
  SpreadsheetApp.getUi().alert('✅ Sheet wurde eingerichtet!');
}

// Create a simple dashboard
function createDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dashboard = ss.getSheetByName('Dashboard');

  if (!dashboard) {
    dashboard = ss.insertSheet('Dashboard');
  }

  // Clear existing content
  dashboard.clear();

  // Title
  dashboard.getRange('A1').setValue('📊 Lead-Übersicht');
  dashboard.getRange('A1').setFontSize(20).setFontWeight('bold');

  // Stats
  const leadsSheet = ss.getSheetByName('Leads');
  if (leadsSheet) {
    const lastRow = leadsSheet.getLastRow();
    const totalLeads = Math.max(0, lastRow - 1);

    dashboard.getRange('A3').setValue('Gesamt Leads:');
    dashboard.getRange('B3').setValue(totalLeads);

    // Count by source
    if (totalLeads > 0) {
      const sources = leadsSheet.getRange(2, 5, totalLeads, 1).getValues().flat();
      const googleAds = sources.filter(s => s === 'Google Ads').length;
      const organic = sources.filter(s => s === 'Organic').length;
      const direct = sources.filter(s => s === 'Direct').length;

      dashboard.getRange('A5').setValue('Google Ads:');
      dashboard.getRange('B5').setValue(googleAds);
      dashboard.getRange('A6').setValue('Organic:');
      dashboard.getRange('B6').setValue(organic);
      dashboard.getRange('A7').setValue('Direct:');
      dashboard.getRange('B7').setValue(direct);
    }
  }

  SpreadsheetApp.getUi().alert('✅ Dashboard erstellt!');
}

// Test email
function testEmail() {
  const email = Session.getActiveUser().getEmail();
  MailApp.sendEmail(email, 'Test: Autoankauf Notification', 'Dies ist eine Test-Benachrichtigung.');
  SpreadsheetApp.getUi().alert('✅ Test-E-Mail gesendet an ' + email);
}
```

## 🚀 Einrichtung

### Schritt 1: Google Sheet erstellen
1. Öffnen Sie [Google Sheets](https://sheets.google.com)
2. Erstellen Sie eine neue Tabelle
3. Benennen Sie sie z.B. "Frankenautoankauf - Leads"

### Schritt 2: Apps Script hinzufügen
1. Klicken Sie auf **Erweiterungen → Apps Script**
2. Löschen Sie den Standard-Code
3. Fügen Sie den obigen Code ein
4. Speichern Sie das Projekt (Strg+S)

### Schritt 3: Sheet einrichten
1. Aktualisieren Sie die Seite (F5)
2. Klicken Sie auf **🚗 Autoankauf → 🔄 Sheet einrichten**
3. Die Spalten werden automatisch erstellt

### Schritt 4: Als Web App bereitstellen
1. Klicken Sie auf **Bereitstellen → Neue Bereitstellung**
2. Wählen Sie **Web-App**
3. Einstellungen:
   - **Beschreibung**: "Lead Tracking v2"
   - **Ausführen als**: "Ich"
   - **Wer hat Zugriff**: "Jeder"
4. Klicken Sie auf **Bereitstellen**
5. **Kopieren Sie die Web-App-URL**

### Schritt 5: URL in der Website konfigurieren
Fügen Sie die URL zur `.env.local` Datei hinzu:

```env
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

## 📈 Nutzung

### Automatische Erfassung
- **Formular-Einreichungen**: Werden mit 📝 Formular gekennzeichnet
- **Anrufe**: Werden mit 📞 Anruf gekennzeichnet
- **WhatsApp**: Werden mit 💬 WhatsApp gekennzeichnet

### Manuelle Bewertung
Klicken Sie auf die Spalte "Bewertung" und wählen Sie:
- **Gut** - Interessierter Lead
- **Sehr Gut** - Kaufbereit
- **Exzellent** - Sofortiger Abschluss
- **Kein Interesse** - Lead nicht interessiert
- **Nicht erreicht** - Keine Antwort

### Google Ads Auswertung
1. Öffnen Sie Google Ads
2. Gehen Sie zu **Berichte**
3. Vergleichen Sie die GCLIDs mit Ihren Leads
4. Sehen Sie, welche Kampagnen die besten Leads bringen

## 🔗 GCLID zu Google Ads Kampagne verknüpfen

1. Kopieren Sie die GCLID aus dem Sheet
2. Öffnen Sie Google Ads
3. Gehen Sie zu **Tools → Conversion-Tracking**
4. Nutzen Sie die Offline-Conversion-Import-Funktion
5. Laden Sie die GCLIDs mit Bewertungen hoch

## 📊 Dashboard

Das Dashboard zeigt:
- Gesamt-Leads
- Leads nach Quelle (Google Ads / Organic / Direct)
- Lead-Qualität nach Kampagne

Aktualisieren Sie es über **🚗 Autoankauf → 📊 Dashboard erstellen**

---

**Support**: Bei Fragen wenden Sie sich an den Entwickler.
