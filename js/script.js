// --- NOVO SCRIPT COMPLETO ---

// 1. ESTRUTURA DE DADOS PARA AS FASES
const levels = [
    {
        level: 1,
        title: 'Fase 1: Os Básicos',
        feelings: [
            { name: 'Happy', emoji: '😄' },
            { name: 'Sad', emoji: '😢' },
            { name: 'Angry', emoji: '😡' },
            { name: 'Surprised', emoji: '😲' },
        ]
    },
    {
        level: 2,
        title: 'Fase 2: Novos Sentimentos',
        feelings: [
            { name: 'Scared', emoji: '😨' },
            { name: 'Silly', emoji: '🤪' },
            { name: 'Proud', emoji: '😊' },
            { name: 'Shy', emoji: '😳' },
        ]
    },
    {
        level: 3,
        title: 'Fase Final: O Grande Desafio!',
        get feelings() { return [...levels[0].feelings, ...levels[1].feelings]; }
    }
];

// 2. SELETORES DO DOM
const gameBoard = document.querySelector('.game-board');
const levelTitleElement = document.querySelector('#level-title');
const victoryMessageElement = document.querySelector('#victory-message');
const victoryTextElement = document.querySelector('#victory-text');
const nextLevelButton = document.querySelector('#next-level-button');
const restartButton = document.querySelector('#restart-button');

// 3. VARIÁVEIS DE ESTADO DO JOGO
let currentLevel = 1;
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let matchedPairs = 0;
let totalPairs = 0;

// 4. FUNÇÕES PRINCIPAIS DO JOGO

// Função para embaralhar o baralho
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

// Função para iniciar o jogo em um nível específico
function startGame(levelIndex) {
    // Limpa o tabuleiro anterior
    gameBoard.innerHTML = '';
    victoryMessageElement.classList.add('hidden');
    
    // Define os dados do nível atual
    const levelData = levels[levelIndex - 1];
    totalPairs = levelData.feelings.length;
    matchedPairs = 0;
    
    // Atualiza a interface
    levelTitleElement.textContent = levelData.title;
    gameBoard.dataset.level = levelData.level; // Para o CSS adaptar o grid

    // Cria o baralho do nível
    let gameDeck = [];
    levelData.feelings.forEach((feeling) => {
        gameDeck.push({ type: feeling.name, content: feeling.name });
        gameDeck.push({ type: feeling.name, content: feeling.emoji });
    });

    const shuffledDeck = shuffle(gameDeck);

    // Renderiza as cartas
    shuffledDeck.forEach((card) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.type = card.type;

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-face', 'card-front');
        cardFront.textContent = card.content;

        const cardBack = document.createElement('div');
        cardBack.classList.add('card-face', 'card-back');
        cardBack.innerHTML = '<span>?</span>'; // NOVA LINHA (o CSS vai esconder o span e mostrar a estrela)
        
        cardElement.appendChild(cardFront);
        cardElement.appendChild(cardBack);
        
        cardElement.addEventListener('click', handleCardClick);
        gameBoard.appendChild(cardElement);
    });
}

function handleCardClick(event) {
    if (lockBoard) return;
    const clickedCard = event.currentTarget;
    if (clickedCard === firstCard) return;

    clickedCard.classList.add('flipped');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = clickedCard;
    } else {
        secondCard = clickedCard;
        checkForMatch();
    }
}

function checkForMatch() {
    const isMatch = firstCard.dataset.type === secondCard.dataset.type;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    speak(firstCard.dataset.type);

    // ADICIONE ESTAS DUAS LINHAS PARA A ANIMAÇÃO:
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');

    firstCard.removeEventListener('click', handleCardClick);
    secondCard.removeEventListener('click', handleCardClick);
    
    matchedPairs++;
    if (matchedPairs === totalPairs) {
        setTimeout(showVictoryMessage, 600);
    }
    
    resetBoard();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1200);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function showVictoryMessage() {
    victoryMessageElement.classList.remove('hidden');

    if (currentLevel < levels.length) {
        // Ainda não é a última fase
        victoryTextElement.textContent = `Fase ${currentLevel} completa!`;
        nextLevelButton.style.display = 'block';
        restartButton.style.display = 'none';
    } else {
        // Chegou na última fase
        victoryTextElement.textContent = 'Você zerou o jogo! Parabéns! 🎉';
        nextLevelButton.style.display = 'none';
        restartButton.style.display = 'block';
    }
}

// 5. FUNÇÕES DE APOIO E EVENTOS
function speak(word) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
}

nextLevelButton.addEventListener('click', () => {
    currentLevel++;
    startGame(currentLevel);
});

restartButton.addEventListener('click', () => {
    location.reload();
});


// 6. INICIA O JOGO
startGame(currentLevel);