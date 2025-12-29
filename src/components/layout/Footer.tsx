export const Footer = () => {
  return (
    <footer className="flex-shrink-0 bg-gradient-to-r from-gray-800 to-gray-900 text-white py-4 px-4 md:px-6 border-t border-gray-700">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-sm">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <p className="text-gray-300">
            © 2026 Daegu Big Data Utilization Center. All rights reserved.
          </p>
          <span className="hidden md:inline text-gray-500">|</span>
          <p className="text-gray-400">
            Developed by <span className="font-semibold text-white">Kim Keun Wook (Kay)</span>
          </p>
        </div>
        <div className="text-gray-400 text-xs">
          Task Management System v1.0
        </div>
      </div>
    </footer>
  )
}

