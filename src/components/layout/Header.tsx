import { Bell, User, LogOut } from 'lucide-react'

interface HeaderProps {
  userName: string
  hasNewFeedback?: boolean
  feedbackCount?: number
  onNotificationClick?: () => void
  onProfileClick?: () => void
  onLogoutClick?: () => void
}

export const Header = ({ 
  userName, 
  feedbackCount = 0,
  onNotificationClick,
  onProfileClick,
  onLogoutClick
}: HeaderProps) => {
  const isAdmin = userName.includes('관리자')
  
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-blue-500 shadow-lg px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
      <h1 className="text-base md:text-xl font-bold text-white truncate">
        <span className="hidden sm:inline">대구 빅데이터 활용센터 - </span>
        {isAdmin ? userName : `${userName} 업무 관리`}
      </h1>
      
      <div className="flex items-center gap-2 md:gap-3">
        {/* Notification Icon */}
        {onNotificationClick && (
          <div className="relative group">
            <button 
              onClick={onNotificationClick}
              className="relative p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label={`알림${feedbackCount > 0 ? ` (${feedbackCount}개)` : ''}`}
              disabled={feedbackCount === 0}
            >
              <Bell className={`w-6 h-6 text-white ${feedbackCount > 0 ? 'animate-pulse' : ''}`} />
              {feedbackCount > 0 && (
                <>
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white">
                    {feedbackCount > 9 ? '9+' : feedbackCount}
                  </span>
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75" />
                </>
              )}
            </button>
            
            {/* Tooltip on hover */}
            {feedbackCount > 0 && (
              <div className="absolute right-0 top-full mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {isAdmin ? `새로운 댓글 ${feedbackCount}개` : `새로운 피드백 ${feedbackCount}개`}
                <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            )}
          </div>
        )}
        
        {/* Profile Icon */}
        {onProfileClick && (
          <button 
            onClick={onProfileClick}
            className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
            aria-label="프로필"
            title="회원정보 수정"
          >
            <User className="w-6 h-6 text-white" />
          </button>
        )}
        
        {/* Logout Button */}
        {onLogoutClick && (
          <button 
            onClick={onLogoutClick}
            className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
            aria-label="로그아웃"
            title="로그아웃"
          >
            <LogOut className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
    </header>
  )
}

