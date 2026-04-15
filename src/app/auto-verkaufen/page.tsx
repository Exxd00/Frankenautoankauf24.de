import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { pseoCasesList } from "@/lib/pseo/pseoCases"
import MainHeader from "@/components/MainHeader"
import Footer from "@/components/Footer"

export const metadata: Metadata = {
  title: "Auto verkaufen in Franken | Fälle & schnelle Abwicklung",
  description:
    "Alle häufigen Fälle rund um den Autoverkauf in Franken: Motorschaden, Unfallwagen, ohne TÜV, Export & mehr. Jetzt in 2 Minuten Anfrage senden.",
  alternates: {
    canonical: "https://frankenautoankauf24.de/auto-verkaufen",
  },
}

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <MainHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-orange-600 to-orange-500 text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Auto verkaufen in Franken
            </h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Alle Fälle auf einen Blick – wählen Sie Ihre Situation
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="mb-10 flex flex-col gap-4">
              <p className="text-lg text-muted-foreground">
                Wähle deinen passenden Fall aus. Jede Seite erklärt kurz die Situation und führt dich
                direkt zum Anfrage-Formular.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button asChild className="bg-orange-600 hover:bg-orange-700">
                  <Link href="/#form">Jetzt Anfrage senden</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/auto-verkaufen-sofort">Sofort verkaufen</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/staedte">Städte & Regionen</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pseoCasesList.map((c) => (
                <Link
                  key={c.key}
                  href={`/auto-verkaufen/${c.key}`}
                  className="group rounded-xl border bg-white dark:bg-gray-800 p-5 transition hover:shadow-md hover:border-orange-500"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">{c.title}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{c.shortLabel}</div>
                    </div>
                    <span className="text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-12 rounded-xl border bg-white dark:bg-gray-800 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Du bist dir unsicher?</h2>
              <p className="mt-2 text-muted-foreground">
                Kein Problem – sende einfach eine kurze Anfrage. Wir melden uns schnell mit einem fairen
                Angebot und übernehmen bei Bedarf Abholung & Abmeldung.
              </p>
              <div className="mt-4">
                <Button asChild className="bg-orange-600 hover:bg-orange-700">
                  <Link href="/#form">Zum Formular</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
