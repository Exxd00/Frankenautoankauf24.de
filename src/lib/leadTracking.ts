"use client"

import {
  getStoredGclidData,
  buildLeadTrackingData,
  type ContactType,
  type LeadTrackingData
} from './gclidTracking'

export type LeadSource = {
  source_url: string
  source_path: string
  click_source: string
  ts: number
}

export type TrackEventType = 'whatsapp_click' | 'phone_click' | 'form_submit'

export interface TrackEventData {
  event_type: TrackEventType
  page_url?: string
  page_path?: string
  referrer?: string
  device_type?: string
  timestamp?: string
  click_source?: string

  // GCLID tracking data
  contact_type?: string
  date_time?: string
  source?: string
  gclid?: string
  landing_page?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string

  // Additional data for form_submit
  brand?: string
  model?: string
  year?: string
  mileage?: string
  fuel?: string
  name?: string
  email?: string
  phone?: string
  location?: string
  message?: string
}

const KEY = "faa_lead_source"

export function setLeadSource(click_source: string) {
  if (typeof window === "undefined") return
  const data: LeadSource = {
    source_url: window.location.href,
    source_path: window.location.pathname,
    click_source,
    ts: Date.now(),
  }
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

export function getLeadSource(): LeadSource | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LeadSource
    if (!parsed || typeof parsed !== "object") return null
    return parsed
  } catch {
    return null
  }
}

export function clearLeadSource() {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

type GtagFn = (command: "event", eventName: string, params?: Record<string, unknown>) => void

export function gtagEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return
  const gtag = (window as unknown as { gtag?: GtagFn }).gtag
  if (typeof gtag === "function") {
    gtag("event", eventName, {
      ...params,
      page_path: window.location.pathname,
    })
  }
}

/**
 * Get contact type emoji string for Google Sheets
 */
function getContactTypeString(eventType: TrackEventType): ContactType {
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

/**
 * Track an event and send it to Google Sheets via the API
 * Used for: whatsapp_click, phone_click, form_submit
 * Now includes GCLID tracking data for Google Ads attribution
 */
export async function trackToSheets(eventType: TrackEventType, additionalData?: Partial<TrackEventData>) {
  if (typeof window === "undefined") return

  const leadSource = getLeadSource()
  const gclidData = getStoredGclidData()
  const contactType = getContactTypeString(eventType)
  const trackingData = buildLeadTrackingData(contactType, {
    name: additionalData?.name,
    phone: additionalData?.phone,
    email: additionalData?.email,
  })

  const eventData: TrackEventData = {
    event_type: eventType,
    page_url: window.location.href,
    page_path: window.location.pathname,
    referrer: document.referrer || '',
    device_type: trackingData.deviceType,
    timestamp: new Date().toISOString(),
    click_source: leadSource?.click_source || '',

    // GCLID tracking data
    contact_type: trackingData.contactType,
    date_time: trackingData.dateTime,
    source: trackingData.source,
    gclid: gclidData?.gclid || '',
    landing_page: trackingData.landingPage,
    utm_source: gclidData?.utmSource || '',
    utm_medium: gclidData?.utmMedium || '',
    utm_campaign: gclidData?.utmCampaign || '',

    ...additionalData,
  }

  // Also send GA4 event with enhanced tracking
  gtagEvent(eventType, {
    event_category: eventType === 'form_submit' ? 'Lead' : 'Engagement',
    event_label: window.location.pathname,
    source: trackingData.source,
    gclid: gclidData?.gclid || '',
  })

  try {
    await fetch('/api/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    })
    console.log(`📊 ${eventType} tracked with GCLID:`, gclidData?.gclid || 'none')
  } catch (err) {
    console.error('Track event failed:', err)
  }
}

/**
 * Track WhatsApp button click
 */
export function trackWhatsAppClick() {
  trackToSheets('whatsapp_click')
}

/**
 * Track Phone button click
 */
export function trackPhoneClick() {
  trackToSheets('phone_click')
}

/**
 * Get GCLID tracking data for forms
 * Use this to include GCLID in form submissions
 */
export function getGclidTrackingForForm(): Partial<LeadTrackingData> {
  const gclidData = getStoredGclidData()
  return {
    source: gclidData?.source || 'Direct',
    gclid: gclidData?.gclid || '',
    landingPage: gclidData?.landingPage || '',
    utmSource: gclidData?.utmSource,
    utmMedium: gclidData?.utmMedium,
    utmCampaign: gclidData?.utmCampaign,
  }
}
