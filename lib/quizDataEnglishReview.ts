export type QuestionData = {
  id: string;
  type: 'multiple-choice';
  topic: string;
  instruction: string;
  sentence: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  example: string;
};

export const quizData: QuestionData[] = [
  {
    id: "q1",
    type: "multiple-choice",
    topic: "Articles",
    instruction: "Choose the correct article.",
    sentence: "This is ___ book.",
    options: ["a", "an", "the", "no article"],
    correctAnswer: "a",
    explanation: "Use 'a' antes de palavras que começam com som de consoante.",
    example: "I have a pen."
  },
  {
    id: "q2",
    type: "multiple-choice",
    topic: "Articles",
    instruction: "Choose the correct article.",
    sentence: "This is ___ English book.",
    options: ["an", "a", "the", "no article"],
    correctAnswer: "an",
    explanation: "Use 'an' antes de palavras que começam com som de vogal.",
    example: "She has an apple."
  },
  {
    id: "q3",
    type: "multiple-choice",
    topic: "Articles",
    instruction: "Choose the correct article.",
    sentence: "This is ___ eraser.",
    options: ["an", "a", "the", "no article"],
    correctAnswer: "an",
    explanation: "Use 'an' antes de palavras que começam com som de vogal (e em eraser).",
    example: "I need an eraser."
  },
  {
    id: "q4",
    type: "multiple-choice",
    topic: "Articles",
    instruction: "Choose the correct article.",
    sentence: "This is ___ notebook.",
    options: ["a", "an", "the", "no article"],
    correctAnswer: "a",
    explanation: "Use 'a' antes de palavras que começam com som de consoante (n em notebook).",
    example: "He has a new notebook."
  },
  {
    id: "q5",
    type: "multiple-choice",
    topic: "Articles",
    instruction: "Choose the correct article.",
    sentence: "This is ___ pen.",
    options: ["a", "an", "the", "no article"],
    correctAnswer: "a",
    explanation: "Use 'a' antes de palavras que começam com som de consoante (p em pen).",
    example: "Can I borrow a pen?"
  },
  {
    id: "q6",
    type: "multiple-choice",
    topic: "Articles",
    instruction: "Choose the correct article.",
    sentence: "This is ___ clock.",
    options: ["a", "an", "the", "no article"],
    correctAnswer: "a",
    explanation: "Use 'a' antes de palavras que começam com som de consoante (c em clock).",
    example: "There is a clock on the wall."
  },
  {
    id: "q7",
    type: "multiple-choice",
    topic: "Prepositions",
    instruction: "Select the correct preposition.",
    sentence: "The books are ___ the backpack.",
    options: ["in", "on", "under", "behind"],
    correctAnswer: "in",
    explanation: "'In' indica que algo está dentro de um recipiente.",
    example: "My phone is in my pocket."
  },
  {
    id: "q8",
    type: "multiple-choice",
    topic: "Prepositions",
    instruction: "Select the correct preposition.",
    sentence: "The flash drives are ___ the laptop.",
    options: ["next to", "in", "under", "behind"],
    correctAnswer: "next to",
    explanation: "'Next to' significa logo ao lado de algo.",
    example: "The mouse is next to the keyboard."
  },
  {
    id: "q9",
    type: "multiple-choice",
    topic: "Prepositions",
    instruction: "Select the correct preposition.",
    sentence: "The newspaper is ___ the tablet.",
    options: ["on", "in", "under", "behind"],
    correctAnswer: "on",
    explanation: "'On' significa localizado em cima de algo (na superfície).",
    example: "The keys are on the table."
  },
  {
    id: "q10",
    type: "multiple-choice",
    topic: "Prepositions",
    instruction: "Select the correct preposition.",
    sentence: "The chair is ___ the desk.",
    options: ["behind", "in front of", "on", "next to"],
    correctAnswer: "behind",
    explanation: "'Behind' significa atrás de algo.",
    example: "The dog is hiding behind the couch."
  },
  {
    id: "q11",
    type: "multiple-choice",
    topic: "Prepositions",
    instruction: "Select the correct preposition.",
    sentence: "The wallet is ___ the notebook.",
    options: ["on", "in", "under", "behind"],
    correctAnswer: "on",
    explanation: "Está repousando sobre a superfície do caderno, então usamos 'on'.",
    example: "The cup is on the desk."
  },
  {
    id: "q12",
    type: "multiple-choice",
    topic: "Prepositions",
    instruction: "Select the correct preposition.",
    sentence: "The glasses are ___ the TV.",
    options: ["in front of", "behind", "in", "on"],
    correctAnswer: "in front of",
    explanation: "'In front of' significa localizado à frente de algo.",
    example: "She stood in front of the mirror."
  },
  {
    id: "q13",
    type: "multiple-choice",
    topic: "Yes/No Questions with Be",
    instruction: "Type the correct form of the verb 'be'.",
    sentence: "A: ___ this your cell phone?\nB: No, it's not.",
    options: ["Is", "Are", "Am", "Be"],
    correctAnswer: "Is",
    explanation: "Use 'Is' para objetos no singular ao fazer uma pergunta.",
    example: "Is he your brother?"
  },
  {
    id: "q14",
    type: "multiple-choice",
    topic: "Yes/No Questions with Be",
    instruction: "Type the correct form of the verb 'be'.",
    sentence: "A: ___ these your car keys?\nB: Yes, they are.",
    options: ["Are", "Is", "Am", "Do"],
    correctAnswer: "Are",
    explanation: "Use 'Are' para objetos no plural.",
    example: "Are these your shoes?"
  },
  {
    id: "q15",
    type: "multiple-choice",
    topic: "Yes/No Questions with Be",
    instruction: "Type the correct form of the verb 'be'.",
    sentence: "A: Where are my glasses?\nB: Are these your glasses?\nA: No, they're not. Look! ___ they in your pocket?",
    options: ["Are", "Is", "Am", "Do"],
    correctAnswer: "Are",
    explanation: "'They' é um pronome plural, então usamos 'are'.",
    example: "Are they at home?"
  },
  {
    id: "q16",
    type: "multiple-choice",
    topic: "Yes/No Questions with Be",
    instruction: "Choose the correct response.",
    sentence: "A: Where are your headphones?\nB: ___ on the table.",
    options: ["They're", "It's", "There", "Their"],
    correctAnswer: "They're",
    explanation: "'They're' é a contração de 'they are', usado para objetos no plural.",
    example: "Where are the books? They're on the desk."
  },
  {
    id: "q17",
    type: "multiple-choice",
    topic: "Yes/No Questions with Be",
    instruction: "Choose the correct response.",
    sentence: "A: Is this my umbrella?\nB: No, ___ not. It's my umbrella.",
    options: ["it's", "they're", "is", "are"],
    correctAnswer: "it's",
    explanation: "'It's' é a contração de 'it is', usado para objetos no singular.",
    example: "Is this your car? No, it's not."
  },
  {
    id: "q18",
    type: "multiple-choice",
    topic: "Possessive Adjectives",
    instruction: "Choose the correct possessive adjective.",
    sentence: "A: Hello. What's ___ name?\nB: Hi. My name is Carlos.",
    options: ["your", "my", "his", "her"],
    correctAnswer: "your",
    explanation: "Usamos 'your' para perguntar sobre algo pertencente à pessoa com quem estamos falando.",
    example: "Is this your bag?"
  },
  {
    id: "q19",
    type: "multiple-choice",
    topic: "Possessive Adjectives",
    instruction: "Choose the correct possessive adjective.",
    sentence: "A: What's ___ name?\nB: His name is Ethan.",
    options: ["his", "her", "your", "my"],
    correctAnswer: "his",
    explanation: "'His' é usado para indicar posse para o gênero masculino.",
    example: "His jacket is blue."
  },
  {
    id: "q20",
    type: "multiple-choice",
    topic: "Possessive Adjectives",
    instruction: "Choose the correct possessive adjective.",
    sentence: "A: And what's ___ name?\nB: Her name is Caroline.",
    options: ["her", "his", "your", "my"],
    correctAnswer: "her",
    explanation: "'Her' é usado para indicar posse para o gênero feminino.",
    example: "Her dress is pretty."
  },
  {
    id: "q21",
    type: "multiple-choice",
    topic: "Possessive Adjectives",
    instruction: "Choose the correct possessive adjective.",
    sentence: "A: What's ___ name?\nB: My name is Akina.",
    options: ["your", "my", "his", "her"],
    correctAnswer: "your",
    explanation: "Você pergunta 'your name' ao falar diretamente com alguém.",
    example: "What is your phone number?"
  },
  {
    id: "q22",
    type: "multiple-choice",
    topic: "Possessive Adjectives",
    instruction: "Choose the correct possessive adjective.",
    sentence: "A: Is this ___ pen, Akiko?\nB: No, it's not.",
    options: ["your", "my", "his", "her"],
    correctAnswer: "your",
    explanation: "Ao perguntar diretamente a Akiko sobre uma caneta que ela possa ter, use 'your'.",
    example: "Is this your coat?"
  },
  {
    id: "q23",
    type: "multiple-choice",
    topic: "This / These",
    instruction: "Choose the correct response.",
    sentence: "A: What are these?\nB: ___ flash drives.",
    options: ["They're", "It's", "These", "This"],
    correctAnswer: "They're",
    explanation: "Use 'They're' para responder o que são objetos no plural.",
    example: "What are these? They're shoes."
  },
  {
    id: "q24",
    type: "multiple-choice",
    topic: "This / These",
    instruction: "Choose the correct response.",
    sentence: "A: What's this?\nB: ___ a laptop.",
    options: ["It's", "They're", "This", "These"],
    correctAnswer: "It's",
    explanation: "Use 'It's' para responder o que é um objeto no singular.",
    example: "What's this? It's a phone."
  },
  {
    id: "q25",
    type: "multiple-choice",
    topic: "This / These",
    instruction: "Choose the correct response.",
    sentence: "A: What are these?\nB: ___ backpacks.",
    options: ["They're", "It's", "This is", "That is"],
    correctAnswer: "They're",
    explanation: "'Backpacks' é plural, então respondemos com 'They're'.",
    example: "What are these? They're my keys."
  },
  {
    id: "q26",
    type: "multiple-choice",
    topic: "This / These",
    instruction: "Choose the correct response.",
    sentence: "A: What is this?\nB: ___ an umbrella.",
    options: ["It's", "They're", "These are", "Those are"],
    correctAnswer: "It's",
    explanation: "'An umbrella' é singular, então respondemos com 'It's'.",
    example: "What's this? It's a jacket."
  },
  {
    id: "q27",
    type: "multiple-choice",
    topic: "This / These",
    instruction: "Choose the correct response.",
    sentence: "A: What are these?\nB: ___ sunglasses.",
    options: ["They're", "It's", "This is", "That is"],
    correctAnswer: "They're",
    explanation: "'Sunglasses' é plural, então usamos 'They're'.",
    example: "What are these? They're glasses."
  },
  {
    id: "q28",
    type: "multiple-choice",
    topic: "The Verb Be",
    instruction: "Complete the conversation.",
    sentence: "Ben: Hello, Christy. How ___ you?",
    options: ["are", "is", "am", "be"],
    correctAnswer: "are",
    explanation: "Usamos 'are' com o pronome 'you'.",
    example: "Where are you from?"
  },
  {
    id: "q29",
    type: "multiple-choice",
    topic: "The Verb Be",
    instruction: "Complete the conversation.",
    sentence: "Christy: I'm fine, thanks. I'm sorry - what's ___ name again?",
    options: ["your", "my", "his", "her"],
    correctAnswer: "your",
    explanation: "Ela está perguntando o nome da pessoa com quem está falando.",
    example: "What's your last name?"
  },
  {
    id: "q30",
    type: "multiple-choice",
    topic: "The Verb Be",
    instruction: "Choose the correct subject and verb.",
    sentence: "Ben: ___ Ben - Ben Durant.",
    options: ["It's", "I'm", "He's", "You're"],
    correctAnswer: "It's",
    explanation: "Ao se apresentar ao telefone ou pessoalmente, 'It's [Nome]' é comum. Baseado no livro, usa-se 'It's'.",
    example: "Hi, it's John."
  },
  {
    id: "q31",
    type: "multiple-choice",
    topic: "The Verb Be",
    instruction: "Complete the conversation.",
    sentence: "Christy: That's right! Ben, this ___ Joshua Brown.",
    options: ["is", "am", "are", "be"],
    correctAnswer: "is",
    explanation: "Ao apresentar uma terceira pessoa, dizemos 'this is'.",
    example: "This is my friend, Sarah."
  },
  {
    id: "q32",
    type: "multiple-choice",
    topic: "The Verb Be",
    instruction: "Complete the conversation.",
    sentence: "Joshua: Hi, Ben. I think ___ in my English class, too.",
    options: ["you're", "I'm", "he's", "she's"],
    correctAnswer: "you're",
    explanation: "'You're' é a contração de 'you are', falando diretamente com Ben.",
    example: "I think you're right."
  },
  {
    id: "q33",
    type: "multiple-choice",
    topic: "Negative Statements",
    instruction: "Complete the conversation.",
    sentence: "A: Are Diana and Mario from Ecuador?\nB: No, ___ not. They're from Mexico.",
    options: ["they're", "we're", "you're", "she's"],
    correctAnswer: "they're",
    explanation: "'They' é o pronome plural para Diana e Mario.",
    example: "Are they happy? No, they're not."
  },
  {
    id: "q34",
    type: "multiple-choice",
    topic: "Negative Statements",
    instruction: "Complete the conversation.",
    sentence: "A: ___ you from Mexico, too?\nB: No, I'm not. I'm from Colombia.",
    options: ["Are", "Is", "Am", "Do"],
    correctAnswer: "Are",
    explanation: "Use 'Are' quando o sujeito for 'you'.",
    example: "Are you ready?"
  },
  {
    id: "q35",
    type: "multiple-choice",
    topic: "Negative Statements",
    instruction: "Complete the conversation.",
    sentence: "A: Is Meera from England?\nB: No, ___ not. She's from Australia.",
    options: ["she's", "he's", "it's", "they're"],
    correctAnswer: "she's",
    explanation: "'She's' é a contração de 'she is', usado para um sujeito feminino.",
    example: "Is she a doctor? No, she's not."
  },
  {
    id: "q36",
    type: "multiple-choice",
    topic: "Negative Statements",
    instruction: "Complete the conversation.",
    sentence: "A: Ji-hye, are you and Kwang-ho from South Korea?\nB: Yes, ___ are.",
    options: ["we", "they", "you", "I"],
    correctAnswer: "we",
    explanation: "Use 'we' ao responder por você e por outra pessoa.",
    example: "Are you both tired? Yes, we are."
  },
  {
    id: "q37",
    type: "multiple-choice",
    topic: "Negative Statements",
    instruction: "Complete the conversation.",
    sentence: "A: And are you from Seoul?\nB: No, ___ not. We're from Busan.",
    options: ["we're", "they're", "you're", "I'm"],
    correctAnswer: "we're",
    explanation: "'We're' é a contração de 'we are'.",
    example: "Are you from New York? No, we're not."
  },
  {
    id: "q38",
    type: "multiple-choice",
    topic: "Wh-Questions with Be",
    instruction: "Choose the correct question word.",
    sentence: "A: Look! ___ that?\nB: Oh, she's a new student.",
    options: ["Who's", "What's", "Where's", "How's"],
    correctAnswer: "Who's",
    explanation: "'Who's' pergunta sobre a identidade de uma pessoa.",
    example: "Who's that man?"
  },
  {
    id: "q39",
    type: "multiple-choice",
    topic: "Wh-Questions with Be",
    instruction: "Choose the correct question word.",
    sentence: "A: ___ her name?\nB: I think her name is Yoo-jin.",
    options: ["What's", "Who's", "Where's", "How's"],
    correctAnswer: "What's",
    explanation: "'What's' é usado para pedir informações, como um nome.",
    example: "What's his name?"
  },
  {
    id: "q40",
    type: "multiple-choice",
    topic: "Wh-Questions with Be",
    instruction: "Choose the correct question word.",
    sentence: "A: Yoo-jin? ___ she from?\nB: She's from South Korea.",
    options: ["Where's", "What's", "Who's", "How's"],
    correctAnswer: "Where's",
    explanation: "'Where's' pergunta sobre um lugar ou localização.",
    example: "Where's he from?"
  },
  {
    id: "q41",
    type: "multiple-choice",
    topic: "Wh-Questions with Be",
    instruction: "Choose the correct question word.",
    sentence: "A: Hi, Brittany. ___ are you?\nB: I'm fine, thanks.",
    options: ["How", "What", "Where", "Who"],
    correctAnswer: "How",
    explanation: "'How' é usado para perguntar sobre a condição ou o bem-estar de alguém.",
    example: "How are you doing?"
  },
  {
    id: "q42",
    type: "multiple-choice",
    topic: "Wh-Questions with Be",
    instruction: "Choose the correct question word.",
    sentence: "A: Good morning, Luke. ___ are they?\nB: They're my friends from school.",
    options: ["Who", "What", "Where", "How"],
    correctAnswer: "Who",
    explanation: "'Who' pergunta sobre a identidade de pessoas.",
    example: "Who are those people?"
  },
  {
    id: "q43",
    type: "multiple-choice",
    topic: "Possessives",
    instruction: "Choose the correct possessive pronoun.",
    sentence: "A: This isn't my raincoat. Is it ___?",
    options: ["yours", "your", "mine", "my"],
    correctAnswer: "yours",
    explanation: "Use 'yours' (pronome) no final de uma frase em vez de 'your raincoat'.",
    example: "This book is yours."
  },
  {
    id: "q44",
    type: "multiple-choice",
    topic: "Possessives",
    instruction: "Choose the correct possessive pronoun.",
    sentence: "B: No, it's not ___. Ask Emma. Maybe it's hers.",
    options: ["mine", "my", "yours", "your"],
    correctAnswer: "mine",
    explanation: "'Mine' substitui 'my raincoat' (minha capa de chuva).",
    example: "That jacket is mine."
  },
  {
    id: "q45",
    type: "multiple-choice",
    topic: "Possessives",
    instruction: "Choose the correct possessive adjective.",
    sentence: "A: Hey! These aren't ___ sneakers!",
    options: ["our", "ours", "we", "us"],
    correctAnswer: "our",
    explanation: "Use 'our' (adjetivo) antes do substantivo 'sneakers'.",
    example: "These are our seats."
  },
  {
    id: "q46",
    type: "multiple-choice",
    topic: "Possessives",
    instruction: "Choose the correct possessive pronoun.",
    sentence: "B: You're right. ___ are over there.",
    options: ["Ours", "Our", "We", "Us"],
    correctAnswer: "Ours",
    explanation: "'Ours' (pronome) substitui 'our sneakers' (nossos tênis).",
    example: "Ours is the blue car."
  },
  {
    id: "q47",
    type: "multiple-choice",
    topic: "Possessives",
    instruction: "Choose the correct possessive pronoun.",
    sentence: "A: Are these your gloves, Erin?\nB: No, they're not ___.",
    options: ["mine", "my", "yours", "your"],
    correctAnswer: "mine",
    explanation: "'Mine' substitui 'my gloves' (minhas luvas).",
    example: "These keys aren't mine."
  },
  {
    id: "q48",
    type: "multiple-choice",
    topic: "Present Continuous",
    instruction: "Complete the sentence.",
    sentence: "My name is Dylan Jones. I'm ___ a new gray suit.",
    options: ["wearing", "wear", "wears", "to wear"],
    correctAnswer: "wearing",
    explanation: "Use o presente contínuo (verbo to be + -ing) para ações que estão acontecendo agora.",
    example: "I am wearing a hat."
  },
  {
    id: "q49",
    type: "multiple-choice",
    topic: "Conjunctions",
    instruction: "Choose the correct conjunction.",
    sentence: "It's raining, ___ I'm not wearing a raincoat.",
    options: ["but", "and", "so", "or"],
    correctAnswer: "but",
    explanation: "'But' indica contraste (mas).",
    example: "It's cold, but I'm not wearing a jacket."
  },
  {
    id: "q50",
    type: "multiple-choice",
    topic: "Present Continuous",
    instruction: "Complete the sentence.",
    sentence: "It's very hot and sunny today. Michael ___ light blue shorts.",
    options: ["is wearing", "are wearing", "wearing", "am wearing"],
    correctAnswer: "is wearing",
    explanation: "Use 'is' com o sujeito singular 'Michael', mais o verbo com -ing.",
    example: "She is wearing a red dress."
  },
  {
    id: "q51",
    type: "multiple-choice",
    topic: "Present Continuous",
    instruction: "Complete the sentence.",
    sentence: "Adriana Fuentes is from Mexico. She ___ a pretty yellow dress.",
    options: ["is wearing", "are wearing", "wearing", "wear"],
    correctAnswer: "is wearing",
    explanation: "Use 'is' com 'she' (ela), mais o verbo com -ing.",
    example: "He is wearing sunglasses."
  },
  {
    id: "q52",
    type: "multiple-choice",
    topic: "Conjunctions",
    instruction: "Choose the correct conjunction.",
    sentence: "It's really cold, ___ they're wearing winter clothes.",
    options: ["so", "but", "and", "or"],
    correctAnswer: "so",
    explanation: "'So' introduz um resultado ou consequência (então).",
    example: "I was tired, so I went to bed."
  },
  {
    id: "q53",
    type: "multiple-choice",
    topic: "Present Continuous Questions",
    instruction: "Choose the correct short answer.",
    sentence: "A: Is Dylan wearing a gray suit?\nB: Yes, ___.",
    options: ["he is", "he's", "he wearing", "is he"],
    correctAnswer: "he is",
    explanation: "Respostas curtas afirmativas não usam contrações no final da frase.",
    example: "Is he working? Yes, he is."
  },
  {
    id: "q54",
    type: "multiple-choice",
    topic: "Present Continuous Questions",
    instruction: "Choose the correct short answer.",
    sentence: "A: Is he wearing a raincoat?\nB: No, ___.",
    options: ["he's not", "he isn't wearing", "he don't", "he not"],
    correctAnswer: "he's not",
    explanation: "Respostas curtas negativas podem usar contrações como 'he's not' ou 'he isn't'.",
    example: "Is he eating? No, he's not."
  },
  {
    id: "q55",
    type: "multiple-choice",
    topic: "Present Continuous Questions",
    instruction: "Choose the correct short answer.",
    sentence: "A: Are Hee-sun and Kun-woo wearing swimsuits?\nB: No, ___.",
    options: ["they're not", "they aren't wearing", "they don't", "they not"],
    correctAnswer: "they're not",
    explanation: "'They're not' é a resposta curta negativa correta para 'they'.",
    example: "Are they studying? No, they're not."
  },
  {
    id: "q56",
    type: "multiple-choice",
    topic: "Present Continuous Questions",
    instruction: "Choose the correct short answer.",
    sentence: "A: Are they wearing gloves and hats?\nB: Yes, ___.",
    options: ["they are", "they're", "they wear", "they do"],
    correctAnswer: "they are",
    explanation: "Respostas curtas afirmativas não usam contrações no final.",
    example: "Are they playing? Yes, they are."
  },
  {
    id: "q57",
    type: "multiple-choice",
    topic: "Present Continuous Questions",
    instruction: "Choose the correct short answer.",
    sentence: "A: Is Adriana wearing a skirt?\nB: No, ___.",
    options: ["she's not", "she isn't wearing", "she don't", "she not"],
    correctAnswer: "she's not",
    explanation: "'She's not' é a resposta curta negativa correta para 'she'.",
    example: "Is she watching TV? No, she's not."
  }
];
