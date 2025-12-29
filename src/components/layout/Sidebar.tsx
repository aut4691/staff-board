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
    <aside className="w-56 md:w-64 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 flex flex-col shadow-inner">
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
                  className={`w-full text-left px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg transform scale-105'
                      : 'hover:bg-white hover:shadow-md hover:transform hover:scale-102'
                  }`}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isSelected ? 'text-white' : 'text-gray-600 group-hover:text-indigo-600'}`} />
                    <span className={`font-medium text-sm md:text-base ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                      {item.label}
                    </span>
                  </div>
                  {count > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      isSelected 
                        ? 'bg-white/30 text-white' 
                        : 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white'
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

