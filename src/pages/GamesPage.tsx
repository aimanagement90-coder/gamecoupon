import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  GamepadIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  ExternalLink,
  Gift,
  Settings
} from 'lucide-react'
import type { Database } from '../lib/supabase'

type Game = Database['public']['Tables']['games']['Row']
type Coupon = Database['public']['Tables']['coupons']['Row']

export default function GamesPage() {
  const { user } = useAuth()
  const [games, setGames] = useState<Game[]>([])
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0
  })

  useEffect(() => {
    fetchGames()
  }, [])

  useEffect(() => {
    if (selectedGame) {
      fetchGameCoupons(selectedGame.id)
    }
  }, [selectedGame])

  const fetchGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) {
      setGames(data)
      if (!selectedGame && data.length > 0) {
        setSelectedGame(data[0])
      }
    }
  }

  const fetchGameCoupons = async (gameId: string) => {
    if (!user) return
    
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('user_id', user.id)
      .eq('game_id', gameId)
      .order('created_at', { ascending: false })
    
    if (data) {
      setCoupons(data)
    }
  }

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedGame) return

    const { error } = await supabase
      .from('coupons')
      .insert([{
        user_id: user.id,
        game_id: selectedGame.id,
        ...couponForm
      }])

    if (!error) {
      fetchGameCoupons(selectedGame.id)
      setShowCouponModal(false)
      setCouponForm({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0
      })
    }
  }

  const handleDeleteCoupon = async (couponId: string) => {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', couponId)

    if (!error && selectedGame) {
      fetchGameCoupons(selectedGame.id)
    }
  }

  const generateIframeUrl = (gameId: string) => {
    const baseUrl = window.location.origin
    return `${baseUrl}/game/${gameId}?userId=${user?.id}`
  }

  const copyIframeCode = (gameId: string) => {
    const iframeUrl = generateIframeUrl(gameId)
    const iframeCode = `<iframe src="${iframeUrl}" width="800" height="600" frameborder="0"></iframe>`
    navigator.clipboard.writeText(iframeCode)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Oyun Yönetimi</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Games List */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mevcut Oyunlar</h3>
          <div className="space-y-3">
            {games.map((game) => (
              <div
                key={game.id}
                onClick={() => setSelectedGame(game)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedGame?.id === game.id
                    ? 'bg-indigo-50 border-2 border-indigo-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <GamepadIcon className="h-8 w-8 text-indigo-600" />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{game.name}</p>
                    <p className="text-sm text-gray-500">{game.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Game Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedGame ? (
            <>
              {/* Game Info */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedGame.name}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyIframeCode(selectedGame.id)}
                      className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      iframe Kopyala
                    </button>
                    <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Önizle
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{selectedGame.description}</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">iframe URL:</p>
                  <code className="text-xs bg-white p-2 rounded border block overflow-x-auto">
                    {generateIframeUrl(selectedGame.id)}
                  </code>
                </div>
              </div>

              {/* Coupons */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Kuponlar</h3>
                  <button
                    onClick={() => setShowCouponModal(true)}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Kupon Ekle
                  </button>
                </div>
                
                <div className="space-y-3">
                  {coupons.length > 0 ? coupons.map((coupon) => (
                    <div key={coupon.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Gift className="h-6 w-6 text-green-600" />
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{coupon.code}</p>
                          <p className="text-sm text-gray-500">{coupon.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {coupon.discount_type === 'percentage' ? '%' : '₺'}{coupon.discount_value}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <Gift className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Bu oyun için kupon oluşturmadınız</p>
                      <p className="text-sm">Yukarıdaki butona tıklayarak kupon ekleyebilirsiniz</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <GamepadIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">Bir oyun seçin</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Yeni Kupon Ekle</h3>
            <form onSubmit={handleAddCoupon} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kupon Kodu
                </label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Örn: INDIRIM20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <input
                  type="text"
                  required
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Kupon açıklaması"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İndirim Tipi
                  </label>
                  <select
                    value={couponForm.discount_type}
                    onChange={(e) => setCouponForm({ 
                      ...couponForm, 
                      discount_type: e.target.value as 'percentage' | 'fixed' 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="percentage">Yüzde (%)</option>
                    <option value="fixed">Sabit Tutar (₺)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İndirim Miktarı
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={couponForm.discount_value}
                    onChange={(e) => setCouponForm({ 
                      ...couponForm, 
                      discount_value: Number(e.target.value) 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Kupon Ekle
                </button>
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="flex-1 border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}