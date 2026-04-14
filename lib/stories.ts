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
];
