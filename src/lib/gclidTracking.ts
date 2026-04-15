"use client"

/**
 * GCLID Tracking System for Google Ads
 *
 * This module captures the GCLID (Google Click Identifier) from URL parameters
 * when a user arrives from a Google Ad, stores it in localStorage, and tracks
 * the traffic source for lead attribution.
 */

export type TrafficSource = 'Google Ads' | 'Organic' | 'Direct' | 'Referral' | 'Social'

export type ContactType = '📞 Anruf' | '📝 Formular' | '💬 WhatsApp'

export interface GclidData {
  gclid: string
  capturedAt: number
  landingPage: string
  referrer: string
  source: TrafficSource
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
}

export interface LeadTrackingData {
  // Contact info
  contactType: ContactType
  timestamp: string
  dateTime: string // German formatted date/time

  // Customer info (optional for phone/whatsapp clicks)
  name?: string
  phone?: string
  email?: string

  // Source tracking
  source: TrafficSource
  gclid: string
  landingPage: string
  referrer: string

  // UTM parameters
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string

  // Rating (empty for new leads)
  rating?: string

  // Device info
  deviceType: 'mobile' | 'desktop' | 'tablet'
}

const GCLID_STORAGE_KEY = "faa_gclid_data"
const GCLID_EXPIRY_DAYS = 90 // Google Ads attribution window

/**
 * Detect traffic source based on URL parameters and referrer
 */
function detectTrafficSource(urlParams: URLSearchParams, referrer: string): TrafficSource {
  // Check for GCLID - always Google Ads
  if (urlParams.get('gclid')) {
    return 'Google Ads'
  }

  // Check for UTM source
  const utmSource = urlParams.get('utm_source')?.toLowerCase()
  const utmMedium = urlParams.get('utm_medium')?.toLowerCase()

  if (utmSource === 'google' && utmMedium === 'cpc') {
    return 'Google Ads'
  }

  // Check referrer for organic search
  if (referrer) {
    const referrerHost = new URL(referrer).hostname.toLowerCase()

    // Search engines
    if (referrerHost.includes('google') ||
        referrerHost.includes('bing') ||
        referrerHost.includes('yahoo') ||
        referrerHost.includes('duckduckgo')) {
      return 'Organic'
    }

    // Social media
    if (referrerHost.includes('facebook') ||
        referrerHost.includes('instagram') ||
        referrerHost.includes('twitter') ||
        referrerHost.includes('linkedin') ||
        referrerHost.includes('tiktok')) {
      return 'Social'
    }

    // Other referrals
    return 'Referral'
  }

  // Direct traffic
  return 'Direct'
}

/**
 * Format date in German format
 */
function formatGermanDateTime(): string {
  const now = new Date()
  const day = now.getDate().toString().padStart(2, '0')
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const year = now.getFullYear()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  return `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`
}

/**
 * Get device type
 */
function getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop'

  const width = window.innerWidth
  const userAgent = navigator.userAgent.toLowerCase()

  if (/ipad|tablet|playbook|silk/.test(userAgent) || (width >= 768 && width < 1024)) {
    return 'tablet'
  }

  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/.test(userAgent) || width < 768) {
    return 'mobile'
  }

  return 'desktop'
}

/**
 * Capture GCLID and tracking data from URL on page load
 * Call this function when the page loads
 */
export function captureGclid(): GclidData | null {
  if (typeof window === 'undefined') return null

  try {
    const urlParams = new URLSearchParams(window.location.search)
    const gclid = urlParams.get('gclid')
    const referrer = document.referrer || ''
    const source = detectTrafficSource(urlParams, referrer)

    const gclidData: GclidData = {
      gclid: gclid || '',
      capturedAt: Date.now(),
      landingPage: window.location.pathname,
      referrer: referrer,
      source: source,
      utmSource: urlParams.get('utm_source') || undefined,
      utmMedium: urlParams.get('utm_medium') || undefined,
      utmCampaign: urlParams.get('utm_campaign') || undefined,
      utmTerm: urlParams.get('utm_term') || undefined,
      utmContent: urlParams.get('utm_content') || undefined,
    }

    // Only store if we have a GCLID or if there's no existing data
    const existingData = getStoredGclidData()

    if (gclid) {
      // Always update if we have a new GCLID
      localStorage.setItem(GCLID_STORAGE_KEY, JSON.stringify(gclidData))
      console.log('📊 GCLID captured:', gclid)
      return gclidData
    } else if (!existingData) {
      // Store source data even without GCLID for attribution
      localStorage.setItem(GCLID_STORAGE_KEY, JSON.stringify(gclidData))
      console.log('📊 Traffic source captured:', source)
      return gclidData
    }

    return existingData
  } catch (error) {
    console.error('Error capturing GCLID:', error)
    return null
  }
}

/**
 * Get stored GCLID data from localStorage
 */
export function getStoredGclidData(): GclidData | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(GCLID_STORAGE_KEY)
    if (!stored) return null

    const data = JSON.parse(stored) as GclidData

    // Check if data is expired (90 days)
    const expiryMs = GCLID_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    if (Date.now() - data.capturedAt > expiryMs) {
      localStorage.removeItem(GCLID_STORAGE_KEY)
      return null
    }

    return data
  } catch (error) {
    console.error('Error reading GCLID data:', error)
    return null
  }
}

/**
 * Get GCLID value only
 */
export function getGclid(): string {
  const data = getStoredGclidData()
  return data?.gclid || ''
}

/**
 * Get traffic source
 */
export function getTrafficSource(): TrafficSource {
  const data = getStoredGclidData()
  return data?.source || 'Direct'
}

/**
 * Build complete lead tracking data for Google Sheets
 */
export function buildLeadTrackingData(
  contactType: ContactType,
  customerInfo?: {
    name?: string
    phone?: string
    email?: string
  }
): LeadTrackingData {
  const gclidData = getStoredGclidData()

  return {
    contactType,
    timestamp: new Date().toISOString(),
    dateTime: formatGermanDateTime(),

    name: customerInfo?.name || '',
    phone: customerInfo?.phone || '',
    email: customerInfo?.email || '',

    source: gclidData?.source || 'Direct',
    gclid: gclidData?.gclid || '',
    landingPage: gclidData?.landingPage || window.location.pathname,
    referrer: gclidData?.referrer || document.referrer || '',

    utmSource: gclidData?.utmSource,
    utmMedium: gclidData?.utmMedium,
    utmCampaign: gclidData?.utmCampaign,

    rating: '', // Empty for new leads

    deviceType: getDeviceType(),
  }
}

/**
 * Clear stored GCLID data (e.g., after successful conversion)
 */
export function clearGclidData(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(GCLID_STORAGE_KEY)
    console.log('📊 GCLID data cleared')
  } catch (error) {
    console.error('Error clearing GCLID data:', error)
  }
}
