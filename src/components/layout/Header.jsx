export default function Header() {
  return (
    <header className="bg-white shadow-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50 transition-all duration-300">
      {/* Left: Logo + App Name */}
      <div className="flex items-center space-x-3 group cursor-pointer">
       
      </div>

      {/* Right: Search + Profile */}
      <div className="flex items-center space-x-6">
        {/* Search */}
        

     

        {/* User Profile */}
        <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-all duration-300 group">
          <img
            src="https://ui-avatars.com/api/?name=User"
            alt="profile"
            className="w-10 h-10 rounded-full border transform transition-transform duration-300 group-hover:scale-110"
          />
          <div className="text-gray-700">
            <p className="font-semibold group-hover:text-blue-600 transition-colors">John Doe</p>
            <p className="text-sm text-gray-500">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
