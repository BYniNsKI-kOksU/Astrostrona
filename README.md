# Astrostr 🔭

Strona poświęcona astronomii — forum, galeria, dane zdjęć, grywalizacja i więcej.

## Stack technologiczny

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (kosmiczny motyw)
- **React Icons**

## Struktura projektu

```
src/
├── app/                    # Routing (Next.js App Router)
│   ├── layout.tsx          # Główny layout
│   ├── page.tsx            # Strona główna
│   ├── forum/              # Forum — posty, dyskusje
│   ├── gallery/            # Galeria zdjęć z danymi
│   ├── news/               # Newsy astronomiczne
│   ├── science/            # Część naukowa
│   └── profile/            # Profil użytkownika
├── components/
│   ├── layout/             # Navbar, Footer, Sidebar
│   ├── forum/              # Komponenty forum
│   ├── gallery/            # Komponenty galerii
│   ├── post/               # Karta posta, komentarze, lajki
│   ├── ui/                 # Ogólne UI (Button, Modal, Badge)
│   └── shared/             # Współdzielone (Avatar, Tags)
├── lib/                    # Helpery, konfiguracja
├── types/                  # Typy TypeScript
├── data/                   # Mock dane (na razie)
└── styles/                 # Globalne style
```

## Uruchomienie

```bash
npm install
npm run dev
```

Aplikacja dostępna na `http://localhost:3000`
