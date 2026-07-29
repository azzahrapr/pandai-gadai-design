import type { Milestone, DailyChecklist, PenaksiranRecord, Assessment, AppUser, TaskConfirmation, FLNotification } from '../types'

export interface DailyTaskDef {
  id: string
  name: string
  items: { id: string; text: string }[]
}

export const DAILY_TASKS: DailyTaskDef[] = [
  {
    id: 'closing-cabang',
    name: 'SOP Closing Cabang',
    items: [
      { id: 'cc-1', text: 'Pengecekan uang tunai dan saldo Kopra dengan nominal pada sistem Intools' },
      { id: 'cc-2', text: 'Pengecekan Tab Action – Intools, print resi Perpanjangan/Tebus Online' },
      { id: 'cc-3', text: 'Penempelan resi Perpanjangan/Tebus Online ke barang dan pemisahan barang tebus online' },
      { id: 'cc-4', text: 'Pelaporan Closing Cash Opname' },
      { id: 'cc-5', text: 'Pengecekan jumlah unit aktif di gudang dengan data inventory Intools' },
      { id: 'cc-6', text: 'Pelaporan Stock Opname Intools' },
      { id: 'cc-7', text: 'Perapihan kas dan elektronik/laptop/HP cabang ke storage' },
      { id: 'cc-8', text: 'Pelaksanaan dan pelaporan Serah Terima Kunci Cabang' },
    ],
  },
  {
    id: 'opening-cabang',
    name: 'SOP Opening Cabang',
    items: [
      { id: 'op-1', text: 'Tiba 30 menit sebelum opening cabang' },
      { id: 'op-2', text: 'Absensi via Talenta' },
      { id: 'op-3', text: 'Persiapan laptop, printer, dan peralatan lainnya di area penaksiran' },
      { id: 'op-4', text: 'Pengecekan uang tunai dan saldo Kopra dengan nominal pada sistem Intools' },
      { id: 'op-5', text: 'Memastikan uang tunai tidak lebih dari Rp 15 juta dan tidak kurang dari Rp 7,5 juta' },
      { id: 'op-6', text: 'Pengecekan Tab Action – Intools, print resi Perpanjangan/Tebus Online' },
      { id: 'op-7', text: 'Penempelan resi Perpanjangan/Tebus Online ke barang dan pemisahan barang tebus online' },
      { id: 'op-8', text: 'Pembersihan area penaksiran' },
      { id: 'op-9', text: 'Pelaporan Opening Cash Opname' },
      { id: 'op-10', text: 'Pengecekan jumlah unit aktif di gudang dengan data inventory Intools' },
      { id: 'op-11', text: 'Pemisahan unit tebus online dan default' },
      { id: 'op-12', text: 'Pelaporan Stock Opname Intools' },
      { id: 'op-13', text: 'Pembersihan area penyimpanan' },
      { id: 'op-14', text: 'Pembersihan area nasabah' },
      { id: 'op-15', text: 'Morning Briefing' },
    ],
  },
  {
    id: 'personal-grooming',
    name: 'Personal Grooming',
    items: [
      { id: 'pg-1', text: 'Seragam rapih dan bersih' },
      { id: 'pg-2', text: 'Tata rias (wajah dan rambut) sesuai standar' },
      { id: 'pg-3', text: 'Sepatu hitam tertutup' },
      { id: 'pg-4', text: 'Aroma tubuh bersih (tidak bau badan)' },
    ],
  },
  {
    id: 'pengenalan-produk',
    name: 'Pengenalan Produk & Pricing',
    items: [
      { id: 'pp-1', text: 'Menjelaskan biaya dan masa gadai Elektronik (Biaya Jasa, Admin, Asuransi, Masa Gadai, Denda)' },
      { id: 'pp-2', text: 'Menjelaskan jenis transaksi dan pengertiannya (Gadai Baru, Perpanjangan, Cicil, Tebus)' },
      { id: 'pp-3', text: 'Menjelaskan biaya dan masa gadai BPKB Instant' },
    ],
  },
  {
    id: 'canvassing',
    name: 'Canvassing',
    items: [
      { id: 'cv-1', text: 'Pelaksanaan canvassing: penjelasan Pandai Gadai kepada calon nasabah' },
      { id: 'cv-2', text: 'Penggunaan Avenza untuk pelaporan canvassing' },
    ],
  },
  {
    id: 'cash-management',
    name: 'Cash Management',
    items: [
      { id: 'cm-1', text: 'Administratif Tarik-Setor Tunai (input laporan di sistem)' },
      { id: 'cm-2', text: 'Administratif Penggunaan Kas Kecil (input pengeluaran di cash management)' },
      { id: 'cm-3', text: 'Administratif Uang Kelebihan Nasabah (arahkan nasabah cek dan input di cash management)' },
    ],
  },
  {
    id: 'sop-administrasi',
    name: 'SOP Administrasi Gadai',
    items: [
      { id: 'sa-1', text: 'Administratif Transaksi Gadai Baru Elektronik (Intools + Kopra)' },
      { id: 'sa-2', text: 'Administratif Perpanjangan &/ Cicil Elektronik (Intools + Kopra)' },
      { id: 'sa-3', text: 'Administratif Transaksi Tebus Elektronik (Intools + Kopra)' },
      { id: 'sa-4', text: 'Administratif Transaksi Gadai Baru BPKB Instant (Intools + Kopra)' },
      { id: 'sa-5', text: 'Administratif Transaksi Perpanjangan BPKB Instant (Intools + Kopra)' },
      { id: 'sa-6', text: 'Administratif Transaksi Tebus BPKB Instant (Intools + Kopra)' },
    ],
  },
  {
    id: 'packing-sealing',
    name: 'Praktik Packing & Penyimpanan',
    items: [
      { id: 'ps-1', text: 'Packing dan penyimpanan HP dengan box' },
      { id: 'ps-2', text: 'Packing dan penyimpanan HP tanpa box' },
      { id: 'ps-3', text: 'Packing dan penyimpanan Laptop dengan box' },
      { id: 'ps-4', text: 'Packing dan penyimpanan Laptop tanpa box' },
      { id: 'ps-5', text: 'Packing dan penyimpanan TV dengan box' },
      { id: 'ps-6', text: 'Packing dan penyimpanan Game Console' },
      { id: 'ps-7', text: 'Packing dan penyimpanan Smartwatch' },
      { id: 'ps-8', text: 'Packing dan penyimpanan Camera' },
      { id: 'ps-9', text: 'Packing dan penyimpanan BPKB' },
    ],
  },
  {
    id: 'offloading',
    name: 'Offloading',
    items: [
      { id: 'of-1', text: 'Melakukan packing item offload sesuai prosedur' },
    ],
  },
  {
    id: 'pelayanan-nasabah',
    name: 'Pelayanan Nasabah Visit',
    items: [
      { id: 'pn-1', text: 'Sigap berdiri menyambut nasabah (postur siap melayani)' },
      { id: 'pn-2', text: 'Mengucapkan salam sambutan dengan nada antusias' },
      { id: 'pn-3', text: 'Mempersilahkan nasabah duduk dengan intonasi ramah' },
      { id: 'pn-4', text: 'Memperkenalkan diri dan menanyakan keperluan nasabah' },
      { id: 'pn-5', text: 'Memberikan estimasi waktu menunggu' },
      { id: 'pn-6', text: 'Menjelaskan tahapan selanjutnya kepada nasabah' },
      { id: 'pn-7', text: 'Mengajak interaksi nasabah di waktu tunggu' },
      { id: 'pn-8', text: 'Mengucapkan terima kasih atas kunjungan/transaksi' },
      { id: 'pn-9', text: 'Menjelaskan SBG dan Resi kepada nasabah' },
      { id: 'pn-10', text: 'Edukasi Aplikasi Pandai Gadai' },
      { id: 'pn-11', text: 'Edukasi Saldo Pandai' },
      { id: 'pn-12', text: 'Edukasi Poin Pandai' },
    ],
  },
  {
    id: 'customer-service-wa',
    name: 'Customer Service via WA',
    items: [
      { id: 'csw-1', text: 'Reminder jatuh tempo dan penawaran perpanjangan kepada nasabah' },
      { id: 'csw-2', text: 'Menjawab pertanyaan / request / komplain nasabah via WA' },
    ],
  },
  {
    id: 'penaksiran-elektronik',
    name: 'Penaksiran Elektronik',
    items: [
      { id: 'pe-1', text: 'Handphone – Android' },
      { id: 'pe-2', text: 'Tablet' },
      { id: 'pe-3', text: 'Handphone – iPhone' },
      { id: 'pe-4', text: 'iPad' },
      { id: 'pe-5', text: 'Laptop Windows' },
      { id: 'pe-6', text: 'Laptop Chromebook' },
      { id: 'pe-7', text: 'Laptop MacBook' },
      { id: 'pe-8', text: 'Game Console – PlayStation / Xbox' },
      { id: 'pe-9', text: 'Game Console – Nintendo' },
      { id: 'pe-10', text: 'Smartwatch' },
      { id: 'pe-11', text: 'Camera' },
    ],
  },
  {
    id: 'penaksiran-emas',
    name: 'Penaksiran Emas LM Press',
    items: [
      { id: 'pem-1', text: 'Penaksiran LM Press sesuai prosedur standar' },
    ],
  },
  {
    id: 'penaksiran-bpkb',
    name: 'Penaksiran BPKB',
    items: [
      { id: 'pbk-1', text: 'Penaksiran BPKB Instant sesuai prosedur standar' },
    ],
  },
]

export const MILESTONES: Milestone[] = [
  {
    id: 'closing-cabang',
    name: 'SOP Closing Cabang',
    shortName: 'Closing Cabang',
    type: 'minggu1',
    order: 1,
    description: 'Prosedur penutupan cabang harian sesuai SOP operasional',
    unlockDay: 1,
    estimatedMinutes: 30,
    materials: [
      {
        id: 'cc-m1',
        title: 'Alur SOP Closing Cabang',
        content: `## SOP Closing Cabang\n\n### Langkah-langkah:\n1. **Pengecekan Kas & Kopra** — Cocokan uang tunai fisik + saldo Kopra dengan nominal di Intools\n2. **Tab Action Intools** — Cek Tab Action, print resi Perpanjangan/Tebus Online\n3. **Penempelan Resi** — Tempel resi ke barang, pisahkan barang tebus online\n4. **Closing Cash Opname** — Laporkan closing di sistem\n5. **Pengecekan Unit Gudang** — Verifikasi jumlah unit aktif vs data inventory Intools\n6. **Stock Opname** — Laporkan Stock Opname di Intools\n7. **Perapihan Barang** — Simpan kas dan elektronik/laptop/HP cabang ke storage\n8. **Serah Terima Kunci** — Laksanakan dan laporkan serah terima kunci cabang`,
        slideUrl: 'https://docs.google.com/presentation/d/1VOTzFrxzbV7VbS-IzzIMuWPk-6edIe2FL5BaDSl74sc/embed',
      },
      {
        id: 'cc-m2',
        title: 'Cash Opname & Stock Opname',
        content: `## Cash Opname & Stock Opname saat Closing\n\n### Cash Opname:\n- Hitung uang fisik di laci kas\n- Cocokan dengan saldo Kopra dan data di Intools\n- Laporkan via sistem — jangan ada selisih yang tidak terdokumentasi\n\n### Stock Opname:\n- Hitung semua unit barang aktif di gudang\n- Cocokan dengan data inventory di Intools\n- Pisahkan barang yang statusnya Tebus Online\n- Laporkan hasilnya di Intools sebelum meninggalkan cabang`,
      },
    ],
    checklistItems: [
      { id: 'cc-1', text: 'Pengecekan uang tunai dan saldo Kopra dengan nominal pada sistem Intools', category: 'Kas' },
      { id: 'cc-2', text: 'Pengecekan Tab Action – Intools, print resi Perpanjangan/Tebus Online', category: 'Intools' },
      { id: 'cc-3', text: 'Penempelan resi Perpanjangan/Tebus Online ke barang dan pemisahan barang tebus online', category: 'Gudang' },
      { id: 'cc-4', text: 'Pelaporan Closing Cash Opname', category: 'Pelaporan' },
      { id: 'cc-5', text: 'Pengecekan jumlah unit aktif di gudang dengan data inventory Intools', category: 'Gudang' },
      { id: 'cc-6', text: 'Pelaporan Stock Opname Intools', category: 'Pelaporan' },
      { id: 'cc-7', text: 'Perapihan kas dan elektronik/laptop/HP cabang ke storage', category: 'Keamanan' },
      { id: 'cc-8', text: 'Pelaksanaan dan pelaporan Serah Terima Kunci Cabang', category: 'Keamanan' },
    ],
  },
  {
    id: 'opening-cabang',
    name: 'SOP Opening Cabang',
    shortName: 'Opening Cabang',
    type: 'minggu1',
    order: 2,
    description: 'Prosedur pembukaan cabang harian sesuai SOP operasional',
    unlockDay: 4,
    estimatedMinutes: 30,
    materials: [
      {
        id: 'op-m1',
        title: 'Alur SOP Opening Cabang',
        content: `## SOP Opening Cabang\n\n### Langkah-langkah:\n1. **Tiba tepat waktu** — Hadir 30 menit sebelum opening, absensi via Talenta\n2. **Persiapan peralatan** — Siapkan laptop, printer, dan alat di area penaksiran\n3. **Pengecekan Kas** — Cocokan uang tunai + saldo Kopra dengan Intools\n4. **Batas kas** — Pastikan uang tunai tidak lebih Rp 15 juta dan tidak kurang Rp 7,5 juta\n5. **Tab Action Intools** — Cek, print, dan tempel resi Perpanjangan/Tebus Online\n6. **Pembersihan area** — Bersihkan area penaksiran\n7. **Cash Opname** — Laporkan Opening Cash Opname\n8. **Stock Opname** — Cek unit gudang vs inventory Intools, pisahkan tebus online & default\n9. **Kebersihan** — Bersihkan area penyimpanan dan area nasabah\n10. **Morning Briefing** — Ikuti briefing pagi`,
        slideUrl: 'https://docs.google.com/presentation/d/1VOTzFrxzbV7VbS-IzzIMuWPk-6edIe2FL5BaDSl74sc/embed',
      },
      {
        id: 'op-m2',
        title: 'Limit Kas dan Absensi',
        content: `## Limit Kas Cabang\n\n### Ketentuan:\n- **Batas Atas:** Rp 15.000.000 — jika lebih, setor ke bank\n- **Batas Bawah:** Rp 7.500.000 — jika kurang, tarik dana dari bank\n- Cek setiap hari saat opening dan closing\n\n### Prosedur jika di luar batas:\n1. Laporkan ke Kanit segera\n2. Proses tarik/setor sesuai SOP Cash Management\n3. Catat transaksi di sistem\n\n## Absensi via Talenta\n- Absensi dilakukan segera setelah tiba\n- Pastikan GPS aktif saat check-in\n- Jangan lupa check-out saat closing`,
      },
    ],
    checklistItems: [
      { id: 'op-1', text: 'Tiba 30 menit sebelum opening cabang', category: 'Kehadiran' },
      { id: 'op-2', text: 'Absensi via Talenta', category: 'Kehadiran' },
      { id: 'op-3', text: 'Persiapan laptop, printer, dan peralatan lainnya di area penaksiran', category: 'Persiapan' },
      { id: 'op-4', text: 'Pengecekan uang tunai dan saldo Kopra dengan nominal pada sistem Intools', category: 'Kas' },
      { id: 'op-5', text: 'Memastikan uang tunai tidak lebih dari Rp 15 juta dan tidak kurang dari Rp 7,5 juta', category: 'Kas' },
      { id: 'op-6', text: 'Pengecekan Tab Action – Intools, print resi Perpanjangan/Tebus Online', category: 'Intools' },
      { id: 'op-7', text: 'Penempelan resi Perpanjangan/Tebus Online ke barang dan pemisahan barang tebus online', category: 'Gudang' },
      { id: 'op-8', text: 'Pembersihan area penaksiran', category: 'Kebersihan' },
      { id: 'op-9', text: 'Pelaporan Opening Cash Opname', category: 'Pelaporan' },
      { id: 'op-10', text: 'Pengecekan jumlah unit aktif di gudang dengan data inventory Intools', category: 'Gudang' },
      { id: 'op-11', text: 'Pemisahan unit tebus online dan default', category: 'Gudang' },
      { id: 'op-12', text: 'Pelaporan Stock Opname Intools', category: 'Pelaporan' },
      { id: 'op-13', text: 'Pembersihan area penyimpanan', category: 'Kebersihan' },
      { id: 'op-14', text: 'Pembersihan area nasabah', category: 'Kebersihan' },
      { id: 'op-15', text: 'Morning Briefing', category: 'Briefing' },
    ],
  },
  {
    id: 'personal-grooming',
    name: 'Personal Grooming',
    shortName: 'Grooming',
    type: 'minggu1',
    order: 3,
    description: 'Standar penampilan Frontliner: seragam, tata rias, aroma tubuh',
    unlockDay: 1,
    estimatedMinutes: 15,
    materials: [
      {
        id: 'pg-m1',
        title: 'Standar Penampilan Frontliner',
        content: `## Standar Personal Grooming\n\n### Komponen Wajib:\n- **Seragam** — Rapih, bersih, tidak kusut atau bernoda\n- **Tata Rias** — Wajah dan rambut sesuai standar perusahaan\n- **Sepatu** — Hitam, tertutup, bersih\n- **Aroma** — Bersih, tidak bau badan\n\n### Tips Menjaga Standar:\n1. Siapkan seragam malam sebelumnya agar tidak terburu-buru\n2. Pastikan sepatu bersih sebelum berangkat\n3. Bawa perlengkapan grooming cadangan di tas\n4. Cek penampilan di cermin sebelum membuka cabang`,
      },
    ],
    checklistItems: [
      { id: 'pg-1', text: 'Seragam rapih dan bersih', category: 'Penampilan' },
      { id: 'pg-2', text: 'Tata rias (wajah dan rambut) sesuai standar', category: 'Penampilan' },
      { id: 'pg-3', text: 'Sepatu hitam tertutup', category: 'Penampilan' },
      { id: 'pg-4', text: 'Aroma tubuh bersih (tidak bau badan)', category: 'Penampilan' },
    ],
  },
  {
    id: 'pengenalan-produk',
    name: 'Pengenalan Produk & Pricing',
    shortName: 'Produk & Pricing',
    type: 'minggu1',
    order: 4,
    description: 'Kemampuan menjelaskan produk gadai, biaya, dan jenis transaksi kepada nasabah',
    unlockDay: 2,
    estimatedMinutes: 30,
    materials: [
      {
        id: 'pp-m1',
        title: 'Produk Gadai Elektronik',
        content: `## Produk Gadai Elektronik\n\n### Komponen Biaya:\n- **Biaya Jasa** — Bunga gadai per periode\n- **Biaya Admin** — Biaya administrasi awal\n- **Asuransi** — Perlindungan barang selama masa gadai\n- **Masa Gadai** — Durasi standar gadai elektronik\n- **Denda** — Biaya keterlambatan setelah jatuh tempo\n\n### Jenis Transaksi:\n1. **Gadai Baru** — Nasabah menggadaikan barang pertama kali\n2. **Perpanjangan** — Memperpanjang masa gadai tanpa tebus\n3. **Cicil** — Membayar sebagian pokok untuk kurangi nilai gadai\n4. **Tebus** — Melunasi pinjaman dan mengambil barang kembali`,
      },
      {
        id: 'pp-m2',
        title: 'Produk BPKB Instant',
        content: `## Produk BPKB Instant\n\n### Komponen Biaya BPKB Instant:\n- Biaya Jasa dihitung berbeda dari gadai elektronik\n- Masa gadai BPKB Instant sesuai ketentuan yang berlaku\n- Prosedur administrasi melibatkan Intools dan Kopra\n\n### Yang Perlu Disampaikan ke Nasabah:\n1. Syarat dokumen: BPKB asli + STNK aktif + KTP pemilik\n2. Proses verifikasi dokumen\n3. Estimasi nilai taksiran berdasarkan kendaraan\n4. Timeline pencairan dana`,
      },
    ],
    checklistItems: [
      { id: 'pp-1', text: 'Menjelaskan biaya dan masa gadai Elektronik (Biaya Jasa, Admin, Asuransi, Masa Gadai, Denda)', category: 'Produk' },
      { id: 'pp-2', text: 'Menjelaskan jenis transaksi dan pengertiannya (Gadai Baru, Perpanjangan, Cicil, Tebus)', category: 'Produk' },
      { id: 'pp-3', text: 'Menjelaskan biaya dan masa gadai BPKB Instant', category: 'Produk' },
    ],
  },
  {
    id: 'canvassing',
    name: 'Canvassing',
    shortName: 'Canvassing',
    type: 'minggu1',
    order: 5,
    description: 'Teknik canvassing aktif dan pelaporan menggunakan Avenza',
    unlockDay: 1,
    estimatedMinutes: 30,
    materials: [
      {
        id: 'cv-m1',
        title: 'Teknik Canvassing',
        content: `## Teknik Canvassing Pandai Gadai\n\nCanvassing adalah kegiatan aktif mendatangi calon nasabah untuk memperkenalkan produk gadai.\n\n### Langkah Canvassing Efektif:\n1. **Sapa** — Sapa ramah, perkenalkan diri dan Pandai Gadai\n2. **Tanya** — Identifikasi kebutuhan dana calon nasabah\n3. **Ceritakan** — Manfaat & keunggulan Pandai Gadai (cepat, aman, mudah)\n4. **Tawarkan** — Produk yang relevan (gadai elektronik, BPKB)\n5. **Tutup** — Ajak ke cabang atau catat kontak untuk follow up\n\n### Tips:\n- Tersenyum sepanjang percakapan\n- Nada percaya diri tapi tidak memaksa\n- Kenali area canvassing: pasar, pertokoan, perumahan`,
      },
      {
        id: 'cv-m2',
        title: 'Pelaporan via Avenza',
        content: `## Pelaporan Canvassing via Avenza\n\nAvenza adalah aplikasi peta yang digunakan untuk melaporkan aktivitas canvassing secara geolokasi.\n\n### Cara Penggunaan:\n1. Buka aplikasi Avenza di smartphone\n2. Aktifkan GPS sebelum mulai canvassing\n3. Tandai setiap titik canvassing yang dikunjungi\n4. Isi data calon nasabah di setiap titik\n5. Submit laporan setelah selesai canvassing\n\n### Yang Dicatat:\n- Nama dan kontak calon nasabah\n- Respons calon nasabah (tertarik/tidak/follow up)\n- Lokasi (otomatis tercatat via GPS)`,
      },
    ],
    checklistItems: [
      { id: 'cv-1', text: 'Pelaksanaan canvassing: penjelasan Pandai Gadai kepada calon nasabah', category: 'Eksekusi' },
      { id: 'cv-2', text: 'Penggunaan Avenza untuk pelaporan canvassing', category: 'Pelaporan' },
    ],
    quiz: [
      {
        id: 'cv-q1',
        question: 'Aplikasi apa yang digunakan untuk melaporkan aktivitas canvassing secara geolokasi?',
        options: ['Google Maps', 'Avenza', 'Intools', 'Talenta'],
        correctIndex: 1,
      },
      {
        id: 'cv-q2',
        question: 'Manakah urutan langkah canvassing yang benar?',
        options: [
          'Tawarkan → Tanya → Sapa → Ceritakan → Tutup',
          'Sapa → Tanya → Ceritakan → Tawarkan → Tutup',
          'Ceritakan → Sapa → Tawarkan → Tanya → Tutup',
          'Tanya → Sapa → Tawarkan → Ceritakan → Tutup',
        ],
        correctIndex: 1,
      },
      {
        id: 'cv-q3',
        question: 'Apa yang harus diaktifkan sebelum mulai canvassing saat menggunakan Avenza?',
        options: ['WiFi', 'Bluetooth', 'GPS', 'NFC'],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 'cash-management',
    name: 'Cash Management',
    shortName: 'Cash Mgmt',
    type: 'minggu1',
    order: 6,
    description: 'Administratif tarik-setor tunai, kas kecil, dan uang kelebihan nasabah',
    unlockDay: 1,
    estimatedMinutes: 30,
    materials: [
      {
        id: 'cm-m1',
        title: 'Tarik-Setor Tunai & Kas Kecil',
        content: `## Cash Management Cabang\n\n### Tarik-Setor Tunai:\n- Dilakukan saat saldo kas mendekati batas atas (Rp 15 juta) atau batas bawah (Rp 7,5 juta)\n- Input laporan tarik/setor di sistem setelah transaksi bank selesai\n- Lampirkan bukti transaksi bank\n\n### Kas Kecil:\n- Digunakan untuk pengeluaran operasional cabang (alat tulis, kebersihan, dll)\n- Setiap pengeluaran harus diinput di modul Cash Management\n- Simpan bukti/nota setiap pengeluaran\n\n### Uang Kelebihan Nasabah:\n- Jika nasabah membayar lebih dari yang seharusnya\n- Arahkan nasabah untuk cek kelebihan via aplikasi atau langsung di cabang\n- Input selisih kelebihan di modul Cash Management`,
      },
    ],
    submissionType: 'individual',
    checklistItems: [
      { id: 'cm-1', text: 'Administratif Tarik-Setor Tunai', category: 'Kas', description: 'Mampu menginput laporan tarik setor tunai di sistem.' },
      { id: 'cm-2', text: 'Administratif Penggunaan Kas Kecil', category: 'Kas Kecil', description: 'Mampu menginput pengeluaran kas kecil pada modul cash management.' },
      { id: 'cm-3', text: 'Administratif Uang Kelebihan Nasabah', category: 'Nasabah', description: 'Mampu mengarahkan nasabah dalam pengecekan uang kelebihan dan penginputannya pada cash management.' },
    ],
  },
  {
    id: 'sop-administrasi',
    name: 'SOP Administrasi Gadai',
    shortName: 'Administrasi',
    type: 'minggu1',
    order: 7,
    description: 'Prosedur administratif transaksi Gadai Baru, Perpanjangan, Cicil, dan Tebus untuk Elektronik dan BPKB via Intools dan Kopra',
    unlockDay: 1,
    estimatedMinutes: 45,
    materials: [
      {
        id: 'sa-m1',
        title: 'Transaksi Elektronik di Intools & Kopra',
        content: `## Administrasi Transaksi Elektronik\n\n### Gadai Baru Elektronik:\n1. Input data nasabah dan barang di Intools\n2. Proses pencairan di Kopra\n3. Cetak SBG dan berikan ke nasabah\n\n### Perpanjangan / Cicil Elektronik:\n1. Cari transaksi aktif nasabah di Intools\n2. Pilih opsi Perpanjangan atau Cicil\n3. Proses pembayaran di Kopra\n4. Update data dan cetak SBG baru\n\n### Tebus Elektronik:\n1. Cari transaksi aktif di Intools\n2. Hitung total pelunasan (pokok + biaya)\n3. Proses pembayaran di Kopra\n4. Cetak bukti tebus, serahkan barang ke nasabah`,
      },
      {
        id: 'sa-m2',
        title: 'Transaksi BPKB Instant di Intools & Kopra',
        content: `## Administrasi Transaksi BPKB Instant\n\n### Gadai Baru BPKB Instant:\n1. Verifikasi dokumen (BPKB, STNK, KTP)\n2. Input data kendaraan dan nasabah di Intools\n3. Proses pencairan di Kopra\n4. Cetak SBG dan berikan ke nasabah\n\n### Perpanjangan BPKB Instant:\n1. Cari transaksi BPKB aktif di Intools\n2. Proses perpanjangan dan pembayaran di Kopra\n3. Update data jatuh tempo, cetak SBG baru\n\n### Tebus BPKB Instant:\n1. Verifikasi identitas nasabah\n2. Proses pelunasan di Intools + Kopra\n3. Serahkan BPKB dan dokumen ke nasabah`,
      },
    ],
    submissionType: 'individual',
    checklistItems: [
      { id: 'sa-1', text: 'Gadai Baru Elektronik', category: 'Elektronik', description: 'Input data nasabah & barang di Intools, proses pencairan di Kopra, cetak SBG.', target: 2 },
      { id: 'sa-2', text: 'Perpanjangan / Cicil Elektronik', category: 'Elektronik', description: 'Cari transaksi aktif, pilih perpanjangan/cicil, proses di Kopra, cetak SBG baru.', target: 2 },
      { id: 'sa-3', text: 'Tebus Elektronik', category: 'Elektronik', description: 'Cari transaksi aktif, hitung total pelunasan, proses di Kopra, serahkan barang.', target: 2 },
      { id: 'sa-4', text: 'Gadai Baru BPKB Instant', category: 'BPKB', description: 'Verifikasi dokumen (BPKB, STNK, KTP), input di Intools, proses pencairan di Kopra.', target: 2 },
      { id: 'sa-5', text: 'Perpanjangan BPKB Instant', category: 'BPKB', description: 'Cari transaksi BPKB aktif, proses perpanjangan di Kopra, update jatuh tempo.', target: 2 },
      { id: 'sa-6', text: 'Tebus BPKB Instant', category: 'BPKB', description: 'Verifikasi identitas, proses pelunasan di Intools + Kopra, serahkan BPKB.', target: 2 },
    ],
  },
  {
    id: 'packing-sealing',
    name: 'Praktik Packing & Penyimpanan',
    shortName: 'Packing',
    type: 'minggu1',
    order: 8,
    description: 'Teknik packing dan penyimpanan semua jenis barang gadai sesuai standar',
    unlockDay: 1,
    estimatedMinutes: 30,
    materials: [
      {
        id: 'ps-m1',
        title: 'Packing Elektronik',
        content: `## Packing & Penyimpanan Elektronik\n\n### HP:\n- **Dengan box** — Masukkan ke box asli, seal, tempel label SBG\n- **Tanpa box** — Bungkus bubble wrap, masukkan kantong plastik, tempel label\n\n### Laptop:\n- **Dengan box** — Masukkan ke box asli, pastikan charger ikut terpacking\n- **Tanpa box** — Bungkus bubble wrap tebal, lapisi kardus, tempel label\n\n### TV, Game Console, Smartwatch, Camera:\n- Gunakan kemasan yang sesuai ukuran\n- Tambahkan pelindung sudut untuk barang besar\n- Tandai "FRAGILE" untuk barang mudah pecah\n\n### Label Wajib:\n1. Nomor SBG\n2. Nama nasabah\n3. Deskripsi barang\n4. Tanggal gadai & jatuh tempo`,
      },
      {
        id: 'ps-m2',
        title: 'Packing BPKB & Standar Sealing',
        content: `## Packing BPKB & Standar Sealing\n\n### BPKB:\n- Masukkan ke map/folder dokumen yang bersih\n- Tempel label dengan info lengkap\n- Simpan di lemari dokumen yang terkunci\n\n### Standar Sealing:\n1. Pastikan barang sudah dikemas dengan benar\n2. Tempel stiker segel pada sambungan kemasan\n3. Tulis tanggal dan paraf di atas stiker segel\n4. Pastikan stiker tidak mudah lepas\n\n### Yang Dihindari:\n- Jangan gunakan stiker segel bekas\n- Jangan biarkan ada celah terbuka pada kemasan\n- Jangan tutupi label/informasi penting dengan segel`,
      },
    ],
    submissionType: 'individual',
    checklistItems: [
      { id: 'ps-1', text: 'Packing HP dengan box', category: 'Elektronik', description: 'Masukkan ke box asli, seal, tempel label SBG dengan info lengkap.', target: 2 },
      { id: 'ps-2', text: 'Packing HP tanpa box', category: 'Elektronik', description: 'Bungkus bubble wrap, masukkan kantong plastik, tempel label SBG.', target: 2 },
      { id: 'ps-3', text: 'Packing Laptop dengan box', category: 'Elektronik', description: 'Masukkan ke box asli, pastikan charger ikut terpacking, tempel label.', target: 2 },
      { id: 'ps-4', text: 'Packing Laptop tanpa box', category: 'Elektronik', description: 'Bungkus bubble wrap tebal, lapisi kardus, tempel label SBG.', target: 2 },
      { id: 'ps-5', text: 'Packing TV dengan box', category: 'Elektronik', description: 'Gunakan kemasan sesuai ukuran, tambahkan pelindung sudut, tandai FRAGILE.', target: 2 },
      { id: 'ps-6', text: 'Packing Game Console', category: 'Elektronik', description: 'Kemas dengan aman, sertakan aksesori, tempel label SBG lengkap.', target: 2 },
      { id: 'ps-7', text: 'Packing Smartwatch', category: 'Elektronik', description: 'Gunakan kemasan kecil yang sesuai, tambahkan padding, tempel label.', target: 2 },
      { id: 'ps-8', text: 'Packing Camera', category: 'Elektronik', description: 'Kemas dengan pelindung, tandai FRAGILE, sertakan aksesori, tempel label.', target: 2 },
      { id: 'ps-9', text: 'Packing BPKB', category: 'Dokumen', description: 'Masukkan ke map/folder bersih, tempel label info lengkap, simpan di lemari terkunci.', target: 2 },
    ],
    quiz: [
      {
        id: 'ps-q1',
        question: 'HP tanpa box sebaiknya dikemas menggunakan...',
        options: [
          'Kardus + isolasi biasa',
          'Bubble wrap + kantong plastik + label SBG',
          'Amplop kertas saja',
          'Plastik biasa tanpa pelindung',
        ],
        correctIndex: 1,
      },
      {
        id: 'ps-q2',
        question: 'Informasi apa yang WAJIB ada pada label barang gadai?',
        options: [
          'Nomor SBG, nama nasabah, deskripsi barang, tanggal gadai & jatuh tempo',
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
    id: 'offloading',
    name: 'Offloading',
    shortName: 'Offloading',
    type: 'minggu1',
    order: 9,
    description: 'Prosedur packing dan pelaporan barang offload',
    unlockDay: 1,
    estimatedMinutes: 15,
    materials: [
      {
        id: 'of-m1',
        title: 'Prosedur Offloading',
        content: `## Prosedur Offloading Barang\n\nOffloading adalah proses pengiriman barang gadai yang sudah jatuh tempo dan tidak ditebus oleh nasabah.\n\n### Langkah-langkah:\n1. **Identifikasi barang** — Cek daftar barang yang masuk kategori offload di Intools\n2. **Packing sesuai prosedur** — Kemas barang dengan aman menggunakan standar packing elektronik\n3. **Labeling offload** — Tempel label khusus offload (berbeda dari label gadai biasa)\n4. **Dokumentasi** — Foto barang sebelum dikemas\n5. **Pelaporan** — Laporkan status offload di Intools\n6. **Serah terima** — Serahkan barang ke tim logistik atau pickup offload`,
      },
    ],
    submissionType: 'individual' as const,
    checklistItems: [
      { id: 'of-1', text: 'Offloading', category: 'Offloading', target: 1 },
    ],
  },
  {
    id: 'pelayanan-nasabah',
    name: 'Pelayanan Nasabah Visit',
    shortName: 'Pelayanan Nasabah',
    type: 'minggu2',
    order: 10,
    description: 'Standar pelayanan tatap muka: sambutan, edukasi, dan penutupan interaksi nasabah',
    unlockDay: 8,
    estimatedMinutes: 45,
    materials: [
      {
        id: 'pn-m1',
        title: 'Standar Sambutan & Pelayanan',
        content: `## Standar Pelayanan Nasabah Visit\n\n### Urutan Sambutan:\n1. **Sigap berdiri** — Berdiri saat nasabah masuk, postur siap melayani\n2. **Salam antusias** — Ucapkan salam dengan nada yang hangat dan bersemangat\n3. **Persilakan duduk** — Ajak nasabah duduk dengan intonasi ramah\n4. **Perkenalkan diri** — Sebutkan nama dan tanyakan keperluan nasabah\n5. **Estimasi waktu** — Berikan informasi estimasi waktu proses\n6. **Jelaskan tahapan** — Sampaikan apa yang akan terjadi selanjutnya\n7. **Ajak interaksi** — Di waktu tunggu, ajak nasabah berbincang ringan\n8. **Ucapkan terima kasih** — Saat transaksi selesai, sampaikan terima kasih`,
      },
      {
        id: 'pn-m2',
        title: 'Edukasi Nasabah',
        content: `## Edukasi Nasabah saat Pelayanan\n\n### SBG dan Resi:\n- Jelaskan fungsi SBG sebagai bukti gadai\n- Ingatkan nasabah untuk menyimpan SBG dengan aman\n- Jelaskan cara membaca informasi di SBG\n\n### Edukasi Aplikasi Pandai Gadai:\n- Ajak nasabah download dan registrasi aplikasi\n- Tunjukkan cara cek status gadai, jatuh tempo, dan tagihan\n- Promosikan fitur perpanjangan online\n\n### Saldo Pandai & Poin Pandai:\n- Jelaskan cara mendapatkan dan menggunakan Saldo Pandai\n- Jelaskan program Poin Pandai dan manfaatnya\n- Ajak nasabah untuk aktif menggunakan fitur-fitur ini`,
      },
    ],
    checklistItems: [
      { id: 'pn-1', text: 'Sigap berdiri menyambut nasabah (postur siap melayani)', category: 'Sambutan' },
      { id: 'pn-2', text: 'Mengucapkan salam sambutan dengan nada antusias', category: 'Sambutan' },
      { id: 'pn-3', text: 'Mempersilahkan nasabah duduk dengan intonasi ramah', category: 'Sambutan' },
      { id: 'pn-4', text: 'Memperkenalkan diri dan menanyakan keperluan nasabah', category: 'Sambutan' },
      { id: 'pn-5', text: 'Memberikan estimasi waktu menunggu', category: 'Pelayanan' },
      { id: 'pn-6', text: 'Menjelaskan tahapan selanjutnya kepada nasabah', category: 'Pelayanan' },
      { id: 'pn-7', text: 'Mengajak interaksi nasabah di waktu tunggu', category: 'Pelayanan' },
      { id: 'pn-8', text: 'Mengucapkan terima kasih atas kunjungan/transaksi', category: 'Penutupan' },
      { id: 'pn-9', text: 'Menjelaskan SBG dan Resi kepada nasabah', category: 'Edukasi' },
      { id: 'pn-10', text: 'Edukasi Aplikasi Pandai Gadai', category: 'Edukasi' },
      { id: 'pn-11', text: 'Edukasi Saldo Pandai', category: 'Edukasi' },
      { id: 'pn-12', text: 'Edukasi Poin Pandai', category: 'Edukasi' },
    ],
  },
  {
    id: 'customer-service-wa',
    name: 'Customer Service via WA',
    shortName: 'CS via WA',
    type: 'minggu2',
    order: 11,
    description: 'Komunikasi nasabah via WhatsApp: reminder jatuh tempo dan penanganan pertanyaan/komplain',
    unlockDay: 8,
    estimatedMinutes: 30,
    materials: [
      {
        id: 'csw-m1',
        title: 'Reminder Jatuh Tempo & Komplain WA',
        content: `## Customer Service via WhatsApp\n\n### Reminder Jatuh Tempo:\n- Kirim reminder H-3 sebelum jatuh tempo\n- Sertakan info tagihan dan penawaran perpanjangan\n- Gunakan template pesan yang sudah disediakan\n- Catat respons nasabah di sistem\n\n### Penanganan Pertanyaan/Komplain via WA:\n1. **Respon cepat** — Balas dalam 15 menit di jam operasional\n2. **Sapa dengan nama** — Personalisasi respons\n3. **Dengarkan dulu** — Pahami pertanyaan sebelum menjawab\n4. **Jawab akurat** — Cek data di Intools jika perlu\n5. **Eskalasi jika perlu** — Hubungkan ke Kanit untuk komplain serius\n6. **Follow up** — Pastikan masalah nasabah terselesaikan`,
      },
    ],
    checklistItems: [
      { id: 'csw-1', text: 'Reminder jatuh tempo dan penawaran perpanjangan kepada nasabah', category: 'Proaktif' },
      { id: 'csw-2', text: 'Menjawab pertanyaan / request / komplain nasabah via WA', category: 'Responsif' },
    ],
  },
  {
    id: 'penaksiran-elektronik',
    name: 'Penaksiran Elektronik',
    shortName: 'Taksir Elektronik',
    type: 'minggu2',
    order: 12,
    description: 'Teknik penaksiran gadget dan perangkat elektronik: HP, tablet, laptop, game console, kamera',
    unlockDay: 8,
    estimatedMinutes: 45,
    materials: [
      {
        id: 'pe-m1',
        title: 'HP & Tablet',
        content: `## Penaksiran HP & Tablet\n\n### HP Android:\n- Cek merek, model, kapasitas storage\n- Pastikan tidak terkunci FRP (Factory Reset Protection)\n- Uji layar, kamera, speaker, charging port\n- Cek kondisi fisik bodi dan layar (goresan, retak)\n- Input ke Intools, pilih merek dan model yang sesuai\n\n### iPhone & iPad:\n- Pastikan tidak terkunci iCloud (Activation Lock)\n- Cek IMEI di dus vs di pengaturan\n- Uji Face ID/Touch ID, kondisi baterai, tombol-tombol\n- iPad: cek kondisi Apple Pencil port jika ada\n- Input ke Intools kategori Elektronik`,
      },
      {
        id: 'pe-m2',
        title: 'Laptop & Perangkat Lain',
        content: `## Penaksiran Laptop, Game Console & Kamera\n\n### Laptop (Windows, Chromebook, MacBook):\n- Cek spesifikasi: processor, RAM, storage\n- Uji layar, keyboard, touchpad, semua port\n- Cek kondisi baterai (battery health)\n- MacBook: cek notch dan Touch Bar/Touch ID\n- Input spesifikasi ke Intools\n\n### Game Console (PS/Xbox & Nintendo):\n- Pastikan tidak terkunci akun (PSN/Nintendo Account)\n- Uji controller, port HDMI, disc tray\n- Nintendo Switch: cek kondisi layar dan Joy-Con\n\n### Smartwatch & Camera:\n- Smartwatch: cek model, kondisi strap dan layar, fungsi GPS/HR\n- Camera: cek jenis (DSLR/mirrorless), kondisi lensa, shutter count`,
      },
    ],
    checklistItems: [
      { id: 'pe-1', text: 'Handphone – Android', category: 'HP' },
      { id: 'pe-2', text: 'Tablet', category: 'HP' },
      { id: 'pe-3', text: 'Handphone – iPhone', category: 'HP' },
      { id: 'pe-4', text: 'iPad', category: 'HP' },
      { id: 'pe-5', text: 'Laptop Windows', category: 'Laptop' },
      { id: 'pe-6', text: 'Laptop Chromebook', category: 'Laptop' },
      { id: 'pe-7', text: 'Laptop MacBook', category: 'Laptop' },
      { id: 'pe-8', text: 'Game Console – PlayStation / Xbox', category: 'Gaming' },
      { id: 'pe-9', text: 'Game Console – Nintendo', category: 'Gaming' },
      { id: 'pe-10', text: 'Smartwatch', category: 'Gadget' },
      { id: 'pe-11', text: 'Camera', category: 'Gadget' },
    ],
  },
  {
    id: 'penaksiran-emas',
    name: 'Penaksiran Emas LM Press',
    shortName: 'Taksir Emas',
    type: 'minggu2',
    order: 13,
    description: 'Teknik penaksiran emas batang LM Press sesuai prosedur standar',
    unlockDay: 8,
    estimatedMinutes: 45,
    materials: [
      {
        id: 'pem-m1',
        title: 'Penaksiran LM Press',
        content: `## Penaksiran Emas Batang LM Press\n\n### Apa itu LM Press?\nLM Press (Logam Mulia Press) adalah emas batang yang diproduksi oleh Antam dalam berbagai ukuran (1g–1000g).\n\n### Langkah Penaksiran:\n1. **Verifikasi keaslian** — Cek hologram dan QR code sertifikat Antam\n2. **Periksa kondisi fisik** — Pastikan tidak ada goresan dalam atau tanda pemalsuan\n3. **Verifikasi berat** — Timbang untuk memastikan sesuai keterangan sertifikat\n4. **Cek harga spot** — Lihat harga LM Press hari ini di Intools\n5. **Hitung nilai taksiran** — Berat × harga spot × persentase sesuai ketentuan\n6. **Input ke Intools** — Kategori Emas, subkategori LM Press\n\n### Catatan Penting:\n- LM Press tanpa sertifikat memerlukan prosedur tambahan\n- Konfirmasi ke Kanit untuk LM Press > 100 gram`,
      },
    ],
    checklistItems: [
      { id: 'pem-1', text: 'Penaksiran LM Press sesuai prosedur standar', category: 'Penaksiran' },
    ],
  },
  {
    id: 'penaksiran-bpkb',
    name: 'Penaksiran BPKB',
    shortName: 'Taksir BPKB',
    type: 'minggu2',
    order: 14,
    description: 'Teknik penaksiran kendaraan bermotor berdasarkan dokumen BPKB Instant',
    unlockDay: 8,
    estimatedMinutes: 45,
    materials: [
      {
        id: 'pbk-m1',
        title: 'Penaksiran BPKB Instant',
        content: `## Penaksiran BPKB Instant\n\n### Dokumen yang Diperlukan:\n- BPKB asli\n- STNK aktif\n- KTP pemilik kendaraan\n\n### Langkah Penaksiran:\n1. **Verifikasi dokumen** — Cek keaslian BPKB (hologram, watermark, nomor seri)\n2. **Cocokkan data** — Nomor rangka dan mesin di BPKB vs data STNK\n3. **Cek status kendaraan** — Pastikan tidak dalam kredit/sengketa\n4. **Nilai kendaraan** — Gunakan referensi harga di Intools untuk tipe dan tahun kendaraan\n5. **Input ke Intools** — Pilih kategori BPKB Instant, isi data kendaraan\n6. **Dokumentasi** — Foto BPKB, STNK, dan kendaraan (jika ada)\n\n### Faktor Penentu Nilai:\n- Merek, tipe, dan tahun pembuatan kendaraan\n- Kondisi fisik kendaraan\n- Kelengkapan dokumen`,
      },
      {
        id: 'pbk-m2',
        title: 'Motor vs Mobil',
        content: `## BPKB Motor vs Mobil\n\n### Motor:\n- Merek populer: Honda, Yamaha, Suzuki\n- Motor > 10 tahun nilainya turun signifikan\n- Motor sport/adventure bernilai lebih tinggi\n- Nilai Pasar × 70–80% (tergantung kondisi)\n\n### Mobil:\n- Merek populer: Toyota, Honda, Daihatsu, Suzuki\n- MPV dan SUV lebih diminati pasar\n- Perhatikan kilometer pemakaian\n- Untuk mobil mewah (> Rp 500 juta): wajib konsultasi Kanit\n- Nilai Pasar × 70–80% (tergantung kondisi dan kelengkapan)`,
      },
    ],
    checklistItems: [
      { id: 'pbk-1', text: 'Penaksiran BPKB Instant sesuai prosedur standar', category: 'Penaksiran' },
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
      startDate: '2026-07-24',
      currentDay: 6,
      kanitId: 'kanit-001',
      activeMilestoneIds: ['closing-cabang', 'personal-grooming', 'pengenalan-produk', 'canvassing', 'cash-management', 'sop-administrasi', 'packing-sealing', 'offloading', 'pelayanan-nasabah'],
      completedMilestoneIds: ['packing-sealing'],
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
      startDate: '2026-07-17',
      currentDay: 8,
      kanitId: 'kanit-001',
      activeMilestoneIds: ['closing-cabang', 'opening-cabang', 'personal-grooming', 'pengenalan-produk', 'canvassing', 'cash-management', 'sop-administrasi', 'packing-sealing', 'offloading', 'pelayanan-nasabah'],
      completedMilestoneIds: ['personal-grooming', 'pengenalan-produk', 'canvassing', 'pelayanan-nasabah'],
      quizScores: { 'canvassing': 80 },
      quizAnswers: {
        'canvassing': { 'cv-q1': 1, 'cv-q2': 0, 'cv-q3': 2 },
      },
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
      activeMilestoneIds: ['closing-cabang', 'opening-cabang', 'personal-grooming', 'pengenalan-produk', 'canvassing', 'cash-management', 'sop-administrasi', 'packing-sealing', 'offloading', 'pelayanan-nasabah', 'customer-service-wa', 'penaksiran-elektronik', 'penaksiran-emas', 'penaksiran-bpkb'],
      completedMilestoneIds: ['closing-cabang', 'opening-cabang', 'personal-grooming', 'pengenalan-produk', 'canvassing', 'cash-management', 'sop-administrasi', 'packing-sealing', 'offloading', 'pelayanan-nasabah', 'customer-service-wa', 'penaksiran-elektronik', 'penaksiran-emas', 'penaksiran-bpkb'],
      quizScores: { 'packing-sealing': 85, 'canvassing': 100 },
      quizAnswers: {
        'packing-sealing': { 'ps-q1': 1, 'ps-q2': 0, 'ps-q3': 1, 'ps-q4': 3 },
        'canvassing': { 'cv-q1': 1, 'cv-q2': 1, 'cv-q3': 2 },
      },
    },
  },
  {
    id: 'fl-004',
    name: 'Dewi Rahmawati',
    role: 'fl',
    profile: {
      id: 'fl-004',
      name: 'Dewi Rahmawati',
      branch: 'Cabang Sudirman',
      position: 'OJT Frontliner',
      startDate: '2026-06-24',
      currentDay: 14,
      kanitId: 'kanit-001',
      activeMilestoneIds: ['closing-cabang', 'opening-cabang', 'personal-grooming', 'pengenalan-produk', 'canvassing', 'cash-management', 'sop-administrasi', 'packing-sealing', 'offloading', 'pelayanan-nasabah', 'customer-service-wa', 'penaksiran-elektronik', 'penaksiran-emas', 'penaksiran-bpkb'],
      completedMilestoneIds: ['closing-cabang', 'opening-cabang', 'personal-grooming', 'pengenalan-produk', 'canvassing', 'cash-management', 'sop-administrasi', 'packing-sealing', 'offloading', 'pelayanan-nasabah', 'customer-service-wa', 'penaksiran-elektronik', 'penaksiran-emas', 'penaksiran-bpkb'],
      quizScores: { 'packing-sealing': 100, 'canvassing': 75 },
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
      flIds: ['fl-001', 'fl-002', 'fl-003', 'fl-004'],
    },
  },
]

const fl001Checklists: DailyChecklist[] = [
  {
    id: 'cl-fl001-1', day: 1, date: '2026-07-01', flId: 'fl-001',
    tasks: [
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-1'], reflection: 'Pertama kali canvassing, lumayan nervous. Baru bisa 3 prospek, belum berani masuk ke follow up.', submittedAt: '2026-07-01T13:00:00', kanitScore: 78 },
    ],
    status: 'scored', submittedAt: '2026-07-01T17:30:00',
    kanitScore: 78, kanitNote: 'Hari pertama sudah bagus. Prospek masih sedikit, tapi attitude bagus.', kanitScoredAt: '2026-07-01T18:00:00',
  },
  {
    id: 'cl-fl001-2', day: 2, date: '2026-07-02', flId: 'fl-001',
    tasks: [
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-1', 'cv-2'], reflection: 'Berhasil 5 prospek hari ini. Sudah mulai lebih percaya diri menyapa calon nasabah.', submittedAt: '2026-07-02T13:00:00', kanitScore: 92 },
    ],
    status: 'scored', submittedAt: '2026-07-02T17:15:00',
    kanitScore: 92, kanitNote: 'Sudah mencapai target 5 prospek! Pertahankan.', kanitScoredAt: '2026-07-02T17:45:00',
  },
  {
    id: 'cl-fl001-3', day: 3, date: '2026-07-03', flId: 'fl-001',
    tasks: [
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-1', 'cv-2'], reflection: 'Berhasil menghubungi 7 prospek hari ini, melebihi target.', submittedAt: '2026-07-03T13:00:00', kanitScore: 92 },
    ],
    status: 'scored', submittedAt: '2026-07-03T17:20:00',
    kanitScore: 92, kanitNote: 'Canvassing aktif, 7 prospek melebihi target! Mulai rutinkan follow up.', kanitScoredAt: '2026-07-03T18:10:00',
  },
  {
    id: 'cl-fl001-4', day: 4, date: '2026-07-04', flId: 'fl-001',
    tasks: [
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-1', 'cv-2'], reflection: '6 prospek hari ini dan follow up 2 dari kemarin.', submittedAt: '2026-07-04T13:00:00', kanitScore: 87 },
    ],
    status: 'scored', submittedAt: '2026-07-04T17:00:00',
    kanitScore: 87, kanitNote: 'Follow up mulai konsisten. Bagus!', kanitScoredAt: '2026-07-04T17:30:00',
  },
  {
    id: 'cl-fl001-5', day: 5, date: '2026-07-05', flId: 'fl-001',
    tasks: [
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-1', 'cv-2'], reflection: '7 prospek hari ini. Follow up 2 prospek kemarin, 1 konfirmasi mau datang besok.', submittedAt: '2026-07-05T13:00:00', kanitScore: 89 },
    ],
    status: 'scored', submittedAt: '2026-07-05T17:10:00',
  },
  {
    id: 'cl-fl001-6', day: 6, date: '2026-07-06', flId: 'fl-001',
    tasks: [
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-1', 'cv-2'], reflection: '8 prospek hari ini. Prospek yang kemarin konfirmasi jadi datang — langsung ditangani tim.', submittedAt: '2026-07-06T13:00:00', kanitScore: 91 },
    ],
    status: 'scored', submittedAt: '2026-07-06T17:00:00',
  },
  {
    id: 'cl-fl001-oc-1', day: 1, date: '2026-07-01', flId: 'fl-001',
    tasks: [
      { taskId: 'opening-cabang', taskName: 'SOP Opening Cabang', completedItemIds: ['op-1', 'op-2', 'op-3', 'op-4'], reflection: 'Opening hari pertama berjalan lancar. Sistem siap dan kas awal sudah terverifikasi.', submittedAt: '2026-07-01T09:00:00', kanitScore: 80 },
      { taskId: 'closing-cabang', taskName: 'SOP Closing Cabang', completedItemIds: ['cc-1', 'cc-2', 'cc-3'], reflection: 'Rekap kas sudah selesai. Semua dokumen sudah diarsip dengan benar.', submittedAt: '2026-07-01T17:00:00', kanitScore: 78 },
    ],
    status: 'scored', submittedAt: '2026-07-01T17:30:00',
    kanitScore: 79, kanitScoredAt: '2026-07-01T18:00:00',
  },
  {
    id: 'cl-fl001-oc-2', day: 2, date: '2026-07-02', flId: 'fl-001',
    tasks: [
      { taskId: 'opening-cabang', taskName: 'SOP Opening Cabang', completedItemIds: ['op-1', 'op-2', 'op-3', 'op-4'], reflection: 'Opening hari ini lebih cepat. Sudah terbiasa dengan urutan prosedurnya.', submittedAt: '2026-07-02T09:00:00', kanitScore: 83 },
      { taskId: 'closing-cabang', taskName: 'SOP Closing Cabang', completedItemIds: ['cc-1', 'cc-2', 'cc-3'], reflection: 'Rekap kas lebih teliti. Ada 1 selisih kecil tapi berhasil dikoreksi.', submittedAt: '2026-07-02T17:00:00', kanitScore: 82 },
    ],
    status: 'scored', submittedAt: '2026-07-02T17:30:00',
    kanitScore: 82, kanitScoredAt: '2026-07-02T18:00:00',
  },
  {
    id: 'cl-fl001-oc-3', day: 3, date: '2026-07-03', flId: 'fl-001',
    tasks: [
      { taskId: 'opening-cabang', taskName: 'SOP Opening Cabang', completedItemIds: ['op-1', 'op-2', 'op-3', 'op-4'], reflection: 'Semua checklist opening selesai tanpa kesalahan. Sudah lebih percaya diri.', submittedAt: '2026-07-03T09:00:00', kanitScore: 85 },
      { taskId: 'closing-cabang', taskName: 'SOP Closing Cabang', completedItemIds: ['cc-1', 'cc-2', 'cc-3'], reflection: 'Penutupan berjalan baik. Laporan sudah lebih lengkap dan terstruktur.', submittedAt: '2026-07-03T17:00:00', kanitScore: 85 },
    ],
    status: 'scored', submittedAt: '2026-07-03T17:30:00',
    kanitScore: 85, kanitScoredAt: '2026-07-03T18:00:00',
  },
]

const fl002Checklists: DailyChecklist[] = [
  {
    id: 'cl-fl002-1', day: 1, date: '2026-07-01', flId: 'fl-002',
    milestoneId: 'closing-cabang', milestoneName: 'SOP Closing Cabang',
    items: [
      { itemId: 'cc-1', completed: true }, { itemId: 'cc-2', completed: true },
      { itemId: 'cc-3', completed: false, note: 'Sistem error saat login, perlu bantuan IT' },
      { itemId: 'cc-4', completed: true }, { itemId: 'cc-5', completed: true },
      { itemId: 'cc-6', completed: true }, { itemId: 'cc-7', completed: true },
    ],
    status: 'scored', submittedAt: '2026-07-01T17:30:00',
    kanitScore: 78, kanitNote: 'Ada kendala teknis yang wajar. Pahami cara login sistem dengan baik.', kanitScoredAt: '2026-07-01T18:00:00',
  },
  {
    id: 'cl-fl002-2', day: 2, date: '2026-07-02', flId: 'fl-002',
    milestoneId: 'packing-sealing', milestoneName: 'Praktik Packing & Penyimpanan',
    items: [
      { itemId: 'ps-1', completed: true }, { itemId: 'ps-2', completed: true },
      { itemId: 'ps-3', completed: true },
      { itemId: 'ps-4', completed: false, note: 'Belum sempat menata ulang penyimpanan' },
      { itemId: 'ps-5', completed: true },
    ],
    status: 'scored', submittedAt: '2026-07-02T17:30:00',
    kanitScore: 80, kanitNote: 'Packing cukup baik. Perhatikan penataan penyimpanan agar mudah ditemukan.', kanitScoredAt: '2026-07-02T18:00:00',
  },
  {
    id: 'cl-fl002-3', day: 3, date: '2026-07-03', flId: 'fl-002',
    milestoneId: 'canvassing', milestoneName: 'Canvassing',
    items: [
      { itemId: 'cv-1', completed: true },
      { itemId: 'cv-2', completed: true, note: '5 prospek, tepat di target minimum' },
    ],
    status: 'scored', submittedAt: '2026-07-03T17:30:00',
    kanitScore: 75, kanitNote: 'Sudah mencapai target minimum. Tingkatkan jumlah prospek dan rutinkan follow up.', kanitScoredAt: '2026-07-03T18:00:00',
  },
  {
    id: 'cl-fl002-4', day: 4, date: '2026-07-04', flId: 'fl-002',
    milestoneId: 'pelayanan-nasabah', milestoneName: 'Pelayanan Nasabah',
    items: [
      { itemId: 'pn-1', completed: true },
      { itemId: 'pn-2', completed: false, note: 'Masih perlu latihan untuk identifikasi kebutuhan' },
      { itemId: 'pn-3', completed: true }, { itemId: 'pn-4', completed: true },
      { itemId: 'pn-5', completed: false },
    ],
    status: 'scored', submittedAt: '2026-07-04T17:30:00',
    kanitScore: 70, kanitNote: 'Perlu berlatih identifikasi kebutuhan nasabah. Akan latih bersama besok.', kanitScoredAt: '2026-07-04T18:00:00',
  },
  {
    id: 'cl-fl002-5', day: 5, date: '2026-07-05', flId: 'fl-002',
    milestoneId: 'pelayanan-nasabah', milestoneName: 'Pelayanan Nasabah',
    items: [
      { itemId: 'pn-1', completed: true }, { itemId: 'pn-2', completed: true },
      { itemId: 'pn-3', completed: true }, { itemId: 'pn-4', completed: true },
      { itemId: 'pn-5', completed: true, note: 'Nasabah tanya soal tarif, berhasil dijelaskan' },
    ],
    status: 'scored', submittedAt: '2026-07-05T17:00:00',
    kanitScore: 85, kanitNote: 'Ada peningkatan yang bagus! Penanganan pertanyaan nasabah semakin baik.', kanitScoredAt: '2026-07-05T17:30:00',
  },
  {
    id: 'cl-fl002-6', day: 6, date: '2026-07-06', flId: 'fl-002',
    milestoneId: 'closing-cabang', milestoneName: 'SOP Closing Cabang',
    items: [
      { itemId: 'cc-1', completed: true }, { itemId: 'cc-2', completed: true },
      { itemId: 'cc-3', completed: true }, { itemId: 'cc-4', completed: true },
      { itemId: 'cc-5', completed: true }, { itemId: 'cc-6', completed: true }, { itemId: 'cc-7', completed: true },
    ],
    status: 'scored', submittedAt: '2026-07-06T17:00:00',
    kanitScore: 88, kanitNote: 'Opening closing sudah sangat baik dan konsisten. Bagus!', kanitScoredAt: '2026-07-06T17:20:00',
  },
]

const milestoneRotation = ['closing-cabang', 'packing-sealing', 'canvassing', 'pelayanan-nasabah', 'sop-administrasi', 'penaksiran-elektronik', 'penaksiran-emas', 'penaksiran-bpkb']
const milestoneNames = ['SOP Closing Cabang', 'Praktik Packing & Penyimpanan', 'Canvassing', 'Pelayanan Nasabah Visit', 'SOP Administrasi Gadai', 'Penaksiran Elektronik', 'Penaksiran Emas LM Press', 'Penaksiran BPKB']
const fl003Checklists: DailyChecklist[] = [
  // Days 1–7: multi-task format with full daily activity
  {
    id: 'cl-fl003-1', day: 1, date: '2026-06-24', flId: 'fl-003',
    tasks: [
      { taskId: 'personal-grooming', taskName: 'Personal Grooming', completedItemIds: ['pg-1', 'pg-2', 'pg-3', 'pg-4'], reflection: 'Hari pertama OJT! Pastikan penampilan rapi dan standar sejak awal.', submittedAt: '2026-06-24T08:00:00', kanitScore: 90 },
      { taskId: 'closing-cabang', taskName: 'SOP Closing Cabang', completedItemIds: ['cc-1', 'cc-2', 'cc-3', 'cc-4', 'cc-5', 'cc-6', 'cc-7', 'cc-8'], reflection: 'Baru pertama kali lakukan closing cabang. Perlu waktu lebih, tapi semua langkah terpenuhi.', submittedAt: '2026-06-24T17:00:00', kanitScore: 78 },
    ],
    status: 'scored', submittedAt: '2026-06-24T17:00:00',
    kanitScore: 80, kanitNote: 'Hari pertama sudah solid. Closing masih butuh dipercepat.', kanitScoredAt: '2026-06-24T17:30:00',
  },
  {
    id: 'cl-fl003-2', day: 2, date: '2026-06-25', flId: 'fl-003',
    tasks: [
      { taskId: 'personal-grooming', taskName: 'Personal Grooming', completedItemIds: ['pg-1', 'pg-2', 'pg-3', 'pg-4'], reflection: 'Semua checklist grooming terpenuhi.', submittedAt: '2026-06-25T08:00:00', kanitScore: 90 },
      { taskId: 'pengenalan-produk', taskName: 'Pengenalan Produk & Pricing', completedItemIds: ['pp-1', 'pp-2', 'pp-3'], reflection: 'Belajar menjelaskan produk Elektronik dan BPKB. Masih perlu hafal angka biaya lebih lancar.', submittedAt: '2026-06-25T12:00:00', kanitScore: 80 },
      { taskId: 'closing-cabang', taskName: 'SOP Closing Cabang', completedItemIds: ['cc-1', 'cc-2', 'cc-3', 'cc-4', 'cc-5', 'cc-6', 'cc-7', 'cc-8'], reflection: 'Sudah lebih cepat dari kemarin. Serah terima kunci berjalan lancar.', submittedAt: '2026-06-25T17:00:00', kanitScore: 83 },
    ],
    status: 'scored', submittedAt: '2026-06-25T17:00:00',
    kanitScore: 83, kanitNote: 'Hafalan produk masih perlu diasah, tapi sikap antusias bagus.', kanitScoredAt: '2026-06-25T17:30:00',
  },
  {
    id: 'cl-fl003-3', day: 3, date: '2026-06-26', flId: 'fl-003',
    tasks: [
      { taskId: 'personal-grooming', taskName: 'Personal Grooming', completedItemIds: ['pg-1', 'pg-2', 'pg-3', 'pg-4'], reflection: 'Konsisten rapi.', submittedAt: '2026-06-26T08:00:00', kanitScore: 90 },
      { taskId: 'pengenalan-produk', taskName: 'Pengenalan Produk & Pricing', completedItemIds: ['pp-1', 'pp-2', 'pp-3'], reflection: 'Sudah lebih hafal. Bisa jelaskan ke nasabah simulasi dengan lebih lancar.', submittedAt: '2026-06-26T12:00:00', kanitScore: 85 },
      { taskId: 'cash-management', taskName: 'Cash Management', completedItemIds: ['cm-1', 'cm-2', 'cm-3'], reflection: 'Belajar input tarik-setor dan kas kecil di sistem. Agak bingung di awal tapi sudah paham alurnya.', submittedAt: '2026-06-26T14:00:00', kanitScore: 80 },
      { taskId: 'closing-cabang', taskName: 'SOP Closing Cabang', completedItemIds: ['cc-1', 'cc-2', 'cc-3', 'cc-4', 'cc-5', 'cc-6', 'cc-7', 'cc-8'], reflection: 'Waktu closing semakin singkat. Semua dokumen tertempel rapi.', submittedAt: '2026-06-26T17:00:00', kanitScore: 86 },
    ],
    status: 'scored', submittedAt: '2026-06-26T17:00:00',
    kanitScore: 85, kanitNote: 'Cash management sudah dipahami. Closing terus membaik.', kanitScoredAt: '2026-06-26T17:30:00',
  },
  {
    id: 'cl-fl003-4', day: 4, date: '2026-06-27', flId: 'fl-003',
    tasks: [
      { taskId: 'personal-grooming', taskName: 'Personal Grooming', completedItemIds: ['pg-1', 'pg-2', 'pg-3', 'pg-4'], reflection: 'Penampilan standar terpenuhi.', submittedAt: '2026-06-27T07:30:00', kanitScore: 90 },
      { taskId: 'opening-cabang', taskName: 'SOP Opening Cabang', completedItemIds: ['op-1', 'op-2', 'op-3', 'op-4', 'op-5', 'op-6', 'op-7', 'op-8', 'op-9', 'op-10', 'op-11', 'op-12', 'op-13', 'op-14', 'op-15'], reflection: 'Pertama kali handle opening cabang sendiri. Ada 1 resi yang tertinggal, langsung diperbaiki.', submittedAt: '2026-06-27T09:00:00', kanitScore: 82 },
      { taskId: 'pengenalan-produk', taskName: 'Pengenalan Produk & Pricing', completedItemIds: ['pp-1', 'pp-2', 'pp-3'], reflection: 'Sesi ketiga pengenalan produk. Sudah bisa jelaskan dengan percaya diri ke nasabah.', submittedAt: '2026-06-27T12:00:00', kanitScore: 90 },
      { taskId: 'closing-cabang', taskName: 'SOP Closing Cabang', completedItemIds: ['cc-1', 'cc-2', 'cc-3', 'cc-4', 'cc-5', 'cc-6', 'cc-7', 'cc-8'], reflection: 'Closing rutin berjalan lancar. Tidak ada selisih kas.', submittedAt: '2026-06-27T17:00:00', kanitScore: 88 },
    ],
    status: 'scored', submittedAt: '2026-06-27T17:00:00',
    kanitScore: 87, kanitNote: 'Opening pertama oke! Pengenalan produk sudah mantap.', kanitScoredAt: '2026-06-27T17:30:00',
  },
  {
    id: 'cl-fl003-5', day: 5, date: '2026-06-28', flId: 'fl-003',
    tasks: [
      { taskId: 'personal-grooming', taskName: 'Personal Grooming', completedItemIds: ['pg-1', 'pg-2', 'pg-3', 'pg-4'], reflection: 'Grooming checklist terpenuhi.', submittedAt: '2026-06-28T07:30:00', kanitScore: 90 },
      { taskId: 'opening-cabang', taskName: 'SOP Opening Cabang', completedItemIds: ['op-1', 'op-2', 'op-3', 'op-4', 'op-5', 'op-6', 'op-7', 'op-8', 'op-9', 'op-10', 'op-11', 'op-12', 'op-13', 'op-14', 'op-15'], reflection: 'Opening sudah lebih cepat dari kemarin. Morning briefing berjalan bagus.', submittedAt: '2026-06-28T09:00:00', kanitScore: 88 },
      { taskId: 'offloading', taskName: 'Offloading', completedItemIds: ['of-1'], reflection: 'Latihan pertama packing item offload. Sempat bingung soal penggunaan label, sudah dikonfirmasi ke Kanit.', submittedAt: '2026-06-28T14:00:00', kanitScore: 82 },
      { taskId: 'closing-cabang', taskName: 'SOP Closing Cabang', completedItemIds: ['cc-1', 'cc-2', 'cc-3', 'cc-4', 'cc-5', 'cc-6', 'cc-7', 'cc-8'], reflection: 'Closing selesai tepat waktu. Semua item terpenuhi.', submittedAt: '2026-06-28T17:00:00', kanitScore: 87 },
    ],
    status: 'scored', submittedAt: '2026-06-28T17:00:00',
    kanitScore: 86, kanitNote: 'Offloading perdana berjalan baik. Opening semakin cepat dan rapi.', kanitScoredAt: '2026-06-28T17:30:00',
  },
  {
    id: 'cl-fl003-6', day: 6, date: '2026-06-29', flId: 'fl-003',
    tasks: [
      { taskId: 'personal-grooming', taskName: 'Personal Grooming', completedItemIds: ['pg-1', 'pg-2', 'pg-3', 'pg-4'], reflection: 'Konsisten setiap hari.', submittedAt: '2026-06-29T07:30:00', kanitScore: 90 },
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-1', 'cv-2'], reflection: 'Pertama kali canvassing lapangan. Berhasil 4 prospek, masih malu-malu tapi sudah berani sapa orang baru.', submittedAt: '2026-06-29T13:00:00', kanitScore: 78 },
      { taskId: 'closing-cabang', taskName: 'SOP Closing Cabang', completedItemIds: ['cc-1', 'cc-2', 'cc-3', 'cc-4', 'cc-5', 'cc-6', 'cc-7', 'cc-8'], reflection: 'Closing rutin berjalan normal.', submittedAt: '2026-06-29T17:00:00', kanitScore: 86 },
    ],
    status: 'scored', submittedAt: '2026-06-29T17:00:00',
    kanitScore: 83, kanitNote: 'Canvassing perdana sudah berani! Tingkatkan jumlah prospek.', kanitScoredAt: '2026-06-29T17:30:00',
  },
  {
    id: 'cl-fl003-7', day: 7, date: '2026-06-30', flId: 'fl-003',
    tasks: [
      { taskId: 'personal-grooming', taskName: 'Personal Grooming', completedItemIds: ['pg-1', 'pg-2', 'pg-3', 'pg-4'], reflection: 'Standar grooming selalu terpenuhi.', submittedAt: '2026-06-30T07:30:00', kanitScore: 92 },
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-1', 'cv-2'], reflection: '6 prospek hari ini! Jauh lebih percaya diri dari kemarin. Berhasil jelaskan produk gadai ke 3 orang secara detail.', submittedAt: '2026-06-30T13:00:00', kanitScore: 85 },
      { taskId: 'closing-cabang', taskName: 'SOP Closing Cabang', completedItemIds: ['cc-1', 'cc-2', 'cc-3', 'cc-4', 'cc-5', 'cc-6', 'cc-7', 'cc-8'], reflection: 'Selesai closing minggu pertama. Tidak ada kendala.', submittedAt: '2026-06-30T17:00:00', kanitScore: 88 },
    ],
    status: 'scored', submittedAt: '2026-06-30T17:00:00',
    kanitScore: 88, kanitNote: 'Minggu 1 selesai dengan sangat baik! Semua modul Level 1 tercapai. Siap Level 2.', kanitScoredAt: '2026-06-30T17:30:00',
  },
  // Days 8–13: Level 2 multi-task format
  {
    id: 'cl-fl003-8', day: 8, date: '2026-07-01', flId: 'fl-003',
    tasks: [
      { taskId: 'opening-cabang', taskName: 'SOP Opening Cabang', completedItemIds: ['op-1', 'op-2', 'op-3', 'op-4', 'op-5', 'op-6', 'op-7', 'op-8', 'op-9', 'op-10', 'op-11', 'op-12', 'op-13', 'op-14', 'op-15'], reflection: 'Opening sudah sangat rutin. Tidak ada kendala, saldo awal langsung diverifikasi.', submittedAt: '2026-07-01T08:30:00', kanitScore: 88 },
      { taskId: 'personal-grooming', taskName: 'Personal Grooming', completedItemIds: ['pg-1', 'pg-2', 'pg-3', 'pg-4'], reflection: 'Grooming standar, hari ke-8 tetap terjaga.', submittedAt: '2026-07-01T08:00:00', kanitScore: 92 },
      { taskId: 'customer-service-wa', taskName: 'Customer Service via WA', completedItemIds: ['csw-1', 'csw-2'], reflection: 'Pertama kali handle WA nasabah. Kirim reminder jatuh tempo ke 12 nasabah, 3 langsung konfirmasi perpanjangan.', submittedAt: '2026-07-01T11:00:00', kanitScore: 85 },
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-1', 'cv-2'], reflection: '5 prospek hari ini, 2 follow up dari kemarin. Salah satu prospek minta jadwal kunjungan ke cabang.', submittedAt: '2026-07-01T13:00:00', kanitScore: 83 },
      { taskId: 'pelayanan-nasabah', taskName: 'Pelayanan Nasabah', completedItemIds: ['pn-1', 'pn-2', 'pn-3', 'pn-4', 'pn-5', 'pn-6', 'pn-7', 'pn-8', 'pn-9', 'pn-10', 'pn-11', 'pn-12'], reflection: 'Ada komplain soal antrian, berhasil diselesaikan dengan meminta nasabah menunggu di ruang nyaman.', submittedAt: '2026-07-01T16:00:00', kanitScore: 85 },
      { taskId: 'closing-cabang', taskName: 'SOP Closing Cabang', completedItemIds: ['cc-1', 'cc-2', 'cc-3', 'cc-4', 'cc-5', 'cc-6', 'cc-7', 'cc-8'], reflection: 'Rekap dan laporan selesai tepat waktu. Tidak ada selisih kas.', submittedAt: '2026-07-01T17:00:00', kanitScore: 82 },
    ],
    status: 'scored', submittedAt: '2026-07-01T17:00:00',
    kanitScore: 85, kanitNote: 'Sudah sangat konsisten di hari ke-8. CS via WA perdana bagus! Pertahankan ritme ini.', kanitScoredAt: '2026-07-01T17:30:00',
  },
  {
    id: 'cl-fl003-9', day: 9, date: '2026-07-02', flId: 'fl-003',
    tasks: [
      { taskId: 'opening-cabang', taskName: 'SOP Opening Cabang', completedItemIds: ['op-1', 'op-2', 'op-3', 'op-4', 'op-5', 'op-6', 'op-7', 'op-8', 'op-9', 'op-10', 'op-11', 'op-12', 'op-13', 'op-14', 'op-15'], reflection: 'Opening sesuai SOP. Ditemukan printer macet, langsung lapor dan ditangani teknisi.', submittedAt: '2026-07-02T08:30:00', kanitScore: 88 },
      { taskId: 'personal-grooming', taskName: 'Personal Grooming', completedItemIds: ['pg-1', 'pg-2', 'pg-3', 'pg-4'], reflection: 'Konsisten rapi setiap hari.', submittedAt: '2026-07-02T08:00:00', kanitScore: 92 },
      { taskId: 'customer-service-wa', taskName: 'Customer Service via WA', completedItemIds: ['csw-1', 'csw-2'], reflection: 'Handle 2 komplain via WA dengan baik. Nasabah puas dan tidak eskalasi.', submittedAt: '2026-07-02T11:00:00', kanitScore: 88 },
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-1', 'cv-2'], reflection: '6 prospek hari ini. Prospek yang kemarin dikonfirmasi jadi datang ke cabang.', submittedAt: '2026-07-02T13:00:00', kanitScore: 90 },
      { taskId: 'pelayanan-nasabah', taskName: 'Pelayanan Nasabah', completedItemIds: ['pn-1', 'pn-2', 'pn-3', 'pn-4', 'pn-5', 'pn-6', 'pn-7', 'pn-8', 'pn-9', 'pn-10', 'pn-11', 'pn-12'], reflection: 'Pelayanan lancar. Tidak ada komplain besar. Nasabah baru berhasil dilayani dari awal hingga selesai transaksi.', submittedAt: '2026-07-02T16:00:00', kanitScore: 87 },
      { taskId: 'closing-cabang', taskName: 'SOP Closing Cabang', completedItemIds: ['cc-1', 'cc-2', 'cc-3', 'cc-4', 'cc-5', 'cc-6', 'cc-7', 'cc-8'], reflection: 'Rekap selesai. Ada 1 transaksi tebus yang perlu dicek ulang tapi sudah beres.', submittedAt: '2026-07-02T17:00:00', kanitScore: 85 },
    ],
    status: 'scored', submittedAt: '2026-07-02T17:00:00',
    kanitScore: 88, kanitNote: 'CS via WA sudah lancar handle komplain. Penaksiran dan canvassing meningkat signifikan!', kanitScoredAt: '2026-07-02T17:30:00',
  },
  {
    id: 'cl-fl003-10', day: 10, date: '2026-07-03', flId: 'fl-003',
    tasks: [
      { taskId: 'opening-cabang', taskName: 'SOP Opening Cabang', completedItemIds: ['op-1', 'op-2', 'op-3', 'op-4', 'op-5', 'op-6', 'op-7', 'op-8', 'op-9', 'op-10', 'op-11', 'op-12', 'op-13', 'op-14', 'op-15'], reflection: 'Semua berjalan normal. Saldo awal sesuai.', submittedAt: '2026-07-03T08:30:00', kanitScore: 90 },
      { taskId: 'personal-grooming', taskName: 'Personal Grooming', completedItemIds: ['pg-1', 'pg-2', 'pg-3', 'pg-4'], reflection: 'Grooming terjaga.', submittedAt: '2026-07-03T08:00:00', kanitScore: 90 },
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-1', 'cv-2'], reflection: '7 prospek hari ini — rekor terbanyak. Follow up 3 dari kemarin, 2 berminat minggu depan.', submittedAt: '2026-07-03T13:00:00', kanitScore: 93 },
      { taskId: 'pelayanan-nasabah', taskName: 'Pelayanan Nasabah', completedItemIds: ['pn-1', 'pn-2', 'pn-3', 'pn-4', 'pn-5', 'pn-6', 'pn-7', 'pn-8', 'pn-9', 'pn-10', 'pn-11', 'pn-12'], reflection: 'Nasabah lama kembali gadai, senang bisa melayani dengan cepat karena sudah kenal prosedurnya.', submittedAt: '2026-07-03T16:00:00', kanitScore: 90 },
      { taskId: 'closing-cabang', taskName: 'SOP Closing Cabang', completedItemIds: ['cc-1', 'cc-2', 'cc-3', 'cc-4', 'cc-5', 'cc-6', 'cc-7', 'cc-8'], reflection: 'Rekap selesai tepat waktu. Tidak ada selisih.', submittedAt: '2026-07-03T17:00:00', kanitScore: 89 },
    ],
    status: 'scored', submittedAt: '2026-07-03T17:00:00',
    kanitScore: 90, kanitNote: 'Canvassing terus meningkat, 7 prospek rekor! Pelayanan sudah sangat baik.', kanitScoredAt: '2026-07-03T17:30:00',
  },
  {
    id: 'cl-fl003-11', day: 11, date: '2026-07-04', flId: 'fl-003',
    tasks: [
      { taskId: 'opening-cabang', taskName: 'SOP Opening Cabang', completedItemIds: ['op-1', 'op-2', 'op-3', 'op-4', 'op-5', 'op-6', 'op-7', 'op-8', 'op-9', 'op-10', 'op-11', 'op-12', 'op-13', 'op-14', 'op-15'], reflection: 'Opening lancar, semua sistem normal.', submittedAt: '2026-07-04T08:30:00', kanitScore: 87 },
      { taskId: 'personal-grooming', taskName: 'Personal Grooming', completedItemIds: ['pg-1', 'pg-2', 'pg-3', 'pg-4'], reflection: 'Konsisten setiap hari tanpa pengecualian.', submittedAt: '2026-07-04T08:00:00', kanitScore: 92 },
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-1', 'cv-2'], reflection: '5 prospek hari ini. Fokus di follow up — 3 dari kemarin sudah dijawab, 1 berencana datang akhir pekan.', submittedAt: '2026-07-04T13:00:00', kanitScore: 85 },
      { taskId: 'pelayanan-nasabah', taskName: 'Pelayanan Nasabah', completedItemIds: ['pn-1', 'pn-2', 'pn-3', 'pn-4', 'pn-5', 'pn-6', 'pn-7', 'pn-8', 'pn-9', 'pn-10', 'pn-11', 'pn-12'], reflection: 'Pelayanan berjalan baik. Berhasil jelaskan produk perpanjangan kepada 2 nasabah yang baru pertama kali.', submittedAt: '2026-07-04T16:00:00', kanitScore: 85 },
      { taskId: 'closing-cabang', taskName: 'SOP Closing Cabang', completedItemIds: ['cc-1', 'cc-2', 'cc-3', 'cc-4', 'cc-5', 'cc-6', 'cc-7', 'cc-8'], reflection: 'Rekap dan laporan selesai. Semua dokumen diamankan.', submittedAt: '2026-07-04T17:00:00', kanitScore: 81 },
    ],
    status: 'scored', submittedAt: '2026-07-04T17:00:00',
    kanitScore: 85, kanitNote: 'Progress pelayanan dan follow up canvassing konsisten bagus!', kanitScoredAt: '2026-07-04T17:30:00',
  },
  {
    id: 'cl-fl003-12', day: 12, date: '2026-07-05', flId: 'fl-003',
    tasks: [
      { taskId: 'opening-cabang', taskName: 'SOP Opening Cabang', completedItemIds: ['op-1', 'op-2', 'op-3', 'op-4', 'op-5', 'op-6', 'op-7', 'op-8', 'op-9', 'op-10', 'op-11', 'op-12', 'op-13', 'op-14', 'op-15'], reflection: 'Opening sesuai SOP, tidak ada kendala.', submittedAt: '2026-07-05T08:30:00', kanitScore: 88 },
      { taskId: 'personal-grooming', taskName: 'Personal Grooming', completedItemIds: ['pg-1', 'pg-2', 'pg-3', 'pg-4'], reflection: '12 hari berturut-turut grooming terpenuhi. Sudah jadi kebiasaan yang natural.', submittedAt: '2026-07-05T08:00:00', kanitScore: 95 },
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-1', 'cv-2'], reflection: '6 prospek baru dan follow up 2. Prospek akhir pekan kemarin jadi datang hari ini dan langsung transaksi!', submittedAt: '2026-07-05T13:00:00', kanitScore: 90 },
      { taskId: 'pelayanan-nasabah', taskName: 'Pelayanan Nasabah', completedItemIds: ['pn-1', 'pn-2', 'pn-3', 'pn-4', 'pn-5', 'pn-6', 'pn-7', 'pn-8', 'pn-9', 'pn-10', 'pn-11', 'pn-12'], reflection: 'Ramai hari ini, tapi berhasil tangani semua nasabah dengan baik. Tidak ada keluhan.', submittedAt: '2026-07-05T16:00:00', kanitScore: 87 },
      { taskId: 'closing-cabang', taskName: 'SOP Closing Cabang', completedItemIds: ['cc-1', 'cc-2', 'cc-3', 'cc-4', 'cc-5', 'cc-6', 'cc-7', 'cc-8'], reflection: 'Rekap lebih lama karena transaksi banyak, tapi selesai tepat waktu.', submittedAt: '2026-07-05T17:00:00', kanitScore: 82 },
    ],
    status: 'scored', submittedAt: '2026-07-05T17:00:00',
    kanitScore: 87, kanitNote: 'Canvassing menghasilkan konversi nyata! 12 hari OJT — semua target modul tercapai. Bravo!', kanitScoredAt: '2026-07-05T17:30:00',
  },
  {
    id: 'cl-fl003-13', day: 13, date: '2026-07-06', flId: 'fl-003',
    tasks: [
      { taskId: 'opening-cabang', taskName: 'SOP Opening Cabang', completedItemIds: ['op-1', 'op-2', 'op-3', 'op-4', 'op-5', 'op-6', 'op-7', 'op-8', 'op-9', 'op-10', 'op-11', 'op-12', 'op-13', 'op-14', 'op-15'], reflection: 'Opening sempurna, semua item selesai sebelum jam buka.', submittedAt: '2026-07-06T08:30:00', kanitScore: 93 },
      { taskId: 'personal-grooming', taskName: 'Personal Grooming', completedItemIds: ['pg-1', 'pg-2', 'pg-3', 'pg-4'], reflection: 'Hari terakhir OJT, tetap konsisten.', submittedAt: '2026-07-06T08:00:00', kanitScore: 95 },
      { taskId: 'canvassing', taskName: 'Canvassing', completedItemIds: ['cv-1', 'cv-2'], reflection: '8 prospek hari ini — terbanyak selama OJT. Semangat tinggi di hari penentuan.', submittedAt: '2026-07-06T13:00:00', kanitScore: 95 },
      { taskId: 'pelayanan-nasabah', taskName: 'Pelayanan Nasabah', completedItemIds: ['pn-1', 'pn-2', 'pn-3', 'pn-4', 'pn-5', 'pn-6', 'pn-7', 'pn-8', 'pn-9', 'pn-10', 'pn-11', 'pn-12'], reflection: 'Melayani dengan percaya diri. Sudah bisa handle 2 nasabah sekaligus di jam sibuk.', submittedAt: '2026-07-06T16:00:00', kanitScore: 91 },
      { taskId: 'closing-cabang', taskName: 'SOP Closing Cabang', completedItemIds: ['cc-1', 'cc-2', 'cc-3', 'cc-4', 'cc-5', 'cc-6', 'cc-7', 'cc-8'], reflection: 'Rekap selesai 15 menit lebih cepat dari biasanya. Semua aman dan terdokumentasi.', submittedAt: '2026-07-06T17:00:00', kanitScore: 86 },
    ],
    status: 'scored', submittedAt: '2026-07-06T17:00:00',
    kanitScore: 91, kanitNote: 'OJT selesai dengan sangat memuaskan! Konsistensi sempurna di semua aspek. Siap jadi Frontliner.', kanitScoredAt: '2026-07-06T17:30:00',
  },
]

// Penaksiran milestone DailyChecklists for Budi (used by progress counting)
const fl003PenaksiranChecklists: DailyChecklist[] = [
  { id: 'cl-fl003-pe-1', day: 9, date: '2026-07-02', flId: 'fl-003', milestoneId: 'penaksiran-elektronik', milestoneName: 'Penaksiran Elektronik', items: [{ itemId: 'pe-1', completed: true }, { itemId: 'pe-3', completed: true }, { itemId: 'pe-5', completed: true }], status: 'scored', submittedAt: '2026-07-02T16:30:00', kanitScore: 90, kanitNote: 'Akurasi 94% untuk HP dan Laptop. Sangat bagus!', kanitScoredAt: '2026-07-02T17:00:00' },
  { id: 'cl-fl003-pe-2', day: 11, date: '2026-07-04', flId: 'fl-003', milestoneId: 'penaksiran-elektronik', milestoneName: 'Penaksiran Elektronik', items: [{ itemId: 'pe-8', completed: true }, { itemId: 'pe-10', completed: true }, { itemId: 'pe-11', completed: true }], status: 'scored', submittedAt: '2026-07-04T16:30:00', kanitScore: 87, kanitNote: 'Penaksiran Game Console dan Camera sudah di atas target.', kanitScoredAt: '2026-07-04T17:00:00' },
  { id: 'cl-fl003-pem-1', day: 10, date: '2026-07-03', flId: 'fl-003', milestoneId: 'penaksiran-emas', milestoneName: 'Penaksiran Emas LM Press', items: [{ itemId: 'pem-1', completed: true }], status: 'scored', submittedAt: '2026-07-03T15:00:00', kanitScore: 95, kanitNote: 'Akurasi emas mendekati sempurna. Teknik timbang dan hitung sudah benar.', kanitScoredAt: '2026-07-03T15:30:00' },
  { id: 'cl-fl003-pbk-1', day: 10, date: '2026-07-03', flId: 'fl-003', milestoneId: 'penaksiran-bpkb', milestoneName: 'Penaksiran BPKB', items: [{ itemId: 'pbk-1', completed: true }], status: 'scored', submittedAt: '2026-07-03T15:30:00', kanitScore: 88, kanitNote: 'Verifikasi dokumen BPKB sudah tepat. Perhatikan tahun kendaraan.', kanitScoredAt: '2026-07-03T16:00:00' },
  { id: 'cl-fl003-pbk-2', day: 12, date: '2026-07-05', flId: 'fl-003', milestoneId: 'penaksiran-bpkb', milestoneName: 'Penaksiran BPKB', items: [{ itemId: 'pbk-1', completed: true }], status: 'scored', submittedAt: '2026-07-05T15:30:00', kanitScore: 92, kanitNote: 'BPKB penaksiran ke-2 lebih akurat. Siap mandiri.', kanitScoredAt: '2026-07-05T16:00:00' },
]

const pendingChecklists: DailyChecklist[] = [
  {
    id: 'cl-fl002-7', day: 7, date: '2026-07-07', flId: 'fl-002',
    tasks: [
      { taskId: 'opening-cabang', taskName: 'SOP Opening Cabang', completedItemIds: ['op-1', 'op-2', 'op-3'], reflection: 'Opening OK, tapi sistem sempat lambat loading ~5 menit. Akhirnya bisa masuk dan saldo diverifikasi.', submittedAt: '2026-07-07T08:45:00' },
      { taskId: 'pelayanan-nasabah', taskName: 'Pelayanan Nasabah', completedItemIds: ['pn-1', 'pn-2', 'pn-3', 'pn-4'], reflection: 'Pelayanan berjalan baik. Belum ada situasi komplain hari ini, tapi sudah siap jika ada.', submittedAt: '2026-07-07T16:00:00' },
      { taskId: 'closing-cabang', taskName: 'SOP Closing Cabang', completedItemIds: ['cc-1', 'cc-2', 'cc-3'], reflection: 'Closing selesai tepat waktu. Rekap kas sesuai, tidak ada selisih.', submittedAt: '2026-07-07T17:00:00' },
    ],
    status: 'submitted', submittedAt: '2026-07-07T17:00:00',
  },
]

const fl004EarlyScores = [78, 82, 85, 80, 88, 90, 86]
const fl004DayScores = [84, 87, 92, 89, 91, 88]
const fl004DayNotes = ['Baik, terus tingkatkan!', 'Penaksiran sangat akurat!', 'Excellent, konsisten!', 'Pertahankan ritme ini!', 'Sangat konsisten!', 'Performa terbaik hari ini!']
// Per-task scores for fl004 days 8–13: [opening-cabang, pelayanan-nasabah, closing-cabang]
const fl004TaskScores: Record<number, [number, number, number]> = {
  8: [83, 85, 84], 9: [87, 88, 86], 10: [92, 93, 91],
  11: [89, 90, 88], 12: [91, 93, 89], 13: [88, 89, 87],
}

const fl004Checklists: DailyChecklist[] = [
  ...Array.from({ length: 7 }, (_, i) => {
    const day = i + 1
    const milestoneIdx = Math.min(Math.floor(i / 2.2), 5)
    const d = new Date('2026-06-24')
    d.setDate(d.getDate() + i)
    const date = d.toISOString().split('T')[0]
    return {
      id: `cl-fl004-${day}`, day, date, flId: 'fl-004',
      milestoneId: milestoneRotation[milestoneIdx],
      milestoneName: milestoneNames[milestoneIdx],
      items: [
        { itemId: 'cc-1', completed: true },
        { itemId: 'cc-2', completed: true },
        { itemId: 'cc-3', completed: true },
      ],
      status: 'scored' as const,
      submittedAt: `${date}T17:00:00`,
      kanitScore: fl004EarlyScores[i],
      kanitNote: 'Progress baik, terus tingkatkan!',
      kanitScoredAt: `${date}T17:30:00`,
    }
  }),
  ...Array.from({ length: 6 }, (_, i) => {
    const day = i + 8
    const d = new Date('2026-07-01')
    d.setDate(d.getDate() + i)
    const date = d.toISOString().split('T')[0]
    const ts = fl004TaskScores[day]
    return {
      id: `cl-fl004-${day}`, day, date, flId: 'fl-004',
      tasks: [
        { taskId: 'opening-cabang', taskName: 'SOP Opening Cabang', completedItemIds: ['op-1', 'op-2', 'op-3', 'op-4'], reflection: 'Opening sesuai SOP, tidak ada kendala.', submittedAt: `${date}T08:30:00`, kanitScore: ts[0] },
        { taskId: 'pelayanan-nasabah', taskName: 'Pelayanan Nasabah', completedItemIds: ['pn-1', 'pn-2', 'pn-3', 'pn-4', 'pn-5'], reflection: 'Pelayanan nasabah berjalan lancar dan profesional.', submittedAt: `${date}T16:00:00`, kanitScore: ts[1] },
        { taskId: 'closing-cabang', taskName: 'SOP Closing Cabang', completedItemIds: ['cc-1', 'cc-2', 'cc-3'], reflection: 'Closing selesai tepat waktu, rekap kas sesuai.', submittedAt: `${date}T17:00:00`, kanitScore: ts[2] },
      ],
      status: 'scored' as const,
      submittedAt: `${date}T17:00:00`,
      kanitScore: fl004DayScores[i],
      kanitNote: fl004DayNotes[i],
      kanitScoredAt: `${date}T17:30:00`,
    }
  }),
  {
    id: 'cl-fl004-14', day: 14, date: '2026-07-13', flId: 'fl-004',
    tasks: [
      { taskId: 'opening-cabang', taskName: 'SOP Opening Cabang', completedItemIds: ['op-1', 'op-2', 'op-3', 'op-4'], reflection: 'Opening hari terakhir! Sudah sangat hafal semua prosedur tanpa perlu panduan.', submittedAt: '2026-07-13T08:00:00', kanitScore: 93 },
      { taskId: 'pelayanan-nasabah', taskName: 'Pelayanan Nasabah', completedItemIds: ['pn-1', 'pn-2', 'pn-3', 'pn-4', 'pn-5'], reflection: 'Pelayanan terbaik sepanjang OJT. Bangga bisa menutup dengan performa penuh.', submittedAt: '2026-07-13T16:00:00', kanitScore: 95 },
      { taskId: 'closing-cabang', taskName: 'SOP Closing Cabang', completedItemIds: ['cc-1', 'cc-2', 'cc-3'], reflection: 'Closing terakhir. Rekap bersih, tidak ada selisih. Terima kasih atas bimbingannya!', submittedAt: '2026-07-13T17:00:00', kanitScore: 91 },
    ],
    status: 'scored', submittedAt: '2026-07-13T17:00:00',
    kanitScore: 93, kanitNote: 'Penutup yang luar biasa! Dewi menunjukkan kemajuan konsisten selama 14 hari. Semangat terus!', kanitScoredAt: '2026-07-13T17:30:00',
  },
]

const fl004Penaksiran: PenaksiranRecord[] = [
  {
    id: 'pk-fl004-1', day: 9, date: '2026-07-02', flId: 'fl-004',
    barangType: 'Emas', barangDescription: 'Emas 24K — gelang 8 gram',
    flEstimate: 7500000, intoolsValue: 7480000, accuracy: 99.7,
    kanitScore: 98, kanitNote: 'Hampir sempurna! Penaksiran sangat presisi.', kanitScoredAt: '2026-07-02T18:00:00',
  },
  {
    id: 'pk-fl004-2', day: 10, date: '2026-07-03', flId: 'fl-004',
    barangType: 'Elektronik', barangDescription: 'Samsung Galaxy S23 second',
    flEstimate: 7000000, intoolsValue: 6800000, accuracy: 97.1,
    kanitScore: 90, kanitNote: 'Akurasi bagus untuk elektronik second.', kanitScoredAt: '2026-07-03T18:00:00',
  },
  {
    id: 'pk-fl004-3', day: 11, date: '2026-07-04', flId: 'fl-004',
    barangType: 'Emas', barangDescription: 'Emas 18K — cincin 4 gram',
    flEstimate: 2800000, intoolsValue: 2950000, accuracy: 94.9,
    kanitScore: 85, kanitNote: 'Perhatikan konversi kadar 18K lebih teliti.', kanitScoredAt: '2026-07-04T18:00:00',
  },
]

export const INITIAL_CHECKLISTS: DailyChecklist[] = [
  ...fl001Checklists,
  ...fl002Checklists,
  ...fl003Checklists,
  ...fl003PenaksiranChecklists,
  ...fl004Checklists,
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
  ...fl004Penaksiran,
]

export const ASSESSMENT_QUESTIONS = [
  {
    id: 'q1',
    question: 'Berapa menit sebelum jam buka, frontliner harus sudah tiba di kantor untuk melakukan opening?',
    options: ['15 menit', '30 menit', '45 menit', '60 menit'],
    correctIndex: 1,
  },
  {
    id: 'q2',
    question: 'Jika terdapat selisih pada rekap kas harian, langkah pertama yang harus dilakukan adalah...',
    options: ['Langsung laporkan ke Kanit', 'Hitung ulang semua uang fisik', 'Abaikan jika selisihnya kecil', 'Catat di buku harian dan lanjutkan'],
    correctIndex: 1,
  },
  {
    id: 'q3',
    question: 'Harga emas hari ini Rp 1.050.000/gram. Berapakah nilai taksiran emas 24K seberat 5 gram?',
    options: ['Rp 4.200.000', 'Rp 5.000.000', 'Rp 5.250.000', 'Rp 6.000.000'],
    correctIndex: 2,
  },
  {
    id: 'q4',
    question: 'Manakah urutan alur transaksi gadai baru yang benar?',
    options: [
      'Taksir barang → Identifikasi nasabah → Buat SBG → Serahkan uang',
      'Identifikasi nasabah → Taksir barang → Buat SBG → Serahkan uang',
      'Buat SBG → Identifikasi nasabah → Taksir barang → Serahkan uang',
      'Identifikasi nasabah → Buat SBG → Taksir barang → Serahkan uang',
    ],
    correctIndex: 1,
  },
  {
    id: 'q5',
    question: 'Apa yang WAJIB tertulis pada label/stiker barang gadai?',
    options: [
      'Nama nasabah, nomor SBG, dan nama frontliner',
      'Nomor SBG, tanggal gadai, dan paraf frontliner',
      'Nama nasabah, nilai taksiran, dan tanggal jatuh tempo',
      'Nomor SBG, nama kantor cabang, dan nilai taksiran',
    ],
    correctIndex: 1,
  },
  {
    id: 'q6',
    question: 'Prinsip penanganan komplain nasabah yang diajarkan selama OJT disingkat...',
    options: ['CARE', 'HEAR', 'STAR', 'HELP'],
    correctIndex: 1,
  },
  {
    id: 'q7',
    question: 'Manakah dari berikut ini yang BUKAN standar greeting nasabah di Pandai Gadai?',
    options: [
      'Berdiri saat nasabah datang',
      'Menyapa dengan senyum',
      'Langsung duduk dan bertanya keperluan',
      'Mempersilakan nasabah duduk',
    ],
    correctIndex: 2,
  },
  {
    id: 'q8',
    question: 'Tujuan utama dari proses packing & sealing barang gadai adalah...',
    options: [
      'Mempercantik tampilan barang',
      'Memudahkan penyimpanan di gudang',
      'Menjaga keamanan dan identitas barang gadai',
      'Memenuhi standar ISO perusahaan',
    ],
    correctIndex: 2,
  },
  {
    id: 'q9',
    question: 'Dalam canvassing, pendekatan yang paling efektif untuk mendapatkan nasabah baru adalah...',
    options: [
      'Menyebar brosur di tempat umum tanpa seleksi',
      'Menghubungi referensi dari nasabah yang sudah ada',
      'Memasang iklan di media sosial pribadi',
      'Menunggu nasabah datang sendiri ke kantor',
    ],
    correctIndex: 1,
  },
  {
    id: 'q10',
    question: 'Dokumen utama yang dipegang nasabah sebagai bukti gadai disebut...',
    options: ['Surat Perjanjian Kredit (SPK)', 'Surat Bukti Gadai (SBG)', 'Formulir Taksiran Barang (FTB)', 'Kartu Nasabah (KN)'],
    correctIndex: 1,
  },
  {
    id: 'q11',
    question: 'Nasabah ingin memperpanjang masa gadai. Langkah pertama frontliner adalah...',
    options: [
      'Taksir ulang barang gadai',
      'Cetak formulir perpanjangan langsung',
      'Verifikasi identitas nasabah dan nomor SBG',
      'Hitung bunga yang harus dibayar',
    ],
    correctIndex: 2,
  },
  {
    id: 'q12',
    question: 'Apa perbedaan utama dalam menghitung taksiran emas 18K dibanding 24K?',
    options: [
      'Tidak ada perbedaan, harga per gram sama',
      'Emas 18K dikalikan faktor konversi kadar (18/24)',
      'Emas 18K selalu lebih mahal dari 24K',
      'Emas 18K menggunakan harga pasar berbeda',
    ],
    correctIndex: 1,
  },
  {
    id: 'q13',
    question: 'Berapa toleransi selisih rekap kas yang diperbolehkan tanpa harus melapor ke Kanit?',
    options: ['Rp 1.000', 'Rp 5.000', 'Rp 10.000', 'Tidak ada — selisih sekecil apapun harus dilaporkan'],
    correctIndex: 3,
  },
  {
    id: 'q14',
    question: 'Nilai akhir OJT dihitung dari berapa komponen penilaian?',
    options: ['2 komponen', '3 komponen', '4 komponen', '5 komponen'],
    correctIndex: 1,
  },
  {
    id: 'q15',
    question: 'Saat closing kantor, laporan yang HARUS diselesaikan sebelum frontliner meninggalkan kantor adalah...',
    options: [
      'Laporan kunjungan nasabah harian',
      'Laporan penaksiran barang',
      'Laporan transaksi harian dan rekap kas',
      'Laporan canvassing mingguan',
    ],
    correctIndex: 2,
  },
]

export const MASTERY_MATERIALS = [
  { materialId: 'oc', material: 'SOP Opening & Closing Kantor' },
  { materialId: 'ps', material: 'Standar Packing & Sealing Barang Gadai' },
  { materialId: 'cv', material: 'Teknik dan Script Canvassing' },
  { materialId: 'pd', material: 'Standar Pelayanan dan Penanganan Komplain' },
  { materialId: 'pt', material: 'Alur Transaksi Gadai, Tebus, dan Perpanjangan' },
  { materialId: 'pn', material: 'Teknik Penaksiran dan Penggunaan Intools' },
]

export const INITIAL_ASSESSMENTS: Assessment[] = [
  {
    id: 'assess-fl-004',
    flId: 'fl-004',
    day: 14,
    date: '2026-07-13',
    masteryChecks: [
      { materialId: 'oc', material: 'SOP Opening & Closing Kantor', mastered: true },
      { materialId: 'ps', material: 'Standar Packing & Sealing Barang Gadai', mastered: true },
      { materialId: 'cv', material: 'Teknik dan Script Canvassing', mastered: true },
      { materialId: 'pd', material: 'Standar Pelayanan dan Penanganan Komplain', mastered: true },
      { materialId: 'pt', material: 'Alur Transaksi Gadai, Tebus, dan Perpanjangan', mastered: false },
      { materialId: 'pn', material: 'Teknik Penaksiran dan Penggunaan Intools', mastered: true },
    ],
    answers: [
      { questionId: 'q1', question: 'Berapa menit sebelum jam buka, frontliner harus sudah tiba di kantor untuk melakukan opening?', answer: '30 menit' },
      { questionId: 'q2', question: 'Jika terdapat selisih pada rekap kas harian, langkah pertama yang harus dilakukan adalah...', answer: 'Hitung ulang semua uang fisik' },
      { questionId: 'q3', question: 'Harga emas hari ini Rp 1.050.000/gram. Berapakah nilai taksiran emas 24K seberat 5 gram?', answer: 'Rp 5.000.000' },
      { questionId: 'q4', question: 'Manakah urutan alur transaksi gadai baru yang benar?', answer: 'Identifikasi nasabah → Taksir barang → Buat SBG → Serahkan uang' },
      { questionId: 'q5', question: 'Apa yang WAJIB tertulis pada label/stiker barang gadai?', answer: 'Nomor SBG, tanggal gadai, dan paraf frontliner' },
      { questionId: 'q6', question: 'Prinsip penanganan komplain nasabah yang diajarkan selama OJT disingkat...', answer: 'HEAR' },
      { questionId: 'q7', question: 'Manakah dari berikut ini yang BUKAN standar greeting nasabah di Pandai Gadai?', answer: 'Langsung duduk dan bertanya keperluan' },
      { questionId: 'q8', question: 'Tujuan utama dari proses packing & sealing barang gadai adalah...', answer: 'Menjaga keamanan dan identitas barang gadai' },
      { questionId: 'q9', question: 'Dalam canvassing, pendekatan yang paling efektif untuk mendapatkan nasabah baru adalah...', answer: 'Menyebar brosur di tempat umum tanpa seleksi' },
      { questionId: 'q10', question: 'Dokumen utama yang dipegang nasabah sebagai bukti gadai disebut...', answer: 'Surat Bukti Gadai (SBG)' },
      { questionId: 'q11', question: 'Nasabah ingin memperpanjang masa gadai. Langkah pertama frontliner adalah...', answer: 'Hitung bunga yang harus dibayar' },
      { questionId: 'q12', question: 'Apa perbedaan utama dalam menghitung taksiran emas 18K dibanding 24K?', answer: 'Emas 18K dikalikan faktor konversi kadar (18/24)' },
      { questionId: 'q13', question: 'Berapa toleransi selisih rekap kas yang diperbolehkan tanpa harus melapor ke Kanit?', answer: 'Rp 5.000' },
      { questionId: 'q14', question: 'Nilai akhir OJT dihitung dari berapa komponen penilaian?', answer: '3 komponen' },
      { questionId: 'q15', question: 'Saat closing kantor, laporan yang HARUS diselesaikan sebelum frontliner meninggalkan kantor adalah...', answer: 'Laporan transaksi harian dan rekap kas' },
    ],
    status: 'selesai',
    submittedAt: '2026-07-13T18:30:00',
    mcqScore: 73,
  },
]

export const MOCK_TASK_CONFIRMATIONS: TaskConfirmation[] = [
  {
    id: 'mock-tc-fl001-sa1-a',
    flId: 'fl-001',
    milestoneId: 'sop-administrasi',
    itemId: 'sa-1',
    itemText: 'Gadai Baru Elektronik',
    nomorSbg: 'SBG-2026-00098',
    catatan: 'Prosesnya berjalan lancar. Nasabah puas dengan pelayanan.',
    kanitNote: 'Input Intools dan Kopra sudah benar. Pastikan SBG selalu dicetak sebelum menyerahkan barang ke nasabah.',
    submittedAt: '2026-07-26T09:30:00',
    day: 2,
  },
  {
    id: 'mock-tc-fl001-sa2-a',
    flId: 'fl-001',
    milestoneId: 'sop-administrasi',
    itemId: 'sa-2',
    itemText: 'Perpanjangan / Cicil Elektronik',
    nomorSbg: 'SBG-2026-00112',
    catatan: 'Ada sedikit kebingungan saat memilih opsi cicil vs perpanjangan.',
    kanitNote: 'Pemahaman alur perpanjangan perlu diperkuat. Coba ulangi materi sebelum latihan berikutnya.',
    submittedAt: '2026-07-26T14:00:00',
    day: 2,
  },
  {
    id: 'mock-tc-fl003-ps1-a',
    flId: 'fl-003',
    milestoneId: 'packing-sealing',
    itemId: 'ps-1',
    itemText: 'Packing dan penyimpanan HP dengan box',
    nomorSbg: 'SBG-2026-00205',
    catatan: 'Sudah mengikuti prosedur sealing dengan benar.',
    kanitNote: 'Packing rapi dan label terpasang dengan benar. Pertahankan!',
    submittedAt: '2026-07-27T10:00:00',
    day: 3,
  },
  // fl-001 (Andi) — packing-sealing, all items × 2 submissions
  { id: 'mock-tc-fl001-ps1-a', flId: 'fl-001', milestoneId: 'packing-sealing', itemId: 'ps-1', itemText: 'Packing HP dengan box', nomorSbg: 'SBG-2026-00141', catatan: 'Label sudah ditempel di posisi yang benar.', kanitNote: 'Rapi dan sesuai prosedur.', submittedAt: '2026-07-25T09:15:00', day: 2 },
  { id: 'mock-tc-fl001-ps1-b', flId: 'fl-001', milestoneId: 'packing-sealing', itemId: 'ps-1', itemText: 'Packing HP dengan box', nomorSbg: 'SBG-2026-00142', catatan: 'Lebih cepat dari percobaan pertama.', submittedAt: '2026-07-25T10:30:00', day: 2 },
  { id: 'mock-tc-fl001-ps2-a', flId: 'fl-001', milestoneId: 'packing-sealing', itemId: 'ps-2', itemText: 'Packing HP tanpa box', nomorSbg: 'SBG-2026-00143', catatan: 'Bubble wrap cukup, kantong plastik sudah di-seal.', submittedAt: '2026-07-25T11:00:00', day: 2 },
  { id: 'mock-tc-fl001-ps2-b', flId: 'fl-001', milestoneId: 'packing-sealing', itemId: 'ps-2', itemText: 'Packing HP tanpa box', nomorSbg: 'SBG-2026-00144', catatan: 'Sudah lebih rapi dari sesi sebelumnya.', kanitNote: 'Pastikan bubble wrap menutupi semua sisi.', submittedAt: '2026-07-25T14:00:00', day: 2 },
  { id: 'mock-tc-fl001-ps3-a', flId: 'fl-001', milestoneId: 'packing-sealing', itemId: 'ps-3', itemText: 'Packing Laptop dengan box', nomorSbg: 'SBG-2026-00155', catatan: 'Charger ikut terpacking dan sudah dilabel.', submittedAt: '2026-07-26T09:00:00', day: 3 },
  { id: 'mock-tc-fl001-ps3-b', flId: 'fl-001', milestoneId: 'packing-sealing', itemId: 'ps-3', itemText: 'Packing Laptop dengan box', nomorSbg: 'SBG-2026-00156', catatan: 'Box original digunakan, label terpasang sempurna.', submittedAt: '2026-07-26T10:15:00', day: 3 },
  { id: 'mock-tc-fl001-ps4-a', flId: 'fl-001', milestoneId: 'packing-sealing', itemId: 'ps-4', itemText: 'Packing Laptop tanpa box', nomorSbg: 'SBG-2026-00157', catatan: 'Bubble wrap tebal sudah digunakan, lapisan kardus ada.', submittedAt: '2026-07-26T11:30:00', day: 3 },
  { id: 'mock-tc-fl001-ps4-b', flId: 'fl-001', milestoneId: 'packing-sealing', itemId: 'ps-4', itemText: 'Packing Laptop tanpa box', nomorSbg: 'SBG-2026-00158', catatan: 'Sudah menggunakan standar packing yang benar.', submittedAt: '2026-07-26T14:30:00', day: 3 },
  { id: 'mock-tc-fl001-ps5-a', flId: 'fl-001', milestoneId: 'packing-sealing', itemId: 'ps-5', itemText: 'Packing TV dengan box', nomorSbg: 'SBG-2026-00168', catatan: 'Pelindung sudut terpasang, FRAGILE sudah ditandai.', submittedAt: '2026-07-27T09:00:00', day: 4 },
  { id: 'mock-tc-fl001-ps5-b', flId: 'fl-001', milestoneId: 'packing-sealing', itemId: 'ps-5', itemText: 'Packing TV dengan box', nomorSbg: 'SBG-2026-00169', catatan: 'Label dan penandaan FRAGILE sudah sesuai standar.', submittedAt: '2026-07-27T10:45:00', day: 4 },
  { id: 'mock-tc-fl001-ps6-a', flId: 'fl-001', milestoneId: 'packing-sealing', itemId: 'ps-6', itemText: 'Packing Game Console', nomorSbg: 'SBG-2026-00170', catatan: 'Aksesori sudah ikut dikemas, label terpasang.', submittedAt: '2026-07-27T11:30:00', day: 4 },
  { id: 'mock-tc-fl001-ps6-b', flId: 'fl-001', milestoneId: 'packing-sealing', itemId: 'ps-6', itemText: 'Packing Game Console', nomorSbg: 'SBG-2026-00171', catatan: 'Semua aksesori terkemas dengan aman.', kanitNote: 'Controller dan kabel sudah dimasukkan. Bagus!', submittedAt: '2026-07-27T14:00:00', day: 4 },
  { id: 'mock-tc-fl001-ps7-a', flId: 'fl-001', milestoneId: 'packing-sealing', itemId: 'ps-7', itemText: 'Packing Smartwatch', nomorSbg: 'SBG-2026-00182', catatan: 'Padding cukup, label terpasang dengan benar.', submittedAt: '2026-07-28T09:00:00', day: 5 },
  { id: 'mock-tc-fl001-ps7-b', flId: 'fl-001', milestoneId: 'packing-sealing', itemId: 'ps-7', itemText: 'Packing Smartwatch', nomorSbg: 'SBG-2026-00183', catatan: 'Kemasan kecil yang sesuai sudah digunakan.', submittedAt: '2026-07-28T10:00:00', day: 5 },
  { id: 'mock-tc-fl001-ps8-a', flId: 'fl-001', milestoneId: 'packing-sealing', itemId: 'ps-8', itemText: 'Packing Camera', nomorSbg: 'SBG-2026-00184', catatan: 'FRAGILE ditandai, lensa sudah dilindungi.', submittedAt: '2026-07-28T11:00:00', day: 5 },
  { id: 'mock-tc-fl001-ps8-b', flId: 'fl-001', milestoneId: 'packing-sealing', itemId: 'ps-8', itemText: 'Packing Camera', nomorSbg: 'SBG-2026-00185', catatan: 'Aksesori kamera sudah terkemas bersama.', submittedAt: '2026-07-28T13:30:00', day: 5 },
  { id: 'mock-tc-fl001-ps9-a', flId: 'fl-001', milestoneId: 'packing-sealing', itemId: 'ps-9', itemText: 'Packing BPKB', catatan: 'Disimpan di map bersih, label info lengkap.', submittedAt: '2026-07-28T14:00:00', day: 5 },
  { id: 'mock-tc-fl001-ps9-b', flId: 'fl-001', milestoneId: 'packing-sealing', itemId: 'ps-9', itemText: 'Packing BPKB', catatan: 'Lemari terkunci sudah digunakan untuk penyimpanan.', kanitNote: 'Dokumen tersimpan rapi. Modul packing selesai!', submittedAt: '2026-07-28T15:00:00', day: 5 },
]

export const MOCK_NOTIFICATIONS: FLNotification[] = [
  // ── Andi (fl-001, Hari 6) ────────────────────────────────
  {
    id: 'notif-fl001-1',
    flId: 'fl-001',
    type: 'persetujuan_kanit',
    title: 'SOP Administrasi',
    body: 'Kanit menyetujui carry-over modul ini ke Minggu 2. Kamu bisa melanjutkan latihan minggu depan.',
    milestoneId: 'sop-administrasi',
    milestoneName: 'SOP Administrasi',
    read: false,
    createdAt: '2026-07-28T17:00:00',
  },
  {
    id: 'notif-fl001-2',
    flId: 'fl-001',
    type: 'feedback_latihan',
    title: 'Praktik Packing & Penyimpanan',
    body: 'Kamu dapat feedback dari Kanit: "Dokumen tersimpan rapi. Modul packing selesai!"',
    milestoneId: 'packing-sealing',
    milestoneName: 'Praktik Packing & Penyimpanan',
    read: false,
    createdAt: '2026-07-28T15:30:00',
  },
  {
    id: 'notif-fl001-3',
    flId: 'fl-001',
    type: 'feedback_latihan',
    title: 'Praktik Packing & Penyimpanan',
    body: 'Kamu dapat feedback dari Kanit: "Controller dan kabel sudah dimasukkan. Bagus!"',
    milestoneId: 'packing-sealing',
    milestoneName: 'Praktik Packing & Penyimpanan',
    read: false,
    createdAt: '2026-07-27T14:30:00',
  },
  {
    id: 'notif-fl001-4',
    flId: 'fl-001',
    type: 'feedback_latihan',
    title: 'SOP Administrasi',
    body: 'Kamu dapat feedback dari Kanit: "Pemahaman alur perpanjangan perlu diperkuat. Coba ulangi materi sebelum latihan berikutnya."',
    milestoneId: 'sop-administrasi',
    milestoneName: 'SOP Administrasi',
    read: true,
    createdAt: '2026-07-25T14:30:00',
  },

  // ── Sari (fl-002, Hari 8) ────────────────────────────────
  {
    id: 'notif-fl002-1',
    flId: 'fl-002',
    type: 'feedback_latihan',
    title: 'Canvassing',
    body: 'Kamu dapat feedback dari Kanit: "Penjelasan ke calon nasabah sudah bagus, tapi pelaporan Avenza perlu lebih konsisten."',
    milestoneId: 'canvassing',
    milestoneName: 'Canvassing',
    read: false,
    createdAt: '2026-07-24T16:00:00',
  },
  {
    id: 'notif-fl002-2',
    flId: 'fl-002',
    type: 'feedback_latihan',
    title: 'Personal Grooming',
    body: 'Kamu dapat feedback dari Kanit: "Penampilan sudah rapi dan konsisten. Pertahankan!"',
    milestoneId: 'personal-grooming',
    milestoneName: 'Personal Grooming',
    read: true,
    createdAt: '2026-07-21T09:00:00',
  },

  // ── Budi (fl-003, Hari 14) ───────────────────────────────
  {
    id: 'notif-fl003-1',
    flId: 'fl-003',
    type: 'final_assessment',
    title: 'Final Assessment OJT',
    body: 'Selamat! Kamu sudah menyelesaikan semua modul OJT. Final assessment kini sudah dibuka — kerjakan hari ini untuk menyelesaikan OJT kamu.',
    read: false,
    createdAt: '2026-07-24T08:00:00',
  },
  {
    id: 'notif-fl003-2',
    flId: 'fl-003',
    type: 'feedback_latihan',
    title: 'Penaksiran Elektronik',
    body: 'Kamu dapat feedback dari Kanit: "Estimasi harga Macbook sudah akurat. Nilai penaksiran elektronik kamu bagus!"',
    milestoneId: 'penaksiran-elektronik',
    milestoneName: 'Penaksiran Elektronik',
    read: true,
    createdAt: '2026-07-22T14:00:00',
  },

  // ── Dewi (fl-004, Hari 14) ───────────────────────────────
  {
    id: 'notif-fl004-1',
    flId: 'fl-004',
    type: 'final_assessment',
    title: 'Final Assessment OJT',
    body: 'Selamat! Kamu sudah menyelesaikan semua modul OJT. Final assessment kini sudah dibuka — kerjakan hari ini untuk menyelesaikan OJT kamu.',
    read: true,
    createdAt: '2026-07-24T08:00:00',
  },
  {
    id: 'notif-fl004-2',
    flId: 'fl-004',
    type: 'persetujuan_kanit',
    title: 'Penaksiran BPKB',
    body: 'Kanit menyetujui carry-over modul Penaksiran BPKB ke Minggu 2. Kamu bisa melanjutkan latihan.',
    milestoneId: 'penaksiran-bpkb',
    milestoneName: 'Penaksiran BPKB',
    read: true,
    createdAt: '2026-07-20T10:00:00',
  },
]
