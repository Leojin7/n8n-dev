const adjectives = [
  'autumn', 'hidden', 'bitter', 'misty', 'silent', 'empty', 'dry', 'dark',
  'summer', 'icy', 'delicate', 'quiet', 'white', 'cool', 'spring', 'winter',
  'patient', 'twilight', 'dawn', 'crimson', 'wispy', 'weathered', 'blue',
  'billowing', 'broken', 'cold', 'damp', 'falling', 'frosty', 'green', 'long',
  'late', 'lingering', 'bold', 'little', 'morning', 'muddy', 'old', 'red',
  'rough', 'still', 'small', 'sparkling', 'throbbing', 'shy', 'wandering',
  'withered', 'wild', 'black', 'young', 'holy', 'solitary', 'fragrant',
  'aged', 'snowy', 'proud', 'floral', 'restless', 'divine', 'polished',
  'ancient', 'purple', 'lively', 'nameless'
];

const nouns = [
  'waterfall', 'river', 'breeze', 'moon', 'rain', 'wind', 'sea', 'morning',
  'snow', 'lake', 'sunset', 'pine', 'shadow', 'leaf', 'dawn', 'glitter',
  'forest', 'hill', 'cloud', 'meadow', 'sun', 'glade', 'bird', 'brook',
  'butterfly', 'bush', 'dew', 'dust', 'field', 'fire', 'flower', 'firefly',
  'feather', 'grass', 'haze', 'mountain', 'night', 'pond', 'darkness',
  'snowflake', 'silence', 'sound', 'sky', 'shape', 'surf', 'thunder',
  'violet', 'water', 'wildflower', 'wave', 'water', 'resonance', 'sun',
  'wood', 'dream', 'cherry', 'tree', 'fog', 'frost', 'voice', 'paper',
  'frog', 'smoke', 'star'
];

export function generateSlug(words = 2, separator = '-') {
  const randomArray = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  let result = [];
  for (let i = 0; i < words; i++) {
    if (i % 2 === 0) {
      result.push(randomArray(adjectives));
    } else {
      result.push(randomArray(nouns));
    }
  }

  return result.join(separator);
}

// Generate a random number within a range
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random hex color
export function randomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}
