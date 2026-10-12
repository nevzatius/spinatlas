# SpinAtlas

Çarkı çevir, rastgele bir **Erasmus+ program ülkesi** ve o ülkeden rastgele bir **şehir** keşfet. Şehir hakkında Vikipedi'den kısa bilgi ve etkileşimli harita gösterilir. Hesap, sunucu veya veritabanı gerekmez; tamamen statik bir web uygulamasıdır.

## Özellikler
- İki aşamalı Canvas çark: ülke → o ülkenin şehirleri (33 ülke, ülke başına en fazla 40 şehir)
- Koyu tema, mobil uyumlu, `prefers-reduced-motion` desteği
- Bilgi kartı: bayrak, şehir, Vikipedi özeti (TR, yoksa EN), fotoğraf, koordinat, nüfus. Güvenilir kaynak bulunamazsa metin **uydurulmaz**, yalnızca doğrulanmış veriler gösterilir
- Leaflet + OpenStreetMap haritası: ülkeye, ardından şehre otomatik yakınlaşma

## Geliştirme
```bash
npm install
npm run dev      # geliştirme sunucusu
npm test         # birim testleri
npm run build    # dist/ üretir
```

## Nasıl çalışır
- **Rastgelelik:** Kazanan, tam listeden `crypto.getRandomValues` ile (modulo bias'sız) seçilir. Çark yalnızca en fazla 12 dilim gösterir (kazanan + rastgele diğerleri), yani ekrandaki dilim sayısı seçimin adilliğini etkilemez.
- **Veri:** `src/data/countries.json` (elle) ve `src/data/cities.json` (üretilmiş). Yeniden üretmek için `npm run data` — GeoNames `cities5000` dosyasını indirir, Wikidata'dan Türkçe ad ve Vikipedi başlıklarını ekler. Ülke listesi Erasmus+ program ülkeleridir (AB-27 + Türkiye, Norveç, İzlanda, Lihtenştayn, Kuzey Makedonya, Sırbistan).
- **Şehir bilgisi:** Çalışma zamanında Vikipedi REST API (anahtarsız). Sayfa belirsizleştirme sayfası değilse ve koordinatı şehre ≤ 50 km yakınsa kullanılır.

## GitHub Pages
`main` dalına push edildiğinde `.github/workflows/deploy.yml` testleri çalıştırıp siteyi yayınlar. Repo ayarlarında **Settings → Pages → Source: GitHub Actions** seçilmelidir. `vite.config.ts` içinde `base: './'` olduğu için alt yolda da çalışır.

## Atıflar
- Şehir verisi: [GeoNames](https://www.geonames.org/) — CC BY 4.0
- Açıklamalar ve görseller: [Vikipedi](https://www.wikipedia.org/) — CC BY-SA (kartta kaynak bağlantısı verilir; fotoğrafların kendi lisansları ilgili Vikipedi/Commons sayfasındadır)
- Harita: © [OpenStreetMap](https://www.openstreetmap.org/copyright) katkıda bulunanlar, [Leaflet](https://leafletjs.com/)
- Bayraklar: [flag-icons](https://github.com/lipis/flag-icons) — MIT

Lisans: MIT
