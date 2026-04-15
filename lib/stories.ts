export type GlossaryWord = {
  id: string;
  word: string;
  definition: string;
  example: string;
  pronunciation?: string;
};

export type TextSegment = {
  text: string;
  isWord?: boolean;
  wordId?: string;
};

export type PageData = {
  id: number;
  imageUrl: string;
  imageAlt: string;
  content: TextSegment[];
  rawText: string;
};

export type BookData = {
  id: string;
  title: string;
  description: string;
  author: string;
  coverImage: string;
  pages: PageData[];
  glossary: Record<string, GlossaryWord>;
};

export const stories: BookData[] = [
  {
    id: 'language-journey',
    title: 'The Language Journey',
    description: "Discover how learning a new language can open doors and connect you to people from all over the world.",
    author: 'Diego Danner',
    coverImage: '/images/storytelling/cover.jpg',
    glossary: {
      baffled: {
        id: 'baffled',
        word: 'baffled',
        definition: 'Totally confused or puzzled.',
        example: 'Leo was baffled by the strange letters in the book.',
        pronunciation: '/ˈbæf.əld/',
      },
      intriguing: {
        id: 'intriguing',
        word: 'intriguing',
        definition: "Arousing one's curiosity or interest; fascinating.",
        example: 'The old dictionary was very intriguing to him.',
        pronunciation: '/ɪnˈtriː.ɡɪŋ/',
      },
      decipher: {
        id: 'decipher',
        word: 'decipher',
        definition: 'Succeed in understanding, interpreting, or identifying (something).',
        example: 'He tried to decipher the secret code of the new language.',
        pronunciation: '/dɪˈsaɪ.fər/',
      },
      hesitant: {
        id: 'hesitant',
        word: 'hesitant',
        definition: 'Tentative, unsure, or slow in acting or speaking.',
        example: 'Leo was hesitant to speak the new words at first.',
        pronunciation: '/ˈhez.ɪ.tənt/',
      },
      connection: {
        id: 'connection',
        word: 'connection',
        definition: 'A relationship in which a person, thing, or idea is linked or associated with something else.',
        example: 'They formed a strong connection despite speaking different native languages.',
        pronunciation: '/kəˈnek.ʃən/',
      },
      boundless: {
        id: 'boundless',
        word: 'boundless',
        definition: 'Unlimited; immense.',
        example: 'The world felt boundless to Leo now that he could communicate with more people.',
        pronunciation: '/ˈbaʊnd.ləs/',
      },
    },
    pages: [
      {
        id: 1,
        imageUrl: '/images/storytelling/page-1.jpg',
        imageAlt: 'A young boy reading a book in a cozy room',
        content: [
          { text: "Leo lived in a small town. He loved reading, but sometimes he found books in languages he couldn't understand. He felt " },
          { text: 'baffled', isWord: true, wordId: 'baffled' },
          { text: ' by the strange words.' },
        ],
        rawText: "Leo lived in a small town. He loved reading, but sometimes he found books in languages he couldn't understand. He felt baffled by the strange words.",
      },
      {
        id: 2,
        imageUrl: '/images/storytelling/page-2.jpg',
        imageAlt: 'A dusty old dictionary in an attic',
        content: [
          { text: 'One day, he found a dusty old dictionary in the attic. It was filled with strange symbols and letters. It was highly ' },
          { text: 'intriguing', isWord: true, wordId: 'intriguing' },
          { text: '.' },
        ],
        rawText: 'One day, he found a dusty old dictionary in the attic. It was filled with strange symbols and letters. It was highly intriguing.',
      },
      {
        id: 3,
        imageUrl: '/images/storytelling/page-3.jpg',
        imageAlt: 'Boy writing down words in a notebook',
        content: [
          { text: 'He started learning a few words every day. "Hola", "Bonjour", "Ciao". It felt like a secret code he had to ' },
          { text: 'decipher', isWord: true, wordId: 'decipher' },
          { text: '.' },
        ],
        rawText: 'He started learning a few words every day. "Hola", "Bonjour", "Ciao". It felt like a secret code he had to decipher.',
      },
      {
        id: 4,
        imageUrl: '/images/storytelling/page-4.jpg',
        imageAlt: 'A new family moving in next door',
        content: [
          { text: 'When a new family moved next door, they spoke a different language. Leo was ' },
          { text: 'hesitant', isWord: true, wordId: 'hesitant' },
          { text: ' at first, but he used his new words to say hello.' },
        ],
        rawText: 'When a new family moved next door, they spoke a different language. Leo was hesitant at first, but he used his new words to say hello.',
      },
      {
        id: 5,
        imageUrl: '/images/storytelling/page-5.jpg',
        imageAlt: 'Kids laughing and sharing food',
        content: [
          { text: 'Their faces lit up! They shared food, stories, and laughter. Leo realized that language was a bridge, creating a beautiful ' },
          { text: 'connection', isWord: true, wordId: 'connection' },
          { text: '.' },
        ],
        rawText: 'Their faces lit up! They shared food, stories, and laughter. Leo realized that language was a bridge, creating a beautiful connection.',
      },
      {
        id: 6,
        imageUrl: '/images/storytelling/page-6.jpg',
        imageAlt: 'A boy looking at a globe',
        content: [
          { text: 'From that day on, Leo knew that every new word he learned was a key to a new adventure. The world felt ' },
          { text: 'boundless', isWord: true, wordId: 'boundless' },
          { text: '.' },
        ],
        rawText: 'From that day on, Leo knew that every new word he learned was a key to a new adventure. The world felt boundless.',
      },
    ],
  },
  {
    id: 'leos-world',
    title: "Leo's Night of Star-Dust and Stories",
    description: "An interactive storybook about a boy discovering the magic of Grammy's house, featuring interactive vocabulary and text-to-speech.",
    author: 'Diego Danner',
    coverImage: '/images/storytelling/leos-world/cover.jpg',
    glossary: {
      clutching: {
        id: 'clutching',
        word: 'clutching',
        definition: 'Grasping or holding tightly.',
        example: 'Leo stood on the front porch, clutching his blue suitcase.',
        pronunciation: '/ˈklʌtʃ.ɪŋ/',
      },
      swaying: {
        id: 'swaying',
        word: 'swaying',
        definition: 'Moving slowly or rhythmically backward and forward or from side to side.',
        example: 'The tall trees were swaying like giant hands in the wind.',
        pronunciation: '/ˈsweɪ.ɪŋ/',
      },
      creaked: {
        id: 'creaked',
        word: 'creaked',
        definition: 'Made a harsh, high-pitched sound when being moved.',
        example: 'Suddenly, the front door creaked open.',
        pronunciation: '/kriːkt/',
      },
      winking: {
        id: 'winking',
        word: 'winking',
        definition: 'Closing and opening one eye quickly, typically to indicate that something is a joke or a secret.',
        example: '"We aren\'t just making dessert," she whispered, winking at him.',
        pronunciation: '/ˈwɪŋ.kɪŋ/',
      },
      puffed: {
        id: 'puffed',
        word: 'puffed',
        definition: 'Moved or burst out in a small cloud.',
        example: 'A cloud of flour puffed up into the air.',
        pronunciation: '/pʌft/',
      },
      giggle: {
        id: 'giggle',
        word: 'giggle',
        definition: 'A light, silly, or nervous laugh.',
        example: 'He couldn\'t help it—he let out a giant giggle.',
        pronunciation: '/ˈɡɪɡ.əl/',
      },
      crackled: {
        id: 'crackled',
        word: 'crackled',
        definition: 'Made a series of slight snapping noises.',
        example: 'Its cover was worn and crackled when she opened it.',
        pronunciation: '/ˈkræk.əld/',
      },
      explorer: {
        id: 'explorer',
        word: 'explorer',
        definition: 'A person who travels in search of new places or to discover new things.',
        example: 'The house was a kingdom waiting for an explorer.',
        pronunciation: '/ɪkˈsplɔːr.ər/',
      },
      flicked: {
        id: 'flicked',
        word: 'flicked',
        definition: 'Turned something on or off with a quick movement.',
        example: 'When she flicked the switch, it glowed with a soft, amber light.',
        pronunciation: '/flɪkt/',
      },
    },
    pages: [
      {
        id: 1,
        imageUrl: '/images/storytelling/leos-world/page-1.jpg',
        imageAlt: 'Leo standing on the porch with his blue suitcase',
        content: [
          { text: 'Leo stood on the front porch, ' },
          { text: 'clutching', isWord: true, wordId: 'clutching' },
          { text: ' his blue suitcase so hard his knuckles turned white. The night air felt big and chilly. "What if I miss my own bed?" he whispered to his shadow. Grammy\'s house always looked different at night, with the tall trees ' },
          { text: 'swaying', isWord: true, wordId: 'swaying' },
          { text: ' like giant hands.' },
        ],
        rawText: 'Leo stood on the front porch, clutching his blue suitcase so hard his knuckles turned white. The night air felt big and chilly. "What if I miss my own bed?" he whispered to his shadow. Grammy\'s house always looked different at night, with the tall trees swaying like giant hands.',
      },
      {
        id: 2,
        imageUrl: '/images/storytelling/leos-world/page-2.jpg',
        imageAlt: 'Grammy Elspeth opening the door for Leo',
        content: [
          { text: 'Suddenly, the front door ' },
          { text: 'creaked', isWord: true, wordId: 'creaked' },
          { text: ' open, spilling a river of golden light onto the porch. There stood Grammy Elspeth, wearing her favorite fuzzy cardigan and a smile that looked like a warm hug. "Leo!" she cried joyfully. "You\'ve arrived just in time. The magic is about to start!"' },
        ],
        rawText: 'Suddenly, the front door creaked open, spilling a river of golden light onto the porch. There stood Grammy Elspeth, wearing her favorite fuzzy cardigan and a smile that looked like a warm hug. "Leo!" she cried joyfully. "You\'ve arrived just in time. The magic is about to start!"',
      },
      {
        id: 3,
        imageUrl: '/images/storytelling/leos-world/page-3.jpg',
        imageAlt: 'Grammy handing Leo a wooden spoon in the kitchen',
        content: [
          { text: 'Inside, the kitchen smelled like cinnamon and secrets. Grammy Elspeth handed Leo a wooden spoon that was almost as long as his arm. "We aren\'t just making dessert," she whispered, ' },
          { text: 'winking', isWord: true, wordId: 'winking' },
          { text: ' at him. "We are baking Moon-Dusted Cookies. They only taste sweet if you bake them when the sun goes down."' },
        ],
        rawText: 'Inside, the kitchen smelled like cinnamon and secrets. Grammy Elspeth handed Leo a wooden spoon that was almost as long as his arm. "We aren\'t just making dessert," she whispered, winking at him. "We are baking Moon-Dusted Cookies. They only taste sweet if you bake them when the sun goes down."',
      },
      {
        id: 4,
        imageUrl: '/images/storytelling/leos-world/page-4.jpg',
        imageAlt: 'Leo laughing as flour puffs into the air',
        content: [
          { text: 'Leo stirred the dough until his arms felt like jelly. When he tipped the jar of silver sugar, a cloud of flour ' },
          { text: 'puffed', isWord: true, wordId: 'puffed' },
          { text: ' up into the air, landing on his nose like snow. He couldn\'t help it—he let out a giant ' },
          { text: 'giggle', isWord: true, wordId: 'giggle' },
          { text: '. For a moment, he forgot all about his quiet bedroom back home.' },
        ],
        rawText: 'Leo stirred the dough until his arms felt like jelly. When he tipped the jar of silver sugar, a cloud of flour puffed up into the air, landing on his nose like snow. He couldn\'t help it—he let out a giant giggle. For a moment, he forgot all about his quiet bedroom back home.',
      },
      {
        id: 5,
        imageUrl: '/images/storytelling/leos-world/page-5.jpg',
        imageAlt: 'Grammy and Leo reading a book in a velvet armchair',
        content: [
          { text: 'While the cookies baked, they moved to the living room and climbed into a big, velvet armchair. Grammy Elspeth pulled a heavy book from the shelf. Its cover was worn and ' },
          { text: 'crackled', isWord: true, wordId: 'crackled' },
          { text: ' when she opened it. "This," she said in a low, mysterious voice, "is the map to the Land of Whispers."' },
        ],
        rawText: 'While the cookies baked, they moved to the living room and climbed into a big, velvet armchair. Grammy Elspeth pulled a heavy book from the shelf. Its cover was worn and crackled when she opened it. "This," she said in a low, mysterious voice, "is the map to the Land of Whispers."',
      },
      {
        id: 6,
        imageUrl: '/images/storytelling/leos-world/page-6.jpg',
        imageAlt: 'Leo looking at dragon shadows on the wall',
        content: [
          { text: 'As Grammy read, the shadows on the wall seemed to change. They didn\'t look like scary shapes anymore; they looked like the tall, friendly kings and dancing dragons from the story. Leo realized that Grammy\'s house wasn\'t just a house—it was a kingdom waiting for an ' },
          { text: 'explorer', isWord: true, wordId: 'explorer' },
          { text: '.' },
        ],
        rawText: 'As Grammy read, the shadows on the wall seemed to change. They didn\'t look like scary shapes anymore; they looked like the tall, friendly kings and dancing dragons from the story. Leo realized that Grammy\'s house wasn\'t just a house—it was a kingdom waiting for an explorer.',
      },
      {
        id: 7,
        imageUrl: '/images/storytelling/leos-world/page-7.jpg',
        imageAlt: 'Leo hugging his bear in the dark hallway',
        content: [
          { text: 'But when the clock chimed for bedtime, the hallway looked very long and very dark. Leo hugged his stuffed bear, Barnaby, against his chest. "Grammy," he asked softly, "what if the dark is too big in the guest room?"' },
        ],
        rawText: 'But when the clock chimed for bedtime, the hallway looked very long and very dark. Leo hugged his stuffed bear, Barnaby, against his chest. "Grammy," he asked softly, "what if the dark is too big in the guest room?"',
      },
      {
        id: 8,
        imageUrl: '/images/storytelling/leos-world/page-8.jpg',
        imageAlt: 'Grammy showing Leo a Star-Light Lantern',
        content: [
          { text: 'Grammy Elspeth reached into a wooden trunk and pulled out a small, glass lantern. When she ' },
          { text: 'flicked', isWord: true, wordId: 'flicked' },
          { text: ' the switch, it glowed with a soft, amber light. "This is a Star-Light Lantern," she explained. "It catches all the brave dreams and keeps them right by your pillow."' },
        ],
        rawText: 'Grammy Elspeth reached into a wooden trunk and pulled out a small, glass lantern. When she flicked the switch, it glowed with a soft, amber light. "This is a Star-Light Lantern," she explained. "It catches all the brave dreams and keeps them right by your pillow."',
      },
      {
        id: 9,
        imageUrl: '/images/storytelling/leos-world/page-9.jpg',
        imageAlt: 'Leo sleeping peacefully with his bear and the lantern',
        content: [
          { text: 'Leo watched the golden light of the lantern dance on the ceiling. He felt like a knight resting after a great adventure. He wasn\'t nervous anymore; he was excited for the morning and the pancakes Grammy had promised. Before he knew it, he was fast asleep, dreaming of silver sugar and stars.' },
        ],
        rawText: 'Leo watched the golden light of the lantern dance on the ceiling. He felt like a knight resting after a great adventure. He wasn\'t nervous anymore; he was excited for the morning and the pancakes Grammy had promised. Before he knew it, he was fast asleep, dreaming of silver sugar and stars.',
      },
    ],
  },
];
