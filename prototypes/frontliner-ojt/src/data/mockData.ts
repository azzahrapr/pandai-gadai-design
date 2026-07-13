import type { Milestone, DailyChecklist, PenaksiranRecord, Assessment, AppUser } from '../types'

export interface DailyTaskDef {
  id: string
  name: string
  items: { id: string; text: string }[]
}

export const DAILY_TASKS: DailyTaskDef[] = [
  {
    id: 'opening',
    name: 'Opening',
    items: [
      { id: 'oc-c1', text: 'Tiba di kantor 30 menit sebelum jam buka dan melakukan opening sesuai SOP' },
      { id: 'oc-c2', text: 'Memeriksa kondisi ruangan, peralatan, dan area layanan nasabah' },
      { id: 'oc-c3', text: 'Menghidupkan sistem dan memverifikasi saldo kas awal' },
      { id: 'oc-c4', text: 'Menyiapkan dokumen harian dan form transaksi' },
    ],
  },
  {
    id: 'pelayanan-dasar',
    name: 'Pelayanan Nasabah',
    items: [
      { id: 'pd-c1', text: 'Menyambut setiap nasabah dengan greeting yang benar (berdiri, senyum, sapa)' },
      { id: 'pd-c2', text: 'Mengidentifikasi kebutuhan nasabah dengan pertanyaan yang tepat' },
      { id: 'pd-c3', text: 'Memberikan solusi dan informasi produk yang akurat kepada nasabah' },
      { id: 'pd-c4', text: 'Menerapkan standar penampilan (seragam, ID card, grooming)' },
      { id: 'pd-c5', text: 'Menangani minimal 1 situasi komplain/pertanyaan sulit dengan prinsip HEAR' },
    ],
  },
  {
    id: 'closing',
    name: 'Closing',
    items: [
      { id: 'oc-c5', text: 'Melakukan rekap kas harian dengan benar' },
      { id: 'oc-c6', text: 'Membuat laporan transaksi harian' },
      { id: 'oc-c7', text: 'Mengamankan semua dokumen dan barang gadai sebelum closing' },
    ],
  },
]

export const MILESTONES: Milestone[] = [
  {
    id: 'opening-closing',
    name: 'Opening & Closing',
    shortName: 'Opening/Closing',
    type: 'minggu1',
    order: 1,
    description: 'Prosedur pembukaan dan penutupan kantor cabang sesuai SOP',
    unlockDay: 1,
    estimatedMinutes: 45,
    materials: [
      {
        id: 'oc-m1',
        title: 'SOP Opening Kantor',
        content: `## Prosedur Opening Kantor\n\n**Waktu:** 30 menit sebelum jam operasional\n\n### Langkah-langkah:\n1. **Tiba di kantor** — Hadir 30 menit sebelum jam buka\n2. **Keamanan** — Matikan alarm, buka pintu utama\n3. **Sistem** — Hidupkan komputer, login sistem Pandai Gadai\n4. **Uang kas** — Hitung dan verifikasi saldo kas awal\n5. **Area nasabah** — Rapikan meja, kursi, dan area tunggu\n6. **Dokumen** — Siapkan form transaksi dan dokumen harian\n7. **Siap layanan** — Konfirmasi ke Kanit bahwa kantor siap beroperasi`,
      },
      {
        id: 'oc-m2',
        title: 'SOP Closing Kantor',
        content: `## Prosedur Closing Kantor\n\n**Waktu:** Setelah jam operasional\n\n### Langkah-langkah:\n1. **Selesaikan transaksi** — Pastikan semua transaksi hari ini telah diproses\n2. **Rekap kas** — Hitung total uang kas dan cocokkan dengan sistem\n3. **Laporan harian** — Buat dan cetak laporan transaksi harian\n4. **Arsip dokumen** — Simpan semua dokumen transaksi di tempat yang benar\n5. **Amankan barang** — Pastikan semua barang gadai tersimpan aman\n6. **Matikan sistem** — Log out dan matikan semua komputer\n7. **Kunci kantor** — Aktifkan alarm dan kunci semua pintu`,
      },
      {
        id: 'oc-m3',
        title: 'Rekap Kas Harian',
        content: `## Rekap Kas Harian\n\nRekap kas dilakukan setiap hari sebelum closing. Pastikan:\n\n- **Saldo awal** sesuai saldo akhir hari kemarin\n- **Total penerimaan** = uang masuk dari transaksi gadai & perpanjangan\n- **Total pengeluaran** = uang keluar untuk pencairan & tebus\n- **Saldo akhir** = Saldo awal + Penerimaan - Pengeluaran\n\n### Jika ada selisih:\n1. Hitung ulang semua uang fisik\n2. Cek kembali semua transaksi di sistem\n3. Laporkan ke Kanit jika selisih tidak ditemukan`,
      },
    ],
    checklistItems: [
      { id: 'oc-c1', text: 'Tiba di kantor 30 menit sebelum jam buka dan melakukan opening sesuai SOP', category: 'Opening' },
      { id: 'oc-c2', text: 'Memeriksa kondisi ruangan, peralatan, dan area layanan nasabah', category: 'Opening' },
      { id: 'oc-c3', text: 'Menghidupkan sistem dan memverifikasi saldo kas awal', category: 'Opening' },
      { id: 'oc-c4', text: 'Menyiapkan dokumen harian dan form transaksi', category: 'Opening' },
      { id: 'oc-c5', text: 'Melakukan rekap kas harian dengan benar', category: 'Closing' },
      { id: 'oc-c6', text: 'Membuat laporan transaksi harian', category: 'Closing' },
      { id: 'oc-c7', text: 'Mengamankan semua dokumen dan barang gadai sebelum closing', category: 'Closing' },
    ],
  },
  {
    id: 'packing-sealing',
    name: 'Packing & Sealing',
    shortName: 'Packing/Sealing',
    type: 'minggu1',
    order: 2,
    description: 'Teknik packing dan sealing barang gadai sesuai standar keamanan',
    unlockDay: 1,
    estimatedMinutes: 30,
    materials: [
      {
        id: 'ps-m1',
        title: 'Standar Packing Barang Gadai',
        content: `## Standar Packing Barang Gadai\n\n### Jenis Kemasan:\n- **Emas & Perhiasan:** Plastik ziplock + amplop kertas + stiker segel\n- **Elektronik:** Bubble wrap + kardus + stiker segel\n- **Kendaraan:** Kunci di laci khusus, dokumen di map terpisah\n\n### Label Wajib (isi lengkap):\n1. Nomor SBR (Surat Bukti Rahn)\n2. Nama nasabah\n3. Deskripsi barang\n4. Tanggal gadai & jatuh tempo\n5. Nilai taksiran`,
      },
      {
        id: 'ps-m2',
        title: 'Teknik Sealing yang Benar',
        content: `## Teknik Sealing\n\nSealing memastikan tidak ada manipulasi pada barang gadai.\n\n### Prosedur:\n1. Pastikan barang sudah dikemas dengan benar\n2. Tempel stiker segel pada sambungan kemasan\n3. Tulis tanggal dan paraf di atas stiker segel\n4. Pastikan stiker tidak mudah lepas\n5. Double-check label terbaca dengan jelas\n\n### Yang Dihindari:\n- Jangan gunakan stiker segel bekas\n- Jangan tutupi informasi dengan stiker\n- Jangan biarkan ada celah terbuka pada kemasan`,
      },
    ],
    checklistItems: [
      { id: 'ps-c1', text: 'Melakukan packing barang sesuai jenis (emas, elektronik, kendaraan)', category: 'Packing' },
      { id: 'ps-c2', text: 'Menulis label barang dengan informasi yang lengkap dan benar', category: 'Labeling' },
      { id: 'ps-c3', text: 'Melakukan sealing pada kemasan barang gadai dengan benar', category: 'Sealing' },
      { id: 'ps-c4', text: 'Menyimpan barang di tempat penyimpanan yang sesuai dan tertata', category: 'Penyimpanan' },
      { id: 'ps-c5', text: 'Mencatat barang yang disimpan di buku catatan/sistem', category: 'Administrasi' },
    ],
    quiz: [
      {
        id: 'ps-q1',
        question: 'Kemasan yang benar untuk emas & perhiasan adalah...',
        options: [
          'Kardus + bubble wrap',
          'Plastik ziplock + amplop kertas + stiker segel',
          'Amplop kertas saja',
          'Plastik biasa + isolasi',
        ],
        correctIndex: 1,
      },
      {
        id: 'ps-q2',
        question: 'Informasi apa yang WAJIB ada pada label barang gadai?',
        options: [
          'Nomor SBR, nama nasabah, deskripsi barang, tanggal gadai & jatuh tempo, nilai taksiran',
          'Nama nasabah dan nomor HP saja',
          'Nomor KTP dan alamat nasabah',
          'Hanya nilai taksiran dan nama nasabah',
        ],
        correctIndex: 0,
      },
      {
        id: 'ps-q3',
        question: 'Apa yang harus dilakukan SETELAH menempel stiker segel?',
        options: [
          'Simpan langsung ke gudang',
          'Foto barang terlebih dahulu',
          'Tulis tanggal dan paraf di atas stiker segel',
          'Lapor ke Kanit',
        ],
        correctIndex: 2,
      },
      {
        id: 'ps-q4',
        question: 'Mana yang HARUS DIHINDARI saat sealing?',
        options: [
          'Menulis tanggal di atas stiker',
          'Memaraf stiker segel',
          'Memastikan kemasan tertutup rapat',
          'Menggunakan stiker segel bekas',
        ],
        correctIndex: 3,
      },
    ],
  },
  {
    id: 'canvassing',
    name: 'Canvassing',
    shortName: 'Canvassing',
    type: 'minggu1',
    order: 3,
    description: 'Strategi dan teknik canvassing aktif untuk mendapatkan nasabah baru',
    unlockDay: 2,
    estimatedMinutes: 30,
    materials: [
      {
        id: 'cv-m1',
        title: 'Dasar-Dasar Canvassing',
        content: `## Dasar-Dasar Canvassing\n\nCanvassing adalah kegiatan aktif mendatangi calon nasabah untuk memperkenalkan produk gadai.\n\n### Persiapan:\n1. Pelajari produk unggulan (tarif terbaik, proses cepat)\n2. Siapkan brosur dan kartu nama\n3. Kenali area canvassing (pasar, toko, perumahan)\n4. Tetapkan target minimum: **5 prospek per hari**\n\n### 5 Langkah Canvassing Efektif:\n1. **Sapa** — Sapa ramah, perkenalkan diri\n2. **Tanya** — Identifikasi kebutuhan\n3. **Ceritakan** — Manfaat & keunggulan Pandai Gadai\n4. **Tawarkan** — Penawaran yang relevan\n5. **Follow Up** — Minta kontak, jadwalkan kunjungan`,
      },
      {
        id: 'cv-m2',
        title: 'Script Canvassing',
        content: `## Script Canvassing\n\n### Opening:\n*"Selamat pagi/siang, Pak/Bu. Perkenalkan saya [nama] dari Pandai Gadai cabang [lokasi]. Boleh saya beberapa menit?"*\n\n### Pitch Utama:\n*"Kami menawarkan solusi gadai emas dan elektronik dengan proses 15 menit, tanpa biaya administrasi, dan tarif mulai 1% per bulan. Kalau sewaktu-waktu butuh dana cepat, kami siap membantu."*\n\n### Closing:\n*"Boleh saya tinggalkan brosur ini? Kalau ada pertanyaan, bisa hubungi saya di nomor ini. Terima kasih!"*\n\n### Tips:\n- Tersenyum sepanjang percakapan\n- Nada percaya diri tapi tidak memaksa\n- Dengarkan kebutuhan calon nasabah`,
      },
    ],
    checklistItems: [
      { id: 'cv-c1', text: 'Menyiapkan materi canvassing (brosur, kartu nama, script)', category: 'Persiapan' },
      { id: 'cv-c2', text: 'Melakukan canvassing minimal 5 prospek per hari', category: 'Eksekusi' },
      { id: 'cv-c3', text: 'Mencatat hasil canvassing (nama, kontak, respon) di form', category: 'Dokumentasi' },
      { id: 'cv-c4', text: 'Melakukan follow up pada prospek dari hari sebelumnya', category: 'Follow Up' },
      { id: 'cv-c5', text: 'Melaporkan hasil canvassing kepada Kanit', category: 'Pelaporan' },
    ],
  },
  {
    id: 'pelayanan-dasar',
    name: 'Pelayanan Dasar',
    shortName: 'Pelayanan Dasar',
    type: 'minggu1',
    order: 4,
    description: 'Teknik pelayanan prima dan etika kerja Frontliner Pandai Gadai',
    unlockDay: 3,
    estimatedMinutes: 30,
    materials: [
      {
        id: 'pd-m1',
        title: 'Standar Pelayanan Nasabah',
        content: `## Standar Pelayanan Nasabah\n\n### Siklus Pelayanan (6 S):\n1. **Sambut** — Berdiri, senyum, sapa nasabah saat masuk\n2. **Sapa** — *"Selamat pagi/siang/sore, ada yang bisa saya bantu?"*\n3. **Simak** — Identifikasi kebutuhan dengan pertanyaan terbuka\n4. **Solusi** — Berikan solusi terbaik sesuai kebutuhan\n5. **Selesaikan** — Proses dengan cepat dan tepat\n6. **Salam** — Ucapkan terima kasih saat nasabah selesai\n\n### Standar Penampilan:\n- Seragam bersih dan rapi\n- ID card terpasang\n- Rambut rapi & ekspresi ramah`,
      },
      {
        id: 'pd-m2',
        title: 'Menangani Nasabah Komplain',
        content: `## Menangani Komplain: Prinsip HEAR\n\n- **H**ear — Dengarkan tanpa memotong\n- **E**mpathize — *"Saya memahami perasaan Bapak/Ibu..."*\n- **A**pologize — Minta maaf atas ketidaknyamanan\n- **R**esolve — Cari solusi & tindak lanjut\n\n### Langkah Penanganan:\n1. Tetap tenang, dengarkan dengan sabar\n2. Jangan defensif atau menyalahkan nasabah\n3. Catat detail keluhan\n4. Berikan solusi atau eskalasi ke Kanit\n5. Follow up setelah masalah selesai`,
      },
    ],
    checklistItems: [
      { id: 'pd-c1', text: 'Menyambut setiap nasabah dengan greeting yang benar (berdiri, senyum, sapa)', category: 'Pelayanan' },
      { id: 'pd-c2', text: 'Mengidentifikasi kebutuhan nasabah dengan pertanyaan yang tepat', category: 'Pelayanan' },
      { id: 'pd-c3', text: 'Memberikan solusi dan informasi produk yang akurat kepada nasabah', category: 'Pelayanan' },
      { id: 'pd-c4', text: 'Menerapkan standar penampilan (seragam, ID card, grooming)', category: 'Penampilan' },
      { id: 'pd-c5', text: 'Menangani minimal 1 situasi komplain/pertanyaan sulit dengan prinsip HEAR', category: 'Komplain' },
    ],
  },
  {
    id: 'pelayanan-transaksi',
    name: 'Pelayanan Transaksi',
    shortName: 'Transaksi',
    type: 'minggu2',
    order: 5,
    description: 'Prosedur lengkap transaksi gadai baru, tebus, dan perpanjangan',
    unlockDay: 8,
    estimatedMinutes: 45,
    materials: [
      {
        id: 'pt-m1',
        title: 'Alur Transaksi Gadai Baru',
        content: `## Alur Transaksi Gadai Baru\n\n1. **Verifikasi Identitas** — Minta KTP nasabah, cek keaslian\n2. **Identifikasi Barang** — Terima barang yang akan digadai\n3. **Penaksiran** — Taksir nilai barang (lihat modul Penaksiran)\n4. **Informasikan** — Beritahu nilai taksiran, tarif, dan jangka waktu\n5. **Persetujuan** — Nasabah setuju dan tanda tangan akad\n6. **Input Sistem** — Input data transaksi ke sistem Pandai Gadai\n7. **Pencairan** — Hitung dan berikan uang pinjaman\n8. **Dokumentasi** — Cetak SBR, berikan ke nasabah\n9. **Packing** — Kemas barang gadai (lihat modul Packing & Sealing)`,
      },
      {
        id: 'pt-m2',
        title: 'Alur Tebus dan Perpanjangan',
        content: `## Alur Tebus Barang\n\n1. Minta SBR dari nasabah\n2. Verifikasi data nasabah dengan KTP\n3. Hitung total yang harus dibayar (pokok + biaya gadai)\n4. Nasabah membayar\n5. Input transaksi tebus di sistem\n6. Ambil barang dari penyimpanan\n7. Periksa kondisi barang dengan nasabah\n8. Serahkan barang dan cetak bukti tebus\n\n## Alur Perpanjangan\n\n1. Minta SBR dari nasabah\n2. Hitung biaya perpanjangan\n3. Nasabah membayar biaya perpanjangan\n4. Update data di sistem\n5. Cetak SBR baru dengan tanggal jatuh tempo terbaru`,
      },
    ],
    checklistItems: [
      { id: 'pt-c1', text: 'Memproses minimal 1 transaksi gadai baru dari awal hingga selesai', category: 'Gadai Baru' },
      { id: 'pt-c2', text: 'Memverifikasi identitas nasabah sesuai prosedur', category: 'Verifikasi' },
      { id: 'pt-c3', text: 'Memproses transaksi tebus dengan benar', category: 'Tebus' },
      { id: 'pt-c4', text: 'Memproses perpanjangan masa gadai', category: 'Perpanjangan' },
      { id: 'pt-c5', text: 'Menginput semua transaksi ke sistem dengan benar dan lengkap', category: 'Input Sistem' },
      { id: 'pt-c6', text: 'Mencetak dan memberikan dokumen transaksi kepada nasabah', category: 'Administrasi' },
    ],
  },
  {
    id: 'penaksiran',
    name: 'Penaksiran',
    shortName: 'Penaksiran',
    type: 'minggu2',
    order: 6,
    description: 'Teknik penaksiran barang gadai emas, elektronik, dan barang berharga lainnya',
    unlockDay: 10,
    estimatedMinutes: 60,
    materials: [
      {
        id: 'pn-m1',
        title: 'Prinsip Dasar Penaksiran',
        content: `## Prinsip Dasar Penaksiran\n\nPenaksiran adalah proses menilai barang untuk menentukan nilai pinjaman maksimum.\n\n### Faktor yang Mempengaruhi Nilai:\n- **Kadar/Kualitas** — Kadar emas, spesifikasi elektronik\n- **Berat/Ukuran** — Berat emas dalam gram\n- **Kondisi** — Mulus, bekas, rusak\n- **Kelengkapan** — Box, charger, dokumen\n- **Harga Pasar** — Mengacu harga spot emas dan harga pasar\n\n### Rumus:\n**Nilai Taksiran = Nilai Pasar × Persentase Gadai (85–90%)**`,
      },
      {
        id: 'pn-m2',
        title: 'Penaksiran Emas',
        content: `## Penaksiran Emas\n\n### Alat:\n- Timbangan digital presisi\n- Cairan uji kadar (acid test)\n- Intools (sistem referensi harga)\n\n### Langkah:\n1. **Identifikasi kadar** — Lihat cap (999, 750, 375) atau uji acid test\n2. **Timbang** — Dalam satuan gram\n3. **Hitung nilai** — Gunakan harga emas di Intools sesuai kadar\n4. **Kondisi** — Perhatikan batu permata, kondisi fisik\n5. **Kalkulasi** — Nilai taksiran = berat × harga/gram × 85%\n\n### Contoh:\nEmas 24K, 10g, harga Rp1.000.000/g\n→ 10 × 1.000.000 × 85% = **Rp 8.500.000**`,
      },
      {
        id: 'pn-m3',
        title: 'Menggunakan Intools',
        content: `## Menggunakan Intools\n\nIntools adalah sistem referensi penaksiran resmi Pandai Gadai. Semua penaksiran **WAJIB** diverifikasi.\n\n### Langkah:\n1. Login dengan akun OJT yang diberikan\n2. Pilih kategori (Emas, Elektronik, Kendaraan)\n3. Input spesifikasi barang\n4. Sistem memberikan range nilai taksiran\n5. Gunakan nilai tengah sebagai acuan\n\n### Penting:\n- Hasil taksiran TIDAK boleh melebihi nilai Intools lebih dari **5%**\n- Perbedaan besar → konsultasikan dengan Kanit\n- Selalu catat nomor referensi Intools`,
      },
    ],
    checklistItems: [
      { id: 'pn-c1', text: 'Melakukan penaksiran emas minimal 2 item sesuai prosedur', category: 'Penaksiran' },
      { id: 'pn-c2', text: 'Menggunakan Intools untuk validasi setiap hasil taksiran', category: 'Intools' },
      { id: 'pn-c3', text: 'Mencapai akurasi taksiran ≥ 90% dari nilai Intools', category: 'Akurasi' },
      { id: 'pn-c4', text: 'Mengisi form penaksiran dengan lengkap dan benar', category: 'Administrasi' },
      { id: 'pn-c5', text: 'Mendokumentasikan barang yang ditaksir', category: 'Dokumentasi' },
    ],
  },
]

export const MOCK_USERS: AppUser[] = [
  {
    id: 'fl-001',
    name: 'Andi Pratama',
    role: 'fl',
    profile: {
      id: 'fl-001',
      name: 'Andi Pratama',
      branch: 'Cabang Sudirman',
      position: 'OJT Frontliner',
      startDate: '2026-07-01',
      currentDay: 7,
      kanitId: 'kanit-001',
      activeMilestoneIds: ['opening-closing', 'packing-sealing', 'canvassing', 'pelayanan-dasar'],
    },
  },
  {
    id: 'fl-002',
    name: 'Sari Dewi Lestari',
    role: 'fl',
    profile: {
      id: 'fl-002',
      name: 'Sari Dewi Lestari',
      branch: 'Cabang Sudirman',
      position: 'OJT Frontliner',
      startDate: '2026-07-01',
      currentDay: 7,
      kanitId: 'kanit-001',
      activeMilestoneIds: ['opening-closing', 'packing-sealing', 'canvassing', 'pelayanan-dasar'],
    },
  },
  {
    id: 'fl-003',
    name: 'Budi Santoso',
    role: 'fl',
    profile: {
      id: 'fl-003',
      name: 'Budi Santoso',
      branch: 'Cabang Sudirman',
      position: 'OJT Frontliner',
      startDate: '2026-06-24',
      currentDay: 14,
      kanitId: 'kanit-001',
      activeMilestoneIds: ['opening-closing', 'packing-sealing', 'canvassing', 'pelayanan-dasar', 'pelayanan-transaksi', 'penaksiran'],
      completedMilestoneIds: ['opening-closing', 'packing-sealing', 'canvassing', 'pelayanan-dasar'],
      quizScores: { 'packing-sealing': 85 },
      quizAnswers: {
        'packing-sealing': { 'ps-q1': 1, 'ps-q2': 0, 'ps-q3': 1, 'ps-q4': 3 },
      },
    },
  },
  {
    id: 'kanit-001',
    name: 'Hendra Wijaya',
    role: 'kanit',
    profile: {
      id: 'kanit-001',
      name: 'Hendra Wijaya',
      branch: 'Cabang Sudirman',
      flIds: ['fl-001', 'fl-002', 'fl-003'],
    },
  },
]

const fl001Checklists: DailyChecklist[] = [
  {
    id: 'cl-fl001-1', day: 1, date: '2026-07-01', flId: 'fl-001',
    tasks: [
      { taskId: 'opening', taskName: 'Opening', completedItemIds: ['oc-c1', 'oc-c2', 'oc-c3', 'oc-c4'], reflection: 'Hari pertama, agak grogi tapi opening berjalan. Saldo awal sudah diverifikasi sesuai catatan.', submittedAt: '2026-07-01T08:30:00' },
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-c1', 'cv-c2', 'cv-c3'], reflection: 'Pertama kali canvassing, lumayan nervous. Baru bisa 3 prospek, belum berani masuk ke follow up.', submittedAt: '2026-07-01T13:00:00' },
      { taskId: 'pelayanan-dasar', taskName: 'Pelayanan Nasabah', completedItemIds: ['pd-c1', 'pd-c2', 'pd-c3', 'pd-c4'], reflection: 'Greeting sudah dilakukan dengan baik. Belum ada situasi komplain hari ini.', submittedAt: '2026-07-01T16:00:00' },
      { taskId: 'penaksiran-elektronik', taskName: 'Penaksiran Elektronik', completedItemIds: ['pn-c2', 'pn-c4'], reflection: 'Belum berani taksir sendiri, baru observasi dan bantu input data ke Intools.', submittedAt: '2026-07-01T16:30:00' },
      { taskId: 'closing', taskName: 'Closing', completedItemIds: ['oc-c6', 'oc-c7'], reflection: 'Laporan belum selesai tepat waktu, ada nasabah mendadak sebelum closing. Perlu manajemen waktu lebih baik.', submittedAt: '2026-07-01T17:30:00' },
    ],
    status: 'scored', submittedAt: '2026-07-01T17:30:00',
    kanitScore: 82, kanitNote: 'Hari pertama sudah bagus. Laporan harian perlu lebih dipersiapkan dari awal.', kanitScoredAt: '2026-07-01T18:00:00',
  },
  {
    id: 'cl-fl001-2', day: 2, date: '2026-07-02', flId: 'fl-001',
    tasks: [
      { taskId: 'opening', taskName: 'Opening', completedItemIds: ['oc-c1', 'oc-c2', 'oc-c3', 'oc-c4'], reflection: 'Opening lebih lancar dari kemarin. Saldo sudah langsung dicek saat sistem menyala.', submittedAt: '2026-07-02T08:30:00' },
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-c1', 'cv-c2', 'cv-c3', 'cv-c5'], reflection: 'Berhasil 5 prospek hari ini. Sudah mulai lebih percaya diri menyapa calon nasabah.', submittedAt: '2026-07-02T13:00:00' },
      { taskId: 'pelayanan-dasar', taskName: 'Pelayanan Nasabah', completedItemIds: ['pd-c1', 'pd-c2', 'pd-c3', 'pd-c4'], reflection: 'Pelayanan sudah lebih tenang. Masih perlu latihan untuk skenario komplain.', submittedAt: '2026-07-02T16:00:00' },
      { taskId: 'penaksiran-elektronik', taskName: 'Penaksiran Elektronik', completedItemIds: ['pn-c1', 'pn-c2', 'pn-c4', 'pn-c5'], reflection: 'Sudah coba taksir 2 item dengan didampingi. Akurasi masih perlu ditingkatkan.', submittedAt: '2026-07-02T16:30:00' },
      { taskId: 'closing', taskName: 'Closing', completedItemIds: ['oc-c5', 'oc-c6', 'oc-c7'], reflection: 'Rekap dan laporan selesai tepat waktu. Lebih baik dari kemarin.', submittedAt: '2026-07-02T17:15:00' },
    ],
    status: 'scored', submittedAt: '2026-07-02T17:15:00',
    kanitScore: 90, kanitNote: 'Progress bagus di hari kedua! Packing rapi dan tepat waktu. Pertahankan.', kanitScoredAt: '2026-07-02T17:45:00',
  },
  {
    id: 'cl-fl001-3', day: 3, date: '2026-07-03', flId: 'fl-001',
    tasks: [
      { taskId: 'opening', taskName: 'Opening', completedItemIds: ['oc-c1', 'oc-c2', 'oc-c3', 'oc-c4'], reflection: 'Semua item opening selesai tanpa kendala.', submittedAt: '2026-07-03T08:30:00' },
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-c1', 'cv-c2', 'cv-c3', 'cv-c5'], reflection: 'Berhasil menghubungi 7 prospek hari ini, melebihi target. Belum ada prospek kemarin untuk di-follow up.', submittedAt: '2026-07-03T13:00:00' },
      { taskId: 'pelayanan-dasar', taskName: 'Pelayanan Nasabah', completedItemIds: ['pd-c1', 'pd-c2', 'pd-c3', 'pd-c4', 'pd-c5'], reflection: 'Ada 1 situasi komplain hari ini, berhasil diselesaikan meski masih perlu bimbingan Kanit.', submittedAt: '2026-07-03T16:00:00' },
      { taskId: 'penaksiran-elektronik', taskName: 'Penaksiran Elektronik', completedItemIds: ['pn-c1', 'pn-c2', 'pn-c3', 'pn-c4', 'pn-c5'], reflection: 'Taksir 3 item sendiri hari ini. Akurasi 88%, hampir mencapai target. Perlu lebih teliti.', submittedAt: '2026-07-03T16:30:00' },
      { taskId: 'closing', taskName: 'Closing', completedItemIds: ['oc-c5', 'oc-c6', 'oc-c7'], reflection: 'Rekap selesai tepat waktu. Tidak ada selisih kas.', submittedAt: '2026-07-03T17:20:00' },
    ],
    status: 'scored', submittedAt: '2026-07-03T17:20:00',
    kanitScore: 88, kanitNote: 'Canvassing aktif, 7 prospek melebihi target! Mulai rutinkan follow up.', kanitScoredAt: '2026-07-03T18:10:00',
  },
  {
    id: 'cl-fl001-4', day: 4, date: '2026-07-04', flId: 'fl-001',
    tasks: [
      { taskId: 'opening', taskName: 'Opening', completedItemIds: ['oc-c1', 'oc-c2', 'oc-c3', 'oc-c4'], reflection: 'Opening berjalan lancar, sistem menyala tanpa masalah. Saldo awal sesuai catatan kemarin.', submittedAt: '2026-07-04T08:30:00' },
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-c1', 'cv-c2', 'cv-c3', 'cv-c4', 'cv-c5'], reflection: '6 prospek hari ini dan follow up 2 dari kemarin. Salah satu prospek minta brosur untuk dibawa pulang.', submittedAt: '2026-07-04T13:00:00' },
      { taskId: 'pelayanan-dasar', taskName: 'Pelayanan Nasabah', completedItemIds: ['pd-c1', 'pd-c2', 'pd-c3', 'pd-c4'], reflection: 'Pelayanan sudah baik dan ramah. Belum ada situasi komplain hari ini, tapi sudah siap jika ada.', submittedAt: '2026-07-04T16:00:00' },
      { taskId: 'penaksiran-elektronik', taskName: 'Penaksiran Elektronik', completedItemIds: ['pn-c1', 'pn-c2', 'pn-c3', 'pn-c4', 'pn-c5'], reflection: 'Akurasi taksiran 91%, sudah melewati target 90%. Mulai lebih percaya diri.', submittedAt: '2026-07-04T16:30:00' },
      { taskId: 'closing', taskName: 'Closing', completedItemIds: ['oc-c5', 'oc-c6', 'oc-c7'], reflection: 'Rekap kas selesai tepat waktu. Semua dokumen sudah diamankan dengan baik.', submittedAt: '2026-07-04T17:00:00' },
    ],
    status: 'scored', submittedAt: '2026-07-04T17:00:00',
    kanitScore: 85, kanitNote: 'Pelayanan sudah baik dan ramah. Akan ada latihan skenario komplain besok.', kanitScoredAt: '2026-07-04T17:30:00',
  },
  {
    id: 'cl-fl001-5', day: 5, date: '2026-07-05', flId: 'fl-001',
    tasks: [
      { taskId: 'opening', taskName: 'Opening', completedItemIds: ['oc-c1', 'oc-c2', 'oc-c3', 'oc-c4'], reflection: 'Semua checklist opening selesai. Saldo awal verified dan sesuai.', submittedAt: '2026-07-05T08:30:00' },
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-c1', 'cv-c2', 'cv-c3', 'cv-c4', 'cv-c5'], reflection: '7 prospek hari ini. Follow up 2 prospek kemarin, 1 konfirmasi mau datang besok.', submittedAt: '2026-07-05T13:00:00' },
      { taskId: 'pelayanan-dasar', taskName: 'Pelayanan Nasabah', completedItemIds: ['pd-c1', 'pd-c2', 'pd-c3', 'pd-c4', 'pd-c5'], reflection: 'Berhasil menangani komplain nasabah soal waktu tunggu dengan prinsip HEAR. Deg-degan tapi berhasil!', submittedAt: '2026-07-05T16:00:00' },
      { taskId: 'penaksiran-elektronik', taskName: 'Penaksiran Elektronik', completedItemIds: ['pn-c1', 'pn-c2', 'pn-c3', 'pn-c4', 'pn-c5'], reflection: 'Akurasi taksiran hari ini 93%. Sudah konsisten di atas target.', submittedAt: '2026-07-05T16:30:00' },
      { taskId: 'closing', taskName: 'Closing', completedItemIds: ['oc-c5', 'oc-c6', 'oc-c7'], reflection: 'Rekap dan laporan selesai tepat waktu. Tidak ada selisih kas hari ini.', submittedAt: '2026-07-05T17:10:00' },
    ],
    status: 'scored', submittedAt: '2026-07-05T17:10:00',
    kanitScore: 95, kanitNote: 'Excellent! Semua item terpenuhi. Progress signifikan dari hari pertama!', kanitScoredAt: '2026-07-05T17:30:00',
  },
  {
    id: 'cl-fl001-6', day: 6, date: '2026-07-06', flId: 'fl-001',
    tasks: [
      { taskId: 'opening', taskName: 'Opening', completedItemIds: ['oc-c1', 'oc-c2', 'oc-c3', 'oc-c4'], reflection: 'Opening sesuai SOP. Tidak ada kendala berarti.', submittedAt: '2026-07-06T08:30:00' },
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-c1', 'cv-c2', 'cv-c3', 'cv-c4', 'cv-c5'], reflection: '8 prospek hari ini. Prospek yang kemarin konfirmasi jadi datang — langsung ditangani tim.', submittedAt: '2026-07-06T13:00:00' },
      { taskId: 'pelayanan-dasar', taskName: 'Pelayanan Nasabah', completedItemIds: ['pd-c1', 'pd-c2', 'pd-c3', 'pd-c4', 'pd-c5'], reflection: 'Ada nasabah kurang puas dengan penjelasan bunga gadai. Berhasil dijelaskan ulang dengan sabar dan nasabah mengerti.', submittedAt: '2026-07-06T16:00:00' },
      { taskId: 'penaksiran-elektronik', taskName: 'Penaksiran Elektronik', completedItemIds: ['pn-c1', 'pn-c2', 'pn-c3', 'pn-c4', 'pn-c5'], reflection: 'Taksir 4 item hari ini, semua akurasi di atas 90%. Sudah lebih konsisten.', submittedAt: '2026-07-06T16:30:00' },
      { taskId: 'closing', taskName: 'Closing', completedItemIds: ['oc-c5', 'oc-c6', 'oc-c7'], reflection: 'Rekap selesai, ada selisih kecil Rp 2.000 tapi sudah ketemu penyebabnya dari transaksi kembalian.', submittedAt: '2026-07-06T17:00:00' },
    ],
    status: 'scored', submittedAt: '2026-07-06T17:00:00',
    kanitScore: 92, kanitNote: 'Konsistensi meningkat! Penanganan komplain sudah jauh lebih baik dari hari pertama.', kanitScoredAt: '2026-07-06T17:20:00',
  },
]

const fl002Checklists: DailyChecklist[] = [
  {
    id: 'cl-fl002-1', day: 1, date: '2026-07-01', flId: 'fl-002',
    milestoneId: 'opening-closing', milestoneName: 'Opening & Closing',
    items: [
      { itemId: 'oc-c1', completed: true }, { itemId: 'oc-c2', completed: true },
      { itemId: 'oc-c3', completed: false, note: 'Sistem error saat login, perlu bantuan IT' },
      { itemId: 'oc-c4', completed: true }, { itemId: 'oc-c5', completed: true },
      { itemId: 'oc-c6', completed: true }, { itemId: 'oc-c7', completed: true },
    ],
    status: 'scored', submittedAt: '2026-07-01T17:30:00',
    kanitScore: 78, kanitNote: 'Ada kendala teknis yang wajar. Pahami cara login sistem dengan baik.', kanitScoredAt: '2026-07-01T18:00:00',
  },
  {
    id: 'cl-fl002-2', day: 2, date: '2026-07-02', flId: 'fl-002',
    milestoneId: 'packing-sealing', milestoneName: 'Packing & Sealing',
    items: [
      { itemId: 'ps-c1', completed: true }, { itemId: 'ps-c2', completed: true },
      { itemId: 'ps-c3', completed: true },
      { itemId: 'ps-c4', completed: false, note: 'Belum sempat menata ulang penyimpanan' },
      { itemId: 'ps-c5', completed: true },
    ],
    status: 'scored', submittedAt: '2026-07-02T17:30:00',
    kanitScore: 80, kanitNote: 'Packing cukup baik. Perhatikan penataan penyimpanan agar mudah ditemukan.', kanitScoredAt: '2026-07-02T18:00:00',
  },
  {
    id: 'cl-fl002-3', day: 3, date: '2026-07-03', flId: 'fl-002',
    milestoneId: 'canvassing', milestoneName: 'Canvassing',
    items: [
      { itemId: 'cv-c1', completed: true },
      { itemId: 'cv-c2', completed: true, note: '5 prospek, tepat di target minimum' },
      { itemId: 'cv-c3', completed: true },
      { itemId: 'cv-c4', completed: false },
      { itemId: 'cv-c5', completed: true },
    ],
    status: 'scored', submittedAt: '2026-07-03T17:30:00',
    kanitScore: 75, kanitNote: 'Sudah mencapai target minimum. Tingkatkan jumlah prospek dan rutinkan follow up.', kanitScoredAt: '2026-07-03T18:00:00',
  },
  {
    id: 'cl-fl002-4', day: 4, date: '2026-07-04', flId: 'fl-002',
    milestoneId: 'pelayanan-dasar', milestoneName: 'Pelayanan Dasar',
    items: [
      { itemId: 'pd-c1', completed: true },
      { itemId: 'pd-c2', completed: false, note: 'Masih perlu latihan untuk identifikasi kebutuhan' },
      { itemId: 'pd-c3', completed: true }, { itemId: 'pd-c4', completed: true },
      { itemId: 'pd-c5', completed: false },
    ],
    status: 'scored', submittedAt: '2026-07-04T17:30:00',
    kanitScore: 70, kanitNote: 'Perlu berlatih identifikasi kebutuhan nasabah. Akan latih bersama besok.', kanitScoredAt: '2026-07-04T18:00:00',
  },
  {
    id: 'cl-fl002-5', day: 5, date: '2026-07-05', flId: 'fl-002',
    milestoneId: 'pelayanan-dasar', milestoneName: 'Pelayanan Dasar',
    items: [
      { itemId: 'pd-c1', completed: true }, { itemId: 'pd-c2', completed: true },
      { itemId: 'pd-c3', completed: true }, { itemId: 'pd-c4', completed: true },
      { itemId: 'pd-c5', completed: true, note: 'Nasabah tanya soal tarif, berhasil dijelaskan' },
    ],
    status: 'scored', submittedAt: '2026-07-05T17:00:00',
    kanitScore: 85, kanitNote: 'Ada peningkatan yang bagus! Penanganan pertanyaan nasabah semakin baik.', kanitScoredAt: '2026-07-05T17:30:00',
  },
  {
    id: 'cl-fl002-6', day: 6, date: '2026-07-06', flId: 'fl-002',
    milestoneId: 'opening-closing', milestoneName: 'Opening & Closing',
    items: [
      { itemId: 'oc-c1', completed: true }, { itemId: 'oc-c2', completed: true },
      { itemId: 'oc-c3', completed: true }, { itemId: 'oc-c4', completed: true },
      { itemId: 'oc-c5', completed: true }, { itemId: 'oc-c6', completed: true }, { itemId: 'oc-c7', completed: true },
    ],
    status: 'scored', submittedAt: '2026-07-06T17:00:00',
    kanitScore: 88, kanitNote: 'Opening closing sudah sangat baik dan konsisten. Bagus!', kanitScoredAt: '2026-07-06T17:20:00',
  },
]

const milestoneRotation = ['opening-closing', 'packing-sealing', 'canvassing', 'pelayanan-dasar', 'pelayanan-transaksi', 'penaksiran']
const milestoneNames = ['Opening & Closing', 'Packing & Sealing', 'Canvassing', 'Pelayanan Dasar', 'Pelayanan Transaksi', 'Penaksiran']
const fl003EarlyScores = [80, 85, 78, 82, 90, 88, 92]

const fl003Checklists: DailyChecklist[] = [
  // Days 1–7: old single-milestone format
  ...Array.from({ length: 7 }, (_, i) => {
    const day = i + 1
    const milestoneIdx = Math.min(Math.floor(i / 2.2), 5)
    const d = new Date('2026-06-24')
    d.setDate(d.getDate() + i)
    const date = d.toISOString().split('T')[0]
    return {
      id: `cl-fl003-${day}`, day, date, flId: 'fl-003',
      milestoneId: milestoneRotation[milestoneIdx],
      milestoneName: milestoneNames[milestoneIdx],
      items: [
        { itemId: 'oc-c1', completed: true },
        { itemId: 'oc-c2', completed: true },
        { itemId: 'oc-c3', completed: day > 2 },
      ],
      status: 'scored' as const,
      submittedAt: `${date}T17:00:00`,
      kanitScore: fl003EarlyScores[i],
      kanitNote: 'Progress baik, terus tingkatkan!',
      kanitScoredAt: `${date}T17:30:00`,
    }
  }),
  // Days 8–13: multi-task format
  {
    id: 'cl-fl003-8', day: 8, date: '2026-07-01', flId: 'fl-003',
    tasks: [
      { taskId: 'opening', taskName: 'Opening', completedItemIds: ['oc-c1', 'oc-c2', 'oc-c3', 'oc-c4'], reflection: 'Opening sudah sangat rutin. Tidak ada kendala, saldo awal langsung diverifikasi.', submittedAt: '2026-07-01T08:30:00' },
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-c1', 'cv-c2', 'cv-c3', 'cv-c4', 'cv-c5'], reflection: '5 prospek hari ini, 2 follow up dari kemarin. Salah satu prospek minta jadwal kunjungan ke cabang.', submittedAt: '2026-07-01T13:00:00' },
      { taskId: 'pelayanan-dasar', taskName: 'Pelayanan Nasabah', completedItemIds: ['pd-c1', 'pd-c2', 'pd-c3', 'pd-c4', 'pd-c5'], reflection: 'Ada komplain soal antrian, berhasil diselesaikan dengan meminta nasabah menunggu di ruang nyaman.', submittedAt: '2026-07-01T16:00:00' },
      { taskId: 'penaksiran-elektronik', taskName: 'Penaksiran Elektronik', completedItemIds: ['pn-c1', 'pn-c2', 'pn-c3', 'pn-c4', 'pn-c5'], reflection: 'Taksir 2 item emas. Akurasi 92%, sudah konsisten di atas target.', submittedAt: '2026-07-01T16:30:00' },
      { taskId: 'closing', taskName: 'Closing', completedItemIds: ['oc-c5', 'oc-c6', 'oc-c7'], reflection: 'Rekap dan laporan selesai tepat waktu. Tidak ada selisih kas.', submittedAt: '2026-07-01T17:00:00' },
    ],
    status: 'scored', submittedAt: '2026-07-01T17:00:00',
    kanitScore: 85, kanitNote: 'Sudah sangat konsisten di hari ke-8. Pertahankan ritme ini.', kanitScoredAt: '2026-07-01T17:30:00',
  },
  {
    id: 'cl-fl003-9', day: 9, date: '2026-07-02', flId: 'fl-003',
    tasks: [
      { taskId: 'opening', taskName: 'Opening', completedItemIds: ['oc-c1', 'oc-c2', 'oc-c3', 'oc-c4'], reflection: 'Opening sesuai SOP. Ditemukan printer macet, langsung lapor dan ditangani teknisi.', submittedAt: '2026-07-02T08:30:00' },
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-c1', 'cv-c2', 'cv-c3', 'cv-c4', 'cv-c5'], reflection: '6 prospek hari ini. Prospek yang kemarin dikonfirmasi jadi datang ke cabang.', submittedAt: '2026-07-02T13:00:00' },
      { taskId: 'pelayanan-dasar', taskName: 'Pelayanan Nasabah', completedItemIds: ['pd-c1', 'pd-c2', 'pd-c3', 'pd-c4', 'pd-c5'], reflection: 'Pelayanan lancar. Tidak ada komplain besar. Nasabah baru berhasil dilayani dari awal hingga selesai transaksi.', submittedAt: '2026-07-02T16:00:00' },
      { taskId: 'penaksiran-elektronik', taskName: 'Penaksiran Elektronik', completedItemIds: ['pn-c1', 'pn-c2', 'pn-c3', 'pn-c4', 'pn-c5'], reflection: 'Taksir 3 item: 2 emas dan 1 perhiasan. Rata-rata akurasi 94%, yang terbaik sejauh ini.', submittedAt: '2026-07-02T16:30:00' },
      { taskId: 'closing', taskName: 'Closing', completedItemIds: ['oc-c5', 'oc-c6', 'oc-c7'], reflection: 'Rekap selesai. Ada 1 transaksi tebus yang perlu dicek ulang tapi sudah beres.', submittedAt: '2026-07-02T17:00:00' },
    ],
    status: 'scored', submittedAt: '2026-07-02T17:00:00',
    kanitScore: 88, kanitNote: 'Penaksiran meningkat signifikan! Akurasi dan kecepatan sudah bagus.', kanitScoredAt: '2026-07-02T17:30:00',
  },
  {
    id: 'cl-fl003-10', day: 10, date: '2026-07-03', flId: 'fl-003',
    tasks: [
      { taskId: 'opening', taskName: 'Opening', completedItemIds: ['oc-c1', 'oc-c2', 'oc-c3', 'oc-c4'], reflection: 'Semua berjalan normal. Saldo awal sesuai.', submittedAt: '2026-07-03T08:30:00' },
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-c1', 'cv-c2', 'cv-c3', 'cv-c4', 'cv-c5'], reflection: '7 prospek hari ini — rekor terbanyak. Follow up 3 dari kemarin, 2 berminat minggu depan.', submittedAt: '2026-07-03T13:00:00' },
      { taskId: 'pelayanan-dasar', taskName: 'Pelayanan Nasabah', completedItemIds: ['pd-c1', 'pd-c2', 'pd-c3', 'pd-c4', 'pd-c5'], reflection: 'Nasabah lama kembali gadai, senang bisa melayani dengan cepat karena sudah kenal prosedurnya.', submittedAt: '2026-07-03T16:00:00' },
      { taskId: 'penaksiran-elektronik', taskName: 'Penaksiran Elektronik', completedItemIds: ['pn-c1', 'pn-c2', 'pn-c3', 'pn-c4', 'pn-c5'], reflection: 'Taksir 4 item hari ini. Salah satu item jam tangan, pertama kali — akurasi 89%, perlu latihan lebih.', submittedAt: '2026-07-03T16:30:00' },
      { taskId: 'closing', taskName: 'Closing', completedItemIds: ['oc-c5', 'oc-c6', 'oc-c7'], reflection: 'Rekap selesai tepat waktu. Tidak ada selisih.', submittedAt: '2026-07-03T17:00:00' },
    ],
    status: 'scored', submittedAt: '2026-07-03T17:00:00',
    kanitScore: 90, kanitNote: 'Canvassing terus meningkat. Penaksiran item non-emas perlu lebih dilatih.', kanitScoredAt: '2026-07-03T17:30:00',
  },
  {
    id: 'cl-fl003-11', day: 11, date: '2026-07-04', flId: 'fl-003',
    tasks: [
      { taskId: 'opening', taskName: 'Opening', completedItemIds: ['oc-c1', 'oc-c2', 'oc-c3', 'oc-c4'], reflection: 'Opening lancar, semua sistem normal.', submittedAt: '2026-07-04T08:30:00' },
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-c1', 'cv-c2', 'cv-c3', 'cv-c4', 'cv-c5'], reflection: '5 prospek hari ini. Fokus di follow up — 3 dari kemarin sudah dijawab, 1 berencana datang akhir pekan.', submittedAt: '2026-07-04T13:00:00' },
      { taskId: 'pelayanan-dasar', taskName: 'Pelayanan Nasabah', completedItemIds: ['pd-c1', 'pd-c2', 'pd-c3', 'pd-c4', 'pd-c5'], reflection: 'Pelayanan berjalan baik. Berhasil jelaskan produk perpanjangan kepada 2 nasabah yang baru pertama kali.', submittedAt: '2026-07-04T16:00:00' },
      { taskId: 'penaksiran-elektronik', taskName: 'Penaksiran Elektronik', completedItemIds: ['pn-c1', 'pn-c2', 'pn-c3', 'pn-c4', 'pn-c5'], reflection: 'Taksir 3 item emas dan 1 jam tangan. Akurasi jam tangan meningkat ke 91% — sudah di atas target!', submittedAt: '2026-07-04T16:30:00' },
      { taskId: 'closing', taskName: 'Closing', completedItemIds: ['oc-c5', 'oc-c6', 'oc-c7'], reflection: 'Rekap dan laporan selesai. Semua dokumen diamankan.', submittedAt: '2026-07-04T17:00:00' },
    ],
    status: 'scored', submittedAt: '2026-07-04T17:00:00',
    kanitScore: 85, kanitNote: 'Progress penaksiran non-emas terus membaik. Pertahankan follow up canvassing!', kanitScoredAt: '2026-07-04T17:30:00',
  },
  {
    id: 'cl-fl003-12', day: 12, date: '2026-07-05', flId: 'fl-003',
    tasks: [
      { taskId: 'opening', taskName: 'Opening', completedItemIds: ['oc-c1', 'oc-c2', 'oc-c3', 'oc-c4'], reflection: 'Opening sesuai SOP, tidak ada kendala.', submittedAt: '2026-07-05T08:30:00' },
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-c1', 'cv-c2', 'cv-c3', 'cv-c4', 'cv-c5'], reflection: '6 prospek baru dan follow up 2. Prospek akhir pekan kemarin jadi datang hari ini dan langsung transaksi!', submittedAt: '2026-07-05T13:00:00' },
      { taskId: 'pelayanan-dasar', taskName: 'Pelayanan Nasabah', completedItemIds: ['pd-c1', 'pd-c2', 'pd-c3', 'pd-c4', 'pd-c5'], reflection: 'Ramai hari ini, tapi berhasil tangani semua nasabah dengan baik. Tidak ada keluhan.', submittedAt: '2026-07-05T16:00:00' },
      { taskId: 'penaksiran-elektronik', taskName: 'Penaksiran Elektronik', completedItemIds: ['pn-c1', 'pn-c2', 'pn-c3', 'pn-c4', 'pn-c5'], reflection: 'Taksir 5 item hari ini — terbanyak selama OJT. Rata-rata akurasi 93%.', submittedAt: '2026-07-05T16:30:00' },
      { taskId: 'closing', taskName: 'Closing', completedItemIds: ['oc-c5', 'oc-c6', 'oc-c7'], reflection: 'Rekap lebih lama karena transaksi banyak, tapi selesai tepat waktu.', submittedAt: '2026-07-05T17:00:00' },
    ],
    status: 'scored', submittedAt: '2026-07-05T17:00:00',
    kanitScore: 87, kanitNote: 'Canvassing menghasilkan konversi nyata! Penaksiran konsisten. Closing perlu sedikit lebih cepat.', kanitScoredAt: '2026-07-05T17:30:00',
  },
  {
    id: 'cl-fl003-13', day: 13, date: '2026-07-06', flId: 'fl-003',
    tasks: [
      { taskId: 'opening', taskName: 'Opening', completedItemIds: ['oc-c1', 'oc-c2', 'oc-c3', 'oc-c4'], reflection: 'Opening sempurna, semua item selesai sebelum jam buka.', submittedAt: '2026-07-06T08:30:00' },
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-c1', 'cv-c2', 'cv-c3', 'cv-c4', 'cv-c5'], reflection: '8 prospek hari ini — terbanyak selama OJT. Semangat tinggi karena besok hari terakhir.', submittedAt: '2026-07-06T13:00:00' },
      { taskId: 'pelayanan-dasar', taskName: 'Pelayanan Nasabah', completedItemIds: ['pd-c1', 'pd-c2', 'pd-c3', 'pd-c4', 'pd-c5'], reflection: 'Melayani dengan percaya diri. Sudah bisa handle 2 nasabah sekaligus di jam sibuk.', submittedAt: '2026-07-06T16:00:00' },
      { taskId: 'penaksiran-elektronik', taskName: 'Penaksiran Elektronik', completedItemIds: ['pn-c1', 'pn-c2', 'pn-c3', 'pn-c4', 'pn-c5'], reflection: 'Taksir 4 item (3 emas, 1 elektronik). Akurasi rata-rata 95% — pencapaian terbaik selama OJT!', submittedAt: '2026-07-06T16:30:00' },
      { taskId: 'closing', taskName: 'Closing', completedItemIds: ['oc-c5', 'oc-c6', 'oc-c7'], reflection: 'Rekap selesai 15 menit lebih cepat dari biasanya. Semua aman dan terdokumentasi.', submittedAt: '2026-07-06T17:00:00' },
    ],
    status: 'scored', submittedAt: '2026-07-06T17:00:00',
    kanitScore: 91, kanitNote: 'Milestone lanjutan sudah bagus! Konsistensi meningkat di semua aspek.', kanitScoredAt: '2026-07-06T17:30:00',
  },
]

const pendingChecklists: DailyChecklist[] = [
  {
    id: 'cl-fl003-14', day: 14, date: '2026-07-13', flId: 'fl-003',
    tasks: [
      { taskId: 'opening', taskName: 'Opening', completedItemIds: ['oc-c1', 'oc-c2', 'oc-c3'], reflection: 'Opening hari terakhir lancar. Semua prosedur sudah hafal tanpa perlu cek panduan.', submittedAt: '2026-07-13T08:15:00' },
      { taskId: 'pelayanan-dasar', taskName: 'Pelayanan Nasabah', completedItemIds: ['pd-c1', 'pd-c2', 'pd-c3'], reflection: 'Pelayanan berjalan sangat baik. Sudah bisa handle nasabah komplain dengan tenang dan solutif.', submittedAt: '2026-07-13T16:00:00' },
      { taskId: 'closing', taskName: 'Closing', completedItemIds: ['oc-c5', 'oc-c6'], reflection: 'Closing tepat waktu dan rekap kas sesuai. Siap menghadapi assessment besok.', submittedAt: '2026-07-13T17:00:00' },
    ],
    status: 'submitted', submittedAt: '2026-07-13T17:00:00',
  },
  {
    id: 'cl-fl002-7', day: 7, date: '2026-07-07', flId: 'fl-002',
    tasks: [
      { taskId: 'opening', taskName: 'Opening', completedItemIds: ['oc-c1', 'oc-c2', 'oc-c3'], reflection: 'Opening OK, tapi sistem sempat lambat loading ~5 menit. Akhirnya bisa masuk dan saldo diverifikasi.', submittedAt: '2026-07-07T08:45:00' },
      { taskId: 'pelayanan-dasar', taskName: 'Pelayanan Nasabah', completedItemIds: ['pd-c1', 'pd-c2', 'pd-c3', 'pd-c4'], reflection: 'Pelayanan berjalan baik. Belum ada situasi komplain hari ini, tapi sudah siap jika ada.', submittedAt: '2026-07-07T16:00:00' },
      { taskId: 'closing', taskName: 'Closing', completedItemIds: ['oc-c5', 'oc-c6', 'oc-c7'], reflection: 'Closing selesai tepat waktu. Rekap kas sesuai, tidak ada selisih.', submittedAt: '2026-07-07T17:00:00' },
    ],
    status: 'submitted', submittedAt: '2026-07-07T17:00:00',
  },
]

export const INITIAL_CHECKLISTS: DailyChecklist[] = [
  ...fl001Checklists,
  ...fl002Checklists,
  ...fl003Checklists,
  ...pendingChecklists,
]

export const INITIAL_PENAKSIRAN: PenaksiranRecord[] = [
  {
    id: 'pk-fl003-1', day: 10, date: '2026-07-03', flId: 'fl-003',
    barangType: 'Emas', barangDescription: 'Emas 24K — kalung 10 gram',
    flEstimate: 9200000, intoolsValue: 9350000, accuracy: 98.4,
    kanitScore: 95, kanitNote: 'Sangat akurat! Selisih hanya 1.6%', kanitScoredAt: '2026-07-03T18:00:00',
  },
  {
    id: 'pk-fl003-2', day: 11, date: '2026-07-04', flId: 'fl-003',
    barangType: 'Emas', barangDescription: 'Emas 18K — cincin 5 gram',
    flEstimate: 3800000, intoolsValue: 3950000, accuracy: 96.2,
    kanitScore: 88, kanitNote: 'Akurasi baik. Perhatikan konversi kadar 18K.', kanitScoredAt: '2026-07-04T18:00:00',
  },
  {
    id: 'pk-fl003-3', day: 12, date: '2026-07-05', flId: 'fl-003',
    barangType: 'Elektronik', barangDescription: 'iPhone 13 Pro 256GB second',
    flEstimate: 8500000, intoolsValue: 8200000, accuracy: 96.3,
    kanitScore: 85, kanitNote: 'Sedikit overestimate untuk HP second. Perhatikan kondisi dan kelengkapan.', kanitScoredAt: '2026-07-05T18:00:00',
  },
  {
    id: 'pk-fl003-4', day: 13, date: '2026-07-06', flId: 'fl-003',
    barangType: 'Emas', barangDescription: 'Emas 24K — gelang 8 gram',
    flEstimate: 7500000, intoolsValue: 7480000, accuracy: 99.7,
    kanitScore: 98, kanitNote: 'Hampir sempurna! Penaksiran yang sangat presisi.', kanitScoredAt: '2026-07-06T18:00:00',
  },
]

export const INITIAL_ASSESSMENTS: Assessment[] = []

export const ASSESSMENT_QUESTIONS = [
  { id: 'q1', question: 'Jelaskan langkah-langkah prosedur opening kantor yang benar!' },
  { id: 'q2', question: 'Apa yang harus dilakukan jika terdapat selisih pada rekap kas harian?' },
  { id: 'q3', question: 'Bagaimana cara menentukan nilai taksiran emas 24K seberat 5 gram, jika harga emas hari ini Rp 1.000.000/gram?' },
  { id: 'q4', question: 'Jelaskan alur transaksi gadai baru dari awal hingga nasabah menerima uang!' },
  { id: 'q5', question: 'Apa saja yang harus tertulis pada label barang gadai?' },
  { id: 'q6', question: 'Bagaimana cara menangani nasabah yang komplain dengan tepat?' },
  { id: 'q7', question: 'Sebutkan minimal 5 langkah canvassing yang efektif!' },
]

export const MASTERY_MATERIALS = [
  { materialId: 'oc', material: 'SOP Opening & Closing Kantor' },
  { materialId: 'ps', material: 'Standar Packing & Sealing Barang Gadai' },
  { materialId: 'cv', material: 'Teknik dan Script Canvassing' },
  { materialId: 'pd', material: 'Standar Pelayanan dan Penanganan Komplain' },
  { materialId: 'pt', material: 'Alur Transaksi Gadai, Tebus, dan Perpanjangan' },
  { materialId: 'pn', material: 'Teknik Penaksiran dan Penggunaan Intools' },
]
