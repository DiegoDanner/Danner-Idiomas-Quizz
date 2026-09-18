import { VocabularyItem, AudioSimulationChallenge, InspectionItem } from '../types';

export const VOCABULARY_LIST: VocabularyItem[] = [
  // STAGE 1: Planning & Booking
  {
    id: 'travel-agent',
    term: 'Travel agent',
    partOfSpeech: 'N',
    category: 'Planning & Booking',
    definition: 'A person or agency who helps you organize your travel plans and book your flights and vacations.',
    exampleSentences: [
      'I tried looking for a flight online, but I couldn’t book it with my credit card.',
      'You should visit the travel agent in the mall, she is very good and they have great offers.'
    ],
    dialogue: [
      { speaker: 'Traveler', text: 'Good morning! Can you help me find the best route to Tokyo next month?' },
      { speaker: 'Travel Agent', text: 'Certainly! I can compare flight schedules and organize your hotel package as well.' }
    ],
    didYouKnow: 'Even with modern apps, travel agents often have direct access to exclusive airline consolidation rates!',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Travel agent with headset assisting customer with trip planning',
    audioAnnouncementText: 'Welcome to Horizon Travel Services. An agent will be with you shortly to book your tickets.',
    pronunciationIpa: '/ˈtræv.əl ˌeɪ.dʒənt/'
  },
  {
    id: 'book-ticket',
    term: 'Book (a ticket)',
    partOfSpeech: 'V',
    category: 'Planning & Booking',
    definition: 'To reserve your seat on a flight and pay for it in advance.',
    exampleSentences: [
      'Hi, how can I help you? — I’d like to book a return ticket to Paris, please.',
      'Make sure you book your tickets early for the summer holidays to get the best prices.'
    ],
    dialogue: [
      { speaker: 'Customer', text: 'I’d like to book an economy ticket to Rome next Friday.' },
      { speaker: 'Desk', text: 'Would you like to make it return or one-way?' }
    ],
    tip: 'Remember: In English, we say "book a flight", "book a ticket", or "book a hotel room".',
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Traveler booking and holding an airline ticket',
    audioAnnouncementText: 'Thank you for calling. Your reservation on Flight 412 has been successfully booked.',
    pronunciationIpa: '/bʊk ə ˈtɪk.ɪt/'
  },
  {
    id: 'one-way-ticket',
    term: 'One-way (ticket)',
    partOfSpeech: 'N',
    category: 'Planning & Booking',
    definition: 'A ticket that takes you to your destination without a return flight. The opposite is a return ticket (or round-trip).',
    exampleSentences: [
      'Hi, I’d like to book a one-way ticket to Hong Kong.',
      'What’s your purpose for traveling? — We’re emigrating (moving for a new life) there.'
    ],
    tip: 'In British English, people say "return ticket". In American English, it is often called a "round-trip ticket".',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Airline passenger ticket showing one-way routing',
    audioAnnouncementText: 'Passenger booked on a one-way itinerary to Hong Kong, please confirm your entry visa.',
    pronunciationIpa: '/ˌwʌnˈweɪ ˈtɪk.ɪt/'
  },
  {
    id: 'airline',
    term: 'Airline',
    partOfSpeech: 'N',
    category: 'Planning & Booking',
    definition: 'The commercial company or carrier that owns airplanes and operates flights (e.g. Singapore Airlines, British Airways, Lufthansa).',
    exampleSentences: [
      'I need to book a flight to Berlin next week. Which airline do you suggest I fly with?',
      'The cheapest airline that flies to Germany is Lufthansa. It’s a German carrier.'
    ],
    didYouKnow: 'The word "carrier" is frequently used as a formal synonym for airline in airport documents and industry news.',
    imageUrl: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Lufthansa commercial airliner ready for passengers on the tarmac',
    audioAnnouncementText: 'Welcome aboard Lufthansa flight 402 with service to Frankfurt. Please have your boarding pass ready.',
    pronunciationIpa: '/ˈeə.laɪn/'
  },
  {
    id: 'visa',
    term: 'Visa',
    partOfSpeech: 'N',
    category: 'Planning & Booking',
    definition: 'An official stamp or document issued by a foreign government granting you legal permission to enter, stay, or transit through their country.',
    exampleSentences: [
      'Could you tell me if a person from Albania needs a visa to travel to Italy?',
      'No, you don’t require a visa. Albanian citizens can travel up to 3 months without a visa to any EU country.'
    ],
    tip: 'Always check visa requirements weeks before departing; some countries require an e-visa or transit visa even for layovers!',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'United Kingdom entry visa sticker stamped inside passport page',
    audioAnnouncementText: 'International travelers must hold a valid entry visa prior to boarding.',
    pronunciationIpa: '/ˈviː.zə/'
  },

  // STAGE 2: Airport Check-In
  {
    id: 'departures',
    term: 'Departures',
    partOfSpeech: 'N',
    category: 'Airport Check-In',
    definition: 'The area or terminal where passengers leave on their trips, wait in the lounge, and go to their flight gates.',
    exampleSentences: [
      'When you are leaving to go on a trip, you will need to go to the departures lounge where you will wait to board your flight.',
      'All passengers flying to Istanbul are kindly requested to go to the departures lounge.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Traveler standing in departures lounge looking out at runway',
    audioAnnouncementText: 'Attention please. All passengers for Istanbul flight 1842, please proceed to Departures Concourse B.',
    pronunciationIpa: '/dɪˈpɑː.tʃəz/'
  },
  {
    id: 'check-in',
    term: 'Check in',
    partOfSpeech: 'V/N',
    category: 'Airport Check-In',
    definition: 'To notify the airline at their counter or kiosk that you have arrived, register your checked bags, and receive your boarding pass. The counter area is also called check-in.',
    exampleSentences: [
      'How many passengers are checking in with you?',
      'It’s a large school group. We have 45 people in our party (group).'
    ],
    dialogue: [
      { speaker: 'Agent', text: 'Welcome! Where are you flying today, sir?' },
      { speaker: 'Traveler', text: 'London Heathrow. Here are our passports.' },
      { speaker: 'Agent', text: 'Great. Place your bags on the scale, please.' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Busy airport check-in desks with passengers queuing with suitcases',
    audioAnnouncementText: 'Passengers for Belle Air flight 890 may now proceed to check-in desks 14 through 18.',
    pronunciationIpa: '/ˈtʃek.ɪn/'
  },
  {
    id: 'identification-id',
    term: 'Identification (ID)',
    partOfSpeech: 'N',
    category: 'Airport Check-In',
    definition: 'An official photo document verifying who you are. When flying internationally, your passport is your essential ID.',
    exampleSentences: [
      'I’d like to book a flight to New Jersey for tomorrow. — Certainly, can I see your ID please?',
      'Keep your ID and boarding pass in an easily accessible pocket throughout the airport.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Blue passport identification tucked neatly in traveler shirt pocket',
    audioAnnouncementText: 'Please have your photo identification and boarding pass ready for airport security inspection.',
    pronunciationIpa: '/aɪˌden.tɪ.fɪˈkeɪ.ʃən/'
  },
  {
    id: 'carry-on-luggage',
    term: 'Carry on (luggage)',
    partOfSpeech: 'N',
    category: 'Airport Check-In',
    definition: 'The small piece of hand luggage or cabin bag allowed onto the airplane with you, usually weighing under 8kg or fitting the overhead bin.',
    exampleSentences: [
      'I’m sorry, but your carry on is too heavy. We will have to put it under the plane with the rest of the luggage.',
      'Check your airline guidelines: carry on bags must fit under the seat in front of you or in the overhead locker.'
    ],
    tip: 'Grammar Alert: "Luggage" and "baggage" are uncountable! Say "two pieces of carry-on luggage", NOT "two carry-on luggages".',
    imageUrl: 'https://images.unsplash.com/photo-1553531384-411a247ccd73?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Traveler walking with rolling carry-on suitcase and messenger bag',
    audioAnnouncementText: 'Passengers are reminded that carry-on luggage is limited to one bag and one personal item.',
    pronunciationIpa: '/ˈkær.i.ɒn ˈlʌɡ.ɪdʒ/'
  },
  {
    id: 'oversized-baggage',
    term: 'Oversized / Overweight baggage',
    partOfSpeech: 'N',
    category: 'Airport Check-In',
    definition: 'Baggage that exceeds standard airline dimensions or weight limits (typically over 20–23kg), requiring an excess baggage fee.',
    exampleSentences: [
      'I’m sorry madam, but your bag is overweight. — By how many kilos? — Two. — One minute, let me just take a few things out.',
      'Surfboards, skis, and large musical instruments are handled at the oversized baggage counter.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1588625500568-89c02604081c?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Heavy luggage on airport baggage weighing scale',
    audioAnnouncementText: 'Checked baggage exceeding 23 kilos is subject to overweight baggage surcharges.',
    pronunciationIpa: '/ˌəʊ.vəˈsaɪzd ˈbæɡ.ɪdʒ/'
  },

  // STAGE 3: Security & Gates
  {
    id: 'liquids',
    term: 'Liquids',
    partOfSpeech: 'N',
    category: 'Security & Gates',
    definition: 'Substances with watery or gel bases (water, perfume, lotions, deodorants). Airport security limits each container to maximum 100ml inside a clear plastic bag.',
    exampleSentences: [
      'Are you travelling with any liquids? — Yes, I have this deodorant. — I’m sorry, but that is too big. Each container must not exceed 100ml.',
      'Empty water bottles are permitted through security, but full bottles must be emptied before screening.'
    ],
    tip: 'Rule of thumb: Anything you can pour, smear, or spray is considered a liquid by airport security officers!',
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Travel toiletries and clear plastic bag containers at airport security',
    audioAnnouncementText: 'Security announcement: All liquids, aerosols, and gels over 100 milliliters must be surrendered.',
    pronunciationIpa: '/ˈlɪk.wɪdz/'
  },
  {
    id: 'fragile',
    term: 'Fragile',
    partOfSpeech: 'Adj',
    category: 'Security & Gates',
    definition: 'Delicate, easily broken items marked with special stickers so baggage handlers treat the suitcase with extra care.',
    exampleSentences: [
      'Sometimes we carry things that are delicate or easily broken when we travel. A way of letting the baggage handlers know is to mark it with a sticker saying fragile.',
      'Please handle this box carefully; there are crystal glasses inside, it is extremely fragile.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1588625500568-89c02604081c?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Suitcase with bright red fragile sticker tag',
    audioAnnouncementText: 'Baggage handling notice: Items marked fragile must be loaded manually into cargo hold section 2.',
    pronunciationIpa: '/ˈfrædʒ.aɪl/'
  },
  {
    id: 'gate',
    term: 'Gate',
    partOfSpeech: 'N',
    category: 'Security & Gates',
    definition: 'The specific numbered doorway or access point in the departures concourse that leads onto your airplane.',
    exampleSentences: [
      'Can you tell me where flight AZ672 to New York departs from, please? — Yes, it leaves from gate A27.',
      'Gate B15 has just opened for boarding. Please have your boarding cards in hand.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1473862170180-84427c485aca?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Illuminated yellow Gate B15 sign in wide airport terminal corridor',
    audioAnnouncementText: 'This is a gate change announcement for flight AZ672. The new boarding gate is A27.',
    pronunciationIpa: '/ɡeɪt/'
  },
  {
    id: 'boarding-pass',
    term: 'Boarding pass',
    partOfSpeech: 'N',
    category: 'Security & Gates',
    definition: 'The official ticket card or mobile document given after check-in indicating your flight number, gate, boarding time, and seat number.',
    exampleSentences: [
      'Sir, this is your boarding pass. You will be boarding at gate 22 at 6.35.',
      'After you have notified the airline you are at the airport and checked your luggage, you will be given a boarding pass.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Two first class boarding passes showing gate 7 and seat 25b',
    audioAnnouncementText: 'Please have your boarding pass and passport open to the photo page ready for gate scanning.',
    pronunciationIpa: '/ˈbɔː.dɪŋ ˌpɑːs/'
  },
  {
    id: 'boarding-time',
    term: 'Boarding time',
    partOfSpeech: 'N',
    category: 'Security & Gates',
    definition: 'The exact scheduled time when passengers are permitted to enter and take their seats on the aircraft.',
    exampleSentences: [
      'Boarding will begin in approximately 5 minutes. We ask all families with young children to move to the front of the line.',
      'Check your boarding time, not your departure time! Gates usually close 15 to 20 minutes before takeoff.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Digital airport board displaying flight boarding times and countdowns',
    audioAnnouncementText: 'Final boarding call for flight 2216. Boarding time has expired and gate doors are closing.',
    pronunciationIpa: '/ˈbɔː.dɪŋ ˌtaɪm/'
  },

  // STAGE 4: In-Flight & Classes
  {
    id: 'board-plane',
    term: 'Board (a plane)',
    partOfSpeech: 'V',
    category: 'In-Flight & Classes',
    definition: 'To physically get on or enter the airplane.',
    exampleSentences: [
      'All passengers on Belle Air flight 2216 must go to the gate. The plane will begin boarding in 10 minutes.',
      'We will board the plane using the airstairs on the tarmac today.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Passengers climbing stairs to board an airplane parked on the tarmac',
    audioAnnouncementText: 'Belle Air flight 2216 is now boarding at Gate 12. Row 20 to 35 please board now.',
    pronunciationIpa: '/bɔːd/'
  },
  {
    id: 'economy-class',
    term: 'Economy class',
    partOfSpeech: 'N',
    category: 'In-Flight & Classes',
    definition: 'The standard seating cabin on an aircraft offering the lowest ticket price, where the majority of passengers sit.',
    exampleSentences: [
      'Most people who travel by plane travel in economy class because the price is much cheaper.',
      'I’d like to book an economy class ticket to Rome next Friday.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Rows of blue passenger seats in an airplane economy class cabin',
    audioAnnouncementText: 'Now boarding economy class passengers seated in rows 30 to 45.',
    pronunciationIpa: '/ɪˈkɒn.ə.mi ˌklɑːs/'
  },
  {
    id: 'business-class',
    term: 'Business class',
    partOfSpeech: 'N',
    category: 'In-Flight & Classes',
    definition: 'A premium cabin positioned towards the front of the aircraft offering wider reclining seats, priority service, and extra workspace.',
    exampleSentences: [
      'Business class is the area where people who are traveling for business sit. Tickets are more expensive than normal tickets.',
      'We’d like to invite all our passengers flying in business class to start boarding.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Modern airplane business class suite with personal video screen and privacy divider',
    audioAnnouncementText: 'We invite all our passengers flying in business class to proceed with priority boarding.',
    pronunciationIpa: '/ˈbɪz.nɪs ˌklɑːs/'
  },
  {
    id: 'first-class',
    term: 'First class',
    partOfSpeech: 'N',
    category: 'In-Flight & Classes',
    definition: 'The most luxurious and expensive cabin with lie-flat beds, gourmet dining, maximum legroom, and personalized service.',
    exampleSentences: [
      'Next time I want to fly first class. — Why? It’s so expensive! — I’m just too tall, I have no leg room in economy.',
      'First class passengers enjoy private check-in lounges and five-star in-flight service.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Flight attendant serving fine dining champagne service in luxury first class cabin',
    audioAnnouncementText: 'First class guests are invited to board at their leisure through the priority sky bridge.',
    pronunciationIpa: '/ˈfɜːst ˌklɑːs/'
  },
  {
    id: 'long-haul-flight',
    term: 'Long-haul flight',
    partOfSpeech: 'N',
    category: 'In-Flight & Classes',
    definition: 'A flight that travels a continuous long distance across continents or oceans in one go (e.g. New York to Sydney).',
    exampleSentences: [
      'I really don’t like long-haul flights and wished we had a stopover somewhere, but we need to get back today.',
      'During a 14-hour long-haul flight, it is essential to stay hydrated and walk around the cabin.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Airplane cruising over clouds during a long-haul international journey',
    audioAnnouncementText: 'Good evening passengers, captain speaking. Our non-stop long-haul flight to Sydney will take 14 hours.',
    pronunciationIpa: '/ˈlɒŋ.hɔːl ˌflaɪt/'
  },
  {
    id: 'stopover-layover',
    term: 'Stopover (layover)',
    partOfSpeech: 'N',
    category: 'In-Flight & Classes',
    definition: 'A short or overnight break in another country between flight legs on a long journey.',
    exampleSentences: [
      'If you’re travelling from Europe to Australia, it’s recommended that you have a stopover either in Los Angeles or Dubai.',
      'We had a four-hour layover in Singapore and took a quick tour through the jewel waterfall.'
    ],
    tip: 'Tip: "Layover" usually refers to a short connection of a few hours; "stopover" often denotes a stay of 24 hours or longer.',
    imageUrl: 'https://images.unsplash.com/photo-1473862170180-84427c485aca?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Airport transit concourse where travelers wait during a stopover flight',
    audioAnnouncementText: 'Transit passengers with a Dubai stopover, please follow green signage for connecting gates.',
    pronunciationIpa: '/ˈstɒpˌəʊ.vər/'
  },

  // STAGE 5: Arrivals & Customs
  {
    id: 'arrivals',
    term: 'Arrivals',
    partOfSpeech: 'N',
    category: 'Arrivals & Customs',
    definition: 'The terminal area where landing flights arrive and where friends, family, and chauffeurs wait to welcome passengers.',
    exampleSentences: [
      'When your plane arrives at the airport, your family and friends will meet you at arrivals.',
      'Jane, I’ll meet you in the arrivals lounge. I’ll be holding a sign to tell you I’m looking for you.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Airport arrivals hall where greeters wait with signs for arriving passengers',
    audioAnnouncementText: 'Arriving passengers on Belle Air flight 2216, please proceed down to Level 1 Arrivals.',
    pronunciationIpa: '/əˈraɪ.vəlz/'
  },
  {
    id: 'baggage-carousel',
    term: 'Conveyor belt / carousel / baggage claim',
    partOfSpeech: 'N',
    category: 'Arrivals & Customs',
    definition: 'The circular motorized conveyor belt where checked suitcases circulate for passengers to collect after their flight.',
    exampleSentences: [
      'When your plane arrives, your bags come out on the moving conveyor belt. Another word is carousel or baggage claim.',
      'All passengers arriving from New York can pick up their luggage from carousel 4.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1588625500568-89c02604081c?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Airport baggage claim carousel with luggage circulating around the belt',
    audioAnnouncementText: 'All passengers arriving on flight BA178 from New York, please collect luggage from carousel 4.',
    pronunciationIpa: '/bæɡ.ɪdʒ ˈkær.ə.sel/'
  },
  {
    id: 'customs',
    term: 'Customs',
    partOfSpeech: 'N',
    category: 'Arrivals & Customs',
    definition: 'The border checkpoint where officers inspect travelers and luggage for forbidden items, firearms, drugs, or undeclared goods.',
    exampleSentences: [
      'Before entering the country, you must go through customs where you will be met by a customs officer.',
      'They will ask you if you “have anything to declare?” If you’re carrying nothing forbidden, answer “no”.'
    ],
    dialogue: [
      { speaker: 'Customs Officer', text: 'Good evening. What is the nature of your visit to the country?' },
      { speaker: 'Traveler', text: 'I am here for a two-week holiday with my family.' },
      { speaker: 'Customs Officer', text: 'Do you have any foodstuffs, plants, or currency exceeding ten thousand dollars to declare?' },
      { speaker: 'Traveler', text: 'No officer, nothing to declare.' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Customs and border inspection hall at international airport',
    audioAnnouncementText: 'Customs notification: All arriving passengers must declare agricultural products and cash over limit.',
    pronunciationIpa: '/ˈkʌs.təmz/'
  },
  {
    id: 'delayed',
    term: 'Delayed',
    partOfSpeech: 'Adj',
    category: 'Arrivals & Customs',
    definition: 'Occurring later than planned due to weather conditions, air traffic congestion, or technical issues.',
    exampleSentences: [
      'Ladies and gentlemen, this is an announcement that flight NZ245 has been delayed. Your new departure time is 2.25.',
      'If your flight has been delayed, check the digital screens for updated departure estimates.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Tired traveler resting on red suitcase under flight departures delay board',
    audioAnnouncementText: 'Ladies and gentlemen, flight NZ245 has been delayed. Your new departure time is 2:25.',
    pronunciationIpa: '/dɪˈleɪd/'
  },
  {
    id: 'on-time',
    term: 'On time',
    partOfSpeech: 'Adj',
    category: 'Arrivals & Customs',
    definition: 'Operating punctually according to the published airline schedule without delay.',
    exampleSentences: [
      'When you want to check your flight status, look at the departures board. If it says on time, the plane will depart as scheduled.',
      'We were thrilled that despite the winter snowstorm, our flight to Zurich remained on time.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Departure board showing green ON TIME flight statuses',
    audioAnnouncementText: 'Good news travelers: Flight BA308 to Paris is on time and gate doors will open at 10:15.',
    pronunciationIpa: '/ˌɒn ˈtaɪm/'
  }
];

export const GRAMMAR_TIPS = [
  {
    title: 'Luggage / Baggage vs. Suitcase / Bag',
    badge: 'Countable vs Uncountable',
    content: 'The word "bag" or "suitcase" is countable (e.g., "1 bag, 2 bags, 3 bags"). The words "luggage" and "baggage" are uncountable! You cannot say "two luggages". To make it plural or quantify it, say: "pieces of luggage" or "items of baggage".',
    exampleDialogue: 'Desk: How many pieces of luggage do you want to check in today sir? — Passenger: 2 pieces. Okay, that’s fine.',
    sourceCredit: 'By Diego Danner'
  },
  {
    title: 'Wishing Someone a Safe Journey: "Bon Voyage!"',
    badge: 'Cultural Phrase',
    content: 'If we want to wish someone a good flight or journey in English, we frequently adopt the French phrase "Bon Voyage!" alongside "Safe travels!" and "Have a safe trip!".',
    exampleDialogue: 'Have a wonderful vacation in Italy! Bon Voyage and take lots of cool photos!',
    sourceCredit: 'By Diego Danner'
  }
];

export const AUDIO_SIMULATION_CHALLENGES: AudioSimulationChallenge[] = [
  {
    id: 'sim-1',
    title: 'Belle Air Flight 2216 Boarding Call',
    location: 'Gate A12 Loudspeaker',
    announcementScript: 'All passengers on Belle Air flight 2216 must go to the gate. The plane will begin boarding in 10 minutes. Families with young children please move to the front of the line.',
    speakerType: 'Gate Agent',
    chimeSound: 'airport-chime',
    question: 'According to this announcement, what should families with young children do?',
    options: [
      'Go immediately to carousel 4 for baggage pickup',
      'Move to the front of the line for boarding',
      'Visit the customs officer to declare liquids',
      'Check in their carry-on bags at the main terminal'
    ],
    correctIndex: 1,
    explanation: 'The gate agent specifically requested families with young children to move to the front of the line for priority boarding.',
    relatedTermId: 'board-plane'
  },
  {
    id: 'sim-2',
    title: 'Flight NZ245 Delay Alert',
    location: 'Departures Concourse Main Broadcast',
    announcementScript: 'Ladies and gentlemen, this is an announcement that flight NZ245 has been delayed due to air traffic control. Your new departure time is 2:25.',
    speakerType: 'Gate Agent',
    chimeSound: 'airport-chime',
    question: 'What is the updated status and new departure time of flight NZ245?',
    options: [
      'The flight is cancelled and leaves at 4:30',
      'The flight is on time and leaves at 1:15',
      'The flight is delayed and leaves at 2:25',
      'The flight has arrived at carousel 2'
    ],
    correctIndex: 2,
    explanation: 'The announcer clearly stated that flight NZ245 is delayed and the new departure time is 2:25.',
    relatedTermId: 'delayed'
  },
  {
    id: 'sim-3',
    title: 'Customs Officer Interrogation',
    location: 'Border Control Primary Inspection',
    announcementScript: 'Welcome sir. Please step forward. Do you have anything to declare today, such as alcohol, prohibited items, or currency over ten thousand dollars?',
    speakerType: 'Customs Officer',
    chimeSound: 'ding',
    question: 'If you are carrying standard personal clothes and nothing illegal or over the limits, what must you answer?',
    options: [
      'Answer "Yes, I have two pieces of luggage"',
      'Answer "No, nothing to declare"',
      'Answer "I would like to book a one-way ticket"',
      'Answer "I need an economy class upgrade"'
    ],
    correctIndex: 1,
    explanation: 'As Diego Danner explains: If you are not carrying anything forbidden or over duty limits, you should answer "no" or "nothing to declare".',
    relatedTermId: 'customs'
  },
  {
    id: 'sim-4',
    title: 'New York Baggage Claim Notice',
    location: 'Arrivals Terminal Carousel Area',
    announcementScript: 'Attention passengers arriving from New York on British Airways flight 178: All checked bags are now circulating on carousel 4.',
    speakerType: 'Check-in Desk',
    chimeSound: 'airport-chime',
    question: 'Where should passengers arriving from New York collect their luggage?',
    options: [
      'At Gate A27 in the departures lounge',
      'From carousel 4 on the conveyor belt',
      'From the travel agent in the mall',
      'At the oversized baggage counter on Level 3'
    ],
    correctIndex: 1,
    explanation: 'The announcement informs all passengers arriving from New York that their bags are on carousel 4.',
    relatedTermId: 'baggage-carousel'
  },
  {
    id: 'sim-5',
    title: 'Security Screening Liquids Warning',
    location: 'Terminal 2 Central Security Checkpoint',
    announcementScript: 'Security notice: Please ensure all liquids, lotions, and deodorants are in containers not exceeding 100 milliliters and placed in a clear plastic bag.',
    speakerType: 'Gate Agent',
    chimeSound: 'airport-chime',
    question: 'A traveler has a 150ml bottle of deodorant. What will happen at security?',
    options: [
      'It is allowed because deodorant is not considered liquid',
      'It will be allowed if placed under the plane in the cargo hold as checked luggage, but NOT in carry-on',
      'It will be stamped with a fragile sticker and carried onboard',
      'It can be brought onboard as long as it has a visa'
    ],
    correctIndex: 1,
    explanation: 'In carry-on hand luggage, each liquid container must not exceed 100ml. Larger liquids must be put under the plane in checked baggage or will be confiscated.',
    relatedTermId: 'liquids'
  },
  {
    id: 'sim-6',
    title: 'In-Flight Captain Greeting',
    location: 'Aircraft Cockpit PA System',
    announcementScript: 'Good afternoon ladies and gentlemen, this is your Captain speaking. We have reached our cruising altitude on this long-haul flight to Sydney. We anticipate an on-time arrival.',
    speakerType: 'Captain',
    chimeSound: 'seatbelt',
    question: 'What type of flight is this, and what is its expected status?',
    options: [
      'A short domestic hop that has been delayed',
      'A long-haul flight traveling a long distance, expected on time',
      'A flight requiring an emergency stopover in Albania',
      'A flight boarding only business class passengers'
    ],
    correctIndex: 1,
    explanation: 'The Captain confirms it is a long-haul flight to Sydney and anticipates arriving on time.',
    relatedTermId: 'long-haul-flight'
  }
];

export const LUGGAGE_SCANNER_ITEMS: InspectionItem[] = [
  {
    id: 'item-1',
    name: 'Mineral Water Bottle (500ml)',
    description: 'Full bottle of spring water inside carry-on backpack.',
    category: 'Liquid',
    details: 'Volume: 500ml (Exceeds 100ml security threshold).',
    correctAction: 'confiscate_liquid',
    explanation: 'Containers with watery bases in hand luggage must not exceed 100ml. A 500ml water bottle must be finished or disposed before security.',
    iconName: 'Droplets'
  },
  {
    id: 'item-2',
    name: 'Suitcase Weighed at Check-in (24kg)',
    description: 'Large hard-shell suitcase on the check-in scale. Airline allowance limit is 20kg.',
    category: 'Luggage',
    details: 'Weight: 24.0 kg (4.0 kg over maximum standard limit).',
    correctAction: 'charge_overweight',
    explanation: 'As Diego notes, suitcases exceeding 20kg are overweight baggage and will incur an extra excess fee unless items are removed.',
    iconName: 'Scale'
  },
  {
    id: 'item-3',
    name: 'Vintage Porcelain Tea Set in Box',
    description: 'Delicate ceramic porcelain cups packed inside passenger luggage.',
    category: 'Fragile Item',
    details: 'Delicate / easily broken glass/ceramic contents.',
    correctAction: 'tag_fragile',
    explanation: 'Delicate or easily broken items should be marked with a "Fragile" sticker so handlers treat the luggage with special care.',
    iconName: 'AlertTriangle'
  },
  {
    id: 'item-4',
    name: 'Pocket Perfume Spray (50ml in Zip Bag)',
    description: 'Small eau de parfum in original container inside clear quart bag.',
    category: 'Liquid',
    details: 'Volume: 50ml (Under 100ml limit).',
    correctAction: 'allow',
    explanation: 'Allowed! The container is under 100ml and placed in a clear plastic bag.',
    iconName: 'CheckCircle'
  },
  {
    id: 'item-5',
    name: 'Cash Envelope Containing $15,000 USD',
    description: 'Large sum of cash arriving through international border checkpoint.',
    category: 'Document',
    details: 'Amount: $15,000 USD (Exceeds typical $10,000 undeclared threshold).',
    correctAction: 'customs_declaration',
    explanation: 'Customs officers ask travelers to declare cash amounts over the legal threshold (typically $10,000). You must answer "Yes, I have currency to declare".',
    iconName: 'ShieldAlert'
  },
  {
    id: 'item-6',
    name: 'Cabin Trolley Bag (weighing 6.5kg)',
    description: 'Small wheeled bag measuring 55x35x20cm presented at gate.',
    category: 'Luggage',
    details: 'Weight: 6.5 kg (Within 8kg carry-on limit).',
    correctAction: 'allow',
    explanation: 'Approved! Fits within airline carry-on dimensions and weighs less than 8kg.',
    iconName: 'Luggage'
  }
];

export const INITIAL_LEADERBOARD = [
  {
    id: 'comp-1',
    rank: 1,
    callsign: 'Captain_Amelia',
    country: 'United Kingdom',
    flag: '🇬🇧',
    avatar: '👩‍✈️',
    tier: 'Diamond Captain' as const,
    xp: 2850,
    badgesCount: 8
  },
  {
    id: 'comp-2',
    rank: 2,
    callsign: 'SkylineKenji',
    country: 'Japan',
    flag: '🇯🇵',
    avatar: '👨‍✈️',
    tier: 'Diamond Captain' as const,
    xp: 2620,
    badgesCount: 7
  },
  {
    id: 'comp-3',
    rank: 3,
    callsign: 'Elena_Iberia',
    country: 'Spain',
    flag: '🇪🇸',
    avatar: '👩‍💼',
    tier: 'Gold Aviator' as const,
    xp: 2410,
    badgesCount: 6
  },
  {
    id: 'comp-4',
    rank: 4,
    callsign: 'MateoSaoPaulo',
    country: 'Brazil',
    flag: '🇧🇷',
    avatar: '🧑‍💻',
    tier: 'Gold Aviator' as const,
    xp: 2190,
    badgesCount: 5
  },
  {
    id: 'comp-5',
    rank: 5,
    callsign: 'Sophie_Paris',
    country: 'France',
    flag: '🇫🇷',
    avatar: '👩‍🎨',
    tier: 'Gold Aviator' as const,
    xp: 1950,
    badgesCount: 5
  },
  {
    id: 'comp-6',
    rank: 6,
    callsign: 'AeroLiam',
    country: 'Australia',
    flag: '🇦🇺',
    avatar: '🏄‍♂️',
    tier: 'Silver Sky' as const,
    xp: 1720,
    badgesCount: 4
  },
  {
    id: 'comp-7',
    rank: 7,
    callsign: 'Lukas_Berlin',
    country: 'Germany',
    flag: '🇩🇪',
    avatar: '🧑‍🔬',
    tier: 'Silver Sky' as const,
    xp: 1480,
    badgesCount: 4
  },
  {
    id: 'comp-8',
    rank: 8,
    callsign: 'Hana_Seoul',
    country: 'South Korea',
    flag: '🇰🇷',
    avatar: '👩‍🎤',
    tier: 'Silver Sky' as const,
    xp: 1250,
    badgesCount: 3
  },
  {
    id: 'comp-9',
    rank: 9,
    callsign: 'Marco_Roma',
    country: 'Italy',
    flag: '🇮🇹',
    avatar: '👨‍🍳',
    tier: 'Bronze Passenger' as const,
    xp: 980,
    badgesCount: 3
  },
  {
    id: 'comp-10',
    rank: 10,
    callsign: 'Nadia_Dubai',
    country: 'UAE',
    flag: '🇦🇪',
    avatar: '👩‍🚀',
    tier: 'Bronze Passenger' as const,
    xp: 750,
    badgesCount: 2
  }
];

export const BADGES_CATALOG = [
  {
    id: 'first-flight',
    title: 'First Flight',
    description: 'Completed your first airport lesson',
    icon: 'Plane'
  },
  {
    id: 'sound-detective',
    title: 'Audio Specialist',
    description: 'Completed a real-world PA airport announcement challenge',
    icon: 'Headphones'
  },
  {
    id: 'customs-pro',
    title: 'Border Clearance',
    description: 'Passed customs inspection with nothing to declare',
    icon: 'ShieldCheck'
  },
  {
    id: 'scanner-ace',
    title: 'Security Marshal',
    description: 'Solved all items in the Luggage Scanner checkpoint',
    icon: 'ScanLine'
  },
  {
    id: 'grammar-jet',
    title: 'Countable Master',
    description: 'Mastered the difference between bags and pieces of luggage',
    icon: 'BookOpen'
  },
  {
    id: 'speed-flyer',
    title: 'Speed Flyer',
    description: 'Scored over 500 points in Speed Challenge',
    icon: 'Zap'
  },
  {
    id: 'top-gun',
    title: 'Diamond Captain',
    description: 'Reached top 3 on the global competitive leaderboard',
    icon: 'Award'
  }
];
