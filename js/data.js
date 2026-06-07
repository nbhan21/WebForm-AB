// Kategori Reject untuk setiap POS
const rejectData = {
    "Offset Printing": [
        "Tinta register",
        "Warna tidak sesuai proof",
        "Tinta bercak tidak rata",
        "Bekas cap tangan/sidik jari",
        "Kotor dari mesin (cyler/blanket/roller)",
        "Kertas miring/skew saat masuk mesin",
        "Double print (dicetak dua kali)",
        "Kertas kusut/terlipat masuk mesin"
    ],
    "Cutting": [
        "Potongan miring/tidak lurus",
        "Ukuran hasil tidak sesuai spesifikasi",
        "Tepi sobek atau kasar",
        "Kertas kotor",
        "Kertas double feed saat proses potong"
    ],
    "Complete": [
        "Kertas Kotor",
        "Kertas Tertekuk/terlipat",
        "Kertas Kriput/gelombang",
        "Kertas Bintik/Bercak",
        "Kertas Sobek",
        "Cetakan lari (Tidak sesuai posisinya)"
    ],
    "Lipat": [
        "Lipatan miring / tidak simetris",
        "Hasil lipatan lecek/kusut",
        "Lipatan double (terlipat dua kali)",
        "Sobek di bagian lipatan"
    ],
    "Jahit": [
        "Kertas robek",
        "Jahitan meleset",
        "Jahitan tidak rapi",
        "Benang putus",
        "Posisi cover tidak center"
    ],
    "Hot Binding": [
        "Halaman robek",
        "Halaman kriput",
        "Halaman tertekuk",
        "Lem tidak merata",
        "Lem berlebih sampai halaman"
    ],
    "Finishing": [
        "Halaman terlipat",
        "Halaman kotor",
        "Halaman kriput",
        "Halaman blank (putih)",
        "Halaman robek",
        "Halaman berbayang/tembus",
        "Cover Baret/tergores",
        "Cover Kotor",
        "Cover bergaris",
        "Cover berbintik",
        "Cover luka"
    ],
    "QC": [
        "Halaman terlipat",
        "Halaman kotor",
        "Halaman kriput",
        "Halaman blank (putih)",
        "Halaman robek",
        "Halaman berbayang/tembus",
        "Cover Baret/tergores",
        "Cover Kotor",
        "Cover bergaris",
        "Cover berbintik",
        "Cover luka"
    ]
};

// Daftar POS
const posList = Object.keys(rejectData);