import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Contact */}
          <div>
            <h3 className="font-bold mb-4">Kontakt</h3>
            <p className="mb-2">Auto Ankauf Franken</p>
            <p className="mb-2">0176 – 323 335 61</p>
            <p className="mb-4">info@frankenautoankauf24.de</p>
            <div className="flex gap-3">
              <a
                href="https://wa.me/4917632333561"
                className="text-green-400 hover:text-green-300 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* Vehicle Conditions */}
          <div>
            <h3 className="font-bold mb-4">Zustand</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auto-verkaufen-ohne-tuev" className="hover:text-orange-400 transition-colors">Ohne TÜV</Link></li>
              <li><Link href="/auto-verkaufen-mit-motorschaden" className="hover:text-orange-400 transition-colors">Mit Motorschaden</Link></li>
              <li><Link href="/auto-verkaufen-unfallschaden" className="hover:text-orange-400 transition-colors">Unfallschaden</Link></li>
              <li><Link href="/auto-verkaufen-defektes-auto" className="hover:text-orange-400 transition-colors">Defektes Auto</Link></li>
              <li><Link href="/faelle" className="hover:text-orange-400 transition-colors">Alle Fälle</Link></li>
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h3 className="font-bold mb-4">Städte</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/autoankauf/nuernberg" className="hover:text-orange-400 transition-colors">Autoankauf Nürnberg</Link></li>
              <li><Link href="/autoankauf/fuerth" className="hover:text-orange-400 transition-colors">Autoankauf Fürth</Link></li>
              <li><Link href="/autoankauf/erlangen" className="hover:text-orange-400 transition-colors">Autoankauf Erlangen</Link></li>
              <li><Link href="/autoankauf/bamberg" className="hover:text-orange-400 transition-colors">Autoankauf Bamberg</Link></li>
              <li><Link href="/autoankauf/bayreuth" className="hover:text-orange-400 transition-colors">Autoankauf Bayreuth</Link></li>
              <li><Link href="/autoankauf/wuerzburg" className="hover:text-orange-400 transition-colors">Autoankauf Würzburg</Link></li>
              <li><Link href="/autoankauf/schweinfurt" className="hover:text-orange-400 transition-colors">Autoankauf Schweinfurt</Link></li>
              <li><Link href="/staedte" className="text-orange-400 hover:text-orange-300 transition-colors">→ Alle Städte</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold mb-4">Rechtliches</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-orange-400 transition-colors">Startseite</Link></li>
              <li><Link href="/#form" className="hover:text-orange-400 transition-colors">Kostenlose Bewertung</Link></li>
              <li><Link href="/impressum" className="hover:text-orange-400 transition-colors">Impressum</Link></li>
              <li><Link href="/datenschutz" className="hover:text-orange-400 transition-colors">Datenschutz</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p className="mb-4">© 2024 Auto Ankauf Franken | Professioneller Autoankauf in Nürnberg & Franken</p>
          <div className="flex justify-center gap-6">
            <Link href="/impressum" className="hover:text-orange-400 transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-orange-400 transition-colors">Datenschutz</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
