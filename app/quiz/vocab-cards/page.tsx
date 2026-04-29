'use client';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { Volume2, VolumeX, Crown, Shuffle } from 'lucide-react';

const BLOWOUT_PIECES = Array.from({ length: 120 }).map(() => {
  const depth = Math.random();
  const size = depth * 25 + 10;
  const zPos = depth * 600 - 300;

  const startX = 50 + (Math.random() - 0.5) * 20;
  const peakX = startX + (Math.random() - 0.5) * 100;
  const endX = peakX + (Math.random() - 0.5) * 40;

  const startY = 110;
  const peakY = Math.random() * 50 + 5;
  const endY = 120;

  const duration = Math.random() * 2 + 3;
  const delay = Math.random() * 0.2;

  const isMuted = depth > 0.85;
  const filterStr = isMuted ? 'blur(4px)' : depth < 0.15 ? 'blur(2px)' : 'none';

  const hue = 40 + Math.random() * 10;
  const sat = 20 + Math.random() * 10;
  const lit = 90 + Math.random() * 10;
  const bgColor = `hsl(${hue}, ${sat}%, ${lit}%)`;

  return {
    size, zPos, startX, peakX, endX, startY, peakY, endY,
    duration, delay, filterStr, bgColor, depth,
    rotateXPeak: Math.random() * 1080 + 360,
    rotateYPeak: Math.random() * 1080 + 360,
    rotateZPeak: Math.random() * 720 - 360
  };
});

const PaperBlowout = ({ soundEnabled }: { soundEnabled: boolean }) => {
  const pieces = BLOWOUT_PIECES;

  useEffect(() => {
    if (!soundEnabled) return;

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.5;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 500;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 3.5);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start();
    } catch (e) {
      console.log('Audio error:', e);
    }
  }, [soundEnabled]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden perspective-[1000px]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 4, times: [0, 0.1, 1], ease: "easeOut" }}
        className="absolute inset-0 bg-[#fdf8eab3] mix-blend-overlay"
      />

      {pieces.map((p, i) => {
        return (
          <motion.div
            key={i}
            initial={{ x: `${p.startX}vw`, y: `${p.startY}vh`, z: p.zPos, rotateX: 0, rotateY: 0, rotateZ: 0 }}
            animate={{
              x: [`${p.startX}vw`, `${p.peakX}vw`, `${p.endX}vw`],
              y: [`${p.startY}vh`, `${p.peakY}vh`, `${p.endY}vh`],
              rotateX: [0, p.rotateXPeak],
              rotateY: [0, p.rotateYPeak],
              rotateZ: [0, p.rotateZPeak]
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: ["easeOut", "easeInOut"],
              times: [0, 0.3, 1]
            }}
            style={{
              position: 'absolute',
              width: p.size * 0.7,
              height: p.size,
              backgroundColor: p.bgColor,
              border: '1px solid rgba(0,0,0,0.05)',
              filter: p.filterStr,
              opacity: p.depth > 0.8 ? 0.6 : 0.9,
              boxShadow: 'inset 0 0 10px rgba(255, 230, 180, 0.4), 0 4px 10px rgba(0,0,0,0.15)',
              transformStyle: 'preserve-3d',
              willChange: 'transform'
            }}
          />
        )
      })}
    </div>
  )
}


// ==========================================
// GLOBALS & CONSTANTS
// ==========================================

const CATEGORY_EMOJIS: Record<string, string> = {
  Clothes: "👕", Body: "👁️", Colors: "🎨", Planets: "🪐", House: "🏠", Rooms: "🚪", Food: "🍔", Animals: "🐾", Transportation: "🚗", Jobs: "💼", Places: "📍", Emotions: "😊", Fruits: "🍎", Vegetables: "🥕", Days: "📅", Months: "🗓️"
};

const getEmojiForWord = (word: string, category: string) => {
  const baseMap: Record<string, string> = {
    // Clothes
    "Shirt": "👕", "Pants": "👖", "Dress": "👗", "Skirt": "🥻", "Jacket": "🧥", "Sweater": "🧥", "Shoes": "👞", "Socks": "🧦", "Hat": "🎩", "Scarf": "🧣", "Gloves": "🧤", "Boots": "👢", "Belt": "🥋", "Tie": "👔", "Coat": "🧥", "Shorts": "🩳", "Jeans": "👖", "T-shirt": "👕", "Swimsuit": "👙", "Pyjamas": "👚",
    // Body
    "Head": "🗣️", "Arm": "💪", "Leg": "🦵", "Hand": "🖐️", "Foot": "🦶", "Eye": "👁️", "Ear": "👂", "Nose": "👃", "Mouth": "👄", "Finger": "☝️", "Toe": "🦶", "Knee": "🦵", "Shoulder": "🤷", "Neck": "🧣", "Back": "🧘", "Chest": "🫁", "Stomach": "🤰", "Hair": "💇", "Tooth": "🦷", "Tongue": "👅",
    // Colors
    "Red": "🔴", "Blue": "🔵", "Green": "🟢", "Yellow": "🟡", "Orange": "🟠", "Purple": "🟣", "Pink": "🩷", "Black": "⚫", "White": "⚪", "Brown": "🟤", "Gray": "🔘", "Cyan": "🩵", "Magenta": "💖", "Maroon": "🍷", "Navy": "⛴️", "Olive": "🫒", "Teal": "🦚", "Lime": "🍋‍🟩", "Indigo": "🌌", "Violet": "👾",
    // Planets
    "Mercury": "🪐", "Venus": "⭐", "Earth": "🌍", "Mars": "🔴", "Jupiter": "🟠", "Saturn": "🪐", "Uranus": "🔵", "Neptune": "🌊", "Pluto": "🪨", "Sun": "☀️", "Moon": "🌙", "Star": "⭐", "Comet": "☄️", "Asteroid": "🪨", "Galaxy": "🌌", "Nebula": "🌠", "Meteor": "🌠", "Orbit": "🛸", "Satellite": "🛰️", "Eclipse": "🌘",
    // House
    "Chair": "🪑", "Table": "🪚", "Bed": "🛏️", "Sofa": "🛋️", "Lamp": "🪔", "Clock": "🕰️", "Mirror": "🪞", "Rug": "🔲", "Television": "📺", "Radio": "📻", "Telephone": "☎️", "Shelf": "📚", "Desk": "🪑", "Window": "🪟", "Door": "🚪", "Pillow": "🛌", "Blanket": "🛏️", "Towel": "🧖", "Oven": "🍳", "Fridge": "🧊",
    // Rooms
    "Kitchen": "🍳", "Bathroom": "🛁", "Bedroom": "🛏️", "Garage": "🚗", "Attic": "🕸️", "Basement": "🪨", "Office": "💻", "Hallway": "🚪", "Balcony": "🪴", "Living Room": "🛋️", "Dining Room": "🍽️", "Closet": "👗", "Laundry": "🧺", "Pantry": "🥫", "Porch": "🪑", "Patio": "🪴", "Study": "📚", "Nursery": "🍼", "Cellar": "🍷", "Loft": "🪜",
    // Food
    "Pizza": "🍕", "Burger": "🍔", "Pasta": "🍝", "Salad": "🥗", "Steak": "🥩", "Sushi": "🍣", "Soup": "🍲", "Sandwich": "🥪", "Taco": "🌮", "Bread": "🍞", "Cheese": "🧀", "Rice": "🍚", "Chicken": "🍗", "Fish": "🐟", "Egg": "🥚", "Cake": "🍰", "Cookie": "🍪",
    // Animals
    "Dog": "🐶", "Cat": "🐱", "Elephant": "🐘", "Lion": "🦁", "Tiger": "🐯", "Bear": "🐻", "Zebra": "🦓", "Giraffe": "🦒", "Monkey": "🐵", "Kangaroo": "🦘", "Penguin": "🐧", "Dolphin": "🐬", "Rabbit": "🐰", "Horse": "🐴", "Cow": "🐮", "Pig": "🐷", "Sheep": "🐑", "Goat": "🐐", "Bird": "🐦", "Snake": "🐍",
    // Transportation
    "Car": "🚗", "Bus": "🚌", "Train": "🚆", "Bicycle": "🚲", "Airplane": "✈️", "Helicopter": "🚁", "Motorcycle": "🏍️", "Boat": "⛵", "Ship": "🚢", "Submarine": "🦈", "Scooter": "🛴", "Skateboard": "🛹", "Truck": "🚚", "Van": "🚐", "Tram": "🚊", "Ferry": "⛴️", "Taxi": "🚕", "Ambulance": "🚑", "Tractor": "🚜", "Rocket": "🚀",
    // Jobs
    "Teacher": "🧑‍🏫", "Doctor": "🧑‍⚕️", "Engineer": "👷", "Nurse": "👩‍⚕️", "Police": "👮", "Firefighter": "🧑‍🚒", "Pilot": "🧑‍✈️", "Chef": "🧑‍🍳", "Baker": "🥖", "Farmer": "🧑‍🌾", "Waiter": "💁", "Actor": "🎭", "Singer": "🧑‍🎤", "Dancer": "💃", "Artist": "🧑‍🎨", "Writer": "✍️", "Dentist": "🦷", "Mechanic": "🔧", "Plumber": "🪠", "Scientist": "🧑‍🔬",
    // Places
    "Hospital": "🏥", "Bank": "🏦", "Park": "🏞️", "School": "🏫", "Library": "📚", "Supermarket": "🛒", "Restaurant": "🍽️", "Museum": "🏛️", "Cinema": "🎬", "Post Office": "🏤", "Station": "🚉", "Fire Station": "🚒", "Hotel": "🏨", "Airport": "✈️", "Zoo": "🦓", "Beach": "🏖️", "Gym": "🏋️", "Church": "⛪", "Bakery": "🥐", "Pharmacy": "💊",
    // Emotions
    "Happy": "😀", "Sad": "😢", "Angry": "😠", "Excited": "🤩", "Scared": "😨", "Surprised": "😲", "Bored": "🥱", "Tired": "😫", "Nervous": "😬", "Proud": "😌", "Jealous": "😒", "Confused": "😕", "Lonely": "😔", "Shy": "😳", "Guilty": "🥺", "Disgusted": "🤢", "Hopeful": "🤞", "Frustrated": "😤", "Relaxed": "😎", "Curious": "🤔",
    // Vegetables
    "Carrot": "🥕", "Broccoli": "🥦", "Tomato": "🍅", "Potato": "🥔", "Onion": "🧅", "Garlic": "🧄", "Spinach": "🥬", "Cucumber": "🥒", "Pepper": "🌶️", "Lettuce": "🥬", "Cabbage": "🥬", "Mushroom": "🍄", "Corn": "🌽", "Pea": "🫛", "Eggplant": "🍆", "Zucchini": "🥒", "Cauliflower": "🥦", "Celery": "🥬", "Radish": "🌶️", "Pumpkin": "🎃",
    // Days / Months
    "Monday": "📅", "Tuesday": "📅", "Wednesday": "📅", "Thursday": "📅", "Friday": "📅", "Saturday": "🌟", "Sunday": "🌟",
    "January": "❄️", "February": "💘", "March": "☘️", "April": "☔", "May": "🌸", "June": "☀️", "July": "🎆", "August": "🏖️", "September": "🍂", "October": "🎃", "November": "🦃", "December": "🎄"
  };

  const fruitMap: Record<string, string> = {
    // Fruits
    "Apple": "🍎", "Banana": "🍌", "Mango": "🥭", "Orange": "🍊", "Strawberry": "🍓", "Grape": "🍇", "Watermelon": "🍉", "Pineapple": "🍍", "Peach": "🍑", "Cherry": "🍒", "Pear": "🍐", "Plum": "🫐", "Kiwi": "🥝", "Lemon": "🍋", "Blueberry": "🫐", "Raspberry": "🍓", "Melon": "🍈", "Papaya": "🥭", "Fig": "🥥", "Pomegranate": "🥭"
  };

  const map = { ...baseMap, ...fruitMap };

  if (map[word]) return map[word];

  // Default fallback by category
  return CATEGORY_EMOJIS[category] || "✨";
};

const CATEGORIES: Record<string, string[]> = {
  Clothes: ["Shirt", "Pants", "Dress", "Skirt", "Jacket", "Sweater", "Shoes", "Socks", "Hat", "Scarf", "Gloves", "Boots", "Belt", "Tie", "Coat", "Shorts", "Jeans", "T-shirt", "Swimsuit", "Pyjamas"],
  Body: ["Head", "Arm", "Leg", "Hand", "Foot", "Eye", "Ear", "Nose", "Mouth", "Finger", "Toe", "Knee", "Shoulder", "Neck", "Back", "Chest", "Stomach", "Hair", "Tooth", "Tongue"],
  Colors: ["Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Pink", "Black", "White", "Brown", "Gray", "Cyan", "Magenta", "Maroon", "Navy", "Olive", "Teal", "Lime", "Indigo", "Violet"],
  Planets: ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Sun", "Moon", "Star", "Comet", "Asteroid", "Galaxy", "Nebula", "Meteor", "Orbit", "Satellite", "Eclipse"],
  House: ["Chair", "Table", "Bed", "Sofa", "Lamp", "Clock", "Mirror", "Rug", "Television", "Radio", "Telephone", "Shelf", "Desk", "Window", "Door", "Pillow", "Blanket", "Towel", "Oven", "Fridge"],
  Rooms: ["Kitchen", "Bathroom", "Bedroom", "Garage", "Attic", "Basement", "Office", "Hallway", "Balcony", "Living Room", "Dining Room", "Closet", "Laundry", "Pantry", "Porch", "Patio", "Study", "Nursery", "Cellar", "Loft"],
  Food: ["Pizza", "Burger", "Pasta", "Salad", "Steak", "Sushi", "Soup", "Sandwich", "Taco", "Bread", "Cheese", "Apple", "Banana", "Orange", "Rice", "Chicken", "Fish", "Egg", "Cake", "Cookie"],
  Animals: ["Dog", "Cat", "Elephant", "Lion", "Tiger", "Bear", "Zebra", "Giraffe", "Monkey", "Kangaroo", "Penguin", "Dolphin", "Rabbit", "Horse", "Cow", "Pig", "Sheep", "Goat", "Bird", "Snake"],
  Transportation: ["Car", "Bus", "Train", "Bicycle", "Airplane", "Helicopter", "Motorcycle", "Boat", "Ship", "Submarine", "Scooter", "Skateboard", "Truck", "Van", "Tram", "Ferry", "Taxi", "Ambulance", "Tractor", "Rocket"],
  Jobs: ["Teacher", "Doctor", "Engineer", "Nurse", "Police", "Firefighter", "Pilot", "Chef", "Baker", "Farmer", "Waiter", "Actor", "Singer", "Dancer", "Artist", "Writer", "Dentist", "Mechanic", "Plumber", "Scientist"],
  Places: ["Hospital", "Bank", "Park", "School", "Library", "Supermarket", "Restaurant", "Museum", "Cinema", "Post Office", "Station", "Fire Station", "Hotel", "Airport", "Zoo", "Beach", "Gym", "Church", "Bakery", "Pharmacy"],
  Emotions: ["Happy", "Sad", "Angry", "Excited", "Scared", "Surprised", "Bored", "Tired", "Nervous", "Proud", "Jealous", "Confused", "Lonely", "Shy", "Guilty", "Disgusted", "Hopeful", "Frustrated", "Relaxed", "Curious"],
  Fruits: ["Apple", "Banana", "Mango", "Orange", "Strawberry", "Grape", "Watermelon", "Pineapple", "Peach", "Cherry", "Pear", "Plum", "Kiwi", "Lemon", "Blueberry", "Raspberry", "Melon", "Papaya", "Fig", "Pomegranate"],
  Vegetables: ["Carrot", "Broccoli", "Tomato", "Potato", "Onion", "Garlic", "Spinach", "Cucumber", "Pepper", "Lettuce", "Cabbage", "Mushroom", "Corn", "Pea", "Eggplant", "Zucchini", "Cauliflower", "Celery", "Radish", "Pumpkin"],
  Days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  Months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
};

// Ensure all categories are multiples of 3
for (const key in CATEGORIES) {
  const rem = CATEGORIES[key].length % 3;
  if (rem !== 0) {
    CATEGORIES[key] = CATEGORIES[key].slice(0, CATEGORIES[key].length - rem);
  }
}

type Card = { id: string; word: string; category: string };
type CategoryState = { id: string; name: string; current: number; total: number };
type Source = { type: 'table' } | { type: 'holding', index: number };

let idCounter = 0;
const generateId = () => {
  idCounter++;
  return Math.random().toString(36).substring(2, 9) + '-' + idCounter;
};

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// ==========================================
// AUDIO SYNTHESIS
// ==========================================
class AudioFX {
  private ctx: AudioContext | null = null;

  init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(freq: number, type: OscillatorType, dur: number, vol = 0.1, sweep = false) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (sweep) osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + dur);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + dur);
    } catch(e) {}
  }

  slide() { this.init(); this.play(300, 'sine', 0.1, 0.05, true); }
  flip()  { this.init(); this.play(700, 'triangle', 0.05, 0.05); }
  success() {
    this.init();
    this.play(600, 'sine', 0.1, 0.1);
    setTimeout(() => this.play(900, 'sine', 0.15, 0.1), 100);
  }
  combo() {
    this.init();
    this.play(523.25, 'sine', 0.1, 0.1); // C5
    setTimeout(() => this.play(659.25, 'sine', 0.1, 0.1), 100); // E5
    setTimeout(() => this.play(783.99, 'sine', 0.1, 0.1), 200); // G5
    setTimeout(() => this.play(1046.50, 'sine', 0.2, 0.15), 300); // C6
  }
  error() { this.init(); this.play(200, 'sawtooth', 0.15, 0.05); }
}

const fx = new AudioFX();

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function VocabCardsPage() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [moves, setMoves] = useState(0);
  const deckShake = false;
  const [mounted, setMounted] = useState(false);

  // Initialize state lazily
  const [{ initialCats, initialCards, initialPool }] = useState(() => {
    if (typeof window === 'undefined') return { initialCats: [], initialCards: [], initialPool: [] };
    const shuffledCats = shuffleArray(Object.keys(CATEGORIES));
    const initCats = shuffledCats.slice(0, 4);
    const pool = shuffledCats.slice(4);
    const catState = initCats.map(name => ({
      id: generateId(),
      name,
      current: 0,
      total: CATEGORIES[name].length
    }));
    const cardsState: Card[] = [];
    initCats.forEach(cat => {
      CATEGORIES[cat].forEach(word => {
        cardsState.push({ id: generateId(), word, category: cat });
      });
    });
    return { initialCats: catState, initialCards: shuffleArray(cardsState), initialPool: pool };
  });

  const [categories, setCategories] = useState<CategoryState[]>(initialCats);
  const [deck, setDeck] = useState<Card[]>(initialCards);
  const [catPool, setCatPool] = useState<string[]>(initialPool);
  const [tableCards, setTableCards] = useState<Card[]>([]);
  const [holding, setHolding] = useState<Card[][]>([[], [], [], []]);
  const [isDraggingAny, setIsDraggingAny] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);

  useEffect(() => {
    //
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleFirstInteraction = () => {
      fx.init();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
      }
      window.removeEventListener('pointerdown', handleFirstInteraction);
    };
    window.addEventListener('pointerdown', handleFirstInteraction);
    return () => window.removeEventListener('pointerdown', handleFirstInteraction);
  }, []);

  const playWord = (word: string) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const drawCard = () => {
    fx.init();
    if (deck.length === 0) return;

    const newDeck = [...deck];
    const topCard = newDeck.pop();
    if (topCard) {
      setDeck(newDeck);
      setTableCards(prev => {
        if (prev.some(c => c.id === topCard.id)) return prev;
        return [...prev, topCard];
      });
      if (soundEnabled) {
        fx.slide();
        setTimeout(() => fx.flip(), 100);
      }
    }
  };

  const getHitZone = (x: number, y: number) => {
    const zones = Array.from(document.querySelectorAll('[data-dropzone]'));
    for (const zone of zones) {
      const rect = zone.getBoundingClientRect();
      const pad = 15;
      if (x >= rect.left - pad && x <= rect.right + pad && y >= rect.top - pad && y <= rect.bottom + pad) {
        return zone.getAttribute('data-dropzone');
      }
    }
    return null;
  };

  const handleDragStart = () => {
    setIsDraggingAny(true);
    setHasDragged(true);
  };

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, card: Card, source: Source) => {
    setIsDraggingAny(false);
    const hitZone = getHitZone(info.point.x, info.point.y);

    if (!hitZone) {
      if (soundEnabled) fx.error();
      return;
    }

    let targetIdx = -1;
    if (hitZone.startsWith('category-')) {
      const catName = hitZone.split('category-')[1];
      targetIdx = categories.findIndex(c => c.name === catName);
    } else if (hitZone.startsWith('holding-')) {
      targetIdx = parseInt(hitZone.split('holding-')[1]);
    }

    if (targetIdx !== -1) {
      const targetCategory = categories[targetIdx]?.name;
      if (targetCategory && card.category !== targetCategory) {
        if (soundEnabled) fx.error();
        return;
      }

      if (source.type === 'holding' && source.index === targetIdx) return;

      if (soundEnabled) fx.slide();
      playWord(card.word);
      setMoves(m => m + 1);

      if (source.type === 'table') {
        setTableCards(prev => prev.filter(c => c.id !== card.id));
      }

      setHolding(prev => {
        const next = [...prev];
        if (source.type === 'holding') {
          next[source.index] = next[source.index].filter(c => c.id !== card.id);
        }
        if (!next[targetIdx].some(c => c.id === card.id)) {
          next[targetIdx] = [...next[targetIdx], card];
        }
        return next;
      });
    } else if (hitZone === 'table') {
      if (source.type === 'holding') {
        if (soundEnabled) fx.slide();
        setMoves(m => m + 1);

        setHolding(prev => {
          const next = [...prev];
          next[source.index] = next[source.index].filter(c => c.id !== card.id);
          return next;
        });
        setTableCards(prev => {
          if (prev.some(c => c.id === card.id)) return prev;
          return [...prev, card];
        });
      }
    }
  };

  useEffect(() => {
    if (categories.length === 0) return;

    const isAllCompleted = categories.every((c, idx) => holding[idx]?.length === c.total);

    if (isAllCompleted) {
      const timer = setTimeout(() => {
        if (catPool.length > 0) {
          const numToPick = Math.min(4, catPool.length);
          const nextNames = catPool.slice(0, numToPick);
          setCatPool(p => p.slice(numToPick));

          setCategories(nextNames.map(name => ({
            id: generateId(),
            name,
            current: 0,
            total: CATEGORIES[name].length
          })));

          setHolding(Array.from({ length: numToPick }, () => []));

          setDeck(prevDeck => {
            const newCards = nextNames.flatMap(name => CATEGORIES[name].map(word => ({
              id: generateId(), word, category: name
            })));
            return shuffleArray([...prevDeck, ...newCards]);
          });
        } else {
          setCategories([]);
          setHolding([]);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [categories, catPool, mounted, holding, tableCards]);

  const allGameCategories = React.useMemo(() => {
    return [...initialCats.map(c => c.name), ...initialPool];
  }, [initialCats, initialPool]);

  if (!mounted) return null;

  const isGameCompleted = categories.length === 0 && tableCards.length === 0 && holding.every(c => c.length === 0);

  return (
    <main className="min-h-screen bg-[#489552] text-white font-sans overflow-y-auto overflow-x-hidden flex flex-col select-none relative pt-24 pb-24">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 w-full mb-6 z-50 relative mt-8 sm:mt-12 ml-20 sm:ml-32">
        <Link href="/#quizzes">
          <motion.button
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors font-headline font-bold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Quizzes
          </motion.button>
        </Link>
      </div>

      {/* Moves Banner - Top Left */}
      <div className="absolute top-[72px] left-0 sm:left-6 flex flex-col items-center mt-2 z-50 pointer-events-none">
        <div className="bg-[#3AA34C] text-[#1B4E26] pt-4 pb-6 w-[60px] sm:w-[90px] flex flex-col items-center shadow-lg relative rounded-b-sm pointer-events-auto"
             style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)' }}>
          <span className="text-[9px] sm:text-[11px] font-bold tracking-tight opacity-80 mb-0.5">Moves</span>
          <span className="text-[28px] sm:text-[42px] font-extrabold leading-none">{moves}</span>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="mt-2 sm:mt-3 p-1 text-white/90 hover:text-white transition-colors pointer-events-auto"
        >
          {soundEnabled ? <Volume2 size={24} className="sm:hidden" /> : <VolumeX size={24} className="sm:hidden" />}
          {soundEnabled ? <Volume2 size={28} className="hidden sm:block" /> : <VolumeX size={28} className="hidden sm:block" />}
        </button>

        {/* Categories Progress List */}
        <div className="mt-1 sm:mt-4 grid grid-cols-1 gap-1 sm:gap-2">
          {allGameCategories.map(cat => {
            const isCompleted = !categories.find(c => c.name === cat) && !catPool.includes(cat);
            const isOnTable = !!categories.find(c => c.name === cat);

            return (
              <div
                key={cat}
                className={`w-5 h-5 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-[10px] sm:text-lg transition-all duration-500 pointer-events-auto
                  ${isCompleted ? 'bg-white/90 scale-110 shadow-sm'
                    : isOnTable ? 'bg-black/30 border border-white/40 shadow-inner'
                    : 'bg-black/10 opacity-40 grayscale'}
                `}
                title={`${cat} ${isCompleted ? '(Completed)' : isOnTable ? '(In Play)' : '(Upcoming)'}`}
              >
                {CATEGORY_EMOJIS[cat] || "✨"}
              </div>
            );
          })}
        </div>
      </div>

      {/* Deck & Table Area - Top Right */}
      <div className="absolute top-[88px] right-4 sm:right-12 z-50 flex flex-row items-start gap-3 sm:gap-6">

        {/* Drawn Cards Area (tableCards) */}
        <div
          data-dropzone="table"
          className="relative w-24 sm:w-48 h-[120px] sm:h-[160px] bg-black/10 rounded-xl border-2 border-dashed border-white/30 flex items-center justify-center p-2"
        >
          <AnimatePresence>
            {tableCards.length > 0 && !hasDragged && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 font-bold px-3 py-1.5 rounded-full text-xs sm:text-sm shadow-md whitespace-nowrap z-50 animate-bounce pointer-events-none"
              >
                Drag a card!
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-x-4 border-b-4 border-x-transparent border-b-yellow-400" />
              </motion.div>
            )}
            {tableCards.map((card, idx) => {
              const hash = card.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
              const randRot = ((hash * 13) % 20) - 10;
              // offset slightly to the right to show pile
              const xOffset = Math.min(idx * 8, 40);
              const yOffset = 0;
              const rotation = randRot;

              return (
                <div key={card.id} className="absolute left-2 sm:left-4 top-2 sm:top-4">
                  <DraggableCard
                    card={card}
                    source={{ type: 'table' }}
                    isDraggable={true}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onTap={() => { playWord(card.word); }}
                    tableStyle={{ xOffset, yOffset, rotation, zIndex: idx }}
                  />
                </div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Deck */}
        <motion.div
          onClick={drawCard}
          animate={deckShake ? { x: [-5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.3 }}
          className="relative w-20 sm:w-28 aspect-[2/3] max-h-32 sm:max-h-40 shadow-xl cursor-pointer"
        >
          {deck.length > 0 ? (
            <div className="absolute inset-0 bg-white rounded-[10px] p-1.5 shadow-md border-b-[4px] border-gray-200">
              <div className="w-full h-full bg-[#3B8EF0] rounded-md overflow-hidden relative border border-blue-400">
                 <div className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff), linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff)`,
                        backgroundSize: `16px 16px`,
                        backgroundPosition: `0 0, 8px 8px`
                      }} />
              </div>
            </div>
          ) : (
            <div className="w-full h-full rounded-[10px] border-2 border-dashed border-[#3C7E41] flex items-center justify-center opacity-50 bg-[#3C7E41]/20">
              <Shuffle className="opacity-30" />
            </div>
          )}
        </motion.div>
      </div>

      <div className="flex-1 w-full max-w-3xl mx-auto mt-[220px] sm:mt-[260px] px-2 flex justify-center gap-2 sm:gap-6 pb-12">
        <AnimatePresence>
          {categories.map((cat, idx) => {
            const col = holding[idx] || [];
            const isComplete = col.length === cat.total;
            return (
              <motion.div
                key={cat.id}
                initial={{ scale: 0, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -50 }}
                transition={{ type: "spring", bounce: 0.4 }}
                className="relative w-[85px] sm:w-[110px] flex flex-col items-center gap-4 sm:gap-6 cursor-default"
                data-dropzone={`category-${cat.name}`}
              >
                {/* Yellow Category Tab */}
                <AnimatePresence>
                  {col.length > 0 && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="absolute -top-6 bg-[#F2C94C] text-[#A67512] text-[11px] sm:text-xs font-bold px-4 py-1.5 rounded-t-lg z-0 whitespace-nowrap shadow-sm"
                    >
                      {cat.name}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div
                  data-dropzone={`holding-${idx}`}
                  className="relative w-full h-[220px]"
                >
                  <div className={`w-full aspect-[2/3] rounded-xl transition-all duration-300 absolute top-0 left-0
                      ${col.length === 0
                          ? 'bg-white border-[3px] sm:border-[4px] border-[#F2C94C] z-10 flex flex-col p-2 shadow-sm'
                          : 'bg-[#3C7E41] z-0 flex items-center justify-center'}`}>

                    {col.length === 0 ? (
                        <>
                          <div className="flex justify-between items-start text-[#A67512] w-full">
                             <span className="text-[10px] sm:text-xs font-bold">0/{cat.total}</span>
                             <Crown size={14} className="fill-[#F2C94C]" />
                          </div>
                          <div className="flex-1 flex items-center justify-center w-full">
                            <span className="font-bold text-[13px] sm:text-[15px] text-center text-gray-800 leading-tight break-words px-1">
                              {cat.name}
                            </span>
                          </div>
                        </>
                    ) : (
                        <Crown size={36} className="text-[#326a37] fill-[#326a37] opacity-60" />
                    )}
                  </div>

                  <div className={`absolute top-0 left-0 w-full aspect-[2/3] rounded-xl border-dashed transition-all duration-300 pointer-events-none z-50
                      ${isDraggingAny && col.length > 0 ? 'border-[3px] border-[#F2C94C]/80 ring-4 ring-[#F2C94C]/20 bg-[#F2C94C]/10' : 'border-transparent'}`} />

                  {col.map((card, i) => {
                    const isDraggable = i === col.length - 1 && !isComplete;

                    return (
                      <div
                        key={card.id}
                        className="absolute left-0 w-full"
                        style={{ top: i * (isComplete ? 6 : 28), zIndex: i + 10 }}
                      >
                        <DraggableCard
                          card={card}
                          source={{ type: 'holding', index: idx }}
                          isDraggable={isDraggable}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          onTap={() => {
                            playWord(card.word);
                          }}
                          progress={i === col.length - 1 ? { current: col.length, total: cat.total } : undefined}
                        />
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}


        </AnimatePresence>
      </div>

      {isGameCompleted && <PaperBlowout soundEnabled={soundEnabled} />}
    </main>
  );
}

function DraggableCard({
  card,
  source,
  isDraggable = true,
  onDragStart,
  onDragEnd,
  onTap,
  tableStyle,
  progress
}: {
  card: Card;
  source: Source;
  isDraggable?: boolean;
  onDragStart?: () => void;
  onDragEnd: (e: any, info: any, card: any, source: any) => void;
  onTap: () => void;
  tableStyle?: { xOffset: number, yOffset: number, rotation: number, zIndex: number };
  progress?: { current: number; total: number };
}) {
  const isTable = source.type === 'table';
  const isCategoryTop = !!progress;

  return (
    <motion.div
      layout
      layoutId={card.id}
      initial={isTable ? { rotateY: 180, x: 50, opacity: 0 } : false}
      animate={{
        rotateY: 0,
        x: tableStyle ? tableStyle.xOffset : 0,
        y: tableStyle ? tableStyle.yOffset : 0,
        rotate: tableStyle ? tableStyle.rotation : 0,
        zIndex: tableStyle ? tableStyle.zIndex : undefined,
        opacity: 1
      }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}

      drag={isDraggable}
      dragSnapToOrigin={true}
      onDragStart={() => {
        if (isDraggable && onDragStart) onDragStart();
      }}
      onDragEnd={(e, info) => {
        if (isDraggable) onDragEnd(e, info, card, source);
      }}
      onClick={onTap}

      whileDrag={{ scale: 1.05, zIndex: 100, rotate: 2, cursor: 'grabbing' }}
      whileHover={isDraggable ? { y: -4 } : {}}

      className={`relative w-20 sm:w-[110px] aspect-[2/3] max-h-32 sm:max-h-40 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center p-2 user-select-none select-none overflow-hidden ${isDraggable ? 'cursor-grab' : 'cursor-default'} ${isCategoryTop ? 'border-[3px] sm:border-[4px] border-[#F2C94C]' : 'border border-gray-200 border-b-4'}`}
    >
      {progress && (
         <div className="absolute top-1.5 sm:top-2 left-1.5 right-1.5 sm:left-2 sm:right-2 flex justify-between items-start text-[#A67512] pointer-events-none">
            <span className="text-[10px] sm:text-xs font-bold">{progress.current}/{progress.total}</span>
            <Crown size={14} className="fill-[#F2C94C]" />
         </div>
      )}
      <div className="flex flex-col items-center justify-center mt-2 pointer-events-none">
        <span className="text-3xl sm:text-4xl mb-1">{getEmojiForWord(card.word, card.category)}</span>
        <span className="font-bold text-gray-800 text-sm sm:text-[15px] text-center leading-tight break-words px-1">
          {card.word}
        </span>
      </div>
    </motion.div>
  );
}
