export interface Category {
  id: string;
  name: string;
  icon: string;
  words: string[];
  description: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'months-days',
    name: 'Months & Days',
    icon: '📅',
    description: 'Say all the months of the year and days of the week!',
    words: [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december',
      'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
    ]
  },
  {
    id: 'colors',
    name: 'Colors',
    icon: '🎨',
    description: 'How many colors can you name in 20 seconds?',
    words: [
      'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white', 'gray', 'brown', 'silver', 'gold', 'violet', 'indigo', 'cyan', 'magenta', 'beige', 'turquoise', 'maroon', 'navy', 'teal', 'olive', 'lime', 'coral', 'peach', 'lavender', 'crimson'
    ]
  },
  {
    id: 'animals',
    name: 'Animals',
    icon: '🦁',
    description: 'Name as many animals as you can!',
    words: [
      'dog', 'cat', 'lion', 'tiger', 'elephant', 'giraffe', 'zebra', 'monkey', 'gorilla', 'bear', 'wolf', 'fox', 'rabbit', 'deer', 'horse', 'cow', 'pig', 'sheep', 'goat', 'chicken', 'duck', 'goose', 'turkey', 'penguin', 'eagle', 'owl', 'parrot', 'shark', 'whale', 'dolphin', 'octopus', 'crab', 'lobster', 'snake', 'lizard', 'frog', 'turtle', 'bee', 'butterfly', 'ant', 'spider', 'kangaroo', 'panda', 'koala', 'hippo', 'rhino', 'camel', 'bat', 'mouse', 'rat', 'hamster', 'squirrel'
    ]
  },
  {
    id: 'food',
    name: 'Food',
    icon: '🍕',
    description: 'Hungry? Name some delicious food items!',
    words: [
      'pizza', 'burger', 'hamburger', 'pasta', 'sushi', 'taco', 'salad', 'soup', 'steak', 'chicken', 'fish', 'rice', 'bread', 'cheese', 'egg', 'apple', 'banana', 'orange', 'strawberry', 'grape', 'watermelon', 'pineapple', 'mango', 'potato', 'tomato', 'carrot', 'broccoli', 'onion', 'garlic', 'chocolate', 'cake', 'cookie', 'ice cream', 'sandwich', 'hot dog', 'pancake', 'waffle', 'donut', 'muffin', 'yogurt', 'milk', 'juice', 'coffee', 'tea'
    ]
  },
  {
    id: 'body-parts',
    name: 'Body Parts',
    icon: '💪',
    description: 'From head to toe, how many can you name?',
    words: [
      'head', 'hair', 'face', 'eye', 'ear', 'nose', 'mouth', 'tooth', 'tongue', 'neck', 'shoulder', 'arm', 'elbow', 'wrist', 'hand', 'finger', 'thumb', 'chest', 'back', 'stomach', 'waist', 'hip', 'leg', 'knee', 'ankle', 'foot', 'toe', 'heart', 'lung', 'brain', 'bone', 'muscle', 'skin', 'blood', 'liver', 'kidney'
    ]
  },
  {
    id: 'medical-symptoms',
    name: 'Medical Symptoms',
    icon: '🤒',
    description: 'Advanced: Name common medical symptoms or feelings.',
    words: [
      'headache', 'fever', 'cough', 'sore throat', 'runny nose', 'nausea', 'vomiting', 'dizziness', 'fatigue', 'pain', 'rash', 'itching', 'swelling', 'bleeding', 'sneezing', 'chills', 'shortness of breath', 'chest pain', 'backache', 'stomach ache', 'diarrhea', 'constipation', 'insomnia', 'anxiety', 'depression', 'cramp', 'numbness', 'weakness'
    ]
  },
  {
    id: 'clothes-accessories',
    name: 'Clothes & Accessories',
    icon: '👕',
    description: 'Style check! Name as many clothing items and accessories as you can.',
    words: [
      'shirt', 'pants', 'dress', 'shoes', 'hat', 'jacket', 'socks', 'glasses', 't-shirt', 'sweater', 'coat', 'skirt', 'shorts', 'boots', 'sneakers', 'belt', 'tie', 'scarf', 'gloves', 'watch', 'necklace', 'ring', 'earrings', 'suit', 'raincoat', 'pajamas'
    ]
  },
  {
    id: 'professions-jobs',
    name: 'Professions & Jobs',
    icon: '👨‍🏫',
    description: 'What do you do? Name different jobs, careers, and professions.',
    words: [
      'doctor', 'teacher', 'engineer', 'chef', 'nurse', 'driver', 'pilot', 'artist', 'lawyer', 'police officer', 'firefighter', 'mechanic', 'architect', 'dentist', 'actor', 'actress', 'waiter', 'waitress', 'scientist', 'programmer', 'writer', 'musician', 'accountant', 'photographer', 'electrician', 'carpenter'
    ]
  },
  {
    id: 'house-furniture',
    name: 'House & Furniture',
    icon: '🏠',
    description: 'Name rooms, furniture, and objects found around the house.',
    words: [
      'bed', 'table', 'chair', 'window', 'door', 'sofa', 'kitchen', 'bathroom', 'wardrobe', 'desk', 'mirror', 'rug', 'lamp', 'television', 'fridge', 'stove', 'oven', 'microwave', 'sink', 'shower', 'armchair', 'bookshelf', 'pillow', 'blanket', 'curtains', 'garden', 'garage'
    ]
  }
];
