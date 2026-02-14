# 📸 OCR (Optical Character Recognition) - Content Shorts Guide

**Target Audience:** Developer Indonesia yang suka coding simpel tapi hasilnya "canggih"
**Tool:** Tesseract.js (JavaScript/React)
**Duration:** 30-60 detik per short
**Vibe:** Sat-set, kode minimal, hasil maksimal

---

## 🎯 Konsep untuk Konten

OCR adalah teknologi membaca teks dari gambar secara otomatis. Terlihat "AI-ish", tapi codenya **sangat simpel** ketika pakai library yang tepat.

**Key Angle untuk Shorts:**

- "Masih ngetik ulang teks dari dokumen/KTP/foto? Cuma butuh 5 baris kode!"
- "Project OCR Cuma 10 Menit Setup + 5 Baris Kode"
- "Bikin Scanner Dokumen Otomatis Pake Javascript!"

---

## 📂 Breakdown File Proyek Anda

### **File 1: `hooks/useOCRWorker.ts`** (⭐ INTI LOGIC)

Ini adalah "jantung" dari OCR implementation Anda. Berikut bagian penting untuk konten:

#### **Bagian 1: Import Library** (00:05 - Video Shorts)

```typescript
import { createWorker, Worker } from "tesseract.js";
```

✅ **HIGHLIGHT INI:** "Install tesseract.js aja, library OCR terbaik buat Javascript!"

---

#### **Bagian 2: Initialize Worker** (00:10 - Video Shorts)

```typescript
const initWorker = useCallback(async () => {
  if (workerRef.current) return;
  const worker = await createWorker("eng");
  workerRef.current = worker;
}, []);
```

✅ **HIGHLIGHT INI:**

- "createWorker('eng') = setup OCR dengan bahasa Inggris"
- Bisa ganti ke 'ind' untuk bahasa Indonesia (perlu download dataset)
- **"Cuma 1 baris, udah bisa baca gambar!"**

---

#### **Bagian 3: Recognize Function** (00:20 - Video Shorts) ⭐⭐⭐ PALING PENTING

```typescript
const recognize = useCallback(
  async (imagePath: string) => {
    if (!workerRef.current) {
      await initWorker();
    }

    const result = await workerRef.current.recognize(imagePath);
    setProgress({ status: "Complete", progress: 1 });
    return result.data.text;
  },
  [initWorker],
);
```

✅ **HIGHLIGHT INI:**

```
❌ Cara Lama: Ngetik ulang manual (membosankan)
✅ Cara Baru: recognize(imagePath) → BOOM! Teks langsung keluar

// Console.log hasilnya:
"Nama: John Doe
No. KTP: 1234.5678.9012.3456
Tempat Lahir: Jakarta"
```

---

### **File 2: `app/page.tsx`** (🎨 UI/UX)

Ini adalah cara Anda **menampilkan** hasil OCR. Bagian penting untuk konten:

#### **Bagian 1: Drag & Drop Upload** (00:00-00:10)

```typescript
const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  const file = e.dataTransfer.files?.[0];
  if (file) {
    handleImageSelect(file);
  }
};
```

✅ **VISUAL UNTUK VIDEO:**

- User drag-drop file JPG/PNG ke box
- Status berubah → "Processing..."

---

#### **Bagian 2: Progress Bar Real-time** (00:25-00:35) ⭐ KEREN!

```typescript
{isLoading && (
  <div className="w-full bg-blue-200 rounded-full h-2">
    <div
      className="bg-blue-500 h-2 rounded-full transition-all"
      style={{ width: `${progress.progress * 100}%` }}
    />
  </div>
)}
```

✅ **HIGHLIGHT INI:**

- "Liat proses scanning real-time!"
- "progress.progress" dari `useOCRWorker` menunjukkan persentase
- **Visual yang bikin orang wow!**

---

#### **Bagian 3: Display Hasil** (00:40-00:50)

```typescript
<p className="text-slate-700 whitespace-pre-wrap">
  {recognizedText}  // ← TEKS HASIL SCAN MUNCUL DI SINI!
</p>
```

✅ **HIGHLIGHT INI:**

- Teks dari `recognize()` langsung di-render
- User bisa Edit, Copy, Share
- **"Siap pakai langsung tanpa rework manual!"**

---

## 🎬 Script Video Shorts (30-60 detik)

### **Video #1: "Males Ngetik Ulang? Bikin OCR Sendiri!" (45 detik)**

| Waktu | Visual                                                                                             | Voice Over                                                 |
| ----- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 00:00 | Meme: Orang nangis lihat tumpukan dokumen/foto dengan banyak teks                                  | "Masih ngetik ulang teks dari gambar? Parah deh..."        |
| 00:05 | Buka VS Code, show file structure, ketik `npm install tesseract.js`                                | "Solusinya install 1 library: tesseract.js"                |
| 00:10 | Zoom ke line: `import { createWorker } from "tesseract.js"`                                        | "Import library-nya, gakperlu setup ribet OS."             |
| 00:15 | Show file `useOCRWorker.ts` highlight 3 baris core: `const result = await worker.recognize(image)` | "Panggil recognize(), kasih nama gambar... LANGSUNG JADI!" |
| 00:25 | Jalankan web app, drag-drop foto dokumen ke UI                                                     | "Taruh gambar di sini... "                                 |
| 00:30 | Progress bar muncul 0% → 100%                                                                      | "Tunggu proses OCR-nya jalan... "                          |
| 00:40 | Hasil teks muncul di layar persis sama dengan dokumen asli                                         | "BUM! Teks keluar otomatis! Tinggal copy-paste!"           |
| 00:45 | Meme: Orang joget "Stonks" / salute                                                                | "Coding tuh kayak magician deh. Next video apa? Komen!"    |

**Video Hook:** "Pare, aku bisa baca gambar!" 🤖

---

### **Video #2: "10 Menit Bikin Scanner Dokumen" (60 detik)**

| Waktu | Visual                                                                  | Voice Over                                                    |
| ----- | ----------------------------------------------------------------------- | ------------------------------------------------------------- |
| 00:00 | Layar VS Code: folder kosong                                            | "Mau bikin scanner dokumen? Cuma 10 menit kok!"               |
| 00:05 | Terminal: `npx create-next-app ocr-scanner`                             | "Bikin Next.js project dulu..."                               |
| 00:10 | Terminal: `npm install tesseract.js`                                    | "Tambah tesseract.js buat OCR-nya..."                         |
| 00:15 | Show file `hooks/useOCRWorker.ts` - highlight code                      | "Bikin custom hook useOCRWorker untuk logic OCR..."           |
| 00:25 | Show file `app/page.tsx` drag-drop area                                 | "UI drag-drop area buat upload gambar..."                     |
| 00:35 | Real-time run: drag-drop contoh foto KTP ke web                         | "Test! Drag-drop foto KTP... "                                |
| 00:45 | Progress bar jalan, habis teks keluar                                   | "Prosesnya... SELESAI! Teks langsung keluar!"                 |
| 00:55 | Show hasil: Nama, nomor, alamat ter-extract sempurna                    | "Klik copy-paste langsung bisa share/simpan!"                 |
| 60:00 | Meme sukses / "ini yang namanya modern problem require modern solution" | "Gampang kan? Like & subscribe buat tutorial coding lainnya!" |

**Video Hook:** "Kemarin manual 1 jam, sekarang 10 detik!" ⏱️

---

## 💻 Kode Simpel untuk Showcase (Copy-Paste Langsung di Video)

Jika ingin showcase versi **Node.js paling simpel** (buat variant content):

```javascript
// FILE: ocr-simple.js
// Install: npm install tesseract.js

const { createWorker } = require("tesseract.js");

async function scanDocument(imagePath) {
  console.log("🔍 Sedang membaca gambar...\n");

  const worker = await createWorker("eng");
  const {
    data: { text },
  } = await worker.recognize(imagePath);

  console.log("✅ Hasil Scan:\n");
  console.log(text);

  await worker.terminate();
}

// Jalankan:
scanDocument("dokumen.jpg");
```

**Run:** `node ocr-simple.js`  
**Output:** Teks langsung keluar!

---

## ⭐ Highlight Points untuk Konten

### **Bagian Wajib Masuk Video:**

1. **"5 Baris Kode"** ← Angle utama

   ```typescript
   const worker = await createWorker("eng");
   const result = await worker.recognize(imagePath);
   return result.data.text;
   ```

2. **Progress Bar Real-time** ← Visual yang eye-catching
   - Show percentage 0% → 100%
   - Keliatan "prosesnya lagi jalan"

3. **Hasil Instant** ← The Wow Factor
   - Foto KTP → Teks keluar sempurna
   - "Persis sama dengan aslinya!"

4. **Copy-Paste Ready** ← Utility
   - User tinggal select & copy
   - Gak perlu rework manual

5. **"Tanpa setup ribet OS"** ← Tech angle
   - Library-based, bukan installer exe
   - Bisa di browser langsung!

---

## 🎨 Visual Tips untuk Shorts

| Element             | Rekomendasi                                                 |
| ------------------- | ----------------------------------------------------------- |
| **Zoom Code**       | Highlight 3-4 baris inti dengan zoom 200%                   |
| **Cursor**          | Pakek cursor animation biar keliatan mana yang penting      |
| **Color Highlight** | Beri warna berbeda untuk `recognize()`, `imagePath`, `text` |
| **Music/Sound**     | Scan sound effect saat progress bar jalan                   |
| **Text Overlay**    | "OCR = Optical Character Recognition" subtitle singkat      |
| **Transition**      | Smooth fade saat hasil keluar                               |

---

## 📊 Content Series Idea

**Video Sequence untuk Maksimalkan Engagement:**

1. **Shorts #1:** "Males Ngetik Ulang?" (Hook - 30 detik) → Drive awareness
2. **Shorts #2:** "Cuma 5 Baris Code" (Explainer - 45 detik) → Education
3. **Shorts #3:** "Bikin Scanner 10 Menit" (Tutorial - 60 detik) → Action
4. **Shorts #4:** "Real-Time OCR Demo" (Proof of concept - 30 detik) → Wow factor

**Caption Hashtag:**

- #CodingSimple #OCR #Javascript #Tesseract #NextJS #TutorialCoding

---

## 🚀 Next Steps

1. **Siapkan demo image:** KTP, struk, surat, atau dokumen apapun
2. **Screen record:** Drag-drop image ke web app, capture hasil
3. **Edit:** Add zoom, highlight, text overlay, sound effects
4. **Post:** TikTok, Instagram Reels, YouTube Shorts

**Estimasi Time to Create:** 1-2 jam per video (termasuk recording + editing)

---

**Made with ❤️ untuk konten coding yang impact!**
