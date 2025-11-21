import { Link } from "react-router-dom";
import { Cloud } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity">
          <Cloud className="w-6 h-6" />
          <span>CloudOptimal.ai</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <ThemeToggle />
          <Link to="/design" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Design
          </Link>
          <Link to="/migrate" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Migrate
          </Link>
          <Link to="/optimize" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Optimize
          </Link>
          <Link to="/compare" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Compare
          </Link>
        </nav>
      </div>
    </header>
  );
}
