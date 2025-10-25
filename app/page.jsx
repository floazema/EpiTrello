import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Taskly Auth</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Minimal login/register system extracted from Taskly.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="px-4 py-2 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900">
            Sign In
          </Link>
          <Link href="/register" className="px-4 py-2 rounded-md border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800">
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
}