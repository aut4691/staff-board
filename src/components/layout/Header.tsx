import { User, LogOut, Menu, Gamepad2 } from 'lucide-react'

interface HeaderProps {
  userName: string
  onProfileClick?: () => void
  onLogoutClick?: () => void
  onMenuClick?: () => void
  onGameClick?: () => void
}

export const Header = ({ 
  userName, 
  onProfileClick,
  onLogoutClick,
  onMenuClick,
  onGameClick
}: HeaderProps) => {
  const isAdmin = userName.includes('관리자')
  
  return (
    <header className="bg-gradient-to-r from-indigo-600/80 to-blue-500/80 backdrop-blur-xl shadow-2xl px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-white/20">
      <div className="flex items-center gap-2 md:gap-3">
        {/* Menu Button (Mobile Only) */}
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-white/30 backdrop-blur-md rounded-full transition-all duration-200 hover:scale-110 border border-white/20"
            aria-label="메뉴"
            title="메뉴"
          >
            <Menu className="w-6 h-6 text-white drop-shadow-md" />
          </button>
        )}
        <h1 className="text-base md:text-xl font-bold text-white truncate drop-shadow-lg">
          <span className="hidden sm:inline">대구 빅데이터 활용센터 - </span>
          {isAdmin ? userName : `${userName} 업무 관리`}
        </h1>
      </div>
      
      <div className="flex items-center gap-2 md:gap-3">
        {/* Profile Icon */}
        {onProfileClick && (
          <button 
            onClick={onProfileClick}
            className="p-2 hover:bg-white/30 backdrop-blur-md rounded-full transition-all duration-200 hover:scale-110 border border-white/20"
            aria-label="프로필"
            title="회원정보 수정"
          >
            <User className="w-6 h-6 text-white drop-shadow-md" />
          </button>
        )}
        
        {/* Game Button */}
        {onGameClick && (
          <button 
            onClick={onGameClick}
            className="p-2 hover:bg-white/30 backdrop-blur-md rounded-full transition-all duration-200 hover:scale-110 border border-white/20"
            aria-label="게임"
            title="게임하기"
          >
            <Gamepad2 className="w-6 h-6 text-white drop-shadow-md" />
          </button>
        )}
        
        {/* Logout Button */}
        {onLogoutClick && (
          <button 
            onClick={onLogoutClick}
            className="p-2 hover:bg-white/30 backdrop-blur-md rounded-full transition-all duration-200 hover:scale-110 border border-white/20"
            aria-label="로그아웃"
            title="로그아웃"
          >
            <LogOut className="w-6 h-6 text-white drop-shadow-md" />
          </button>
        )}
      </div>
    </header>
  )
}

