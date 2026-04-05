import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#080e1a] flex flex-col items-center justify-center px-6 text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-9xl font-black text-[#bd9dff]">404</h1>
        <h2 className="text-3xl font-headline font-bold text-gray-900 dark:text-[#e5ebfc]">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-600 dark:text-[#a5abbb]">
          Oops! It seems like you&apos;ve wandered off the grammar path. Don&apos;t worry, Teacher Danner is here to help you get back!
        </p>
        <div className="pt-8">
          <Link href="/">
            <button className="bg-[#bd9dff] text-[#2a0042] px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-[#bd9dff]/20 hover:bg-[#a885f0] transition-all flex items-center gap-3 mx-auto">
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
