import { ClipboardList, Calendar, PlayCircle, CheckCircle } from 'lucide-react'

interface SidebarProps {
  selectedMenu: string
  onMenuChange: (menu: string) => void
  taskCounts?: {
    all: number
    today: number
    inProgress: number
    completed: number
  }
}

const menuItems = [
  { id: 'all', label: '내업무전체', icon: ClipboardList },
  { id: 'today', label: '오늘마감', icon: Calendar },
  { id: 'in-progress', label: '진행중', icon: PlayCircle },
  { id: 'completed', label: '완료', icon: CheckCircle },
]

export const Sidebar = ({ selectedMenu, onMenuChange, taskCounts }: SidebarProps) => {
  const getCount = (id: string) => {
    if (!taskCounts) return 0
    switch (id) {
      case 'all': return taskCounts.all
      case 'today': return taskCounts.today
      case 'in-progress': return taskCounts.inProgress
      case 'completed': return taskCounts.completed
      default: return 0
    }
  }

  return (
    <aside className="w-0 md:w-56 lg:w-64 bg-white/20 backdrop-blur-xl border-r border-white/30 flex flex-col shadow-2xl transition-all duration-300 overflow-hidden md:overflow-visible">
      <nav className="flex-1 p-3 md:p-4 overflow-y-auto custom-scrollbar">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const count = getCount(item.id)
            const isSelected = selectedMenu === item.id
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onMenuChange(item.id)}
                  className={`w-full text-left px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-200 flex items-center justify-between group backdrop-blur-md border ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-500/90 to-blue-500/90 text-white shadow-2xl transform scale-105 border-white/40'
                      : 'bg-white/30 hover:bg-white/40 hover:shadow-lg hover:transform hover:scale-102 border-white/30 text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isSelected ? 'text-white' : 'text-gray-700 group-hover:text-indigo-600'}`} />
                    <span className={`font-medium text-sm md:text-base ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                      {item.label}
                    </span>
                  </div>
                  {count > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold backdrop-blur-md ${
                      isSelected 
                        ? 'bg-white/40 text-white border border-white/30' 
                        : 'bg-indigo-500/80 text-white border border-indigo-400/50 group-hover:bg-indigo-600/80'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

