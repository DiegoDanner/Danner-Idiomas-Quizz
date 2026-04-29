const fs = require('fs');

let content = fs.readFileSync('app/quiz/vocab-cards/page.tsx', 'utf8');

// fix the "Back to Quizzes" text color so it matches the other components and avoids being too dark/white
content = content.replace(
  '<div className="max-w-7xl mx-auto px-6 w-full mb-6 z-50 relative mt-[20px] sm:ml-[80px] pl-[80px] sm:pl-[24px] pointer-events-auto">',
  '<div className="max-w-7xl mx-auto px-6 w-full mb-6 z-50 relative mt-[40px] sm:ml-[80px] pl-[80px] sm:pl-[24px] pointer-events-auto">'
);

fs.writeFileSync('app/quiz/vocab-cards/page.tsx', content);
