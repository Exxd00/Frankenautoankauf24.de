import Link from "next/link"
import { AlphabetFilter } from "@/components/alphabet-filter"
import { pseoCasesList } from "@/lib/pseo/pseoCases"
import MainHeader from "@/components/MainHeader"
import Footer from "@/components/Footer"

export const metadata = {
  title: "Alle Verkaufsfälle | Franken Auto Ankauf",
  description:
    "Alle Ankauf-Situationen im Überblick: Motorschaden, ohne TÜV, Unfall, Export, Leasing und viele weitere Fälle — mit lokalen Seiten pro Stadt.",
}

export default function FaellePage() {
  const cases = [...pseoCasesList]
    .sort((a, b) => a.title.localeCompare(b.title, "de"))
    .map(c => ({
      id: c.key,
      label: c.title,
      subLabel: c.shortLabel,
      description: "Lokale Seiten pro Stadt verfügbar.",
      links: [
        { href: `/auto-verkaufen/${c.key}`, label: "Übersicht" },
        { href: "/staedte", label: "Stadt wählen" },
      ],
    }))

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <MainHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-orange-600 to-orange-500 text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-2">Alle Verkaufsfälle</h1>
            <p className="text-lg opacity-90">
              Alle Ankauf-Situationen im Überblick
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 max-w-5xl">
            <p className="text-lg text-muted-foreground mb-8">
              Hier finden Sie alle Situationen, für die wir Anfragen annehmen. Jede Situation hat zusätzlich lokale Seiten pro Stadt.
              <span className="ml-2">
                <Link href="/#form" className="text-orange-600 underline hover:text-orange-700">
                  Zum Formular
                </Link>
              </span>
            </p>

            <AlphabetFilter items={cases} />

            <div className="mt-10 p-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-lg">
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Schnell starten (2 Minuten)</h2>
              <p className="text-muted-foreground mb-4">
                Kurze Daten senden — wir prüfen Zustand & Markt und machen Ihnen ein klares Angebot. Keine Verpflichtung.
              </p>
              <Link
                href="/#form"
                className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
              >
                Kostenlose Bewertung starten
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
