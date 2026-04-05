import type {Metadata} from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/context/AuthContext';
import MobileNav from '@/components/MobileNav';
import HoverTranslator from '@/components/HoverTranslator';
import ChatWidget from '@/components/ChatWidget';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-headline',
});

export const metadata: Metadata = {
  title: 'Danner Idiomas - Quiz Center',
  description: 'Interactive knowledge quizzes to accelerate your fluency through immersive practice.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`} suppressHydrationWarning translate="no">
      <head>
        <meta name="google" content="notranslate" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              fetch('/teacher-danner.png')
                .then(res => console.log('Teacher Danner Avatar check:', res.ok ? 'OK' : 'FAILED', res.status))
                .catch(err => console.error('Teacher Danner Avatar check error:', err));
            `,
          }}
        />
      </head>
      <body className="bg-white dark:bg-[#080e1a] text-[#1a1a1a] dark:text-[#e5ebfc] selection:bg-[#6cb2ff]/30 min-h-screen font-sans transition-colors duration-300 notranslate">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            {children}
            <MobileNav />
            <HoverTranslator />
            <ChatWidget />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
