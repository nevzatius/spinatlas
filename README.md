# 🎡 SpinAtlas

**Çarkı çevir, rastgele bir Erasmus+ ülkesi ve o ülkeden bir şehir keşfet.**

### 👉 [Canlı demo: nevzatius.github.io/spinatlas](https://nevzatius.github.io/spinatlas/)

![SpinAtlas masaüstü görünümü](docs/screenshot-desktop.png)

Hesap, sunucu veya veritabanı gerekmez; tarayıcıda çalışan, tamamen statik bir web uygulamasıdır.

## Nasıl kullanılır?

1. **Ülke çarkını çevir.** "Çarkı Çevir" butonuna bas; çark döner ve 33 Erasmus+ program ülkesinden biri rastgele seçilir. Harita seçilen ülkeye yakınlaşır.
2. **Şehir çarkını çevir.** Ülke seçilince ikinci çark açılır. Yalnızca o ülkenin şehirlerini içerir.
3. **Şehri keşfet.** Şehir seçilince harita şehre yakınlaşır ve işaretçi koyar. Bilgi kartında bayrak, şehir adı, Vikipedi'den kısa açıklama, fotoğraf, koordinat ve nüfus görünür.
4. **Tekrar dene.** "Yeniden Çevir" yeni bir ülke, "Başka Şehir" aynı ülkeden yeni bir şehir seçer. "Baştan başla" her şeyi sıfırlar.

Harita yakınlaştırılabilir, uzaklaştırılabilir ve sürüklenebilir. Arayüz koyu temalıdır ve mobilde de çalışır.

| Mobil |
| --- |
| <img src="docs/screenshot-mobile.png" alt="SpinAtlas mobil görünümü" width="280"> |

## Kapsanan ülkeler

AB üyesi 27 ülke ile Türkiye, Norveç, İzlanda, Lihtenştayn, Kuzey Makedonya ve Sırbistan (Erasmus+ program ülkeleri). Her ülke için nüfusa göre en büyük en fazla 40 şehir çarkta yer alır.

## Nasıl çalışır?

- **Adil rastgelelik:** Kazanan, ülkenin tüm şehir listesinden `crypto.getRandomValues` ile seçilir. Çark okunabilirlik için en fazla 12 dilim gösterir (kazanan + rastgele diğerleri); ekrandaki dilim sayısı seçimin adilliğini etkilemez.
- **Doğru bilgi:** Şehir açıklaması Türkçe Vikipedi'den (yoksa İngilizce) gelir. Sayfa belirsizleştirme sayfası değilse ve koordinatı şehre ≤ 50 km yakınsa kullanılır. Güvenilir kaynak bulunamazsa metin uydurulmaz; yalnızca doğrulanmış konum ve nüfus gösterilir.
- **Veri:** Şehirler ve koordinatlar [GeoNames](https://www.geonames.org/)'ten, Türkçe adlar ve Vikipedi başlıkları Wikidata'dan alınır ve `src/data/cities.json` dosyasına yazılır. Çalışma zamanında yalnızca Vikipedi (özet, fotoğraf) ve harita karoları için ağ isteği yapılır.
- **Teknoloji:** Vite + TypeScript (framework yok), Canvas çarklar, Leaflet + OpenStreetMap. Tek çalışma zamanı bağımlılığı Leaflet'tir.

## Geliştirme

```bash
npm install
npm run dev      # geliştirme sunucusu
npm test         # birim testleri
npm run build    # dist/ üretir
npm run data     # şehir verisini yeniden üretir (GeoNames + Wikidata)
```

## GitHub Pages ile yayınlama

`main` dalına push edildiğinde `.github/workflows/deploy.yml` testleri çalıştırıp siteyi yayınlar. Fork'larda **Settings → Pages → Source: GitHub Actions** seçilmelidir. `vite.config.ts` içinde `base: './'` olduğu için sitenin herhangi bir alt yolunda çalışır.

## Atıflar

- Şehir verisi: [GeoNames](https://www.geonames.org/), CC BY 4.0
- Açıklamalar ve görseller: [Vikipedi](https://www.wikipedia.org/), CC BY-SA (kartta kaynak bağlantısı verilir; fotoğrafların kendi lisansları ilgili Vikipedi/Commons sayfasındadır)
- Harita: © [OpenStreetMap](https://www.openstreetmap.org/copyright) katkıda bulunanlar, [Leaflet](https://leafletjs.com/)
- Bayraklar: [flag-icons](https://github.com/lipis/flag-icons), MIT

## Lisans

[MIT](LICENSE)
