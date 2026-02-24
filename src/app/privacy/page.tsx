export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-night-100 mb-6">🔒 Polityka Prywatności</h1>

      <div className="glass-card p-6 md:p-8 space-y-8">
        <p className="text-night-400 text-sm">
          Ostatnia aktualizacja: 1 stycznia 2026
        </p>

        {[
          {
            title: "1. Administrator danych",
            content:
              "Administratorem danych osobowych jest Astrostr — społeczność astronomiczna dostępna pod adresem astrostr.pl. W sprawach ochrony danych kontakt: prywatnosc@astrostr.pl",
          },
          {
            title: "2. Jakie dane zbieramy?",
            content:
              "Zbieramy dane niezbędne do świadczenia usług: adres e-mail, nazwę użytkownika, zdjęcia i treści publikowane na platformie, dane o aktywności (polubienia, komentarze, osiągnięcia) oraz pliki cookies niezbędne do działania serwisu.",
          },
          {
            title: "3. Cel przetwarzania danych",
            content:
              "Dane przetwarzamy w celu: świadczenia usług platformy, personalizacji treści, obsługi systemu grywalizacji i osiągnięć, komunikacji z użytkownikiem oraz zapewnienia bezpieczeństwa serwisu.",
          },
          {
            title: "4. Podstawa prawna",
            content:
              "Dane przetwarzamy na podstawie: zgody użytkownika (art. 6 ust. 1 lit. a RODO), wykonania umowy/regulaminu (art. 6 ust. 1 lit. b RODO) oraz prawnie uzasadnionego interesu (art. 6 ust. 1 lit. f RODO).",
          },
          {
            title: "5. Prawa użytkownika",
            content:
              "Masz prawo do: dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych, sprzeciwu wobec przetwarzania oraz cofnięcia zgody w dowolnym momencie.",
          },
          {
            title: "6. Okres przechowywania",
            content:
              "Dane przechowujemy przez czas korzystania z serwisu. Po usunięciu konta dane są usuwane w ciągu 30 dni, z wyjątkiem danych wymaganych przepisami prawa.",
          },
          {
            title: "7. Pliki cookies",
            content:
              "Używamy plików cookies niezbędnych do działania serwisu (sesja, preferencje) oraz analitycznych (anonimowe statystyki). Możesz zarządzać cookies w ustawieniach przeglądarki.",
          },
          {
            title: "8. Bezpieczeństwo",
            content:
              "Stosujemy odpowiednie środki techniczne i organizacyjne w celu ochrony danych: szyfrowanie SSL/TLS, hashowanie haseł, regularne kopie zapasowe i ograniczony dostęp do danych.",
          },
        ].map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-bold text-night-100 mb-2">{section.title}</h2>
            <p className="text-sm text-night-300 leading-relaxed">{section.content}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
