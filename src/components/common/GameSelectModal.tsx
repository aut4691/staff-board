import { useState, useEffect } from 'react'
import { X, Gamepad2, Target, Hand } from 'lucide-react'
import { NumberGuessingGame } from './games/NumberGuessingGame'
import { RockPaperScissorsGame } from './games/RockPaperScissorsGame'

interface GameSelectModalProps {
  isOpen: boolean
  onClose: () => void
}

type GameType = 'select' | 'number-guessing' | 'rock-paper-scissors'

export const GameSelectModal = ({ isOpen, onClose }: GameSelectModalProps) => {
  const [selectedGame, setSelectedGame] = useState<GameType>('select')

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedGame === 'select') {
          onClose()
        } else {
          setSelectedGame('select')
        }
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      return () => document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, onClose, selectedGame])

  if (!isOpen) return null

  const handleBackToSelect = () => {
    setSelectedGame('select')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col border border-gray-200/50">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600/80 to-blue-500/80 backdrop-blur-xl px-5 md:px-6 py-4 md:py-5 flex items-center justify-between flex-shrink-0 border-b border-white/20">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" />
            <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">
              {selectedGame === 'select' ? '게임 선택' : selectedGame === 'number-guessing' ? '숫자 맞추기' : '가위바위보'}
            </h2>
          </div>
          <button
            onClick={selectedGame === 'select' ? onClose : handleBackToSelect}
            className="p-2 hover:bg-white/30 backdrop-blur-md rounded-full transition-all duration-200 border border-white/20"
            aria-label={selectedGame === 'select' ? '닫기' : '뒤로가기'}
          >
            <X className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar min-h-0">
          {selectedGame === 'select' ? (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-gray-600 text-sm">플레이할 게임을 선택하세요</p>
              </div>

              {/* 숫자 맞추기 게임 */}
              <button
                onClick={() => setSelectedGame('number-guessing')}
                className="w-full group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 hover:border-blue-400 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">숫자 맞추기</h3>
                    <p className="text-sm text-gray-600">
                      1부터 100 사이의 숫자를 맞춰보세요!
                      <br />
                      힌트를 보고 빠르게 맞춰보세요! 🎯
                    </p>
                  </div>
                </div>
              </button>

              {/* 가위바위보 게임 */}
              <button
                onClick={() => setSelectedGame('rock-paper-scissors')}
                className="w-full group bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 hover:border-purple-400 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Hand className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">가위바위보</h3>
                    <p className="text-sm text-gray-600">
                      컴퓨터와 가위바위보 대전!
                      <br />
                      연승 기록과 승률을 확인하세요! ✂️📄🪨
                    </p>
                  </div>
                </div>
              </button>
            </div>
          ) : selectedGame === 'number-guessing' ? (
            <NumberGuessingGame onBack={handleBackToSelect} />
          ) : (
            <RockPaperScissorsGame onBack={handleBackToSelect} />
          )}
        </div>
      </div>
    </div>
  )
}

