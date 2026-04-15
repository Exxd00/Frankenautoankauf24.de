import Link from "next/link"
import { pseoCities } from "@/lib/pseo/pseoCities"
import { MapPin, Star, ArrowRight, Phone } from "lucide-react"
import MainHeader from "@/components/MainHeader"
import Footer from "@/components/Footer"

export const metadata = {
  title: "Autoankauf in allen Städten – Franken Auto Ankauf",
  description:
    "Auto verkaufen in allen Städten in Franken und Bayern. Wir kaufen Ihr Auto schnell, seriös und unkompliziert – auch ohne TÜV oder mit Schaden. Kostenlose Abholung!",
  alternates: {
    canonical: "https://frankenautoankauf24.de/staedte",
  },
}

type CityItem = {
  cityKey: string
  name: string
  regionLabel: string
}

// Featured cities for Google Ads campaigns
const FEATURED_CITIES = [
  'nuernberg', 'erlangen', 'fuerth', 'bamberg', 'bayreuth',
  'wuerzburg', 'schweinfurt', 'regensburg', 'ingolstadt'
]

export default function StaedtePage() {
  const cities: CityItem[] = Object.keys(pseoCities)
    .map((k) => ({
      cityKey: k,
      name: (pseoCities as Record<string, { name: string; regionLabel: string }>)[k].name,
      regionLabel: (pseoCities as Record<string, { name: string; regionLabel: string }>)[k].regionLabel || 'Franken',
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "de"))

  // Group cities by region
  const cityGroups = cities.reduce((acc, city) => {
    const region = city.regionLabel
    if (!acc[region]) acc[region] = []
    acc[region].push(city)
    return acc
  }, {} as Record<string, CityItem[]>)

  // Order of regions
  const regionOrder = ['Mittelfranken', 'Oberfranken', 'Unterfranken', 'Oberpfalz', 'Oberbayern']
  const sortedRegions = Object.keys(cityGroups).sort((a, b) => {
    const aIdx = regionOrder.indexOf(a)
    const bIdx = regionOrder.indexOf(b)
    if (aIdx === -1 && bIdx === -1) return a.localeCompare(b)
    if (aIdx === -1) return 1
    if (bIdx === -1) return -1
    return aIdx - bIdx
  })

  const featuredCities = cities.filter(c => FEATURED_CITIES.includes(c.cityKey))

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <MainHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Autoankauf in allen Städten
            </h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              Wir kaufen Ihr Auto in ganz Franken und Bayern. Wählen Sie Ihre Stadt für ein lokales Angebot.
            </p>
          </div>
        </section>

        {/* Featured Cities */}
        <section className="py-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Unsere Hauptstandorte</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {featuredCities.map((city) => (
                <Link
                  key={city.cityKey}
                  href={`/autoankauf/${city.cityKey}`}
                  className="group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border-2 border-orange-200 dark:border-orange-800 hover:border-orange-500 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-orange-600">
                        {city.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{city.regionLabel}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* All Cities by Region */}
        <section className="py-12 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Alle Städte nach Region</h2>

            <div className="space-y-10">
              {sortedRegions.map((region) => (
                <div key={region}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{region}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({cityGroups[region].length} Städte)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {cityGroups[region].map((city) => (
                      <Link
                        key={city.cityKey}
                        href={`/autoankauf/${city.cityKey}`}
                        className="group bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-orange-500 hover:shadow-md transition-all"
                      >
                        <span className="font-medium text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">
                          {city.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ihre Stadt nicht gefunden?</h2>
            <p className="text-gray-300 mb-6 max-w-xl mx-auto">
              Kein Problem! Wir kaufen Autos in ganz Deutschland. Kontaktieren Sie uns für ein individuelles Angebot.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/#form"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition-all hover:scale-105"
              >
                Jetzt Angebot anfordern
              </Link>
              <a
                href="tel:+4917632333561"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all"
              >
                <Phone className="w-5 h-5" />
                0176 32333561
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
