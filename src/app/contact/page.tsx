"use client";

import { useState } from "react";
import { HiOutlineEnvelope, HiOutlineMapPin, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-night-100 mb-6">📬 Kontakt</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { icon: HiOutlineEnvelope, title: "E-mail", desc: "kontakt@astrostr.pl", sub: "Odpowiadamy w ciągu 24h" },
          { icon: HiOutlineChatBubbleLeftRight, title: "Forum", desc: "Sekcja Pomoc", sub: "Zadaj pytanie społeczności" },
          { icon: HiOutlineMapPin, title: "Lokalizacja", desc: "Polska 🇵🇱", sub: "Projekt zdalny" },
        ].map((item) => (
          <div key={item.title} className="glass-card p-5 text-center">
            <item.icon className="h-8 w-8 text-cosmos-400 mx-auto mb-3" />
            <h3 className="font-semibold text-night-100 mb-1">{item.title}</h3>
            <p className="text-sm text-night-300">{item.desc}</p>
            <p className="text-xs text-night-500 mt-1">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-6 md:p-8">
        <h2 className="text-xl font-bold text-night-100 mb-4">Napisz do nas</h2>

        {submitted ? (
          <div className="text-center py-12">
            <span className="text-5xl mb-4 block">✅</span>
            <h3 className="text-xl font-bold text-night-100 mb-2">Wiadomość wysłana!</h3>
            <p className="text-night-400">Dziękujemy za kontakt. Odpowiemy najszybciej jak to możliwe.</p>
            <button
              onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", subject: "", message: "" }); }}
              className="btn-secondary mt-4"
            >
              Wyślij kolejną
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-night-300 mb-1">Imię / Nick</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Twoje imię"
                />
              </div>
              <div>
                <label className="block text-sm text-night-300 mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="twoj@email.pl"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-night-300 mb-1">Temat</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Wybierz temat...</option>
                <option value="general">Pytanie ogólne</option>
                <option value="bug">Zgłoszenie błędu</option>
                <option value="feature">Propozycja funkcji</option>
                <option value="moderation">Moderacja</option>
                <option value="cooperation">Współpraca</option>
                <option value="other">Inne</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-night-300 mb-1">Wiadomość</label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="input-field min-h-[150px] resize-y"
                placeholder="Opisz, w czym możemy pomóc..."
              />
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn-primary">
                Wyślij wiadomość
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
