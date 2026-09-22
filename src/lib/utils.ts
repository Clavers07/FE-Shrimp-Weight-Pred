import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ErrorCode } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatErrorCode(code: ErrorCode): { title: string; message: string; action: string } {
  switch (code) {
    case 'NO_FILE_KEY':
    case 'EMPTY_FILE':
      return {
        title: 'Gambar Tidak Ditemukan',
        message: 'File gambar udang belum dipilih atau file kosong.',
        action: 'Pilih kembali foto udang yang ingin diuji.',
      };
    case 'UNSUPPORTED_TYPE':
      return {
        title: 'Format File Tidak Didukung',
        message: 'Format gambar harus .jpg, .jpeg, atau .png.',
        action: 'Gunakan format JPG atau PNG dari kamera / galeri HP Anda.',
      };
    case 'FILE_TOO_LARGE':
      return {
        title: 'Ukuran Gambar Terlalu Besar',
        message: 'Ukuran file melampaui batas maksimum 15 MB server.',
        action: 'Foto akan otomatis dikompresi uniform pada percobaan berikutnya.',
      };
    case 'INVALID_IMAGE':
      return {
        title: 'Gambar Rusak / Tidak Dapat Dibaca',
        message: 'Sistem gagal membaca piksel dari file gambar ini.',
        action: 'Ambil ulang foto udang dengan pencahayaan dan fokus yang jelas.',
      };
    case 'MODEL_NOT_READY':
      return {
        title: 'Server AI Sedang Menyiapkan Model',
        message: 'Model inferensi YOLOv8 / SVR sedang melakukan pemuatan awal.',
        action: 'Tunggu beberapa detik dan tekan tombol "Coba Lagi".',
      };
    case 'INFERENCE_FAILED':
      return {
        title: 'Gagal Menjalankan Inferensi',
        message: 'Terjadi masalah teknis saat model memproses segmentasi udang.',
        action: 'Pastikan posisi udang jelas dan tidak terlalu blur, lalu coba lagi.',
      };
    case 'CLIENT_ABORTED':
      return {
        title: 'Proses Dibatalkan',
        message: 'Pengunggahan gambar dibatalkan oleh pengguna.',
        action: 'Pilih foto baru untuk memulai kembali analisis.',
      };
    case 'NETWORK_ERROR':
    default:
      return {
        title: 'Gangguan Koneksi Jaringan',
        message: 'Gagal terhubung ke server Flask API tambak.',
        action: 'Periksa koneksi Wi-Fi/Internet atau status server backend.',
      };
  }
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
