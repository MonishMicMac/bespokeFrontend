import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    // 1. PARENT: Full Screen Height (h-screen), No Body Scroll (overflow-hidden)
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      
      {/* 2. SIDEBAR WRAPPER: Prevents shrinking */}
      <div className="flex-shrink-0 h-full">
        <Sidebar />
      </div>

      {/* 3. RIGHT SIDE: Flex Column (Header + Main Content) */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        
        {/* Header stays fixed at the top of the content area */}
        <Header />
        
        {/* 4. SCROLLABLE AREA: Only this part scrolls */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
}