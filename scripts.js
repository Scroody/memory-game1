const cards = [...document.querySelectorAll('.memory-card')];
const movesElement = document.querySelector('#moves');
const matchesElement = document.querySelector('#matches');
const statusElement = document.querySelector('#status');
const restartButton = document.querySelector('#restart');
let hasFlippedCard = false;
let lockBoard = false;
let firstCard;
let secondCard;
let moves = 0;
let matches = 0;
let shuffleTimer;

function flipCard() {
  if (lockBoard || this === firstCard || this.classList.contains('matched')) return;
  this.classList.add('flip');
  this.setAttribute('aria-label', `${this.dataset.framework} card`);

  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;
    statusElement.textContent = 'Choose a match';
    return;
  }

  secondCard = this;
  moves += 1;
  movesElement.textContent = moves;
  checkForMatch();
}

function checkForMatch() {
  const isMatch = firstCard.dataset.framework === secondCard.dataset.framework;
  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.classList.add('matched');
  secondCard.classList.add('matched');
  firstCard.disabled = true;
  secondCard.disabled = true;
  matches += 1;
  matchesElement.textContent = matches;
  statusElement.textContent = matches === 6 ? 'You did it!' : 'Pair found!';
  resetBoard();
  if (matches < 6) shuffle();
}

function unflipCards() {
  lockBoard = true;
  statusElement.textContent = 'Not quite...';
  setTimeout(() => {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');
    firstCard.setAttribute('aria-label', 'Hidden card');
    secondCard.setAttribute('aria-label', 'Hidden card');
    statusElement.textContent = 'Choose a pair';
    resetBoard();
  }, 900);
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

function shuffle(animate = true) {
  clearTimeout(shuffleTimer);
  cards.forEach(card => card.getAnimations().forEach(animation => animation.cancel()));
  const previousPositions = new Map(cards.map(card => [card, card.getBoundingClientRect()]));
  const shuffledCards = [...cards].sort(() => Math.random() - 0.5);

  shuffledCards.forEach((card, index) => {
    card.style.order = index;
  });

  if (!animate) return;
  lockBoard = true;
  statusElement.textContent = 'Shuffling...';
  requestAnimationFrame(() => {
    cards.forEach(card => {
      const oldPosition = previousPositions.get(card);
      const newPosition = card.getBoundingClientRect();
      const x = oldPosition.left - newPosition.left;
      const y = oldPosition.top - newPosition.top;

      if (Math.abs(x) < 1 && Math.abs(y) < 1) return;
      card.animate(
        [{ translate: `${x}px ${y}px` }, { translate: '0 0' }],
        { duration: 720, easing: 'cubic-bezier(.2,.8,.25,1)', fill: 'both' }
      );
    });
  });

  shuffleTimer = setTimeout(() => {
    cards.forEach(card => card.getAnimations().forEach(animation => animation.cancel()));
    lockBoard = false;
    statusElement.textContent = matches === 6 ? 'You did it!' : 'Choose a pair';
  }, 800);
}

function restartGame() {
  cards.forEach(card => {
    card.classList.remove('flip', 'matched');
    card.disabled = false;
    card.setAttribute('aria-label', 'Hidden card');
  });
  moves = 0;
  matches = 0;
  movesElement.textContent = '0';
  matchesElement.textContent = '0';
  statusElement.textContent = 'Ready to play';
  resetBoard();
  shuffle();
}

cards.forEach(card => card.addEventListener('click', flipCard));
restartButton.addEventListener('click', restartGame);
shuffle(false);