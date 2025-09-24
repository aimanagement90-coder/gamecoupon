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
  Settings,
  Code,
  Eye
} from 'lucide-react'
import type { Database } from '../lib/supabase'

type Game = Database['public']['Tables']['games']['Row']
type Coupon = Database['public']['Tables']['coupons']['Row']

const availableGames = [
  {
    id: 'snake',
    name: 'Yılan Oyunu',
    description: 'Klasik yılan oyunu - Yemi topla ve büyü!',
    code: `
// Snake Game Implementation
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{x: 10, y: 10}];
let food = {x: 15, y: 15};
let dx = 0;
let dy = 0;
let score = 0;

function drawGame() {
    clearCanvas();
    moveSnake();
    drawSnake();
    drawFood();
    checkGameEnd();
}

function clearCanvas() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = 'lime';
    snake.forEach(drawGamePart);
}

function drawGamePart(snakePart) {
    ctx.fillRect(snakePart.x * gridSize, snakePart.y * gridSize, gridSize - 2, gridSize - 2);
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        generateFood();
        if (score >= 50) {
            gameWon();
        }
    } else {
        snake.pop();
    }
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
}

function checkGameEnd() {
    const head = snake[0];
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
    }
    
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
        }
    }
}

document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    
    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;
    
    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

setInterval(drawGame, 100);
    `
  },
  {
    id: 'memory',
    name: 'Hafıza Oyunu',
    description: 'Kartları eşleştir ve hafızanı test et!',
    code: `
// Memory Game Implementation
const gameBoard = document.getElementById('gameBoard');
const cards = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎪', '🎯'];
const gameCards = [...cards, ...cards];
let flippedCards = [];
let matchedPairs = 0;
let score = 0;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function createBoard() {
    shuffle(gameCards);
    gameBoard.innerHTML = '';
    
    gameCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'memory-card';
        cardElement.dataset.card = card;
        cardElement.dataset.index = index;
        cardElement.innerHTML = '<div class="card-back">?</div><div class="card-front">' + card + '</div>';
        cardElement.addEventListener('click', flipCard);
        gameBoard.appendChild(cardElement);
    });
}

function flipCard() {
    if (flippedCards.length < 2 && !this.classList.contains('flipped')) {
        this.classList.add('flipped');
        flippedCards.push(this);
        
        if (flippedCards.length === 2) {
            setTimeout(checkMatch, 1000);
        }
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.dataset.card === card2.dataset.card) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        score += 20;
        
        if (matchedPairs === cards.length) {
            gameWon();
        }
    } else {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
    }
    
    flippedCards = [];
}

createBoard();
    `
  }
]

export default function GamesPage() {
  const { user } = useAuth()
  const [games, setGames] = useState<Game[]>([])
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [showGameModal, setShowGameModal] = useState(false)
  const [showIntegrationModal, setShowIntegrationModal] = useState(false)
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    quantity: 1,
    min_purchase_amount: 0
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

  const handleAddGame = async (gameTemplate: typeof availableGames[0]) => {
    if (!user) return

    const { data, error } = await supabase
      .from('games')
      .insert([{
        name: gameTemplate.name,
        description: gameTemplate.description,
        code: gameTemplate.code
      }])
      .select()
      .single()

    if (!error && data) {
      fetchGames()
      setSelectedGame(data)
      setShowGameModal(false)
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
        discount_value: 0,
        quantity: 1,
        min_purchase_amount: 0
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

  const generateIframeUrl = () => {
    const baseUrl = window.location.origin
    return `${baseUrl}/game-selector?userId=${user?.id}`
  }

  const copyIframeCode = () => {
    const iframeUrl = generateIframeUrl()
    const iframeCode = `<iframe src="${iframeUrl}" width="800" height="600" frameborder="0" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"></iframe>`
    navigator.clipboard.writeText(iframeCode)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Oyun Yönetimi</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowGameModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Oyun Seç
          </button>
          <button
            onClick={() => setShowIntegrationModal(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <Code className="h-4 w-4 mr-2" />
            Entegrasyon
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Games List */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Seçili Oyunlar</h3>
          <div className="space-y-3">
            {games.length > 0 ? games.map((game) => (
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
            )) : (
              <div className="text-center py-8 text-gray-500">
                <GamepadIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Henüz oyun seçmediniz</p>
                <p className="text-sm">Yukarıdaki "Oyun Seç" butonuna tıklayın</p>
              </div>
            )}
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
                    <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      <Eye className="h-4 w-4 mr-2" />
                      Önizle
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{selectedGame.description}</p>
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
                    <div key={coupon.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Gift className="h-6 w-6 text-green-600" />
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{coupon.code}</p>
                          <p className="text-sm text-gray-500">{coupon.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                            <span>Adet: {coupon.quantity}</span>
                            <span>Min. Tutar: ₺{coupon.min_purchase_amount}</span>
                          </div>
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
              <p className="text-gray-500">Bir oyun seçin veya yeni oyun ekleyin</p>
            </div>
          )}
        </div>
      </div>

      {/* Game Selection Modal */}
      {showGameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Oyun Seç</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableGames.map((game) => (
                <div key={game.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center mb-3">
                    <GamepadIcon className="h-8 w-8 text-indigo-600" />
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900">{game.name}</h4>
                      <p className="text-sm text-gray-500">{game.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddGame(game)}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Bu Oyunu Ekle
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowGameModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kupon Adedi
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={couponForm.quantity}
                    onChange={(e) => setCouponForm({ 
                      ...couponForm, 
                      quantity: Number(e.target.value) 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min. Alışveriş (₺)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={couponForm.min_purchase_amount}
                    onChange={(e) => setCouponForm({ 
                      ...couponForm, 
                      min_purchase_amount: Number(e.target.value) 
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

      {/* Integration Modal */}
      {showIntegrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Web Sitesi Entegrasyonu</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">iframe Kodu</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Bu kodu web sitenizin istediğiniz yerine yapıştırın:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <code className="text-sm text-gray-800 break-all">
                    {`<iframe src="${generateIframeUrl()}" width="800" height="600" frameborder="0" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"></iframe>`}
                  </code>
                </div>
                <button
                  onClick={copyIframeCode}
                  className="mt-3 flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Kodu Kopyala
                </button>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Nasıl Çalışır?</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Müşterileriniz iframe içinde oyun seçer</li>
                  <li>• Oyunu oynar ve başarı durumuna göre kupon kazanır</li>
                  <li>• Kazanılan kupon kodu müşteriye gösterilir</li>
                  <li>• Müşteri bu kodu alışverişte kullanabilir</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Önizleme URL'si</h4>
                <p className="text-sm text-blue-800 mb-2">
                  Entegrasyonu test etmek için bu URL'yi kullanabilirsiniz:
                </p>
                <code className="text-xs bg-white p-2 rounded border block overflow-x-auto text-blue-700">
                  {generateIframeUrl()}
                </code>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowIntegrationModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}