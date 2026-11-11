# 🎬 PlayPulse - Gelişmiş IPTV & Sinema Web Oynatıcı

**PlayPulse**, Next.js (App Router), Tailwind CSS ve HLS.js teknolojileriyle geliştirilmiş, Netflix ve Exxen standartlarında kullanıcı deneyimi sunan tam teşekküllü ve PWA (Progressive Web App) destekli bir IPTV oynatıcısıdır.

---

## 🌟 Öne Çıkan Özellikler

### 1. 🔐 Giriş (Login) & Çoklu Kullanıcı Mimarisi
- **Xtream Codes API Entegrasyonu:** `Server URL`, `Kullanıcı Adı` ve `Şifre` ile doğrudan Xtream Codes sunucusuna (`/player_api.php`) bağlanır.
- **Dahili CORS Proxy (`/api/proxy`):** Tarayıcıların harici HTTP IPTV sunucularına uyguladığı CORS ve Mixed-Content kısıtlamalarını şeffaf bir şekilde aşar.
- **Demo Modu:** Aktif bir IPTV aboneliğiniz olmasa bile tek tıkla (`Demo Modu ile Dene`) uygulamayı test edebilirsiniz.
- **Güvenli Oturum:** Kullanıcı bilgileri ve abonelik bitiş tarihi `localStorage` üzerinde saklanır.

### 2. 📺 Canlı TV, Filmler (VOD) ve Diziler (Series)
- **Modüler Sekme Sistemi:** Ana Sayfa, Canlı TV, Filmler, Diziler ve Favorilerim arasında akıcı geçiş.
- **Canlı TV:** Logolu kanal ızgarası, anlık arama, kategori filtreleri ve HLS.js canlı akış motoru.
- **Filmler:** Yüksek çözünürlüklü afişler, IMDB puanları, detay modalları (yönetmen, oyuncular, özet).
- **Diziler:** Sezon ve bölüm seçicisi (`get_series_info`), bölüm süreleri, bölümlerin anlık izlenme durumu.

### 3. ⏱️ Netflix Tarzı İzleme Deneyimi & Kaldığın Yerden Devam Et
- **İzlemeye Devam Et (Continue Watching):** Filmlerde ve dizi bölümlerinde kalınan saniye (`currentTime`) otomatik kaydedilir. Ana sayfadaki yatay şeritten tek tıkla kaldığınız yerden devam edebilirsiniz.
- **Netflix Tarzı Sonraki Bölüm Geri Sayımı:** Bir dizi bölümünün bitmesine 15 saniye kala ekranın sağ altında geri sayım yapan şık bir modal belirir. Süre bittiğinde veya "Hemen İzle" tıklandığında otomatik olarak sonraki bölüme geçer.
- **İzlendi Rozetleri (Watched Badges):** %90'ı tamamlanan bölümler otomatik olarak yeşil tik rozeti alır; ayrıca kullanıcı bölümleri manuel olarak "İzlendi / İzlenmedi" yapabilir.

### 4. ❤️ Kapsamlı Favorilerim Sistemi
- Tüm kanal, film ve dizilerde bulunan kalp butonuyla anında favorilere ekleme.
- **Tür Filtreleme:** Tümü, Canlı TV, Filmler ve Diziler sekmeleri.
- **Gelişmiş Sıralama:** *En Son Eklenenler*, *A-Z*, *Z-A* ve *IMDB Puanı (Yüksekten Düşüğe)* sıralama seçenekleri.

### 5. 📱 PWA & Mobil Standalone Deneyimi
- Masaüstü ve mobilde (iOS & Android) "Ana Ekrana Ekle" desteği ile adres çubuğu olmadan tam ekran uygulama deneyimi.
- Modern koyu tema (Zinc black + Crimson Red vurgular), cam efekti (glassmorphism) ve mobil alt gezinme çubuğu (Bottom Navigation).

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18.x veya daha yeni bir sürüm
- npm, pnpm veya yarn

### Adımlar

1. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```

2. **Geliştirme Sunucusunu Başlatın:**
   ```bash
   npm run dev
   ```
   Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

3. **Üretim (Production) Derlemesi:**
   ```bash
   npm run build
   npm start
   ```

---

## 📂 Proje Dizin Yapısı

```
PlayPulse/
├── public/
│   ├── manifest.json            # PWA Web Uygulaması Manifest Dosyası
│   ├── sw.js                    # Service Worker Caching & Offline Desteği
│   └── icons/                   # PWA İkonları (192x192, 512x512)
├── src/
│   ├── app/
│   │   ├── api/proxy/route.ts   # Xtream Codes CORS/Mixed-Content Proxy
│   │   ├── globals.css          # Tailwind, scrollbar ve cam efektleri
│   │   ├── layout.tsx           # Kök Layout, Meta etiketleri & PWA kaydı
│   │   └── page.tsx             # Ana Uygulama & Sekme Yönlendiricisi
│   ├── components/
│   │   ├── auth/                # Giriş formu & Demo butonu
│   │   ├── continue-watching/   # İzlemeye Devam Et slider şeridi
│   │   ├── favorites/           # Sıralama ve filtrelemeli Favoriler sayfası
│   │   ├── home/                # Ana sayfa ve öne çıkan içerikler
│   │   ├── layout/              # Navbar, Mobile BottomNav, HeroBanner
│   │   ├── live/                # Canlı TV kanal ızgarası & kategori filtreleri
│   │   ├── player/              # HLS.js Oynatıcı & Netflix Sonraki Bölüm Modalı
│   │   ├── ui/                  # Global Arama Modalı
│   │   └── vod/                 # Film & Dizi ızgaraları ve detay modalları
│   ├── context/
│   │   └── AppContext.tsx       # Global Durum (Auth, Progress, Favorites)
│   ├── lib/
│   │   ├── mockData.ts          # Zengin test & demo verisi
│   │   ├── storage.ts           # Type-safe LocalStorage servisi
│   │   ├── utils.ts             # Yardımcı formatlama fonksiyonları
│   │   └── xtream.ts            # Xtream Codes API istemcisi
│   └── types/
│       └── iptv.ts              # Kapsamlı TypeScript model tanımları
├── tailwind.config.ts           # Özel Netflix/Exxen renk paleti
└── tsconfig.json                # TypeScript yapılandırması
```

---

## 🛠️ Teknolojiler
- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Streaming:** [HLS.js](https://github.com/video-dev/hls.js/)
- **İkonlar:** [Lucide React](https://lucide.dev/)
- **PWA:** Web App Manifest + Service Worker API
