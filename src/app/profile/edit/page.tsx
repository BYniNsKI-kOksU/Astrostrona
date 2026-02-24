"use client";

import { useState } from "react";
import Link from "next/link";
import { mockUsers } from "@/data";
import {
  HiOutlineArrowLeft,
  HiOutlineCamera,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

export default function EditProfilePage() {
  const user = mockUsers[0];

  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio);
  const [location, setLocation] = useState("Bieszczady, Polska");
  const [website, setWebsite] = useState("");
  const [telescope, setTelescope] = useState("GSO Newton 200/800");
  const [camera, setCamera] = useState("ZWO ASI2600MM Pro");
  const [mount, setMount] = useState("Sky-Watcher EQ6-R Pro");
  const [showSuccess, setShowSuccess] = useState(false);
  const [email, setEmail] = useState("marek@astrostr.pl");
  const [emailNotifs, setEmailNotifs] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      {/* Nagłówek */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/profile"
          className="btn-ghost p-2 rounded-lg"
        >
          <HiOutlineArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-night-100">
            Edytuj profil
          </h1>
          <p className="text-night-400 text-sm">
            Zmień informacje widoczne na Twoim profilu
          </p>
        </div>
      </div>

      {/* Success toast */}
      {showSuccess && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-3 rounded-xl shadow-2xl animate-in backdrop-blur-xl">
          <HiOutlineCheckCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Profil zaktualizowany!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Avatar */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-night-300 uppercase tracking-wider mb-4">
            Zdjęcie profilowe
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-cosmos-500/30 flex items-center justify-center text-cosmos-300 font-bold text-2xl">
                {displayName.charAt(0)}
              </div>
              <button
                type="button"
                className="absolute inset-0 rounded-full bg-night-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <HiOutlineCamera className="h-6 w-6 text-white" />
              </button>
            </div>
            <div>
              <button type="button" className="btn-secondary text-sm">
                Zmień zdjęcie
              </button>
              <p className="text-xs text-night-500 mt-1">
                JPG, PNG. Maks. 2 MB
              </p>
            </div>
          </div>
        </div>

        {/* Dane podstawowe */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-night-300 uppercase tracking-wider mb-4">
            Dane podstawowe
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-night-300 mb-1.5">
                  Wyświetlana nazwa
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-field"
                  placeholder="Twoja nazwa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-night-300 mb-1.5">
                  Nazwa użytkownika
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-night-500 text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field pl-8"
                    placeholder="username"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-night-300 mb-1.5">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder="Opowiedz coś o sobie..."
                maxLength={200}
              />
              <p className="text-xs text-night-500 mt-1 text-right">
                {bio.length}/200
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-night-300 mb-1.5">
                  Lokalizacja
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input-field"
                  placeholder="np. Kraków, Polska"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-night-300 mb-1.5">
                  Strona WWW
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="input-field"
                  placeholder="https://"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sprzęt */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-night-300 uppercase tracking-wider mb-4">
            🔭 Sprzęt astronomiczny
          </h2>
          <p className="text-xs text-night-500 mb-4">
            Wyświetlany na Twoim profilu i przy zdjęciach
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-night-300 mb-1.5">
                Teleskop / Obiektyw
              </label>
              <input
                type="text"
                value={telescope}
                onChange={(e) => setTelescope(e.target.value)}
                className="input-field"
                placeholder="np. GSO Newton 200/800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-night-300 mb-1.5">
                Kamera
              </label>
              <input
                type="text"
                value={camera}
                onChange={(e) => setCamera(e.target.value)}
                className="input-field"
                placeholder="np. ZWO ASI2600MM Pro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-night-300 mb-1.5">
                Montaż
              </label>
              <input
                type="text"
                value={mount}
                onChange={(e) => setMount(e.target.value)}
                className="input-field"
                placeholder="np. Sky-Watcher EQ6-R Pro"
              />
            </div>
          </div>
        </div>

        {/* Konto i e-mail */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-night-300 uppercase tracking-wider mb-4">
            ✉️ Konto
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-night-300 mb-1.5">
                Adres e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="flex items-center justify-between py-3 border-t border-night-700">
              <div>
                <p className="text-sm text-night-200">Powiadomienia e-mail</p>
                <p className="text-xs text-night-500">
                  Otrzymuj wiadomości o nowych odpowiedziach i polubieniach
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotifs(!emailNotifs)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  emailNotifs ? "bg-cosmos-500" : "bg-night-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    emailNotifs ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Przyciski */}
        <div className="flex items-center gap-4 pt-2">
          <button type="submit" className="btn-primary">
            Zapisz zmiany
          </button>
          <Link href="/profile" className="btn-ghost px-4 py-2">
            Anuluj
          </Link>
        </div>
      </form>
    </div>
  );
}
