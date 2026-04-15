import { NextRequest, NextResponse } from 'next/server'

// Google Sheets webhook URL for tracking events
const SHEETS_WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL || ''

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate event type
    const validEventTypes = ['whatsapp_click', 'phone_click', 'form_submit']
    if (!data.event_type || !validEventTypes.includes(data.event_type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid event type' },
        { status: 400 }
      )
    }

    // Log the event with GCLID info
    console.log(`=== TRACKING EVENT: ${data.event_type.toUpperCase()} ===`)
    console.log('Contact Type:', data.contact_type || data.event_type)
    console.log('Date/Time:', data.date_time)
    console.log('Page:', data.page_url)
    console.log('Source:', data.source || 'Direct')
    console.log('GCLID:', data.gclid || 'none')
    console.log('Device:', data.device_type)
    console.log('==========================================')

    // Forward to Google Sheets if webhook is configured
    if (SHEETS_WEBHOOK_URL) {
      try {
        // Build payload optimized for Google Sheets columns:
        // Datum/Uhrzeit | Kontaktart | Name | Telefon | Quelle | GCLID | Bewertung
        const sheetsPayload = {
          // Primary tracking fields for the new format
          date_time: data.date_time || new Date().toLocaleString('de-DE'),
          contact_type: data.contact_type || getContactTypeEmoji(data.event_type),
          name: data.name || '-',
          phone: data.phone || '-',
          source: data.source || 'Direct',
          gclid: data.gclid || '-',
          rating: '', // Empty for new leads, to be filled manually

          // Additional context fields
          event_type: data.event_type,
          timestamp: data.timestamp || new Date().toISOString(),
          page_url: data.page_url || '',
          page_path: data.page_path || '',
          landing_page: data.landing_page || '',
          referrer: data.referrer || '',
          device_type: data.device_type || '',
          click_source: data.click_source || '',

          // UTM tracking
          utm_source: data.utm_source || '',
          utm_medium: data.utm_medium || '',
          utm_campaign: data.utm_campaign || '',

          // Form data (only for form_submit events)
          email: data.email || '',
          location: data.location || '',
          brand: data.brand || '',
          model: data.model || '',
          year: data.year || '',
          mileage: data.mileage || '',
          fuel: data.fuel || '',
          message: data.message || '',
        }

        // Use text/plain for Google Apps Script compatibility
        const sheetsRes = await fetch(SHEETS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(sheetsPayload),
          redirect: 'follow',
        })

        console.log('✅ Sheets webhook sent for tracking event')
        console.log('   Status:', sheetsRes.status)
        console.log('   Source:', sheetsPayload.source)
        console.log('   GCLID:', sheetsPayload.gclid)
      } catch (err) {
        console.error('❌ Sheets webhook failed for tracking event:', err)
      }
    } else {
      console.log('⚠️ SHEETS_WEBHOOK_URL not configured, event not sent to Google Sheets')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing tracking event:', error)
    return NextResponse.json(
      { success: false, message: 'Error processing event' },
      { status: 500 }
    )
  }
}

/**
 * Get contact type emoji for event type
 */
function getContactTypeEmoji(eventType: string): string {
  switch (eventType) {
    case 'phone_click':
      return '📞 Anruf'
    case 'whatsapp_click':
      return '💬 WhatsApp'
    case 'form_submit':
      return '📝 Formular'
    default:
      return '📝 Formular'
  }
}

// Force dynamic rendering
export const dynamic = "force-dynamic"
