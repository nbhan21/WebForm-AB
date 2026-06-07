# Form Pencatatan Reject — Produksi Aksara Buana

Web form untuk mencatat reject production per POS (Offset Printing, Cutting, Complete, Lipat, Jahit, Hot Binding, Finishing, QC). Data terintegrasi dengan Google Sheets via Google Apps Script.

## Struktur Folder

```
form-app/
├── api/
│   └── submit.js       # Vercel serverless function (proxy ke GAS)
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── config.js
│   └── data.js
├── google-sheets/
│   ├── Code.gs         # Google Apps Script
│   └── appsscript.json
├── form.html
├── server.js           # Server lokal (untuk development)
├── package.json
├── vercel.json         # Konfigurasi Vercel
├── .env.example        # Template environment variable
└── README.md
```

## Setup Lokal (Development)

1. **Clone repo**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Buat file `.env`** dari template
   ```bash
   cp .env.example .env
   ```

4. **Isi `.env`** dengan URL Google Apps Script kamu:
   ```
   GAS_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

5. **Jalankan server**
   ```bash
   npm start
   ```

6. Buka `http://localhost:3000/form.html`

## Deploy ke Vercel

1. Push repo ke GitHub
2. Connect repo di [vercel.com](https://vercel.com)
3. Di Vercel dashboard → **Settings → Environment Variables**, tambahkan:
   - Key: `GAS_URL`
   - Value: URL Google Apps Script kamu
4. Deploy — otomatis setiap push ke main branch

## Setup Google Apps Script

1. Buka [script.google.com](https://script.google.com)
2. Buat project baru, paste isi `google-sheets/Code.gs`
3. Deploy sebagai **Web App**:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Copy URL deployment → gunakan sebagai nilai `GAS_URL`

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JS — NVIDIA design system (Inter font)
- **Backend:** Node.js/Express (lokal) · Vercel Serverless Function (production)
- **Database:** Google Sheets via Google Apps Script
