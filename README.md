# StudyPro - Master Your Materials

Aplikasi pelacak progres belajar berbasis kategori untuk membantu Anda menguasai materi secara mendalam dengan fitur gamifikasi, tantangan mingguan, dan grafik pengetahuan.

## Cara Update / Push ke GitHub

Untuk mengunggah kode ini ke akun GitHub Anda, ikuti langkah-langkah berikut:

### 1. Buat Repositori di GitHub
1. Buka [GitHub](https://github.com/) dan login.
2. Klik tombol **New** (atau ikon `+` di pojok kanan atas lalu **New repository**).
3. Beri nama repositori Anda (misal: `studypro-app`).
4. Biarkan pengaturan lainnya default (Public, jangan centang README/License karena kita sudah punya).
5. Klik **Create repository**.
6. Salin link repositori Anda (contoh: `https://github.com/username/studypro-app.git`).

### 2. Jalankan Perintah di Terminal
Buka terminal di editor ini dan jalankan perintah berikut satu per satu:

```bash
# Inisialisasi git (jika belum ada)
git init

# Tambahkan semua file
git add .

# Buat commit pertama
git commit -m "Initial commit: StudyPro App"

# Atur branch utama ke main
git branch -M main

# Hubungkan ke GitHub (GANTI <LINK_GITHUB_ANDA> dengan link yang Anda salin tadi)
git remote add origin <LINK_GITHUB_ANDA>

# Push kode ke GitHub
git push -u origin main
```

### 3. Update Kode di Masa Depan
Jika Anda melakukan perubahan lagi dan ingin mengirimnya ke GitHub kembali:

```bash
git add .
git commit -m "Deskripsi perubahan Anda"
git push
```

## Fitur Utama
- **Knowledge Graph**: Visualisasi kurikulum materi secara hierarkis.
- **XP & Level System**: Dapatkan XP dari setiap aktivitas belajar.
- **Global Leaderboard**: Bersaing dengan 200+ scholar (simulasi bot cerdas).
- **Weekly Challenges**: Ikuti sprint belajar mingguan.
- **Future Self Projection**: Lihat akumulasi hasil belajar Anda di masa depan.
- **World Activity Feed**: Lihat aktivitas belajar dari seluruh dunia secara real-time.

## Teknologi
- **Next.js 15** (App Router)
- **Firebase** (Auth & Firestore)
- **ShadCN UI** & **Tailwind CSS**
- **Genkit** (AI Integration)
