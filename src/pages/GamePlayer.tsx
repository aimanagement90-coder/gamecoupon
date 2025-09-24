import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Gift, Star, Trophy } from 'lucide-react'
import type { Database } from '../lib/supabase'

type Game = Database['public']['Tables']['games']['Row']
type Coupon = Database['public']['Tables']['coupons']['Row']

export default function GamePlayer() {
  const { gameId } = useParams()
  const [searchParams] = useSearchParams()
  const userId = searchParams.get('userId')
  
  const [game, setGame] = useState<Game | null>(null)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [gameCompleted, setGameCompleted] = useState(false)
  const [wonCoupon, setWonCoupon] = useState<Coupon | null>(null)
  const [score, setScore] = useState(0)

  // Snake Game State
  const [snake, setSnake] = useState([[10, 10]])
  const [food, setFood] = useState([15, 15])
  const [direction, setDirection] = useState([0, 1])
  const [gameRunning, setGameRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    if (gameId) {
      fetchGame()
      fetchCoupons()
    }
  }, [gameId, userId])

  useEffect(() => {
    if (gameRunning && !gameOver) {
      const gameInterval = setInterval(moveSnake, 150)
      return () => clearInterval(gameInterval)
    }
  }, [snake, direction, gameRunning, gameOver])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
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

    if (gameRunning) {
      window.addEventListener('keydown', handleKeyPress)
      return () => window.removeEventListener('keydown', handleKeyPress)
    }
  }, [gameRunning])

  const fetchGame = async () => {
    if (!gameId) return
    
    const { data } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single()
    
    if (data) {
      setGame(data)
    }
  }

  const fetchCoupons = async () => {
    if (!gameId || !userId) return
    
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('user_id', userId)
      .eq('game_id', gameId)
    
    if (data) {
      setCoupons(data)
    }
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
        setGameOver(true)
        setGameRunning(false)
        return currentSnake
      }

      // Check self collision
      if (newSnake.some(segment => segment[0] === head[0] && segment[1] === head[1])) {
        setGameOver(true)
        setGameRunning(false)
        return currentSnake
      }

      newSnake.unshift(head)

      // Check food collision
      if (head[0] === food[0] && head[1] === food[1]) {
        setScore(prev => prev + 10)
        setFood([
          Math.floor(Math.random() * 20),
          Math.floor(Math.random() * 20)
        ])
        
        // Check win condition
        if (score + 10 >= 50) {
          handleGameWin()
        }
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }

  const handleGameWin = () => {
    setGameCompleted(true)
    setGameRunning(false)
    
    // Select random coupon
    if (coupons.length > 0) {
      const randomCoupon = coupons[Math.floor(Math.random() * coupons.length)]
      setWonCoupon(randomCoupon)
    }
  }

  const startGame = () => {
    setGameRunning(true)
    setGameOver(false)
    setGameCompleted(false)
    setScore(0)
    setSnake([[10, 10]])
    setFood([15, 15])
    setDirection([0, 1])
    setWonCoupon(null)
  }

  const resetGame = () => {
    setGameOver(false)
    setGameCompleted(false)
    setScore(0)
    setSnake([[10, 10]])
    setFood([15, 15])
    setDirection([0, 1])
    setWonCoupon(null)
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Oyun yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{game.name}</h1>
            <p className="text-indigo-100">{game.description}</p>
            <div className="mt-4 flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <span className="font-semibold">Skor: {score}</span>
              </div>
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <span className="font-semibold">Hedef: 50 puan</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Game Won Modal */}
            {gameCompleted && wonCoupon && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4 text-center">
                  <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Tebrikler! 🎉
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Oyunu başarıyla tamamladınız ve kupon kazandınız!
                  </p>
                  
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
                  </div>
                  
                  <button
                    onClick={resetGame}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Tekrar Oyna
                  </button>
                </div>
              </div>
            )}

            {/* Game Over Modal */}
            {gameOver && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4 text-center">
                  <div className="text-6xl mb-4">😵</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Oyun Bitti!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Skorunuz: {score} puan<br/>
                    Kupon kazanmak için 50 puana ulaşmanız gerekiyor.
                  </p>
                  <button
                    onClick={resetGame}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Tekrar Dene
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Game Area */}
              <div className="lg:col-span-2">
                <div className="bg-gray-900 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-20 gap-0 w-full max-w-md mx-auto">
                    {Array.from({ length: 400 }, (_, index) => {
                      const row = Math.floor(index / 20)
                      const col = index % 20
                      
                      let cellClass = "w-4 h-4 border border-gray-700"
                      
                      // Snake body
                      if (snake.some(segment => segment[0] === row && segment[1] === col)) {
                        cellClass += " bg-green-500"
                      }
                      // Food
                      else if (food[0] === row && food[1] === col) {
                        cellClass += " bg-red-500"
                      }
                      // Empty cell
                      else {
                        cellClass += " bg-gray-800"
                      }
                      
                      return <div key={index} className={cellClass}></div>
                    })}
                  </div>
                </div>

                <div className="text-center space-y-4">
                  {!gameRunning && !gameOver && !gameCompleted && (
                    <div>
                      <button
                        onClick={startGame}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        Oyunu Başlat
                      </button>
                      <p className="text-gray-600 text-sm mt-2">
                        Ok tuşları ile yönlendirin
                      </p>
                    </div>
                  )}
                  
                  {gameRunning && (
                    <p className="text-gray-600">
                      Ok tuşları ile yılanı yönlendirin. Kırmızı noktaları yakalayın!
                    </p>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Instructions */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Nasıl Oynanır?
                  </h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Ok tuşları ile yılanı yönlendirin</li>
                    <li>• Kırmızı yemi toplayın</li>
                    <li>• 50 puana ulaşın</li>
                    <li>• Kupon kazanın!</li>
                  </ul>
                </div>

                {/* Available Coupons */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                    <Gift className="h-5 w-5 mr-2" />
                    Kazanabileceğiniz Kuponlar
                  </h3>
                  <div className="space-y-2">
                    {coupons.length > 0 ? coupons.map((coupon) => (
                      <div key={coupon.id} className="bg-white p-3 rounded border border-green-200">
                        <div className="font-semibold text-green-800">{coupon.code}</div>
                        <div className="text-green-700 text-sm">
                          {coupon.discount_type === 'percentage' ? '%' : '₺'}{coupon.discount_value} İndirim
                        </div>
                        <div className="text-green-600 text-xs">{coupon.description}</div>
                      </div>
                    )) : (
                      <p className="text-green-700 text-sm">
                        Bu oyun için kupon bulunmuyor
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}