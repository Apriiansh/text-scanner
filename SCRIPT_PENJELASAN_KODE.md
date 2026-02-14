# 📝 Script Penjelasan Kode OCR Scanner

Dokumen ini menjelaskan **apa yang dilakukan** setiap potongan kode di proyek, tanpa voice over. Berguna untuk memahami flow dan logic sebelum recording video.

---

## 🔄 Flow Keseluruhan Aplikasi

```
User upload/drag image 
    ↓
handleImageSelect() dipanggil
    ↓
Image dibaca (FileReader) → base64
    ↓
recognize(imageData) dipanggil
    ↓
Tesseract bekerja (progress bar jalan)
    ↓
result.data.text diperoleh
    ↓
Hasil ditampilkan di UI
```

---

## 1️⃣ **UPLOAD IMAGE - handleImageSelect()**

**File:** `app/page.tsx` (lines 24-37)

### Kode:
```typescript
const handleImageSelect = useCallback(async (file: File) => {
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const imageData = e.target?.result as string;  // ← Base64 string
    setSelectedImage(imageData);                      // ← Simpan ke state
    setRecognizedText(null);                          // ← Reset hasil lama

    const text = await recognize(imageData);         // ← PANGGIL TESSERACT
    if (text) {
      setRecognizedText(text);                        // ← Simpan hasil
    }
  };
  reader.readAsDataURL(file);                         // ← Konversi ke base64
}, [recognize]);
```

### Penjelasan:

| Baris | Fungsi | Penjelasan |
|-------|--------|-----------|
| `if (!file.type.startsWith('image/'))` | Validasi | Pastikan file adalah gambar (jpg, png, gif, dll), bukan file lain |
| `const reader = new FileReader()` | Setup | Siapkan object untuk membaca file |
| `reader.readAsDataURL(file)` | Konversi | Ubah file gambar menjadi string base64 (biar bisa diproses) |
| `const imageData = e.target?.result as string` | Ekstrak | Ambil hasil base64 dari FileReader |
| `setSelectedImage(imageData)` | Display | Tampilkan preview gambar di layar |
| `setRecognizedText(null)` | Reset | Hapus hasil OCR lama sebelum scan yang baru |
| `const text = await recognize(imageData)` | 🔑 INTI | **Panggil Tesseract.js untuk baca teks dari gambar** |
| `setRecognizedText(text)` | Hasil | Simpan teks hasil scan ke state |

### Kapan dipanggil:
- Ketika user **drag-drop** file ke area upload
- Ketika user **klik atau pilih file** dari dialog

---

## 2️⃣ **OCR LOGIC - recognize() DARI useOCRWorker**

**File:** `hooks/useOCRWorker.ts` (lines 47-68)

### Kode:
```typescript
const recognize = useCallback(
  async (imagePath: string) => {
    if (!workerRef.current) {
      await initWorker();  // ← Setup Tesseract jika belum
    }

    if (!workerRef.current) {
      setError("OCR Worker not initialized");
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      setProgress({ status: "Starting recognition...", progress: 0 });

      // 🔴 INTI ALGORITHM - 1 BARIS SAJA!
      const result = await workerRef.current.recognize(imagePath);
      
      setProgress({ status: "Complete", progress: 1 });
      setIsLoading(false);

      return result.data.text;  // ← HASIL TEKS KELUAR DARI SINI
    } catch (err) {
      const message = err instanceof Error ? err.message : "Recognition failed";
      setError(message);
      setIsLoading(false);
    }
  },
  [initWorker]
);
```

### Penjelasan:

| Baris | Fungsi | Penjelasan |
|-------|--------|-----------|
| `if (!workerRef.current)` | Pengecekan | Apakah Tesseract worker sudah diinisialisasi? |
| `await initWorker()` | Setup | Jika belum, setup Tesseract dulu dengan `createWorker('eng')` |
| `setIsLoading(true)` | Flag | Beritahu UI bahwa sedang proses (tampilkan loading spinner) |
| `setProgress({...})` | UI Feedback | Update progress bar dan status text |
| `const result = await workerRef.current.recognize(imagePath)` | ⭐⭐⭐ | **Ini baris paling penting! Tesseract membaca teks dari gambar** |
| `return result.data.text` | Return | Kembalikan string teks hasil scan ke component |
| `catch (err)` | Error Handling | Jika ada error (koneksi gagal, invalid image), tampilkan pesan error |

### Output:
```
Input: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
Processing: Tesseract baca gambar pixel by pixel
Output: "Nama: John Doe\nNo. KTP: 1234.5678.9012.3456\nTempat Lahir: Jakarta"
```

---

## 3️⃣ **UPLOAD AREA - Drag & Drop**

**File:** `app/page.tsx` (lines 43-65)

### Kode:
```typescript
<div
  onDragOver={handleDragOver}      // ← User seret file masuk area
  onDragLeave={handleDragLeave}    // ← User seret file keluar area
  onDrop={handleDrop}              // ← User LEPAS file di area ← TRIGGER UPLOAD
  onClick={() => fileInputRef.current?.click()}  // ← Atau klik biasa
  className={`... ${isDragging ? 'border-blue-500 bg-blue-50' : '...'}`}
>
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    onChange={handleFileInput}     // ← File dipilih → handleImageSelect
    className="hidden"
  />
  {/* Visual: Icon + Text */}
</div>
```

### Event Flow:

| Event | Handler | Hasil |
|-------|---------|-------|
| User seret file ke div | `onDragOver` | Ubah styling (biru) untuk feedback |
| User seret file keluar | `onDragLeave` | Kembalikan styling normal |
| User **LEPAS** file | `onDrop` → `handleImageSelect()` | **Mulai upload & OCR** |
| User klik div | `onClick` | Buka dialog pilih file |
| User pilih file | `onChange` → `handleFileInput()` | Jalankan `handleImageSelect()` |

### Penjelasan:
- **Drag & Drop:** Lebih intuitif, user bisa langsung seret file
- **Click:** Untuk user yang tidak familiar dengan drag & drop
- **isDragging:** State untuk visual feedback (ubah warna border saat drag)

---

## 4️⃣ **PROGRESS BAR - Real-Time Feedback**

**File:** `app/page.tsx` (lines 157-167)

### Kode:
```typescript
{isLoading && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-blue-900 font-medium">
        {progress.status || 'Processing...'}
      </span>
    </div>
    <div className="w-full bg-blue-200 rounded-full h-2">
      <div
        className="bg-blue-500 h-2 rounded-full transition-all"
        style={{ width: `${progress.progress * 100}%` }}  // ← KEY BARIS
      />
    </div>
  </div>
)}
```

### Penjelasan:

| Elemen | Asal Data | Penjelasan |
|--------|----------|-----------|
| `{isLoading && ...}` | `useOCRWorker` | Tampilkan loading state hanya kalau sedang proses |
| `animate-spin` | Tailwind CSS | Spinning loader icon untuk visual feedback |
| `{progress.status}` | `useOCRWorker` | Teks status: "Starting...", "Recognizing...", "Complete" |
| `width: ${progress.progress * 100}%` | `useOCRWorker` | **Bar meluncur dari 0% → 100% sambil Tesseract bekerja** |

### Progress Flow:
```
00% ▯░░░░░░░░ "Starting recognition..."
25% ▯▯▯░░░░░░ "Processing page 1..."
50% ▯▯▯▯▯░░░░ "Processing page 2..."
100% ▯▯▯▯▯▯▯▯▯ "Complete"
```

---

## 5️⃣ **HASIL TEXT - Display & Edit**

**File:** `app/page.tsx` (lines 175-245)

### Kode untuk Display:
```typescript
{recognizedText && !isLoading && (
  <div className="bg-white rounded-lg">
    <p className="text-slate-700 whitespace-pre-wrap">
      {recognizedText}  // ← TEKS HASIL OCR MUNCUL DI SINI
    </p>
  </div>
)}
```

### Kode untuk Edit:
```typescript
{isEditing ? (
  <textarea
    value={editedText || ''}
    onChange={(e) => setEditedText(e.target.value)}
    className="w-full h-40 p-3 border rounded-lg"
  />
) : (
  <p className="whitespace-pre-wrap">
    {recognizedText}
  </p>
)}
```

### Penjelasan:

| Kondisi | Tampilkan | Fungsi |
|---------|-----------|--------|
| `recognizedText && !isLoading` | Text biasa (read-only) | Tampilkan hasil OCR yang sudah selesai |
| `!isEditing` | Tombol Edit + Copy | User bisa mulai edit atau copy hasil |
| `isEditing` | Textarea editable | User bisa ketik manual untuk fix kesalahan OCR |
| Tombol Save | Update `recognizedText` | Simpan perubahan manual user |
| Tombol Cancel | Batalkan edit | Kembali ke hasil OCR original |

### Copy Button:
```typescript
const handleCopyText = async () => {
  if (recognizedText) {
    await navigator.clipboard.writeText(recognizedText);  // ← Copy ke clipboard
    setCopyFeedback(true);   // ← Tampilkan "Copied!" feedback
    setTimeout(() => setCopyFeedback(false), 2000);  // ← Hilang setelah 2 detik
  }
};
```

---

## 🔗 State Dependencies (State Management)

Berikut urutan state yang berubah dari upload hingga hasil:

```
1. User upload image
   ↓ setSelectedImage(imageData)
   ↓ setRecognizedText(null)  ← Reset hasil lama
   
2. OCR dimulai
   ↓ setIsLoading(true)
   ↓ setProgress({ progress: 0, status: "Starting..." })
   
3. Tesseract bekerja
   ↓ (progress bar jalan, progress.progress → 0.5, 0.8, 1.0)
   
4. OCR selesai
   ↓ setIsLoading(false)
   ↓ setRecognizedText(text)  ← HASIL FINAL
   ↓ setProgress({ progress: 1, status: "Complete" })
   
5. User edit (opsional)
   ↓ setIsEditing(true)
   ↓ setEditedText(recognizedText)
   ↓ (user ketik di textarea)
   ↓ setEditedText(e.target.value)
   ↓ Klik Save → setRecognizedText(editedText)
```

---

## 📊 State Diagram

```
┌─ selectedImage: null → base64 string
│
├─ recognizedText: null → OCR result string
│
├─ editedText: null → edited string (saat edit mode)
│
├─ isEditing: false → true → false
│
├─ isLoading: false → true → false
│
├─ progress: { progress: 0, status: "..." }
│           ↓
│           { progress: 1, status: "Complete" }
│
└─ isDragging: false → true → false (visual feedback)
```

---

## ⚡ Performance Notes

1. **useCallback dependencies:** 
   - `handleImageSelect` depends on `recognize` → prevent unnecessary re-render
   - `recognize` depends on `initWorker` → lazy load Tesseract

2. **Worker cleanup:**
   ```typescript
   useEffect(() => {
     return () => {
       if (workerRef.current) {
         workerRef.current.terminate();  // ← Bersihkan memory saat unmount
       }
     };
   }, []);
   ```

3. **Image format:** Base64 lebih "portable" daripada raw File object, bisa langsung pass ke Tesseract.js

---

## 🎯 Ringkasan

| Tahap | Komponen | Aksi |
|-------|----------|------|
| **Input** | handleImageSelect | Baca file → base64 |
| **Process** | recognize (useOCRWorker) | Pass ke Tesseract → baca teks |
| **Feedback** | Progress Bar | Tampilkan progress 0-100% |
| **Output** | Display Text | Tampilkan hasil OCR |
| **Edit** | Textarea + Buttons | User bisa edit koreksi manual |

Semua ini **3 file saja** (page.tsx, useOCRWorker.ts, dependencies) tapi menghasilkan app yang sophisticated dan user-friendly! ✨
