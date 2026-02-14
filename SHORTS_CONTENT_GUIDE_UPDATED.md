# 📸 OCR (Optical Character Recognition) - Content Shorts Guide (UPDATED)

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

// Hasil Output:
"Nama: John Doe
No. KTP: 1234.5678.9012.3456
Tempat Lahir: Jakarta"
```

---

### **File 2: `app/page.tsx`** (🎨 UI/UX) - FOCUS AREA

Ini adalah cara Anda **menampilkan** hasil OCR. Fokus pada 4 bagian core yang penting untuk konten:

#### **Bagian A: Upload Area - Drag & Drop / Click** (00:00-00:05)

**Location:** lines 140-170

```typescript
<div
  onDragOver={handleDragOver}      // ← Border jadi biru saat drag
  onDragLeave={handleDragLeave}    // ← Border kembali normal saat drag keluar
  onDrop={handleDrop}              // ← USER LEPAS FILE → handleImageSelect()
  onClick={() => fileInputRef.current?.click()}  // ← Atau user klik
  className={`... ${isDragging ? 'border-blue-500 bg-blue-50' : '...'}`}
>
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    onChange={handleFileInput}  // ← File dipilih → handleImageSelect()
    className="hidden"
  />
  {/* Icon + Text */}
</div>
```

✅ **Penjelasan Teknis:**

- **onDrop:** Triggered ketika user **lepas file** di area → call `handleImageSelect()`
- **onClick:** User bisa juga **klik area** untuk open file dialog (fallback)
- **isDragging state:** Visual feedback - border berubah biru saat drag over
- **accept="image/\*":** Hanya file image yang bisa dipilih

✅ **VISUAL UNTUK VIDEO:**

- Seret file gambar ke atas upload box
- Box berubah styling (border biru, background lighter)
- Lepas file → langsung mulai OCR process
- Atau klik box → dialog standard file picker muncul

**Frame untuk Video:**

```
00:00 - Meme: Orang lihat tumpukan dokumen (kesel)
00:02 - Cursor siap seret file
00:03 - Seret file ke atas box → box berubah jadi biru
00:04 - Lepas file → box kembali normal
```

---

#### **Bagian B: Core Logic - Select & Process Image** (00:10-00:25) ⭐⭐⭐ PALING PENTING

**Location:** lines 24-37

```typescript
const handleImageSelect = useCallback(async (file: File) => {
  // Validasi: pastikan file adalah image
  if (!file.type.startsWith("image/")) return;

  // Konversi file → base64 string
  const reader = new FileReader();
  reader.onload = async (e) => {
    const imageData = e.target?.result as string;  // ← BASE64
    setSelectedImage(imageData);                      // ← Preview
    setRecognizedText(null);                          // ← Reset hasil lama

    // 🔴 INTI: PANGGIL TESSERACT
    const text = await recognize(imageData);
    if (text) {
      setRecognizedText(text);  // ← SIMPAN HASIL
    }
  };
  reader.readAsDataURL(file);  // ← Mulai konversi
}, [recognize]);
```

✅ **HIGHLIGHT PENTING:**

- **Flow:** File → FileReader → Base64 → recognize() → Tesseract → Text → setRecognizedText() → UI render
- **`reader.readAsDataURL()`** = Ubah file gambar binary menjadi string base64 (portable format)
- **`await recognize(imageData)`** = **INILAH INTI! Panggil Tesseract, kirim gambar, tunggu hasilnya**
- **`setRecognizedText(text)`** = Simpan hasil ke React state agar UI bisa render

✅ **VISUAL UNTUK VIDEO:**

1. Show file dipilih (nama file + ukuran)
2. Image preview muncul di UI
3. Event: `handleImageSelect()` dipanggil
4. Loading bar muncul (dari `useOCRWorker`)
5. Progress bar naik 0% → 100%
6. Loading selesai
7. Teks hasil muncul di bawah dengan smooth

**Code Highlight untuk Video:**
Zoom ke 3 baris ini (highlight dengan warna berbeda):

```
const text = await recognize(imageData);  // ← PANGGIL TESSERACT
if (text) {
  setRecognizedText(text);  // ← SIMPAN HASIL
}
```

---

#### **Bagian C: Image Preview** (00:15-00:25)

**Location:** lines 149-155

```typescript
{selectedImage && (
  <>
    <img src={selectedImage} alt="Selected document" className="..." />
    {/* Loading Bar, Hasil Text akan tampil di bawah */}
  </>
)}
```

✅ **Penjelasan:**

- Menampilkan preview gambar yang user upload (menggunakan base64 dari `selectedImage` state)
- Hanya tampil jika `selectedImage !== null`

✅ **VISUAL:** Gambar yang di-upload tampil di layar sebagai preview

---

#### **Bagian D: Progress Bar Real-time** (00:20-00:35) 🎬 THE WOW FACTOR!

**Location:** lines 157-170

```typescript
{isLoading && (
  <div className="...">
    <div className="flex items-center gap-2">
      <div className="... animate-spin" />  {/* Spinner */}
      <span>{progress.status || 'Processing...'}</span>
    </div>
    {/* Progress Bar */}
    <div className="bg-blue-200 rounded-full h-2">
      <div
        className="bg-blue-500 h-2 rounded-full transition-all"
        style={{ width: `${progress.progress * 100}%` }}  // ← BAR NAIK 0% → 100%
      />
    </div>
  </div>
)}
```

✅ **HIGHLIGHT PENTING:**

- **`{isLoading && ...}`** = Hanya tampil saat OCR sedang jalan (`isLoading = true`)
- **`progress.status`** = Teks status real-time dari Tesseract ("Starting recognition...", "Processing...", "Complete")
- **`progress.progress * 100`** = **Nilai 0-1 dikonversi ke persen buat width CSS** → Bar naik smooth dari 0% ke 100%
- **`animate-spin`** = Tailwind CSS class yang bikin spinner berputar (eye-catching visual!)
- **`transition-all`** = Smooth animation saat bar naik (bukan langsung melompat)

✅ **VISUAL UNTUK VIDEO:** (This is the WOW moment!)

```
Timeline:
00:20 - File dipilih → loading spinner muncul, bar mulai dari 0%
00:22 - Bar naik ke 25%, text: "Starting recognition..."
00:24 - Bar naik ke 50%, text: "Processing page..."
00:28 - Bar naik ke 75%, spinner masih berputar
00:31 - Bar mencapai 100%, text: "Complete"
00:32 - Loading hilang, hasil teks muncul dengan fade-in animation
```

**Key shots untuk video:**

- Focus ke progress bar (zoom in biar terlihat jelas)
- Show spinner berputar + bar naik
- Saat 100%: transition smooth ke hasil text

---

#### **Bagian E: Display Hasil Text & Interactive Buttons** (00:35-00:50)

**Location:** lines 180-245

```typescript
{recognizedText && !isLoading && (
  <div className="...">
    <div className="flex items-center justify-between">
      <h2>Recognized Text</h2>
      
      <div className="flex gap-2">
        {!isEditing ? (
          <>
            {/* EDIT & COPY BUTTONS */}
            <button onClick={handleEditStart} className="...">
              <Edit2 /> Edit
            </button>
            <button onClick={handleCopyText} className={`... ${copyFeedback ? 'bg-green-100' : '...'}`}>
              {copyFeedback ? 'Copied!' : 'Copy'}
            </button>
          </>
        ) : (
          <>
            {/* SAVE & CANCEL BUTTONS */}
            <button onClick={handleEditSave} className="...">Save</button>
            <button onClick={handleEditCancel} className="...">Cancel</button>
          </>
        )}
      </div>
    </div>

    {/* TEXT DISPLAY / EDIT */}
    {isEditing ? (
      <textarea value={editedText || ''} onChange={(e) => setEditedText(e.target.value)} className="..." />
    ) : (
      <p className="...whitespace-pre-wrap">
        {recognizedText}  // ← HASIL OCR
      </p>
    )}
  </div>
)}
```

✅ **PENJELASAN FLOW:**

| Kondisi      | Tombol Tampil | Komponen Text           | Fungsi                                    |
| ------------ | ------------- | ----------------------- | ----------------------------------------- |
| `!isEditing` | Edit + Copy   | `<p>` (read-only)       | User lihat hasil OCR, bisa copy atau edit |
| `isEditing`  | Save + Cancel | `<textarea>` (editable) | User bisa custom/fix hasil OCR manual     |

✅ **KEY FEATURES:**

1. **Copy Button Action:**

   ```typescript
   const handleCopyText = async () => {
     if (recognizedText) {
       await navigator.clipboard.writeText(recognizedText); 
       setCopyFeedback(true);
       setTimeout(() => setCopyFeedback(false), 2000); 
     }
   };
   ```

   - User klik Copy → Teks di-copy ke clipboard (bisa langsung paste di Word, Gmail, dll)
   - Feedback: Button jadi hijau dengan checkmark "Copied!" selama 2 detik

2. **Edit Feature:**

   ```typescript
   const handleEditStart = () => {
     setEditedText(recognizedText);
     setIsEditing(true);
   };

   const handleEditSave = () => {
     if (editedText !== null) {
       setRecognizedText(editedText);
       setIsEditing(false);
     }
   };
   ```

   - User bisa fix kesalahan OCR secara manual (misal: OCR salah baca "0" jadi "O")
   - Save → teks terupdate
   - Cancel → kembali ke versi original OCR

✅ **VISUAL UNTUK VIDEO:**

```
00:35 - Teks hasil muncul di box dengan styling rapi
00:37 - Show Copy button
00:38 - User klik Copy → button jadi hijau + "Copied!" feedback
00:40 - User klik Edit button
00:42 - Box berubah jadi textarea editable (user bisa ketik)
00:44 - User mengetik koreksi di textarea
00:46 - User klik Save → textarea hilang, teks terupdate di display
00:50 - Final result: teks bersih siap pakai
```

**Highlights untuk video:**

- Show Copy functionality (instant copy ke clipboard!)
- Show Edit mode (user bisa customize hasil)
- Show Save (perubahan langsung terupdate)

---

## 🎬 Script Video Shorts (30-60 detik)

### **Video #1: "Males Ngetik Ulang? Bikin OCR Sendiri!" (45 detik)**

| Waktu | Visual                                                            | Voice Over                                              |
| ----- | ----------------------------------------------------------------- | ------------------------------------------------------- |
| 00:00 | Meme: Orang nangis lihat tumpukan dokumen/foto dengan banyak teks | "Masih ngetik ulang teks dari gambar? Parah deh..."     |
| 00:05 | Buka VS Code, show `npm install tesseract.js`                     | "Solusinya install 1 library: tesseract.js"             |
| 00:10 | Zoom ke line: `import { createWorker } from "tesseract.js"`       | "Import library-nya, gakperlu setup ribet OS."          |
| 00:15 | Show Bagian B kode + **highlight 3 baris core**                   | "Panggil recognize(), kasih gambar... LANGSUNG JADI!"   |
| 00:25 | Jalankan web app, drag-drop foto dokumen ke UI                    | "Taruh gambar di sini... "                              |
| 00:30 | Progress bar muncul 0% → 100%, spinner berputar                   | "Tunggu proses OCR-nya jalan... "                       |
| 00:40 | Hasil teks muncul di layar persis sama dengan dokumen asli        | "BUM! Teks keluar otomatis! Tinggal copy-paste!"        |
| 00:42 | Klik Copy button → jadi hijau "Copied!"                           | "Copy langsung ke clipboard..."                         |
| 00:45 | Meme: Orang joget "Stonks" / salute                               | "Coding tuh kayak magician deh. Next video apa? Komen!" |

**Video Hook:** "Pare, aku bisa baca gambar!" 🤖

---

### **Video #2: "10 Menit Bikin Scanner Dokumen" (60 detik)**

| Waktu | Visual                                                      | Voice Over                                            |
| ----- | ----------------------------------------------------------- | ----------------------------------------------------- |
| 00:00 | Layar VS Code: folder kosong                                | "Mau bikin scanner dokumen? Cuma 10 menit kok!"       |
| 00:05 | Terminal: `npx create-next-app ocr-scanner`                 | "Bikin Next.js project dulu..."                       |
| 00:10 | Terminal: `npm install tesseract.js`                        | "Tambah tesseract.js buat OCR-nya..."                 |
| 00:15 | Show file `hooks/useOCRWorker.ts` - highlight Bagian 1-3    | "Bikin custom hook useOCRWorker untuk logic OCR..."   |
| 00:25 | Show file `app/page.tsx` - highlight Bagian A (upload area) | "UI drag-drop area buat upload gambar..."             |
| 00:30 | Show Bagian B (handleImageSelect kode)                      | "Kode untuk handle image selection..."                |
| 00:35 | Real-time run: drag-drop contoh foto KTP ke web             | "Test! Drag-drop foto KTP... "                        |
| 00:40 | Progress bar jalan 0% → 100%                                | "Prosesnya lagi jalan... spinner berputar..."         |
| 00:45 | Hasil teks & buttons muncul                                 | "SELESAI! Teks + Copy button langsung ready!"         |
| 00:55 | Show Copy button clicked, Edit mode, Save button            | "User bisa copy instant, atau edit manual!"           |
| 60:00 | Meme sukses / modern problem modern solution                | "Gampang kan? Like & subscribe buat tutorial lanjut!" |

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

1. **"5-3 Baris Kode"** ← Angle utama

   ```typescript
   const text = await recognize(imageData);
   if (text) {
     setRecognizedText(text);
   }
   ```

2. **Progress Bar Real-time** ← Visual yang eye-catching
   - Show percentage 0% → 100%
   - Keliatan "prosesnya lagi jalan"

3. **Hasil Instant** ← The Wow Factor
   - Foto KTP/Dokumen → Teks keluar sempurna
   - "Persis sama dengan aslinya!"

4. **Copy-Paste Ready** ← Utility
   - Click Copy button → green "Copied!" feedback
   - User tinggal paste ke Word/Email/wherever
   - Gak perlu rework manual

5. **Edit Feature** ← Flexibility
   - User bisa fix kesalahan OCR manual
   - Click Edit → modify → Save
   - "Gakperfect? Tinggal edit manual!"

6. **"Tanpa setup ribet OS"** ← Tech angle
   - Library-based, bukan installer exe
   - Bisa di browser langsung!

---

## 🎨 Visual Tips untuk Shorts

| Element             | Rekomendasi                                                   |
| ------------------- | ------------------------------------------------------------- |
| **Zoom Code**       | Highlight 3-4 baris inti dengan zoom 200%-300%                |
| **Cursor**          | Pakek cursor animation biar keliatan mana yang penting        |
| **Color Highlight** | Beri warna berbeda untuk `recognize()`, `imageData`, `text`   |
| **Progress Bar**    | Focus tight di bar, biar viewer keliatan progress naik        |
| **Copy Feedback**   | Show button change ke green + "Copied!" text                  |
| **Music/Sound**     | Scan beep sound saat recognize start, success sound saat done |
| **Text Overlay**    | "OCR = Optical Character Recognition" subtitle singkat        |
| **Transition**      | Smooth fade antara step-step (upload → processing → result)   |
| **Timeline**        | Gunakan timeline/subtitle di bawah untuk track durasi         |

---

## 📊 Content Series Idea

**Video Sequence untuk Maksimalkan Engagement:**

1. **Shorts #1:** "Males Ngetik Ulang?" (Hook - 30 detik) → Drive awareness
2. **Shorts #2:** "Cuma 3 Baris Code" (Code Explainer - 45 detik) → Education
3. **Shorts #3:** "Bikin Scanner 10 Menit" (Full Tutorial - 60 detik) → Action
4. **Shorts #4:** "Real-Time OCR Demo + Edit Mode" (Advanced - 45 detik) → Wow factor

**Caption Hashtag:**

- #CodingSimple #OCR #Javascript #Tesseract #NextJS #TutorialCoding #WebDev #ScannerApps

---

## 🚀 Production Checklist

**Sebelum Recording:**

- [ ] Persiapkan contoh gambar (KTP, struk, dokumen, handwritten text)
- [ ] Siapkan font size IDE besar (reader-friendly untuk video)
- [ ] Setup dual monitor (kode di satu, preview di satu)
- [ ] Test aplikasi berjalan smooth
- [ ] Prepare sound effects (scan, success, copy beep)
- [ ] Draft script/talking points

**During Recording:**

- [ ] Screen record whole app (upload drag-drop sampai copy)
- [ ] Capture multiple demo (KTP, struk, dokumen berbeda)
- [ ] Record multiple takes (ada yang smooth, ada yang kurang)

**During Editing:**

- [ ] Add zoom pada kode important (3-4 baris)
- [ ] Add color highlight buat key functions
- [ ] Add text overlay/subtitle
- [ ] Add sound effects at key moments
- [ ] Add smooth transitions antara scenes
- [ ] Keep pace fast & snappy (satset style)

**Estimasi Time to Create:** 1-2 jam per video (recording + editing)

---

**Made with ❤️ untuk konten coding yang impact!**

Lihat juga: [SCRIPT_PENJELASAN_KODE.md](SCRIPT_PENJELASAN_KODE.md) untuk penjelasan teknis setiap komponen.
