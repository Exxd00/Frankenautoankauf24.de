"use client"

import { useState, useEffect } from "react"
import { Phone, ArrowLeft, Smartphone, X, MessageCircle, PhoneCall } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { trackWhatsAppClick, trackPhoneClick, gtagEvent } from "@/lib/leadTracking"

// BeforeInstallPromptEvent type
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hallo, ich interessiere mich für den Autoankauf und möchte gerne mehr Informationen erhalten."
)
const WHATSAPP_NUMBER = "4917632333561"
const PHONE_NUMBER = "+4917632333561"
const PHONE_DISPLAY = "0176 32333561"

// Confirmation Modal Types
type ConfirmationType = 'phone' | 'whatsapp' | null

export default function FloatingButtons() {
  const router = useRouter()
  const pathname = usePathname()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showIOSTooltip, setShowIOSTooltip] = useState(false)

  // Confirmation states
  const [confirmationType, setConfirmationType] = useState<ConfirmationType>(null)
  const [confirmationStep, setConfirmationStep] = useState(0) // 0 = hidden, 1 = first confirm, 2 = final confirm

  const isHomePage = pathname === "/"

  useEffect(() => {
    // Check if already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallButton(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallButton(false)
      gtagEvent("pwa_installed", {})
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    // Show install button for mobile users after short delay
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isAndroid = /Android/.test(navigator.userAgent)
    if (isIOS || isAndroid) {
      setTimeout(() => setShowInstallButton(true), 1000)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  // Handle initial button click - show first confirmation
  const handlePhoneButtonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setConfirmationType('phone')
    setConfirmationStep(1)
    gtagEvent("phone_button_click", { step: "initial" })
  }

  const handleWhatsAppButtonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setConfirmationType('whatsapp')
    setConfirmationStep(1)
    gtagEvent("whatsapp_button_click", { step: "initial" })
  }

  // Handle first confirmation - show final confirmation
  const handleFirstConfirm = () => {
    setConfirmationStep(2)
    gtagEvent(`${confirmationType}_button_click`, { step: "first_confirm" })
  }

  // Handle final confirmation - track event and execute action
  const handleFinalConfirm = () => {
    if (confirmationType === 'phone') {
      // Track the confirmed phone call
      trackPhoneClick()
      gtagEvent("phone_call_confirmed", { step: "final_confirm" })

      // Close modal and initiate call
      setConfirmationStep(0)
      setConfirmationType(null)
      window.location.href = `tel:${PHONE_NUMBER}`
    } else if (confirmationType === 'whatsapp') {
      // Track the confirmed WhatsApp message
      trackWhatsAppClick()
      gtagEvent("whatsapp_message_confirmed", { step: "final_confirm" })

      // Close modal and open WhatsApp
      setConfirmationStep(0)
      setConfirmationType(null)
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`, '_blank')
    }
  }

  // Handle cancel/close
  const handleCancel = () => {
    gtagEvent(`${confirmationType}_button_click`, { step: "cancelled", at_step: confirmationStep })
    setConfirmationStep(0)
    setConfirmationType(null)
  }

  const handleInstallClick = async () => {
    setIsInstalling(true)
    gtagEvent("pwa_install_click", { source: "floating_button" })

    if (deferredPrompt) {
      // Auto-install supported (Chrome/Edge/Samsung)
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        gtagEvent("pwa_install_result", { outcome })

        if (outcome === "accepted") {
          setIsInstalled(true)
          setShowInstallButton(false)
        }
        setDeferredPrompt(null)
      } catch (error) {
        console.error('Install error:', error)
      }
    } else {
      // iOS/Safari - show small tooltip
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      if (isIOS) {
        setShowIOSTooltip(true)
        gtagEvent("pwa_ios_tooltip_shown", {})
        // Auto-hide after 8 seconds
        setTimeout(() => setShowIOSTooltip(false), 8000)
      }
    }

    setIsInstalling(false)
  }

  const handleBackClick = () => {
    gtagEvent("back_button_click", { from_page: pathname })
    router.back()
  }

  return (
    <>
      {/* Confirmation Modal */}
      {confirmationStep > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className={`p-4 ${confirmationType === 'phone' ? 'bg-orange-500' : 'bg-green-500'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    {confirmationType === 'phone' ? (
                      <PhoneCall className="w-6 h-6 text-white" />
                    ) : (
                      <MessageCircle className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      {confirmationType === 'phone' ? 'Anrufen' : 'WhatsApp'}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {confirmationType === 'phone' ? PHONE_DISPLAY : 'Nachricht senden'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCancel}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {confirmationStep === 1 ? (
                <>
                  <p className="text-gray-700 dark:text-gray-300 text-center mb-6">
                    {confirmationType === 'phone'
                      ? 'Möchten Sie uns jetzt anrufen? Wir sind für Sie da!'
                      : 'Möchten Sie uns über WhatsApp kontaktieren?'}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={handleFirstConfirm}
                      className={`flex-1 py-3 px-4 rounded-xl text-white font-medium transition-colors ${
                        confirmationType === 'phone'
                          ? 'bg-orange-500 hover:bg-orange-600'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      Ja, weiter
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      confirmationType === 'phone' ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-green-100 dark:bg-green-900/30'
                    }`}>
                      {confirmationType === 'phone' ? (
                        <Phone className={`w-8 h-8 ${confirmationType === 'phone' ? 'text-orange-500' : 'text-green-500'}`} />
                      ) : (
                        <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      {confirmationType === 'phone'
                        ? 'Jetzt anrufen und Angebot erhalten!'
                        : 'WhatsApp öffnen und Nachricht senden!'}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                      {confirmationType === 'phone'
                        ? `Telefon: ${PHONE_DISPLAY}`
                        : 'Wir antworten schnell!'}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={handleFinalConfirm}
                      className={`flex-1 py-3 px-4 rounded-xl text-white font-bold transition-all transform hover:scale-105 ${
                        confirmationType === 'phone'
                          ? 'bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/30'
                          : 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30'
                      }`}
                    >
                      {confirmationType === 'phone' ? '📞 Jetzt anrufen' : '💬 Jetzt schreiben'}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-6 pb-4">
              <p className="text-center text-xs text-gray-400">
                {confirmationStep === 1
                  ? 'Schritt 1 von 2'
                  : 'Schritt 2 von 2 - Bestätigen Sie Ihre Aktion'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* iOS Install Tooltip - Small & Compact */}
      {showIOSTooltip && (
        <div className="fixed bottom-32 right-4 z-50 animate-in slide-in-from-right-5 fade-in duration-300">
          <div className="bg-gray-900/95 backdrop-blur-sm text-white rounded-2xl p-4 shadow-2xl max-w-[220px] border border-gray-700/50">
            {/* Close button */}
            <button
              onClick={() => setShowIOSTooltip(false)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Content */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold mb-1">App installieren</p>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Tippen Sie auf{" "}
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 rounded align-middle mx-0.5">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .9 2 2z"/>
                    </svg>
                  </span>{" "}
                  dann <span className="text-blue-400 font-medium">"Zum Home"</span>
                </p>
              </div>
            </div>

            {/* Arrow pointing to button */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-gray-900/95 rotate-45 border-r border-b border-gray-700/50"></div>
          </div>
        </div>
      )}

      {/* Floating Action Buttons - Right Side */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        {/* PWA Install Button with Pulse Animation - Only show if not installed */}
        {showInstallButton && !isInstalled && (
          <button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="relative group"
            aria-label="App installieren"
          >
            {/* Pulse Ring - Blue/Purple gradient */}
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-ping opacity-40" />
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse opacity-30" style={{ animationDelay: "0.5s" }} />

            {/* Button */}
            <span className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg transition-all hover:scale-110 group-hover:shadow-xl group-hover:shadow-purple-500/40">
              {isInstalling ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Smartphone className="w-7 h-7" />
              )}
            </span>

            {/* Tooltip - Desktop only */}
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">
              App installieren
            </span>

            {/* "Neu" Badge */}
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-bounce">
              NEU
            </span>
          </button>
        )}

        {/* WhatsApp Button with Pulse Animation */}
        <button
          onClick={handleWhatsAppButtonClick}
          className="relative group"
          aria-label="WhatsApp kontaktieren"
        >
          {/* Pulse Ring */}
          <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30" />
          <span className="absolute inset-0 rounded-full bg-green-500 animate-pulse opacity-20" style={{ animationDelay: "0.5s" }} />

          {/* Button */}
          <span className="relative flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all hover:scale-110 group-hover:shadow-xl group-hover:shadow-green-500/30">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </span>

          {/* Tooltip */}
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            WhatsApp schreiben
          </span>
        </button>

        {/* Phone Button with Pulse Animation */}
        <button
          onClick={handlePhoneButtonClick}
          className="relative group"
          aria-label="Jetzt anrufen"
        >
          {/* Pulse Ring */}
          <span className="absolute inset-0 rounded-full bg-orange-600 animate-ping opacity-30" style={{ animationDelay: "0.3s" }} />
          <span className="absolute inset-0 rounded-full bg-orange-600 animate-pulse opacity-20" style={{ animationDelay: "0.8s" }} />

          {/* Button */}
          <span className="relative flex items-center justify-center w-14 h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg transition-all hover:scale-110 group-hover:shadow-xl group-hover:shadow-orange-500/30">
            <Phone className="w-7 h-7" />
          </span>

          {/* Tooltip */}
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Jetzt anrufen
          </span>
        </button>
      </div>

      {/* Back Button - Left Side (only on non-home pages) */}
      {!isHomePage && (
        <div className="fixed bottom-6 left-6 z-40">
          <button
            onClick={handleBackClick}
            className="relative group"
            aria-label="Zurück"
          >
            {/* Pulse Ring */}
            <span className="absolute inset-0 rounded-full bg-gray-700 dark:bg-gray-500 animate-pulse opacity-20" />

            {/* Button */}
            <span className="relative flex items-center justify-center w-14 h-14 bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-full shadow-lg transition-all hover:scale-110 group-hover:shadow-xl">
              <ArrowLeft className="w-7 h-7" />
            </span>

            {/* Tooltip */}
            <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Zurück
            </span>
          </button>
        </div>
      )}
    </>
  )
}
