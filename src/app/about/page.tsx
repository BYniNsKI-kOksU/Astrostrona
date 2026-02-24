import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-night-100 mb-6">🔭 O nas</h1>

      <div className="glass-card p-6 md:p-8 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-night-100 mb-3">Czym jest Astrofor?</h2>
          <p className="text-night-300 leading-relaxed">
            Astrofor to polska społeczność astronomiczna stworzona przez pasjonatów kosmosu, dla pasjonatów kosmosu.
            Łączymy forum dyskusyjne, galerię zdjęć z pełnymi danymi technicznymi (jak Astrobin),
            system grywalizacji oraz sekcję naukową — wszystko w jednym miejscu.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-night-100 mb-3">Nasza misja</h2>
          <p className="text-night-300 leading-relaxed">
            Chcemy stworzyć przyjazne miejsce, gdzie zarówno początkujący obserwatorzy, jak i doświadczeni
            astrofotografowie mogą dzielić się wiedzą, zdjęciami i pasją. Wierzymy, że astronomia
            łączy ludzi — bo niebo jest wspólne dla nas wszystkich.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-night-100 mb-3">Co oferujemy?</h2>
          <ul className="space-y-3">
            {[
              { icon: "💬", title: "Forum", desc: "Dyskusje o sprzęcie, technikach, obserwacjach i oprogramowaniu." },
              { icon: "📷", title: "Galeria", desc: "Zdjęcia z pełnymi danymi akwizycji — jak profesjonalny Astrobin." },
              { icon: "🏆", title: "Grywalizacja", desc: "Osiągnięcia, tytuły astronomiczne i system punktowy." },
              { icon: "🔬", title: "Nauka", desc: "Artykuły naukowe, raporty obserwacyjne i edukacja." },
              { icon: "📰", title: "Newsy", desc: "Najnowsze odkrycia i wydarzenia astronomiczne." },
            ].map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="font-semibold text-night-200">{item.title}</p>
                  <p className="text-sm text-night-400">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-night-100 mb-3">Zespół</h2>
          <p className="text-night-300 leading-relaxed">
            Astrofor jest projektem społecznościowym tworzonym z pasji. Jeśli chcesz dołączyć do zespołu
            lub pomóc w rozwoju platformy —{" "}
            <Link href="/contact" className="text-cosmos-400 hover:text-cosmos-300 transition-colors">
              skontaktuj się z nami
            </Link>
            !
          </p>
        </section>
      </div>
    </div>
  );
}
