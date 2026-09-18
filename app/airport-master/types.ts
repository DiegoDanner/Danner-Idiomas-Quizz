export type WordCategory =
  | 'Planning & Booking'
  | 'Airport Check-In'
  | 'Security & Gates'
  | 'In-Flight & Classes'
  | 'Arrivals & Customs';

export type PartOfSpeech = 'N' | 'V' | 'Adj' | 'V/N';

export interface VocabularyItem {
  id: string;
  term: string;
  partOfSpeech: PartOfSpeech;
  category: WordCategory;
  definition: string;
  exampleSentences: string[];
  dialogue?: { speaker: string; text: string }[];
  didYouKnow?: string;
  tip?: string;
  imageUrl: string;
  imageAlt: string;
  audioAnnouncementText: string;
  pronunciationIpa?: string;
}

export interface AudioSimulationChallenge {
  id: string;
  title: string;
  location: string;
  announcementScript: string;
  speakerType: 'Gate Agent' | 'Customs Officer' | 'Flight Attendant' | 'Captain' | 'Check-in Desk';
  chimeSound: 'airport-chime' | 'seatbelt' | 'ding';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  relatedTermId: string;
}

export interface InspectionItem {
  id: string;
  name: string;
  description: string;
  category: 'Liquid' | 'Luggage' | 'Document' | 'Fragile Item' | 'Forbidden';
  details: string;
  correctAction: 'allow' | 'confiscate_liquid' | 'charge_overweight' | 'tag_fragile' | 'customs_declaration';
  explanation: string;
  iconName: string;
}

export interface UserProgress {
  callsign: string;
  avatarSeed: string;
  nationality: string;
  countryCode: string;
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
  masteredWordIds: string[];
  completedLessons: string[];
  completedSimulations: string[];
  speedHighScore: number;
  badges: Badge[];
  soundEnabled: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface LeaderboardCompetitor {
  id: string;
  rank: number;
  callsign: string;
  country: string;
  flag: string;
  avatar: string;
  tier: 'Diamond Captain' | 'Gold Aviator' | 'Silver Sky' | 'Bronze Passenger';
  xp: number;
  badgesCount: number;
  isCurrentUser?: boolean;
}
