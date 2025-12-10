'use client';

import Link from 'next/link';
import { Sparkles, ShoppingBag, TrendingUp, Shield, ArrowRight, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-pink-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-pink-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Annel Beauty
              </span>
            </div>
            <Link
              href="/login"
              className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                Annel Beauty
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Sistem Analytics & Manajemen Penjualan Terdepan
            </p>
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              Kelola penjualan toko offline dan online Anda dengan mudah. Analisis data real-time, 
              manajemen produk, dan laporan keuangan yang komprehensif.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold text-lg hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Mulai Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full border-2 border-pink-600 text-pink-600 font-semibold text-lg hover:bg-pink-50 transition-all"
              >
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Fitur Unggulan</h2>
            <p className="text-xl text-gray-600">Semua yang Anda butuhkan untuk mengelola bisnis kecantikan Anda</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-pink-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center mb-6">
                <TrendingUp className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Dashboard Analytics</h3>
              <p className="text-gray-600">
                Analisis penjualan real-time dengan grafik interaktif. Pantau total penjualan, 
                keuntungan, dan performa produk dengan mudah.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-pink-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-6">
                <ShoppingBag className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Manajemen Produk</h3>
              <p className="text-gray-600">
                Kelola produk dengan mudah. Tambah, edit, dan atur harga produk dengan sistem 
                riwayat harga yang otomatis.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-pink-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-blue-100 flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Multi-Toko</h3>
              <p className="text-gray-600">
                Kelola toko offline dan online dalam satu platform. Transfer stok antar toko 
                dan gudang dengan mudah.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-pink-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center mb-6">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Upload CSV</h3>
              <p className="text-gray-600">
                Import data penjualan dari CSV dengan mudah. Sistem otomatis memproses 
                dan menganalisis data Anda.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-pink-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center mb-6">
                <ShoppingBag className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">History & Tracking</h3>
              <p className="text-gray-600">
                Lacak semua aktivitas: transfer produk, penambahan stok, dan perubahan harga. 
                Semua tercatat dengan timestamp lengkap.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-pink-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mb-6">
                <Star className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Laporan Lengkap</h3>
              <p className="text-gray-600">
                Generate laporan penjualan per hari dengan analisis mendalam. 
                Grafik visual yang mudah dipahami.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">
              Siap Meningkatkan Bisnis Anda?
            </h2>
            <p className="text-xl text-pink-100 mb-8">
              Mulai gunakan Annel Beauty Analytics hari ini dan rasakan perbedaannya
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-pink-600 font-semibold text-lg hover:bg-pink-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Login Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-pink-400" />
            <span className="text-xl font-bold text-white">Annel Beauty</span>
          </div>
          <p className="text-gray-400">© 2025 Annel Beauty Analytics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
