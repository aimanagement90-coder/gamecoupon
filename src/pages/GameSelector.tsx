import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { GamepadIcon, Play, Trophy, Gift } from 'lucide-react'
import type { Database } from '../lib/supabase'

type Game = Database['public']['Tables']['games']['Row']
type Coupon = Database['public']['Tables']['coupons']['Row']

export default function GameSelector() {
  const [searchParams] = useSearchParams()
  const userId = searchParams.get('userId')
  
  const [games, setGames] = useState<Game[]>([])
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [gameState, setGameState] = useState<'select' | 'playing' | 'won' | 'lost'>('select')
  const [wonCoupon, setWonCoupon] = useState<Coupon | null>(null)
  const [score, setScore] = useState(0)

  // Game specific states
  const [snake, setSnake] = useState([[10, 10]])
  const [food, setFood] = useState([15, 15])
  const [direction, setDirection] = useState([0, 1])
  const [gameRunning, setGameRunning] = useState(false)

  // Memory game states
  const [memoryCards, setMemoryCards] = useState<string[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedCards, setMatchedCards] = useState<number[]>([])

  useEffect(() => {
    if (userId) {
      fetchUserGames()
    }
  }, [userId])

  useEffect(() => {
    if (selectedGame && userId) {
      fetchGameCoupons()
    }
  }, [selectedGame, userId])

  // Snake game logic
  useEffect(() => {
    if (gameRunning && selectedGame?.name === 'Yılan Oyunu') {
      const gameInterval = setInterval(moveSnake, 150)
      return () => clearInterval(gameInterval)
    }
  }, [snake, direction, gameRunning])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (selectedGame?.name === 'Yılan Oyunu' && gameRunning) {
        switch (e.key) {
          case 'ArrowUp':
            setDirection([-1, 0])
            break
          case 'ArrowDown':
            setDirection([1, 0])
            break
          case 'ArrowLeft':
            setDirection([0, -1])
            break
          case 'ArrowRight':
            setDirection([0, 1])
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameRunning, selectedGame])

  const fetchUserGames = async () => {
    if (!userId) return
    
    // Get games that have coupons for this user
    const { data } = await supabase
      .from('games')
      .select(`
        *,
        coupons!inner(user_id)
      `)
      .eq('coupons.user_id', userId)
    
    if (data) {
      setGames(data)
    }
  }

  const fetchGameCoupons = async () => {
    if (!selectedGame || !userId) return
    
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('user_id', userId)
      .eq('game_id', selectedGame.id)
      .gt('quantity', 0) // Only get coupons with remaining quantity
    
    if (data) {
      setCoupons(data)
    }
  }

  const startGame = (game: Game) => {
    setSelectedGame(game)
    setGameState('playing')
    setScore(0)
    setWonCoupon(null)

    if (game.name === 'Yılan Oyunu') {
      setSnake([[10, 10]])
      setFood([15, 15])
      setDirection([0, 1])
      setGameRunning(true)
    } else if (game.name === 'Hafıza Oyunu') {
      initializeMemoryGame()
    }
  }

  const initializeMemoryGame = () => {
    const cards = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎪', '🎯']
    const gameCards = [...cards, ...cards]
    
    // Shuffle cards
    for (let i = gameCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]]
    }
    
    setMemoryCards(gameCards)
    setFlippedCards([])
    setMatchedCards([])
  }

  const moveSnake = () => {
    setSnake(currentSnake => {
      const newSnake = [...currentSnake]
      const head = [
        newSnake[0][0] + direction[0],
        newSnake[0][1] + direction[1]
      ]

      // Check wall collision
      if (head[0] < 0 || head[0] >= 20 || head[1] < 0 || head[1] >= 20) {
        setGameRunning(false)
        setGameState('lost')
        return currentSnake
      }

      // Check self collision
      if (newSnake.some(segment => segment[0] === head[0] && segment[1] === head[1])) {
        setGameRunning(false)
        setGameState('lost')
        return currentSnake
      }

      newSnake.unshift(head)

      // Check food collision
      if (head[0] === food[0] && head[1] === food[1]) {
        setScore(prev => {
          const newScore = prev + 10
          if (newScore >= 50) {
            handleGameWin()
          }
          return newScore
        })
        setFood([
          Math.floor(Math.random() * 20),
          Math.floor(Math.random() * 20)
        ])
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }

  const handleMemoryCardClick = (index: number) => {
    if (flippedCards.length >= 2 || flippedCards.includes(index) || matchedCards.includes(index)) {
      return
    }

    const newFlippedCards = [...flippedCards, index]
    setFlippedCards(newFlippedCards)

    if (newFlippedCards.length === 2) {
      setTimeout(() => {
        const [first, second] = newFlippedCards
        if (memoryCards[first] === memoryCards[second]) {
          setMatchedCards(prev => [...prev, first, second])
          setScore(prev => prev + 20)
          
          if (matchedCards.length + 2 === memoryCards.length) {
            handleGameWin()
          }
        }
        setFlippedCards([])
      }, 1000)
    }
  }

  const handleGameWin = async () => {
    setGameRunning(false)
    setGameState('won')
    
    // Select random coupon and decrease quantity
    if (coupons.length > 0) {
      const availableCoupons = coupons.filter(c => c.quantity > 0)
      if (availableCoupons.length > 0) {
        const randomCoupon = availableCoupons[Math.floor(Math.random() * availableCoupons.length)]
        setWonCoupon(randomCoupon)
        
        // Decrease coupon quantity
        await supabase
          .from('coupons')
          .update({ quantity: randomCoupon.quantity - 1 })
          .eq('id', randomCoupon.id)
      }
    }
  }

  const resetGame = () => {
    setGameState('select')
    setSelectedGame(null)
    setScore(0)
    setWonCoupon(null)
    setGameRunning(false)
  }

  if (gameState === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center">
              <h1 className="text-3xl font-bold mb-2">🎮 Oyun Seç ve Kupon Kazan!</h1>
              <p className="text-indigo-100">Oyunu tamamla ve özel indirim kuponları kazan</p>
            </div>
            
            <div className="p-6">
              {games.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {games.map((game) => (
                    <div key={game.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center mb-4">
                        <GamepadIcon className="h-10 w-10 text-indigo-600" />
                        <div className="ml-4">
                          <h3 className="text-xl font-bold text-gray-900">{game.name}</h3>
                          <p className="text-gray-600">{game.description}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => startGame(game)}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-colors flex items-center justify-center"
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Oyunu Başlat
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <GamepadIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz Oyun Yok</h3>
                  <p className="text-gray-600">Bu mağaza henüz oyun eklememış.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (gameState === 'won') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4 text-center">
          <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            🎉 Tebrikler!
          </h3>
          <p className="text-gray-600 mb-6">
            Oyunu başarıyla tamamladınız ve kupon kazandınız!
          </p>
          
          {wonCoupon && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-center mb-2">
                <Gift className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-lg font-bold text-green-800">{wonCoupon.code}</span>
              </div>
              <p className="text-green-700 font-medium">
                {wonCoupon.discount_type === 'percentage' ? '%' : '₺'}{wonCoupon.discount_value} İndirim
              </p>
              <p className="text-green-600 text-sm mt-1">
                {wonCoupon.description}
              </p>
              {wonCoupon.min_purchase_amount > 0 && (
                <p className="text-green-600 text-xs mt-1">
                  Min. alışveriş: ₺{wonCoupon.min_purchase_amount}
                </p>
              )}
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={resetGame}
              className="w-full bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Başka Oyun Oyna
            </button>
            <p className="text-xs text-gray-500">
              Kupon kodunu alışverişinizde kullanabilirsiniz
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (gameState === 'lost') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">😵</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Oyun Bitti!
          </h3>
          <p className="text-gray-600 mb-6">
            Skorunuz: {score} puan<br/>
            Kupon kazanmak için daha yüksek skor yapmanız gerekiyor.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => startGame(selectedGame!)}
              className="w-full bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Tekrar Dene
            </button>
            <button
              onClick={resetGame}
              className="w-full border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Oyun Seçimine Dön
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Game playing state
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{selectedGame?.name}</h1>
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                  <span className="font-semibold">Skor: {score}</span>
                </div>
                <button
                  onClick={resetGame}
                  className="bg-white bg-opacity-20 px-3 py-1 rounded-full hover:bg-opacity-30 transition-colors"
                >
                  Çıkış
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {selectedGame?.name === 'Yılan Oyunu' && (
              <div className="flex justify-center">
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="grid grid-cols-20 gap-0 w-80 h-80">
                    {Array.from({ length: 400 }, (_, index) => {
                      const row = Math.floor(index / 20)
                      const col = index % 20
                      
                      let cellClass = "w-4 h-4 border border-gray-700"
                      
                      if (snake.some(segment => segment[0] === row && segment[1] === col)) {
                        cellClass += " bg-green-500"
                      } else if (food[0] === row && food[1] === col) {
                        cellClass += " bg-red-500"
                      } else {
                        cellClass += " bg-gray-800"
                      }
                      
                      return <div key={index} className={cellClass}></div>
                    })}
                  </div>
                  <p className="text-white text-center mt-4">
                    Ok tuşları ile yönlendirin. 50 puana ulaşın!
                  </p>
                </div>
              </div>
            )}

            {selectedGame?.name === 'Hafıza Oyunu' && (
              <div className="max-w-md mx-auto">
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {memoryCards.map((card, index) => (
                    <div
                      key={index}
                      onClick={() => handleMemoryCardClick(index)}
                      className={`aspect-square bg-indigo-100 rounded-lg flex items-center justify-center text-2xl cursor-pointer transition-all ${
                        flippedCards.includes(index) || matchedCards.includes(index)
                          ? 'bg-white shadow-lg'
                          : 'hover:bg-indigo-200'
                      }`}
                    >
                      {flippedCards.includes(index) || matchedCards.includes(index) ? card : '?'}
                    </div>
                  ))}
                </div>
                <p className="text-center text-gray-600">
                  Kartları eşleştirin. Tüm çiftleri bulun!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}