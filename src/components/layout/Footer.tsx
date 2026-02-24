import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-night-800 bg-night-950 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Branding */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <span className="text-xl">🔭</span>
              <span className="font-display text-lg font-bold bg-gradient-to-r from-cosmos-400 to-nebula-400 bg-clip-text text-transparent">
                Astrofor
              </span>
            </Link>
            <p className="text-sm text-night-400 leading-relaxed">
              Społeczność astronomiczna. Dziel się zdjęciami, wiedzą i pasją do kosmosu.
            </p>
          </div>

          {/* Społeczność */}
          <div>
            <h3 className="font-semibold text-night-200 mb-3">Społeczność</h3>
            <ul className="space-y-2 text-sm text-night-400">
              <li><Link href="/forum" className="hover:text-night-200 transition-colors">Forum</Link></li>
              <li><Link href="/gallery" className="hover:text-night-200 transition-colors">Galeria</Link></li>
              <li><Link href="/map" className="hover:text-night-200 transition-colors">Mapa spotów</Link></li>
              <li><Link href="/forum?category=beginner" className="hover:text-night-200 transition-colors">Początkujący</Link></li>
              <li><Link href="/forum?category=equipment" className="hover:text-night-200 transition-colors">Sprzęt</Link></li>
              <li><Link href="/saved" className="hover:text-night-200 transition-colors">Zapisane</Link></li>
            </ul>
          </div>

          {/* Wiedza */}
          <div>
            <h3 className="font-semibold text-night-200 mb-3">Wiedza</h3>
            <ul className="space-y-2 text-sm text-night-400">
              <li><Link href="/news" className="hover:text-night-200 transition-colors">Newsy</Link></li>
              <li><Link href="/science" className="hover:text-night-200 transition-colors">Nauka</Link></li>
              <li><Link href="/forum?category=software" className="hover:text-night-200 transition-colors">Oprogramowanie</Link></li>
              <li><Link href="/forum?category=observation" className="hover:text-night-200 transition-colors">Obserwacje</Link></li>
            </ul>
          </div>

          {/* Informacje */}
          <div>
            <h3 className="font-semibold text-night-200 mb-3">Informacje</h3>
            <ul className="space-y-2 text-sm text-night-400">
              <li><Link href="/about" className="hover:text-night-200 transition-colors">O nas</Link></li>
              <li><Link href="/rules" className="hover:text-night-200 transition-colors">Regulamin</Link></li>
              <li><Link href="/contact" className="hover:text-night-200 transition-colors">Kontakt</Link></li>
              <li><Link href="/privacy" className="hover:text-night-200 transition-colors">Prywatność</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-night-800 text-center text-sm text-night-500">
          © {new Date().getFullYear()} Astrofor. Stworzone z ❤️ dla miłośników kosmosu.
        </div>
      </div>
    </footer>
  );
}
