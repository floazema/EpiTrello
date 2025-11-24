import Link from "next/link";
import { Layers, Zap, Users, CheckCircle2, ArrowRight, LayoutDashboard } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
      {/* Simple Background Decorative Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Large gradient blobs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-zinc-800 to-zinc-900 rounded-full blur-[120px] opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-900 rounded-full blur-[100px] opacity-20"></div>
      </div>

      {/* Navbar */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-zinc-900 dark:bg-zinc-100 p-2 rounded-lg">
                <LayoutDashboard className="h-5 w-5 text-white dark:text-zinc-900" />
              </div>
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                EpiTrello
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link 
                href="#features" 
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Features
              </Link>
              <Link 
                href="/login" 
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Simple & Powerful Task Management
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-zinc-900 dark:text-zinc-100">
            Organize your work with{" "}
            <span className="text-zinc-600 dark:text-zinc-400">
              visual boards
            </span>
          </h1>
          
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            EpiTrello is a clean and intuitive Kanban board that helps you manage tasks, 
            track progress, and collaborate with your team effortlessly.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              href="/register" 
              className="group px-8 py-4 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/login" 
              className="px-8 py-4 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Visual Demo */}
        <div className="relative max-w-5xl mx-auto mb-20">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Todo Column */}
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <h3 className="font-semibold text-sm">To Do</h3>
                  <span className="ml-auto text-xs text-zinc-500">3</span>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
                  <p className="text-sm font-medium mb-1">Design homepage</p>
                  <p className="text-xs text-zinc-500">High priority</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
                  <p className="text-sm font-medium mb-1">Setup database</p>
                  <p className="text-xs text-zinc-500">Medium priority</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
                  <p className="text-sm font-medium mb-1">Write documentation</p>
                  <p className="text-xs text-zinc-500">Low priority</p>
                </div>
              </div>

              {/* In Progress Column */}
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <h3 className="font-semibold text-sm">In Progress</h3>
                  <span className="ml-auto text-xs text-zinc-500">2</span>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
                  <p className="text-sm font-medium mb-1">Build API endpoints</p>
                  <p className="text-xs text-zinc-500">In development</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
                  <p className="text-sm font-medium mb-1">Testing features</p>
                  <p className="text-xs text-zinc-500">QA phase</p>
                </div>
              </div>

              {/* Done Column */}
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <h3 className="font-semibold text-sm">Done</h3>
                  <span className="ml-auto text-xs text-zinc-500">4</span>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 opacity-60">
                  <p className="text-sm font-medium mb-1 line-through">Project setup</p>
                  <p className="text-xs text-zinc-500">Completed</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 opacity-60">
                  <p className="text-sm font-medium mb-1 line-through">Authentication</p>
                  <p className="text-xs text-zinc-500">Completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to stay organized
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">
              Simple, powerful features to boost your productivity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 hover:shadow-lg transition-shadow">
              <div className="bg-zinc-100 dark:bg-zinc-800 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Layers className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
              </div>
              <h3 className="text-xl font-bold mb-3">Visual Boards</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Organize tasks with intuitive drag-and-drop Kanban boards that make project management visual and simple.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 hover:shadow-lg transition-shadow">
              <div className="bg-zinc-100 dark:bg-zinc-800 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Built with modern technology for instant updates and seamless performance across all your devices.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 hover:shadow-lg transition-shadow">
              <div className="bg-zinc-100 dark:bg-zinc-800 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle2 className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
              </div>
              <h3 className="text-xl font-bold mb-3">Easy to Use</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Clean interface designed for simplicity. Get started in seconds and focus on what matters most.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Copyright at bottom of main content */}
      <div className="max-w-7xl mx-auto px-6 pb-8 mt-20 text-center text-sm text-zinc-500 dark:text-zinc-600">
        <p>&copy; 2025 EpiTrello</p>
      </div>
    </div>
  );
}