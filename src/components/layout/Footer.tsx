import Link from "next/link";
import { FaFacebookF, FaInstagram, FaDiscord, FaXTwitter } from "react-icons/fa6";

const socialLinks = [
  {
    href: "https://facebook.com/",
    label: "Facebook",
    icon: FaFacebookF,
    hoverColor: "hover:text-blue-400 hover:bg-blue-500/10",
  },
  {
    href: "https://instagram.com/",
    label: "Instagram",
    icon: FaInstagram,
    hoverColor: "hover:text-pink-400 hover:bg-pink-500/10",
  },
  {
    href: "https://discord.gg/",
    label: "Discord",
    icon: FaDiscord,
    hoverColor: "hover:text-indigo-400 hover:bg-indigo-500/10",
  },
  {
    href: "https://x.com/",
    label: "X (Twitter)",
    icon: FaXTwitter,
    hoverColor: "hover:text-night-100 hover:bg-night-700/50",
  },
];

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

        <div className="mt-8 pt-6 border-t border-night-800">
          {/* Social Media */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <h3 className="text-sm font-semibold text-night-300">Znajdź nas w mediach społecznościowych</h3>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2.5 rounded-xl border border-night-700 bg-night-900/50 text-night-400 transition-all duration-200 ${social.hoverColor}`}
                  title={social.label}
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-sm text-night-500">
            © {new Date().getFullYear()} Astrofor. Stworzone z ❤️ dla miłośników kosmosu.
          </div>
        </div>
      </div>
    </footer>
  );
}
