# Sistem Partikel Berbasis Gestur Tangan

Sistem partikel 3D yang memukau dan interaktif, dikendalikan langsung oleh gerakan tangan Anda. Dibangun menggunakan **Three.js** dan **MediaPipe**, aplikasi web eksperimental ini menjembatani celah antara gerakan fisik dan seni digital.

## ✨ Fitur Utama

- **🖐️ Pelacakan Tangan Real-time**: Gunakan webcam Anda untuk berinteraksi dengan 15.000+ partikel secara instan.
- **🌀 Morfosis Dinamis**: Transisi mulus di antara berbagai bentuk kompleks:
  - Sphere, Cube, Torus, Helix, DNA, Galaxy, Pyramid, Star, dan Love.
- **⚡ Interaksi Gestur**:
  - **Telapak Tangan Terbuka**: Partikel mengembang mengikuti bentuk target.
  - **Kepalan Tangan**: Partikel meledak ke dalam (implosive) dan menyusut ke arah tengah.
  - **Magnet Jari**: Ujung jari bertindak sebagai magnet, menarik partikel di sekitarnya.
  - **Gestur Rahasia**: Lakukan gerakan "pinch" atau "finger heart" untuk memicu bentuk **Love** secara otomatis.
- **🌈 Kustomisasi Visual**:
  - Pilih warna kustom melalui panel UI.
  - **Mode Magic Color**: Animasi spektrum warna pelangi yang estetis.
- **🎨 UI Modern**: Kontrol dengan desain glassmorphism yang elegan dan dukungan layar penuh (full-screen).

## 🚀 Cara Penggunaan

1. **Buka Aplikasi**: Jalankan `index.html` di browser modern pilihan Anda.
2. **Aktifkan Kamera**: Klik tombol "Start Experience" dan berikan izin akses webcam.
3. **Kontrol**:
   - Gerakkan tangan Anda untuk menggerakkan seluruh sistem partikel.
   - Kepalkan tangan untuk melihat partikel menyusut ke tengah.
   - Klik tombol bentuk di UI untuk mengubah wujud partikel.
   - Gunakan tombol "Magic Color" untuk efek warna-warni yang dinamis.

## 🛠️ Teknologi yang Digunakan

- **Core**: HTML5, CSS3, JavaScript (Vanilla)
- **3D Engine**: [Three.js](https://threejs.org/)
- **Machine Learning**: [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html)
- **Matematika**: Generasi bentuk prosedural dan animasi berbasis LERP untuk pergerakan yang mulus.

## 📁 Struktur File

- `index.html`: Titik masuk utama dan tata letak antarmuka (UI).
- `style.css`: Gaya modern dan layout panel kontrol.
- `script.js`: Inti dari sistem yang mencakup:
    - Pengaturan Scene Three.js
    - Fisika Partikel & Logika Morfosis
    - Implementasi Pelacakan Tangan MediaPipe
    - Penanganan Event UI

## 🛡️ Catatan Privasi

Aplikasi ini memproses umpan webcam Anda secara lokal di dalam browser menggunakan MediaPipe. **Tidak ada data video yang dikirim ke server mana pun.**

---

*Dibuat dengan ❤️ untuk eksperimen web interaktif.*
