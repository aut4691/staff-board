import { MessageCircle, X } from 'lucide-react'

interface FeedbackBannerProps {
  onClose?: () => void
  onClick?: () => void
}

export const FeedbackBanner = ({ onClose, onClick }: FeedbackBannerProps) => {
  return (
    <div 
      className="fixed top-20 right-4 z-50 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-3 rounded-xl shadow-2xl animate-in slide-in-from-right duration-500 cursor-pointer hover:from-red-600 hover:to-pink-600 transition-all hover:scale-105 max-w-sm"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <MessageCircle className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">
            새 피드백 도착
          </p>
          <p className="text-xs text-red-100 mt-0.5">
            센터장님으로부터
          </p>
        </div>
        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="p-1 hover:bg-white/20 rounded-full transition-all duration-200 flex-shrink-0"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

