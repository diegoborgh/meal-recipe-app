// Recipe data — small fixture used across all mock screens.
// Images are Unsplash photo IDs — pulled via images.unsplash.com w/ size params.
// Titles and metadata are realistic-but-fictional (no real Spoonacular data).

const u = (id, w = 800, h = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&crop=entropy&auto=format&q=80`;

window.SkilletRecipes = [
  {
    id: 'r1', title: 'Sheet-pan harissa salmon with chickpeas',
    time: '25 min', calories: '420 kcal', servings: 4,
    img: u('1467003909585-2f8a72700288'), // salmon
    badges: [{ label: 'Pescatarian', tone: 'rose' }, { label: 'GF', tone: 'olive' }],
  },
  {
    id: 'r2', title: 'Lemony orzo with chickpeas & dill',
    time: '20 min', calories: '380 kcal', servings: 2,
    img: u('1473093295043-cdd812d0e601'), // pasta
    badges: [{ label: 'Vegetarian', tone: 'olive' }, { label: 'High-protein', tone: 'honey' }],
  },
  {
    id: 'r3', title: 'Charred broccoli pasta with garlic breadcrumbs',
    time: '30 min', calories: '510 kcal', servings: 4,
    img: u('1551183053-bf91a1d81141'), // pasta broccoli
    badges: [{ label: 'Vegetarian', tone: 'olive' }],
  },
  {
    id: 'r4', title: 'Coconut chickpea curry with spinach',
    time: '35 min', calories: '460 kcal', servings: 4,
    img: u('1565557623262-b51c2513a641'), // curry
    badges: [{ label: 'Vegan', tone: 'olive' }, { label: 'GF', tone: 'cream' }],
  },
  {
    id: 'r5', title: 'Miso-glazed eggplant with jasmine rice',
    time: '40 min', calories: '480 kcal', servings: 2,
    img: u('1546069901-ba9599a7e63c'), // eggplant
    badges: [{ label: 'Vegan', tone: 'olive' }],
  },
  {
    id: 'r6', title: 'Roasted carrots with whipped feta & honey',
    time: '35 min', calories: '320 kcal', servings: 4,
    img: u('1574484284002-952d92456975'), // carrots
    badges: [{ label: 'Vegetarian', tone: 'olive' }, { label: 'GF', tone: 'cream' }],
  },
  {
    id: 'r7', title: 'Smashed cucumber salad with sesame & soy',
    time: '15 min', calories: '180 kcal', servings: 2,
    img: u('1540420773420-3366772f4999'), // cucumber
    badges: [{ label: 'Vegan', tone: 'olive' }, { label: 'Quick', tone: 'honey' }],
  },
  {
    id: 'r8', title: 'Crispy chickpea & avocado tacos',
    time: '25 min', calories: '440 kcal', servings: 3,
    img: u('1565299585323-38d6b0865b47'), // tacos
    badges: [{ label: 'Vegan', tone: 'olive' }],
  },
];

// Detail recipe — used on the recipe detail and cook mode screens
window.SkilletDetailRecipe = {
  id: 'r1',
  title: 'Sheet-pan harissa salmon with chickpeas',
  attribution: 'Adapted from Spoonacular',
  time: '25 min',
  servings: 4,
  calories: 420,
  protein: 32,
  carbs: 28,
  fat: 18,
  img: u('1467003909585-2f8a72700288', 1200, 800),
  badges: [{ label: 'Pescatarian', tone: 'rose' }, { label: 'Gluten-free', tone: 'olive' }, { label: 'High-protein', tone: 'honey' }],
  ingredients: [
    { name: 'Salmon fillets', amount: '4', unit: 'fillets', have: true },
    { name: 'Chickpeas, drained', amount: '1', unit: 'can (15 oz)', have: true },
    { name: 'Cherry tomatoes', amount: '2', unit: 'cups', have: true },
    { name: 'Harissa paste', amount: '3', unit: 'tbsp' },
    { name: 'Olive oil', amount: '3', unit: 'tbsp', have: true },
    { name: 'Lemon', amount: '1', unit: 'whole', have: true },
    { name: 'Garlic cloves', amount: '4', unit: 'cloves', have: true },
    { name: 'Fresh parsley', amount: '½', unit: 'cup' },
    { name: 'Sea salt', amount: '1', unit: 'tsp', have: true },
    { name: 'Black pepper', amount: '½', unit: 'tsp', have: true },
  ],
  steps: [
    'Heat oven to 425°F (220°C). Pat the salmon dry with paper towels and place on a parchment-lined sheet pan.',
    'Toss chickpeas and cherry tomatoes with 2 tbsp olive oil, minced garlic, salt and pepper. Spread around the salmon.',
    'Whisk harissa, remaining olive oil, and the juice of half the lemon. Brush generously over the salmon fillets.',
    'Roast for 12–15 minutes, until salmon flakes easily and tomatoes have burst.',
    'Squeeze the remaining lemon over the pan, scatter parsley on top, and serve immediately.',
  ],
};

// User's fridge ingredients — for the fridge mode screen
window.SkilletFridge = ['Eggs', 'Spinach', 'Garlic', 'Cherry tomatoes', 'Lemon', 'Pasta'];

// Saved recipes — for the favorites screen
window.SkilletSaved = ['r1', 'r3', 'r6', 'r2', 'r7'];
