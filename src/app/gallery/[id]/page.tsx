import Link from "next/link";
import { mockImages } from "@/data";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import { getMoonPhaseIcon, getObjectTypeLabel, formatNumber } from "@/lib/utils";
import { BORTLE_SCALE_LABELS } from "@/lib/constants";

export default function ImageDetailPage({ params }: { params: { id: string } }) {
  const image = mockImages.find((img) => img.id === params.id);

  if (!image) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <span className="text-5xl mb-4 block">🌑</span>
        <h1 className="text-2xl font-bold text-night-100 mb-2">Zdjęcie nie znalezione</h1>
        <Link href="/gallery" className="btn-primary mt-4 inline-block">Wróć do galerii</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <Link
        href="/gallery"
        className="inline-flex items-center gap-2 text-sm text-night-400 hover:text-night-200 transition-colors mb-6"
      >
        <HiOutlineArrowLeft className="h-4 w-4" />
        Wróć do galerii
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Zdjęcie */}
        <div className="lg:col-span-2">
          <div className="glass-card overflow-hidden">
            <div className="aspect-[4/3] bg-night-800 flex items-center justify-center text-night-600">
              <span className="text-8xl">🌌</span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-night-100 mt-6 mb-2">
            {image.title}
          </h1>
          <p className="text-night-400 leading-relaxed">{image.description}</p>
        </div>

        {/* Panel danych */}
        <div className="space-y-4">
          {/* Autor */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cosmos-500/30 flex items-center justify-center text-cosmos-300 font-bold">
                {image.authorName.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-night-200">{image.authorName}</div>
                <div className="text-xs text-night-500">{image.date}</div>
              </div>
            </div>
          </div>

          {/* Dane obiektu */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-night-300 uppercase tracking-wider mb-3">
              Obiekt
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-night-500">Nazwa</dt>
                <dd className="text-night-200">{image.objectName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-night-500">Typ</dt>
                <dd className="text-night-200">{getObjectTypeLabel(image.objectType)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-night-500">Konstelacja</dt>
                <dd className="text-night-200">{image.constellation}</dd>
              </div>
            </dl>
          </div>

          {/* Warunki */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-night-300 uppercase tracking-wider mb-3">
              Warunki
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-night-500">Lokalizacja</dt>
                <dd className="text-night-200">{image.location}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-night-500">Półkula</dt>
                <dd className="text-night-200">{image.hemisphere === "north" ? "Północna" : "Południowa"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-night-500">Faza księżyca</dt>
                <dd className="text-night-200">{getMoonPhaseIcon(image.moonPhase)} {image.moonPhase}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-night-500">Skala Bortle&apos;a</dt>
                <dd className="text-night-200">{image.bortleScale} — {BORTLE_SCALE_LABELS[image.bortleScale]}</dd>
              </div>
            </dl>
          </div>

          {/* Sprzęt */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-night-300 uppercase tracking-wider mb-3">
              Sprzęt
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-night-500">Teleskop</dt>
                <dd className="text-night-200 text-right">{image.equipment.telescope}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-night-500">Kamera</dt>
                <dd className="text-night-200 text-right">{image.equipment.camera}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-night-500">Montaż</dt>
                <dd className="text-night-200 text-right">{image.equipment.mount}</dd>
              </div>
              <div>
                <dt className="text-night-500 mb-1">Filtry</dt>
                <dd className="flex flex-wrap gap-1">
                  {image.equipment.filters.map((f) => (
                    <span key={f} className="tag bg-night-800 text-night-300 border-night-700 text-xs">
                      {f}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>

          {/* Dane akwizycji */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-night-300 uppercase tracking-wider mb-3">
              Akwizycja
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-night-500">Łączna ekspozycja</dt>
                <dd className="text-night-200 font-medium">{image.acquisitionData.totalExposure}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-night-500">Gain</dt>
                <dd className="text-night-200">{image.acquisitionData.gain}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-night-500">Chłodzenie</dt>
                <dd className="text-night-200">{image.acquisitionData.coolingTemp}°C</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-night-500">Darks / Flats / Bias</dt>
                <dd className="text-night-200">{image.acquisitionData.darks} / {image.acquisitionData.flats} / {image.acquisitionData.bias}</dd>
              </div>
              {image.acquisitionData.subExposures.map((sub) => (
                <div key={sub.filter} className="flex justify-between">
                  <dt className="text-night-500">{sub.filter}</dt>
                  <dd className="text-night-200">{sub.count} × {sub.exposureTime}s</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Obraz */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-night-300 uppercase tracking-wider mb-3">
              Obraz
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-night-500">Rozdzielczość</dt>
                <dd className="text-night-200">{image.resolution.width} × {image.resolution.height}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-night-500">Skala</dt>
                <dd className="text-night-200">{image.imageScale}&quot;/px</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-night-500">Rozmiar pliku</dt>
                <dd className="text-night-200">{image.fileSize}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
