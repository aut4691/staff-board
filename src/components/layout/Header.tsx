import { Bell, User } from 'lucide-react'

interface HeaderProps {
  userName: string
  hasNewFeedback?: boolean
  onNotificationClick?: () => void
  onProfileClick?: () => void
}

export const Header = ({ 
  userName, 
  hasNewFeedback = false,
  onNotificationClick,
  onProfileClick 
}: HeaderProps) => {
  const isAdmin = userName.includes('관리자')
  
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-blue-500 shadow-lg px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
      <h1 className="text-base md:text-xl font-bold text-white truncate">
        <span className="hidden sm:inline">대구 빅데이터 활용센터 - </span>
        {isAdmin ? userName : `${userName} 업무 관리`}
      </h1>
      
      <div className="flex items-center gap-3">
        {/* Notification Icon */}
        <button 
          onClick={onNotificationClick}
          className="relative p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
          aria-label="알림"
        >
          <Bell className="w-6 h-6 text-white" />
          {hasNewFeedback && (
            <>
              <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            </>
          )}
        </button>
        
        {/* Profile Icon */}
        <button 
          onClick={onProfileClick}
          className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
          aria-label="프로필"
        >
          <User className="w-6 h-6 text-white" />
        </button>
      </div>
    </header>
  )
}

