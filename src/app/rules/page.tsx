export default function RulesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-night-100 mb-6">📜 Regulamin</h1>

      <div className="glass-card p-6 md:p-8 space-y-8">
        <p className="text-night-400 text-sm">
          Ostatnia aktualizacja: 1 stycznia 2026
        </p>

        {[
          {
            title: "1. Zasady ogólne",
            items: [
              "Astrofor to platforma dla miłośników astronomii. Każdy użytkownik zobowiązuje się do przestrzegania zasad kultury i wzajemnego szacunku.",
              "Rejestracja jest bezpłatna. Konto jest osobiste i nie może być udostępniane innym osobom.",
              "Administracja zastrzega sobie prawo do usuwania kont naruszających regulamin.",
            ],
          },
          {
            title: "2. Treści na forum",
            items: [
              "Posty i komentarze muszą być związane z tematyką astronomiczną lub społecznością.",
              "Zabronione są treści obraźliwe, wulgarne, rasistowskie lub promujące nienawiść.",
              "Spam, reklamy i treści niezwiązane z tematem będą usuwane.",
              "Publikowane zdjęcia muszą być własnością autora lub mieć stosowne pozwolenie.",
            ],
          },
          {
            title: "3. Galeria zdjęć",
            items: [
              "Zdjęcia powinny zawierać prawdziwe dane techniczne (sprzęt, ekspozycja, lokalizacja).",
              "Zabrania się publikowania cudzych zdjęć jako swoich.",
              "Zdjęcia generowane przez AI powinny być odpowiednio oznaczone.",
              "Administracja może usunąć zdjęcia niespełniające standardów jakości lub opisów.",
            ],
          },
          {
            title: "4. System grywalizacji",
            items: [
              "Punkty i osiągnięcia przyznawane są automatycznie na podstawie aktywności.",
              "Manipulowanie systemem (fake konta, spam polubień) skutkuje banem.",
              "Tytuły astronomiczne przyznawane są na podstawie zdobytych punktów.",
              "Administracja zastrzega prawo do modyfikacji systemu punktowego.",
            ],
          },
          {
            title: "5. Prywatność i dane",
            items: [
              "Dane osobowe przetwarzane są zgodnie z RODO i Polityką Prywatności.",
              "Nie udostępniamy danych osobowych osobom trzecim bez zgody użytkownika.",
              "Użytkownik może w dowolnym momencie usunąć swoje konto i dane.",
            ],
          },
          {
            title: "6. Odpowiedzialność",
            items: [
              "Astrofor nie ponosi odpowiedzialności za treści publikowane przez użytkowników.",
              "Administracja dokłada starań, aby platforma działała stabilnie, ale nie gwarantuje 100% dostępności.",
              "W przypadku naruszenia regulaminu prosimy o kontakt: kontakt@astrofor.pl",
            ],
          },
        ].map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-bold text-night-100 mb-3">{section.title}</h2>
            <ul className="space-y-2">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-night-300 leading-relaxed">
                  <span className="text-cosmos-400 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
