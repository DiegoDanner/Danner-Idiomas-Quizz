import VocabSpeedGame from '@/components/VocabSpeedGame/VocabSpeedGame';

export default function VocabSpeedGamePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0f18]">
      <div className="pt-24">
        <VocabSpeedGame />
      </div>

      {/* Footer / Info */}
      <footer className="mt-20 py-12 border-t border-gray-100 dark:border-[#424855]/10">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 dark:text-[#a5abbb] text-sm">
          <p>© 2026 Rapid Fire Speaking. Built for English learners.</p>
          <p className="mt-2">Danner Idiomas created by Diego Danner.</p>
        </div>
      </footer>
    </main>
  );
}
