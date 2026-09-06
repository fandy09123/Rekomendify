// =====================================================
// PRIVACY POLICY CONTENT & METADATA
// Single Source of Truth - Kebijakan Privasi Rekomendify
// 
// PERPETUAL DEVELOPER GUIDE:
// Untuk memperbarui isi Kebijakan Privasi di masa depan:
// 1. Cukup edit data pada file ini (terutama lastUpdated, contact, atau sections).
// 2. Teks di halaman /privasi dan Modal Privacy akan otomatis terbarui.
// 3. Jangan mengubah logika komponen UI kecuali jika ada struktur baru.
// =====================================================

export interface PrivacySection {
  id: string;
  number: number;
  title: string;
  summary?: string;
  paragraphs: string[];
  bullets?: string[];
  subsections?: {
    subtitle: string;
    paragraphs?: string[];
    bullets?: string[];
  }[];
}

export interface PrivacyPolicyData {
  lastUpdated: string;
  appName: string;
  appUrl: string;
  privacyUrl: string;
  contact: {
    managerName: string;
    appName: string;
    website: string;
    privacyPage: string;
    email: string;
    address: string;
    deletionEmailSubject: string;
  };
  principles: string[];
  permissionsInfo: {
    key: string;
    title: string;
    icon: string;
    shortDesc: string;
    fullDesc: string;
  }[];
  sections: PrivacySection[];
}

export const PRIVACY_POLICY: PrivacyPolicyData = {
  lastUpdated: "1 September 2026",
  appName: "Rekomendify",
  appUrl: "https://www.rekomendify.com",
  privacyUrl: "https://www.rekomendify.com/privasi",

  contact: {
    managerName: "Fandy Alfian Zulvain",
    appName: "Rekomendify",
    website: "https://www.rekomendify.com",
    privacyPage: "https://www.rekomendify.com/privasi",
    email: "alfianfendi2@gmail.com",
    address: "Jl. Raya Pagerwojo, Desa Mulyosari Kecamatan Pagerwojo, Kabupaten Tulungagung, Jawa Timur 66262",
    deletionEmailSubject: "Permohonan Penghapusan Akun Admin - [Nama Desa/Wilayah]",
  },

  principles: [
    "Data seminimal mungkin: Kami hanya menggunakan informasi yang diperlukan untuk menjalankan fitur.",
    "Berdasarkan konteks: Izin kamera, lokasi, dan notifikasi digunakan saat fitur bersangkutan dipakai.",
    "Tidak menjual data pribadi: Kami tidak pernah menjual data pribadi pengguna kepada pihak mana pun.",
    "Transparansi penuh: Pengguna dapat memahami mengapa izin diperlukan dan bagaimana data diproses.",
    "Kontrol di tangan pengguna: Semua izin bersifat opsional dan dapat dicabut sewaktu-waktu melalui pengaturan perangkat.",
  ],

  permissionsInfo: [
    {
      key: "notifications",
      title: "Notifikasi",
      icon: "Bell",
      shortDesc: "Informasi pembaruan dari wilayah yang diikuti.",
      fullDesc: "Digunakan agar Anda menerima pemberitahuan mengenai informasi wilayah, pembaruan layanan, atau pengumuman lokal. Dapat dimatikan kapan saja.",
    },
    {
      key: "geolocation",
      title: "Lokasi",
      icon: "MapPin",
      shortDesc: "Pencarian tempat terdekat saat menekan 'Terdekat'.",
      fullDesc: "Posisi perangkat diproses secara lokal untuk menghitung jarak ke tempat wisata/UMKM terdekat. Koordinat tidak disimpan terus-menerus di server.",
    },
    {
      key: "camera",
      title: "Kamera",
      icon: "Camera",
      shortDesc: "Membaca QR Code pada fitur Scan QR.",
      fullDesc: "Digunakan hanya saat membuka fitur Scan QR. Pemrosesan kode QR dilakukan langsung di perangkat dan gambar tidak diunggah ke server.",
    },
    {
      key: "storage",
      title: "Penyimpanan Lokal",
      icon: "HardDrive",
      shortDesc: "Penyimpanan preferensi dan riwayat offline di perangkat.",
      fullDesc: "Menyimpan wilayah aktif, daftar favorit, riwayat notifikasi lokal (offline access), status onboarding, dan sesi admin.",
    },
    {
      key: "analytics",
      title: "Statistik Kunjungan",
      icon: "BarChart3",
      shortDesc: "Agregasi penggunaan fitur tanpa identitas pribadi.",
      fullDesc: "Mencatat halaman wilayah yang dibuka dan interaksi tombol (WA/Peta/Simpan) secara anonim untuk evaluasi kualitas informasi.",
    },
  ],

  sections: [
    {
      id: "1",
      number: 1,
      title: "TENTANG REKOMENDIFY",
      paragraphs: [
        "Rekomendify adalah platform informasi dan pemandu wisata digital berbasis wilayah yang membantu pengguna menemukan tempat wisata, UMKM, warung, fasilitas, layanan lokal, serta informasi wilayah lainnya.",
        "Untuk implementasi tertentu, Rekomendify dapat disediakan sebagai PWA (Progressive Web App) maupun aplikasi Android yang menggunakan teknologi Capacitor untuk menampilkan layanan web Rekomendify.",
        "Konten utama layanan dapat diperbarui melalui website tanpa harus selalu memperbarui aplikasi Android.",
      ],
    },
    {
      id: "2",
      number: 2,
      title: "PENGELOLA DAN KONTAK PRIVASI",
      paragraphs: [
        "Pengelola resmi dan penanggung jawab perlindungan data Rekomendify dapat dihubungi melalui identitas berikut:",
      ],
      bullets: [
        "Nama Pengelola: Fandy Alfian Zulvain",
        "Nama Aplikasi: Rekomendify",
        "Website Resmi: https://www.rekomendify.com",
        "Halaman Kebijakan Privasi: https://www.rekomendify.com/privasi",
        "Email Kontak Privasi: alfianfendi2@gmail.com",
        "Alamat Pengelola: Jl. Raya Pagerwojo, Kecamatan Pagerwojo, Kabupaten Tulungagung, Jawa Timur 66262",
      ],
    },
    {
      id: "3",
      number: 3,
      title: "PRINSIP PRIVASI KAMI",
      paragraphs: [
        "Kami berkomitmen penuh menjalankan operasional aplikasi berdasarkan prinsip-prinsip perlindungan data berikut:",
      ],
      subsections: [
        {
          subtitle: "Data seminimal mungkin",
          paragraphs: ["Kami hanya meminta atau menggunakan informasi yang diperlukan untuk menyediakan fitur atau layanan yang digunakan pengguna."],
        },
        {
          subtitle: "Berdasarkan konteks",
          paragraphs: ["Izin kamera, lokasi, dan notifikasi digunakan ketika fitur yang memerlukannya digunakan atau ketika pengguna memilih untuk mengaktifkannya."],
        },
        {
          subtitle: "Tidak menjual data pribadi",
          paragraphs: ["Kami tidak menjual data pribadi pengguna kepada pihak ketiga mana pun."],
        },
        {
          subtitle: "Tidak menggunakan data sensitif untuk tujuan yang tidak relevan",
          paragraphs: ["Data seperti lokasi, kamera, atau informasi perangkat tidak digunakan untuk tujuan di luar fungsi yang dijelaskan dalam Kebijakan Privasi ini."],
        },
        {
          subtitle: "Transparansi",
          paragraphs: ["Kami berupaya menjelaskan kepada pengguna secara sederhana mengapa suatu izin diperlukan dan bagaimana informasi digunakan."],
        },
      ],
    },
    {
      id: "4",
      number: 4,
      title: "INFORMASI YANG DAPAT KAMI PROSES",
      paragraphs: [
        "Jenis informasi yang diproses bergantung pada fitur yang digunakan. Tidak semua pengguna memberikan atau menggunakan seluruh jenis informasi.",
      ],
      subsections: [
        {
          subtitle: "4.1 Informasi Akun",
          paragraphs: [
            "Aplikasi Rekomendify bagi publik dapat diakses tanpa pendaftaran akun. Namun untuk fitur administrasi/pengelola wilayah, Rekomendify dapat memproses informasi seperti:",
          ],
          bullets: [
            "Nama dan alamat email",
            "ID akun dan peran/hak akses",
            "Wilayah yang dikelola",
            "Informasi autentikasi masuk layanan",
          ],
        },
      ],
    },
    {
      id: "5",
      number: 5,
      title: "INFORMASI LOKASI",
      paragraphs: [
        "Rekomendify dapat menggunakan lokasi perangkat untuk fitur seperti 'Terdekat', pencarian tempat di sekitar pengguna, atau fungsi lain yang secara langsung membutuhkan posisi pengguna.",
      ],
      bullets: [
        "Bagaimana lokasi digunakan: Menentukan tempat terdekat, mengurutkan hasil berdasarkan jarak, dan memberikan pemandu yang relevan.",
        "Penggunaan kontekstual: Lokasi diminta hanya ketika pengguna memilih fitur 'Terdekat'. Kami tidak meminta lokasi secara otomatis saat aplikasi dibuka.",
        "Pemrosesan di perangkat: Koordinat perangkat diproses secara lokal di browser/aplikasi untuk menghitung jarak ke lokasi.",
        "Tanpa pelacakan latar belakang: Fitur 'Terdekat' tidak memerlukan pelacakan lokasi di latar belakang (background location).",
        "Tanpa penggunaan iklan: Kami tidak menggunakan data lokasi presisi untuk tujuan iklan.",
      ],
    },
    {
      id: "6",
      number: 6,
      title: "KAMERA",
      paragraphs: [
        "Rekomendify dapat meminta akses kamera khusus untuk fitur Scan QR.",
      ],
      bullets: [
        "Tujuan: Mengambil frame dari kamera untuk membaca kode QR lokasi/UMKM.",
        "Pemrosesan QR: Pembacaan kode dilakukan langsung oleh mekanisme aplikasi di perangkat (lokal). Gambar dari kamera tidak diunggah ke server.",
        "Tanpa pengumpulan galeri: Kamera tidak digunakan untuk mengumpulkan foto pribadi pengguna.",
      ],
    },
    {
      id: "7",
      number: 7,
      title: "NOTIFIKASI",
      paragraphs: [
        "Jika pengguna mengaktifkan notifikasi, Rekomendify dapat mengirimkan pemberitahuan mengenai informasi dari wilayah yang diikuti (seperti pembaruan pengumuman atau info penting).",
        "Notifikasi bersifat opsional dan dapat dinonaktifkan kapan saja melalui pengaturan perangkat atau browser.",
        "Pemberian izin notifikasi tidak memberi akses untuk membaca pesan, SMS, kontak, atau data pribadi lain di perangkat.",
      ],
    },
    {
      id: "8",
      number: 8,
      title: "PUSH SUBSCRIPTION",
      paragraphs: [
        "Untuk Web Push, browser/perangkat memberikan informasi teknis subscription yang diperlukan Push Service untuk mengirimkan notifikasi.",
      ],
      bullets: [
        "Push endpoint & public/authentication key subscription",
        "ID subscription & hubungan dengan wilayah yang diikuti",
        "Waktu pembuatan atau pembaruan subscription",
      ],
      subsections: [
        {
          subtitle: "Penggunaan Subscription",
          paragraphs: [
            "Data ini digunakan semata-mata untuk mengidentifikasi tujuan pengiriman notifikasi web dan menangani subscription yang sudah kadaluarsa. Data subscription tidak digunakan untuk mengakses isi perangkat.",
          ],
        },
      ],
    },
    {
      id: "9",
      number: 9,
      title: "PENYIMPANAN RIWAYAT NOTIFIKASI",
      paragraphs: [
        "Rekomendify menyediakan fitur kotak masuk/riwayat notifikasi lokal.",
        "Informasi seperti judul notifikasi, isi pesan, waktu penerimaan, tautan tujuan, dan status baca disimpan di penyimpanan lokal perangkat (LocalStorage/IndexedDB) agar pengguna dapat melihat kembali pesan walau sedang offline.",
      ],
    },
    {
      id: "10",
      number: 10,
      title: "INFORMASI TEKNIS DAN PENGGUNAAN LAYANAN",
      paragraphs: [
        "Sistem dapat memproses informasi teknis yang diperlukan untuk menjalankan aplikasi, menjaga keamanan, memantau error, dan meningkatkan performa.",
      ],
      bullets: [
        "Waktu akses & halaman/fitur yang dibuka",
        "Informasi jenis browser & sistem operasi",
        "Status koneksi teknis yang diperlukan layanan",
      ],
    },
    {
      id: "11",
      number: 11,
      title: "DATA KUNJUNGAN DAN ANALITIK",
      paragraphs: [
        "Rekomendify mencatat aktivitas penggunaan secara anonim dan agregat untuk mengetahui statistik kunjungan tempat/wilayah.",
        "Data yang dicatat meliputi: halaman yang dibuka, sumber akses (QR atau tautan langsung), dan tindakan tombol (membuka WhatsApp, Google Maps, atau menyimpan tempat). Catatan ini tidak memuat nama, nomor HP, atau titik lokasi pengguna.",
      ],
    },
    {
      id: "12",
      number: 12,
      title: "DATA YANG TIDAK KAMI MINTA TANPA KEBUTUHAN",
      paragraphs: [
        "Rekomendify tidak dirancang untuk meminta akses ke:",
      ],
      bullets: [
        "Daftar kontak pribadi",
        "Isi SMS & riwayat panggilan",
        "Mikrofon (kecuali ada fitur spesifik di masa depan)",
        "File pribadi di perangkat",
        "Daftar aplikasi lain yang terpasang",
        "Data kesehatan & biometrik",
      ],
    },
    {
      id: "13",
      number: 13,
      title: "PERIZINAN PERANGKAT",
      paragraphs: [
        "Pengguna memiliki kendali penuh atas izin Notifikasi, Lokasi, dan Kamera.",
        "Menolak izin dapat menyebabkan fitur terkait tidak berjalan maksimal (misalnya Scan QR memerlukan kamera), namun layanan utama Rekomendify tetap dapat digunakan.",
      ],
    },
    {
      id: "14",
      number: 14,
      title: "PENGUNGKAPAN SEBELUM PERMINTAAN IZIN",
      paragraphs: [
        "Rekomendify memberikan penjelasan peruntukan izin sebelum meminta persetujuan pada browser atau sistem operasi Android.",
        "Penutupan dialog penjelasan tanpa memilih tindakan persetujuan tidak dianggap sebagai persetujuan izin.",
      ],
    },
    {
      id: "15",
      number: 15,
      title: "PIHAK KETIGA DAN PENYEDIA INFRASTRUKTUR",
      paragraphs: [
        "Untuk menyelenggarakan layanan, Rekomendify menggunakan penyedia infrastruktur terpercaya:",
      ],
      bullets: [
        "Supabase: Infrastruktur database & backend untuk menyimpan data aplikasi dan token push subscription.",
        "Vercel: Infrastruktur hosting dan serverless runtime web.",
        "Web Push Services: Layanan push bawaan browser (seperti Google Chrome Push Service).",
        "Capacitor / Android: Jembatan WebView untuk aplikasi Android.",
        "Firebase Cloud Messaging (FCM): Layanan notifikasi native Android jika diaktifkan pada build APK.",
      ],
    },
    {
      id: "16",
      number: 16,
      title: "PEMBAGIAN DATA",
      paragraphs: [
        "Kami tidak menjual data pribadi pengguna.",
        "Data hanya diproses oleh penyedia infrastruktur teknis untuk keperluan penyediaan layanan, atau apabila diwajibkan oleh hukum dan hukum yang berlaku.",
      ],
    },
    {
      id: "17",
      number: 17,
      title: "KEAMANAN DATA",
      paragraphs: [
        "Kami menerapkan pengamanan teknis seperti penggunaan protokol HTTPS (SSL/TLS), kontrol akses terenkripsi, enkripsi VAPID key server-side, serta perlindungan database di Supabase.",
      ],
    },
    {
      id: "18",
      number: 18,
      title: "RETENSI DATA",
      paragraphs: [
        "Data akun admin disimpan selama akun aktif. Push subscription dipertahankan hingga pengguna berhenti berlangganan atau endpoint dinyatakan tidak valid oleh Push Service. Riwayat notifikasi di perangkat dapat dihapus kapan saja oleh pengguna.",
      ],
    },
    {
      id: "19",
      number: 19,
      title: "PENGELOLAAN DAN PENGHAPUSAN AKUN ADMIN / MITRA",
      paragraphs: [
        "Aplikasi ini tidak memiliki pendaftaran mandiri publik (non-account-based service untuk pengguna umum). Akses akun hanya diterbitkan terbatas untuk Admin Wilayah / Partner Resmi (BUMDes/Perangkat Desa) berdasarkan Perjanjian Kerja Sama (PKS).",
        "Bagi Admin/Mitra yang ingin mengajukan penghapusan akun beserta data operasional, permohonan resmi dapat dikirim melalui email ke alfianfendi2@gmail.com dengan subjek: 'Permohonan Penghapusan Akun Admin - [Nama Desa/Wilayah]'. Data kredensial akan dihapus/dianonimkan dalam waktu maksimal 30 hari kerja.",
      ],
    },
    {
      id: "20",
      number: 20,
      title: "PENCABUTAN IZIN",
      paragraphs: [
        "Izin perangkat dapat dicabut kapan saja via pengaturan browser (Setelan situs → Rekomendify) atau Android (Setelan → Aplikasi → Rekomendify → Izin).",
      ],
    },
    {
      id: "21",
      number: 21,
      title: "COOKIE, CACHE, STORAGE, DAN DATA LOKAL",
      paragraphs: [
        "Rekomendify menggunakan Cache Storage, IndexedDB, dan LocalStorage untuk mempercepat aplikasi, mendukung mode PWA/offline, serta menyimpan favorit dan riwayat notifikasi lokal.",
      ],
    },
    {
      id: "22",
      number: 22,
      title: "WEBVIEW PADA APLIKASI ANDROID",
      paragraphs: [
        "Aplikasi Android Rekomendify menggunakan Capacitor App Shell untuk menampilkan web Rekomendify dalam WebView. Konten dipembarui langsung dari server tanpa harus selalu menginstal ulang APK.",
      ],
    },
    {
      id: "23",
      number: 23,
      title: "LINK EKSTERNAL",
      paragraphs: [
        "Rekomendify menyediakan tautan luar seperti WhatsApp, Google Maps, telepon, dan email. Saat berpindah ke aplikasi pihak ketiga, kebijakan privasi masing-masing penyedia layanan tersebut berlaku.",
      ],
    },
    {
      id: "24",
      number: 24,
      title: "DATA ANAK",
      paragraphs: [
        "Rekomendify adalah layanan pemandu informasi umum dan tidak ditujukan khusus untuk anak-anak. Kami tidak meminta data anak secara sengaja.",
      ],
    },
    {
      id: "25",
      number: 25,
      title: "PRIVASI DALAM KONTEKS DESA/WILAYAH",
      paragraphs: [
        "Informasi lokasi usaha, UMKM, fasilitas, dan kegiatan wilayah yang ditampilkan adalah informasi publik dan bukan merupakan data pribadi pengguna.",
      ],
    },
    {
      id: "26",
      number: 26,
      title: "PERUBAHAN KEBIJAKAN PRIVASI",
      paragraphs: [
        "Kebijakan Privasi dapat diperbarui sewaktu-waktu mengikuti perkembangan fitur, arsitektur, atau regulasi hukum. Versi terbaru selalu dipublikasikan di https://www.rekomendify.com/privasi.",
      ],
    },
    {
      id: "27",
      number: 27,
      title: "HAK PENGGUNA",
      paragraphs: [
        "Pengguna berhak mengetahui pemrosesan data, meminta informasi, memperbaiki data, serta mengajukan pertanyaan terkait privasi melalui email alfianfendi2@gmail.com.",
      ],
    },
    {
      id: "28",
      number: 28,
      title: "KEWAJIBAN PENGGUNA",
      paragraphs: [
        "Pengguna admin bertanggung jawab menjaga keamanan kredensial akun dan tidak menggunakan Rekomendify untuk tindakan melanggar hukum.",
      ],
    },
    {
      id: "29",
      number: 29,
      title: "KONTAK TERKAIT PRIVASI",
      paragraphs: [
        "Untuk pertanyaan atau keluhan privasi, silakan hubungi:",
      ],
      bullets: [
        "Pengelola: Fandy Alfian Zulvain",
        "Email: alfianfendi2@gmail.com",
        "Alamat: Jl. Raya Pagerwojo, Kecamatan Pagerwojo, Kabupaten Tulungagung, Jawa Timur 66262",
      ],
    },
    {
      id: "30",
      number: 30,
      title: "INFORMASI PENTING UNTUK GOOGLE PLAY",
      paragraphs: [
        "Kebijakan Privasi ini konsisten dengan pernyataan Data Safety pada Google Play Console. Segala pemrosesan data oleh SDK/library internal telah didokumentasikan dengan akurat.",
      ],
    },
    {
      id: "31",
      number: 31,
      title: "KETENTUAN AKHIR",
      paragraphs: [
        "Dengan menggunakan Rekomendify, Anda memahami dan menyetujui prinsip minimisasi data, transparansi, dan kontrol izin yang berlaku.",
        "Dokumen ini merupakan Kebijakan Privasi resmi Rekomendify.",
      ],
    },
  ],
};
