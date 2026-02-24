import Link from "next/link";
import { mockPosts, mockImages } from "@/data";
import { PostCard } from "@/components/post";
import { ImageCard } from "@/components/gallery";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlinePhoto,
  HiOutlineNewspaper,
  HiOutlineBeaker,
  HiOutlineArrowRight,
} from "react-icons/hi2";

const features = [
  {
    icon: HiOutlineChatBubbleLeftRight,
    title: "Forum",
    desc: "Dyskutuj o sprzęcie, programach i technikach astrofotografii.",
    href: "/forum",
    color: "from-cosmos-500 to-cosmos-700",
  },
  {
    icon: HiOutlinePhoto,
    title: "Galeria",
    desc: "Przeglądaj zdjęcia z pełnymi danymi technicznymi jak na Astrobin.",
    href: "/gallery",
    color: "from-nebula-500 to-nebula-700",
  },
  {
    icon: HiOutlineNewspaper,
    title: "Newsy",
    desc: "Bądź na bieżąco z najnowszymi odkryciami i wydarzeniami.",
    href: "/news",
    color: "from-amber-500 to-amber-700",
  },
  {
    icon: HiOutlineBeaker,
    title: "Nauka",
    desc: "Artykuły naukowe, obserwacje i prace amatorskie.",
    href: "/science",
    color: "from-cyan-500 to-cyan-700",
  },
];

export default function HomePage() {
  const latestPosts = mockPosts.slice(0, 3);
  const latestImages = mockImages.slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Hero */}
      <section className="text-center py-16 md:py-24">
        <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-cosmos-300 via-nebula-400 to-cosmos-400 bg-clip-text text-transparent">
            Odkrywaj kosmos
          </span>
          <br />
          <span className="text-night-100">razem z nami</span>
        </h1>
        <p className="text-lg md:text-xl text-night-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Społeczność astronomiczna — dziel się zdjęciami, ucz się od najlepszych,
          dyskutuj o sprzęcie i odkrywaj wszechświat.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/forum" className="btn-primary text-base px-8 py-3">
            Przeglądaj forum
          </Link>
          <Link href="/gallery" className="btn-secondary text-base px-8 py-3">
            Zobacz galerię
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="glass-card-hover p-6 group"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}
            >
              <f.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-night-100 mb-2 group-hover:text-cosmos-300 transition-colors">
              {f.title}
            </h3>
            <p className="text-sm text-night-400 leading-relaxed">{f.desc}</p>
          </Link>
        ))}
      </section>

      {/* Najnowsze posty */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-night-100">
            🔥 Najnowsze na forum
          </h2>
          <Link
            href="/forum"
            className="flex items-center gap-1.5 text-sm text-cosmos-400 hover:text-cosmos-300 transition-colors"
          >
            Wszystkie posty
            <HiOutlineArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-4">
          {latestPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* Galeria */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-night-100">
            📸 Najnowsze zdjęcia
          </h2>
          <Link
            href="/gallery"
            className="flex items-center gap-1.5 text-sm text-cosmos-400 hover:text-cosmos-300 transition-colors"
          >
            Cała galeria
            <HiOutlineArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {latestImages.map((image) => (
            <ImageCard key={image.id} image={image} />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="glass-card p-8 text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-night-100 mb-6">
          Dołącz do społeczności
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Użytkowników", value: "2,340+" },
            { label: "Zdjęć", value: "8,120+" },
            { label: "Postów", value: "15,800+" },
            { label: "Obserwacji", value: "450+" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cosmos-400 to-nebula-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-night-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
