import { useState, useEffect } from 'react'
import { Trophy, RotateCcw } from 'lucide-react'

interface RockPaperScissorsGameProps {
  onBack: () => void
}

type Choice = 'rock' | 'paper' | 'scissors'
type Result = 'win' | 'lose' | 'draw'

interface GameStats {
  totalGames: number
  wins: number
  losses: number
  draws: number
  winStreak: number
  bestWinStreak: number
}

const CHOICES: { value: Choice; emoji: string; label: string }[] = [
  { value: 'rock', emoji: '🪨', label: '바위' },
  { value: 'paper', emoji: '📄', label: '보' },
  { value: 'scissors', emoji: '✂️', label: '가위' },
]

export const RockPaperScissorsGame = ({ }: RockPaperScissorsGameProps) => {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null)
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('rpsGameStats')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return { totalGames: 0, wins: 0, losses: 0, draws: 0, winStreak: 0, bestWinStreak: 0 }
      }
    }
    return { totalGames: 0, wins: 0, losses: 0, draws: 0, winStreak: 0, bestWinStreak: 0 }
  })
  const [isAnimating, setIsAnimating] = useState(false)

  // 통계 저장
  useEffect(() => {
    localStorage.setItem('rpsGameStats', JSON.stringify(stats))
  }, [stats])

  const getComputerChoice = (): Choice => {
    const choices: Choice[] = ['rock', 'paper', 'scissors']
    return choices[Math.floor(Math.random() * choices.length)]
  }

  const determineWinner = (player: Choice, computer: Choice): Result => {
    if (player === computer) return 'draw'
    
    if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) {
      return 'win'
    }
    
    return 'lose'
  }

  const handleChoice = (choice: Choice) => {
    if (isAnimating) return

    setIsAnimating(true)
    setPlayerChoice(choice)
    setComputerChoice(null)
    setResult(null)

    // 애니메이션 효과를 위한 딜레이
    setTimeout(() => {
      const compChoice = getComputerChoice()
      setComputerChoice(compChoice)
      
      const gameResult = determineWinner(choice, compChoice)
      setResult(gameResult)

      // 통계 업데이트
      setStats((prev) => {
        const newStats = { ...prev, totalGames: prev.totalGames + 1 }
        
        if (gameResult === 'win') {
          newStats.wins = prev.wins + 1
          newStats.winStreak = prev.winStreak + 1
          if (newStats.winStreak > prev.bestWinStreak) {
            newStats.bestWinStreak = newStats.winStreak
          }
        } else if (gameResult === 'lose') {
          newStats.losses = prev.losses + 1
          newStats.winStreak = 0
        } else {
          newStats.draws = prev.draws + 1
          newStats.winStreak = 0
        }
        
        return newStats
      })

      setIsAnimating(false)
    }, 500)
  }

  const resetStats = () => {
    if (window.confirm('통계를 초기화하시겠습니까?')) {
      const resetStats: GameStats = { totalGames: 0, wins: 0, losses: 0, draws: 0, winStreak: 0, bestWinStreak: 0 }
      setStats(resetStats)
      localStorage.setItem('rpsGameStats', JSON.stringify(resetStats))
    }
  }

  const winRate = stats.totalGames > 0 
    ? Math.round((stats.wins / stats.totalGames) * 100) 
    : 0

  const getResultMessage = () => {
    if (!result) return ''
    if (result === 'win') return '🎉 승리!'
    if (result === 'lose') return '😢 패배...'
    return '🤝 무승부!'
  }

  const getResultColor = () => {
    if (!result) return 'from-gray-100 to-slate-100 border-gray-200'
    if (result === 'win') return 'from-green-100 to-emerald-100 border-green-200'
    if (result === 'lose') return 'from-red-100 to-pink-100 border-red-200'
    return 'from-yellow-100 to-amber-100 border-yellow-200'
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      {stats.totalGames > 0 && (
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-4 border-2 border-indigo-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-gray-800">통계</h3>
            </div>
            <button
              onClick={resetStats}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors"
            >
              초기화
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className="text-center">
              <p className="text-gray-600 text-xs mb-1">총 게임</p>
              <p className="text-xl font-bold text-indigo-600">{stats.totalGames}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-xs mb-1">승률</p>
              <p className="text-xl font-bold text-green-600">{winRate}%</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-xs mb-1">연승</p>
              <p className="text-xl font-bold text-purple-600">{stats.winStreak}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-xs mb-1">승</p>
              <p className="text-lg font-bold text-green-600">{stats.wins}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-xs mb-1">패</p>
              <p className="text-lg font-bold text-red-600">{stats.losses}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-xs mb-1">무</p>
              <p className="text-lg font-bold text-yellow-600">{stats.draws}</p>
            </div>
          </div>
          {stats.bestWinStreak > 0 && (
            <div className="mt-3 pt-3 border-t border-indigo-200 text-center">
              <p className="text-xs text-gray-600">최고 연승 기록</p>
              <p className="text-lg font-bold text-purple-600">{stats.bestWinStreak}연승</p>
            </div>
          )}
        </div>
      )}

      {/* 게임 설명 */}
      {!playerChoice && (
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4 border border-purple-200">
          <h3 className="font-bold text-gray-800 mb-2">게임 방법</h3>
          <p className="text-sm text-gray-700">
            가위, 바위, 보 중 하나를 선택하세요!
            <br />
            컴퓨터와 대전하여 승률과 연승 기록을 쌓아보세요! 🎮
          </p>
        </div>
      )}

      {/* 선택 버튼 */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {CHOICES.map((choice) => (
            <button
              key={choice.value}
              onClick={() => handleChoice(choice.value)}
              disabled={isAnimating}
              className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 hover:border-purple-400 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                {choice.emoji}
              </div>
              <p className="text-sm font-bold text-gray-800">{choice.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 결과 표시 */}
      {(playerChoice || computerChoice || result) && (
        <div className={`rounded-xl p-6 border-2 ${getResultColor()}`}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* 플레이어 선택 */}
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-2">당신</p>
              <div className="text-6xl mb-2">
                {playerChoice ? CHOICES.find(c => c.value === playerChoice)?.emoji : '❓'}
              </div>
              <p className="text-sm font-bold text-gray-800">
                {playerChoice ? CHOICES.find(c => c.value === playerChoice)?.label : '선택 중...'}
              </p>
            </div>

            {/* VS */}
            <div className="flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-400">VS</span>
            </div>

            {/* 컴퓨터 선택 */}
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-2">컴퓨터</p>
              <div className="text-6xl mb-2 animate-pulse">
                {computerChoice ? CHOICES.find(c => c.value === computerChoice)?.emoji : '❓'}
              </div>
              <p className="text-sm font-bold text-gray-800">
                {computerChoice ? CHOICES.find(c => c.value === computerChoice)?.label : '선택 중...'}
              </p>
            </div>
          </div>

          {/* 결과 메시지 */}
          {result && (
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800 mb-2">{getResultMessage()}</p>
              {result === 'win' && stats.winStreak > 1 && (
                <p className="text-sm text-purple-600 font-semibold">
                  {stats.winStreak}연승 중! 🔥
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 다시 플레이 버튼 */}
      {result && (
        <div className="flex justify-center pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              setPlayerChoice(null)
              setComputerChoice(null)
              setResult(null)
            }}
            className="px-6 py-2 border-2 border-gray-300 bg-white backdrop-blur-md text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium shadow-lg flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            다시 플레이
          </button>
        </div>
      )}
    </div>
  )
}

