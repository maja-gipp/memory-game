const selectors = {
  boardContainer: document.querySelector(".board-container"),
  board: document.querySelector(".board"),
  moves: document.querySelector(".moves"),
  timer: document.querySelector(".timer"),
  start: document.querySelector("button"),
  win: document.querySelector(".win"),
};

const state = {
  gameStarted: false,
  flippedCards: 0,
  totalFlips: 0,
  totalTime: 0,
  loop: null,
};

const shuffle = (array) => {
  const clonedArray = [...array];

  for (let index = clonedArray.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const original = clonedArray[index];

    clonedArray[index] = clonedArray[randomIndex];
    clonedArray[randomIndex] = original;
  }

  return clonedArray;
};

const pickRandom = (array, quantity) => {
  const clonedArray = [...array];
  const randomPicks = [];

  for (let index = 0; index < quantity; index++) {
    const randomIndex = Math.floor(Math.random() * clonedArray.length);
    const randomElement = clonedArray.splice(randomIndex, 1)[0];
    randomPicks.push(randomElement);
  }

  return randomPicks;
};

const generateGame = () => {
  const sizeAttribute = selectors.board.getAttribute("data-size");
  if (sizeAttribute === null) {
    throw new Error("Missing data-size attribute");
  }
  const size = Number(sizeAttribute);

  if (isNaN(size)) {
    throw new Error("The size of the board must be a number");
  }

  if (size < 2) {
    throw new Error("The size of the board must be at least 2");
  }

  if (size % 2 !== 0) {
    throw new Error("The size of the board must be an even number.");
  }

  const emojis = ["🐍", "🐘", "🐇", "🦔", "🦜", "🐈‍⬛", "🦒", "🦭", "🦧", "🦀"];
  const picks = pickRandom(emojis, (size * size) / 2);
  const items = shuffle([...picks, ...picks]);
  const cards = `
        <div class="board" style="grid-template-columns: repeat(${size}, auto)">
            ${items
              .map(
                (item) => `
                <div class="card">
                    <div class="card-front"></div>
                    <div class="card-back">${item}</div>
                </div>
            `
              )
              .join("")}
       </div>
    `;

  const parser = new DOMParser().parseFromString(cards, "text/html");

  selectors.board.replaceWith(parser.querySelector(".board"));
};

const startGame = () => {
  state.gameStarted = true;
  selectors.start.classList.add("disabled");

  state.loop = setInterval(() => {
    state.totalTime++;

    selectors.moves.innerText = `${state.totalFlips} moves`;
    selectors.timer.innerText = `time: ${state.totalTime} sec`;
  }, 1000);
};

const flipBackCards = () => {
  document.querySelectorAll(".card:not(.matched)").forEach((card) => {
    card.classList.remove("flipped");
  });

  state.flippedCards = 0;
};

const flipCard = (card) => {
  state.flippedCards++;
  state.totalFlips++;

  if (!state.gameStarted) {
    startGame();
  }

  if (state.flippedCards <= 2) {
    card.classList.add("flipped");
  }

  if (state.flippedCards === 2) {
    const flippedCards = document.querySelectorAll(".flipped:not(.matched)");

    if (flippedCards[0].innerText === flippedCards[1].innerText) {
      flippedCards[0].classList.add("matched");
      flippedCards[1].classList.add("matched");
    }

    setTimeout(() => {
      flipBackCards();
    }, 1000);
  }

  if (!document.querySelectorAll(".card:not(.flipped)").length) {
    setTimeout(() => {
      selectors.boardContainer.classList.add("flipped");
      selectors.win.innerHTML = `
                <span class="win-text">
                    You won!<br />
                    with <span class="highlight">${state.totalFlips}</span> moves<br />
                    under <span class="highlight">${state.totalTime}</span> seconds
                </span>
            `;

      clearInterval(state.loop);
    }, 1000);
  }
};

const attachEventListeners = () => {
  document.addEventListener("click", (event) => {
    const eventTarget = event.target;
    const eventParent = eventTarget.parentElement;

    if (
      eventTarget.className.includes("card") &&
      !eventParent.className.includes("flipped")
    ) {
      flipCard(eventParent);
    } else if (
      eventTarget.nodeName === "BUTTON" &&
      !eventTarget.className.includes("disabled")
    ) {
      startGame();
    }
  });
};

generateGame();
attachEventListeners();
