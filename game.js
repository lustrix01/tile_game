const images = [
  '1.jpg', '1.jpg',
  '2.jpg', '2.jpg',
  '3.jpg', '3.jpg',
  '4.jpg', '4.jpg',
  '5.jpg', '5.jpg',
  '6.jpg', '6.jpg',
  '7.jpg', '7.jpg',
  '8.jpg', '8.jpg',
];

let flipped = [];
let matched = 0;
let moves = 0;
let lock = false;

// --- SOUND EFFECTS ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  if (type === 'flip') {
    oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.15);

  } else if (type === 'match') {
    oscillator.frequency.setValueAtTime(500, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);

  } else if (type === 'nomatch') {
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);

  } else if (type === 'win') {
    const notes = [500, 600, 700, 900];
    notes.forEach(function(freq, i) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.15 + 0.2);
      osc.start(audioCtx.currentTime + i * 0.15);
      osc.stop(audioCtx.currentTime + i * 0.15 + 0.2);
    });
  }
}

// --- CONFETTI ---
function launchConfetti() {
  const emojis = ['🐠', '🐚', '⭐', '🌊', '🦀', '🐡', '🦋', '💧'];
  for (let i = 0; i < 30; i++) {
    const piece = document.createElement('div');
    piece.classList.add('confetti-piece');
    piece.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.animationDuration = (2 + Math.random() * 3) + 's';
    piece.style.animationDelay = Math.random() * 1.5 + 's';
    piece.style.fontSize = (1 + Math.random()) + 'rem';
    document.body.appendChild(piece);
    piece.addEventListener('animationend', function() {
      piece.remove();
    });
  }
}

// --- CARDS ---
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function createCards() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  const shuffled = shuffle([...images]);

  shuffled.forEach(function(image) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.image = image;

    card.innerHTML =
      '<div class="card-inner">' +
        '<div class="card-back">🌊</div>' +
        '<div class="card-front"></div>' +
      '</div>';

    card.addEventListener('click', function() {
      flipCard(card);
    });

    grid.appendChild(card);
  });
}

function flipCard(card) {
  if (lock) return;
  if (card.classList.contains('flipped')) return;
  if (card.classList.contains('matched')) return;

  card.querySelector('.card-front').style.backgroundImage = "url('images/" + card.dataset.image + "')";
  card.classList.add('flipped');
  flipped.push(card);
  playSound('flip');

  if (flipped.length === 2) {
    moves++;
    document.getElementById('moves').textContent = 'Moves: ' + moves;
    checkMatch();
  }
}

function checkMatch() {
  const cardA = flipped[0];
  const cardB = flipped[1];

  if (cardA.dataset.image === cardB.dataset.image) {
    cardA.classList.add('matched');
    cardB.classList.add('matched');
    matched++;
    flipped = [];
    playSound('match');

    if (matched === images.length / 2) {
      setTimeout(showWin, 600);
    }

  } else {
    lock = true;
    playSound('nomatch');
    setTimeout(function() {
      cardA.classList.remove('flipped');
      cardB.classList.remove('flipped');
      flipped = [];
      lock = false;
    }, 1000);
  }
}

function showWin() {
  document.getElementById('win-msg').textContent = 'You finished in ' + moves + ' moves!';
  document.getElementById('win-screen').classList.add('show');
  launchConfetti();
  playSound('win');
}

function resetGame() {
  flipped = [];
  matched = 0;
  moves = 0;
  lock = false;
  document.getElementById('moves').textContent = 'Moves: 0';
  document.getElementById('win-screen').classList.remove('show');
  createCards();
}

document.getElementById('restart').addEventListener('click', resetGame);
document.getElementById('play-again').addEventListener('click', resetGame);

createCards();