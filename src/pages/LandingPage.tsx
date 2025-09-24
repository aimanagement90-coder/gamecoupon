import React from 'react'
import { Link } from 'react-router-dom'
import { 
  GamepadIcon, 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  Star,
  ArrowRight 
} from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      icon: GamepadIcon,
      title: 'Etkileşimli Oyunlar',
      description: 'Müşterilerinizin sevdiği oyunları sitenize entegre edin'
    },
    {
      icon: TrendingUp,
      title: 'Satış Artışı',
      description: '%40\'a kadar daha fazla dönüşüm oranı elde edin'
    },
    {
      icon: Shield,
      title: 'Güvenilir Altyapı',
      description: 'Kurumsal seviyede güvenlik ve performans'
    },
    {
      icon: Zap,
      title: 'Kolay Entegrasyon',
      description: 'Sadece birkaç dakikada sitenize ekleyin'
    }
  ]

  const testimonials = [
    {
      name: 'Ahmet Yılmaz',
      business: 'TechStore',
      content: 'GameCoupon sayesinde satışlarımız %35 arttı. Müşteriler oyun oynamayı çok seviyor!'
    },
    {
      name: 'Elif Demir',
      business: 'ModaBoutique',
      content: 'Kupon sistemi harika çalışıyor. Müşteriler oyun oynayıp indirim kazanıyor.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <GamepadIcon className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">GameCoupon</span>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Giriş Yap
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Ücretsiz Başla
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              E-ticaret Sitenizde
              <span className="text-indigo-600 block">Oyun Oynatan Platform</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Müşterileriniz oyun oynasın, kupon kazansın, daha fazla alışveriş yapsın. 
              Satışlarınızı artırmak için etkileşimli oyun deneyimi sunan platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                Ücretsiz Başla
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors">
                Demo İzle
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Neden GameCoupon?
            </h2>
            <p className="text-xl text-gray-600">
              E-ticaret sitenizi daha etkileşimli hale getirin
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-indigo-100">Aktif E-ticaret Sitesi</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">%40</div>
              <div className="text-indigo-100">Ortalama Satış Artışı</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">2M+</div>
              <div className="text-indigo-100">Aylık Oyun Oynama</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Müşterilerimiz Ne Diyor?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.business}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Hazır mısınız?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Bugün başlayın ve satışlarınızı artırmaya başlayın
          </p>
          <Link
            to="/signup"
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center"
          >
            Ücretsiz Hesap Oluştur
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <GamepadIcon className="h-8 w-8 text-indigo-400" />
            <span className="ml-2 text-xl font-bold">GameCoupon</span>
          </div>
          <div className="text-center text-gray-400 mt-4">
            © 2024 GameCoupon. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  )
}