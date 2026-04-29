const fs = require('fs');

let content = fs.readFileSync('app/quiz/vocab-cards/page.tsx', 'utf8');

// fix the "Back to Quizzes" position and overlaps
content = content.replace(
  '<div className="max-w-7xl mx-auto px-6 w-full mb-6 z-50 relative mt-0 sm:ml-[80px] pl-[80px] sm:pl-[24px] pointer-events-auto">',
  '<div className="max-w-7xl mx-auto px-6 w-full mb-6 z-50 relative mt-[20px] sm:ml-[80px] pl-[80px] sm:pl-[24px] pointer-events-auto">'
);

// fix sound button position
content = content.replace(
  '<button \n          onClick={() => setSoundEnabled(!soundEnabled)}\n          className="absolute top-[100px] right-4 sm:top-[100px] sm:right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all shadow-sm z-50 pointer-events-auto"\n        >',
  '<button \n          onClick={() => setSoundEnabled(!soundEnabled)}\n          className="absolute top-[120px] right-4 sm:top-[120px] sm:right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all shadow-sm z-50 pointer-events-auto"\n        >'
);

// fix move counter position
content = content.replace(
  '<div className="bg-[#3AA34C] text-[#1B4E26] pt-4 pb-6 w-[60px] sm:w-[90px] flex flex-col items-center shadow-lg relative rounded-b-sm pointer-events-auto"\n             style={{\n               clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)",\n               marginTop: "-16px" // Hide top radius behind screen edge\n             }}>\n          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-0.5 sm:mb-1 opacity-80 mt-4 sm:mt-2">Moves</span>',
  '<div className="bg-[#3AA34C] text-[#1B4E26] pt-4 pb-6 w-[60px] sm:w-[90px] flex flex-col items-center shadow-lg relative rounded-b-sm pointer-events-auto mt-[60px]"\n             style={{\n               clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)",\n             }}>\n          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-0.5 sm:mb-1 opacity-80 mt-4 sm:mt-2">Moves</span>'
);


fs.writeFileSync('app/quiz/vocab-cards/page.tsx', content);
