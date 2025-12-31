import { useState, useEffect } from 'react'
import { X, Trophy, RotateCcw } from 'lucide-react'

interface GameModalProps {
  isOpen: boolean
  onClose: () => void
}

export const GameModal = ({ isOpen, onClose }: GameModalProps) => {
  const [targetNumber, setTargetNumber] = useState<number>(0)
  const [guess, setGuess] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [attempts, setAttempts] = useState<number>(0)
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [bestScore, setBestScore] = useState<number>(() => {
    const saved = localStorage.getItem('numberGameBestScore')
    return saved ? parseInt(saved, 10) : 0
  })

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      return () => document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, onClose])

  const startGame = () => {
    const newTarget = Math.floor(Math.random() * 100) + 1
    setTargetNumber(newTarget)
    setGuess('')
    setMessage('1부터 100 사이의 숫자를 맞춰보세요!')
    setAttempts(0)
    setGameStarted(true)
  }

  const handleGuess = () => {
    const guessNum = parseInt(guess, 10)
    
    if (isNaN(guessNum) || guessNum < 1 || guessNum > 100) {
      setMessage('1부터 100 사이의 숫자를 입력해주세요!')
      return
    }

    const newAttempts = attempts + 1
    setAttempts(newAttempts)

    if (guessNum === targetNumber) {
      setMessage(`🎉 정답입니다! ${newAttempts}번 만에 맞췄어요!`)
      
      // 최고 기록 업데이트
      if (bestScore === 0 || newAttempts < bestScore) {
        setBestScore(newAttempts)
        localStorage.setItem('numberGameBestScore', newAttempts.toString())
      }
      
      setGameStarted(false)
    } else if (guessNum < targetNumber) {
      setMessage(`📈 더 큰 숫자입니다! (${newAttempts}번째 시도)`)
    } else {
      setMessage(`📉 더 작은 숫자입니다! (${newAttempts}번째 시도)`)
    }
    
    setGuess('')
  }

  const resetGame = () => {
    setGameStarted(false)
    setGuess('')
    setMessage('')
    setAttempts(0)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGuess()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col border border-gray-200/50">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600/80 to-blue-500/80 backdrop-blur-xl px-5 md:px-6 py-4 md:py-5 flex items-center justify-between flex-shrink-0 border-b border-white/20">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" />
            <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">숫자 맞추기 게임</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/30 backdrop-blur-md rounded-full transition-all duration-200 border border-white/20"
            aria-label="닫기"
          >
            <X className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar min-h-0">
          <div className="space-y-6">
            {/* 최고 기록 */}
            {bestScore > 0 && (
              <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <span className="font-bold text-yellow-800">최고 기록: {bestScore}번</span>
                </div>
              </div>
            )}

            {/* 게임 설명 */}
            {!gameStarted && (
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl p-4 border border-blue-200">
                <h3 className="font-bold text-gray-800 mb-2">게임 방법</h3>
                <p className="text-sm text-gray-700">
                  1부터 100 사이의 숫자를 생각하고, 컴퓨터가 생각한 숫자를 맞춰보세요!
                  <br />
                  힌트를 보고 더 큰지 작은지 판단해서 최대한 빠르게 맞춰보세요! 🎯
                </p>
              </div>
            )}

            {/* 게임 상태 */}
            {gameStarted && (
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4 border border-green-200">
                <p className="text-center font-semibold text-gray-800">
                  시도 횟수: <span className="text-indigo-600 text-xl">{attempts}</span>번
                </p>
              </div>
            )}

            {/* 메시지 */}
            {message && (
              <div className={`rounded-xl p-4 border ${
                message.includes('정답') 
                  ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-200'
                  : message.includes('더 큰') || message.includes('더 작은')
                  ? 'bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-200'
                  : 'bg-gradient-to-br from-gray-100 to-slate-100 border-gray-200'
              }`}>
                <p className="text-center font-medium text-gray-800">{message}</p>
              </div>
            )}

            {/* 입력 필드 */}
            {gameStarted && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    숫자 입력 (1-100)
                  </label>
                  <input
                    type="number"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyPress={handleKeyPress}
                    min="1"
                    max="100"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white text-center text-2xl font-bold"
                    placeholder="숫자를 입력하세요"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleGuess}
                  className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600/80 to-blue-500/80 backdrop-blur-md text-white rounded-xl hover:shadow-lg transition-all duration-200 font-bold text-lg border border-white/30"
                >
                  확인
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white/95 backdrop-blur-xl px-4 md:px-6 py-3 md:py-4 flex justify-center gap-2 md:gap-3 rounded-b-2xl flex-shrink-0">
          {!gameStarted ? (
            <button
              onClick={startGame}
              className="px-8 py-2 bg-gradient-to-r from-indigo-600/80 to-blue-500/80 backdrop-blur-md text-white rounded-lg hover:shadow-lg transition-all duration-200 font-bold flex items-center gap-2 border border-white/30 shadow-lg"
            >
              게임 시작
            </button>
          ) : (
            <button
              onClick={resetGame}
              className="px-6 py-2 border-2 border-gray-300 bg-white backdrop-blur-md text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium shadow-lg flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              다시 시작
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

