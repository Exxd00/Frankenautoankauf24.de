"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Check, Phone, Clock, Star, Shield, Car, Banknote, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import MainHeader from "@/components/MainHeader"
import Footer from "@/components/Footer"
import { gtagEvent, trackWhatsAppClick, trackPhoneClick } from "@/lib/leadTracking"
import { getStoredGclidData, clearGclidData } from "@/lib/gclidTracking"

export default function DankePage() {
  const router = useRouter()
  const [isValid, setIsValid] = useState(false)
  const [gclidInfo, setGclidInfo] = useState<{ source: string; gclid: string } | null>(null)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Check if user came from form submission
    const formSubmitted = sessionStorage.getItem("form_submitted")
    if (formSubmitted === "true") {
      setIsValid(true)
      sessionStorage.removeItem("form_submitted")

      // Animate content appearance
      setTimeout(() => setShowContent(true), 100)

      // Get GCLID info for display/tracking
      const gclidData = getStoredGclidData()
      if (gclidData) {
        setGclidInfo({
          source: gclidData.source,
          gclid: gclidData.gclid || ''
        })
      }

      // Track thank you page view with source
      gtagEvent("thank_you_page_view", {
        page: "/danke",
        source: gclidData?.source || 'Direct',
        has_gclid: gclidData?.gclid ? 'yes' : 'no'
      })

      // Fire conversion event for Google Ads
      if (typeof window !== 'undefined' && window.gtag) {
        // Standard conversion tracking
        window.gtag('event', 'conversion', {
          'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL', // Replace with actual values
          'value': 1.0,
          'currency': 'EUR'
        })

        // Enhanced conversion with GCLID
        if (gclidData?.gclid) {
          window.gtag('event', 'form_submission_with_gclid', {
            'gclid': gclidData.gclid,
            'source': gclidData.source
          })
        }
      }

      // Clear GCLID after successful conversion (optional - keeps it for repeat visits)
      // clearGclidData()

    } else {
      // Redirect to home if accessed directly
      router.replace("/")
    }
  }, [router])

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600" />
          <p className="text-gray-500 dark:text-gray-400">Laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <MainHeader />

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-br from-green-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className={`container mx-auto px-4 py-12 md:py-16 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="max-w-3xl mx-auto">

            {/* Success Animation */}
            <div className="text-center mb-10">
              <div className="relative inline-block mb-6">
                {/* Animated rings */}
                <div className="absolute inset-0 -m-4 rounded-full bg-green-400/20 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-0 -m-2 rounded-full bg-green-400/30 animate-pulse" />

                {/* Success icon */}
                <div className="relative w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30">
                  <Check className="w-12 h-12 md:w-14 md:h-14 text-white" strokeWidth={3} />
                </div>

                {/* Sparkle effects */}
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <Sparkles className="absolute -bottom-1 -left-3 w-5 h-5 text-orange-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Vielen Dank!
              </h1>

              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-2">
                Ihre Anfrage wurde erfolgreich gesendet.
              </p>

              <p className="text-gray-500 dark:text-gray-400">
                Wir melden uns innerhalb von 24 Stunden bei Ihnen.
              </p>

              {/* Google Ads Badge */}
              {gclidInfo && gclidInfo.source === 'Google Ads' && (
                <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm mt-6">
                  <Star className="w-4 h-4 fill-current" />
                  <span>Danke für Ihr Vertrauen über Google!</span>
                </div>
              )}
            </div>

            {/* What happens next - Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                Was passiert jetzt?
              </h2>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center font-bold">
                    1
                  </div>
                  <div className="pt-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Prüfung Ihrer Daten</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Unsere Experten prüfen Ihre Fahrzeugdaten sorgfältig.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center font-bold">
                    2
                  </div>
                  <div className="pt-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Persönlicher Kontakt</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Sie erhalten innerhalb von 24 Stunden ein faires Angebot.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center font-bold">
                    3
                  </div>
                  <div className="pt-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Kostenlose Abholung & Barzahlung</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Wir holen Ihr Fahrzeug ab und zahlen sofort in bar aus.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <Shield className="w-7 h-7 text-orange-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Sicher & Seriös</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <Clock className="w-7 h-7 text-orange-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">24h Antwort</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <Car className="w-7 h-7 text-orange-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Kostenlose Abholung</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <Banknote className="w-7 h-7 text-orange-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Sofort Barzahlung</p>
              </div>
            </div>

            {/* Quick Contact CTA */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 md:p-8 mb-8 text-white shadow-lg">
              <h3 className="font-bold text-lg md:text-xl mb-2 text-center">
                Haben Sie Fragen?
              </h3>
              <p className="text-orange-100 text-center mb-6 text-sm md:text-base">
                Kontaktieren Sie uns direkt - wir sind für Sie da!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://wa.me/4917632333561?text=Hallo, ich habe gerade eine Anfrage über Ihre Website gesendet und möchte mehr erfahren."
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick()}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp schreiben
                </a>
                <a
                  href="tel:+4917632333561"
                  onClick={() => trackPhoneClick()}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-orange-600 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
                >
                  <Phone className="w-5 h-5" />
                  0176 32333561
                </a>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 px-6 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ArrowRight className="w-5 h-5 rotate-180" />
                  Zur Startseite
                </Button>
              </Link>
              <Link href="/staedte">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 px-6 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Car className="w-5 h-5" />
                  Alle Städte
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
