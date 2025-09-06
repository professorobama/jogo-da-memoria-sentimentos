// Lista de todos os sentimentos que estarão no jogo
// Cada sentimento é um "objeto" com um nome e uma imagem (emoji)
const feelings = [
    { name: 'Happy', emoji: '😄' },
    { name: 'Sad', emoji: '😢' },
    { name: 'Angry', emoji: '😡' },
    { name: 'Surprised', emoji: '😲' },
    { name: 'Silly', emoji: '🤪' },
    { name: 'Scared', emoji: '😨' },
];



// O jogo da memória precisa de pares. Vamos duplicar nossa lista de sentimentos.
// Cada sentimento aparecerá duas vezes: uma com o emoji e outra com a palavra.
// Isso ainda não é a lógica final, mas é o primeiro passo para definir nosso conteúdo.

// --- [COLE O NOVO CÓDIGO ABAIXO DA LISTA 'feelings'] ---

// 1. Selecionar o tabuleiro do jogo no HTML
const gameBoard = document.querySelector('.game-board');

// 2. Criar o baralho do jogo com os pares
let gameDeck = [];
feelings.forEach((feeling) => {
    // Adiciona a carta com a palavra
    gameDeck.push({
        type: feeling.name,
        content: feeling.name
    });
    // Adiciona a carta com o emoji
    gameDeck.push({
        type: feeling.name,
        content: feeling.emoji
    });
});

// 3. Embaralhar o baralho (Algoritmo Fisher-Yates)
function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // Enquanto ainda existirem elementos para embaralhar.
    while (currentIndex !== 0) {
        // Pega um elemento restante.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // E troca de lugar com o elemento atual.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

// Embaralha nosso baralho
const shuffledDeck = shuffle(gameDeck);

// 4. Renderizar as cartas no tabuleiro
function generateCards() {
    shuffledDeck.forEach((card) => {
        // Cria todos os elementos HTML para uma carta
        const cardElement = document.createElement('div');
        const cardFront = document.createElement('div');
        const cardBack = document.createElement('div');

        // Adiciona as classes CSS que criamos
        cardElement.classList.add('card');
        cardFront.classList.add('card-face', 'card-front');
        cardBack.classList.add('card-face', 'card-back');

        // Define o conteúdo da frente e do verso
        cardFront.textContent = card.content;
        cardBack.textContent = '?';

        // Adiciona um "identificador" na carta para sabermos qual sentimento ela representa
        // Isso será MUITO importante para checar se as cartas formam um par
        cardElement.dataset.type = card.type;
        
        // Monta a estrutura da carta (frente e verso dentro do elemento principal)
        cardElement.appendChild(cardFront);
        cardElement.appendChild(cardBack);

        // Adiciona a carta pronta ao tabuleiro
        gameBoard.appendChild(cardElement);
    });
}

// Chama a função para gerar as cartas quando a página carregar
generateCards();

// --- [COLE O NOVO CÓDIGO ABAIXO DA FUNÇÃO generateCards()] ---

// 5. Lógica principal do Jogo

// Variáveis para controlar o estado do jogo
let hasFlippedCard = false; // Controla se já tem uma carta virada
let lockBoard = false;      // "Tranca" o tabuleiro para evitar que mais de 2 cartas sejam viradas
let firstCard, secondCard;  // Armazena a primeira e a segunda carta clicada
let matchedPairs = 0; // <-- ADICIONE ESTA LINHA

// Função para virar uma carta
function handleCardClick(event) {
    // Se o tabuleiro estiver trancado, não faz nada
    if (lockBoard) return;
    
    const clickedCard = event.currentTarget;

    // Evita o duplo clique na mesma carta
    if (clickedCard === firstCard) return;

    clickedCard.classList.add('flipped');

    if (!hasFlippedCard) {
        // Primeiro clique
        hasFlippedCard = true;
        firstCard = clickedCard;
    } else {
        // Segundo clique
        secondCard = clickedCard;
        checkForMatch();
    }
}

// Função que checa se as duas cartas viradas são um par
function checkForMatch() {
    const isMatch = firstCard.dataset.type === secondCard.dataset.type;

    if (isMatch) {
        // É um par!
        speak(firstCard.dataset.type); // <-- ADICIONE ESTA LINHA
        disableCards();
    } else {
        // Não é um par.
        unflipCards();
    }
}

// Função para desabilitar as cartas quando o par é encontrado
function disableCards() {
    firstCard.removeEventListener('click', handleCardClick);
    secondCard.removeEventListener('click', handleCardClick);

    matchedPairs++; // <-- ADICIONE ESTA LINHA
    
    // Verifica se o jogo acabou
    if (matchedPairs === feelings.length) { // <-- ADICIONE ESTE BLOCO IF
        // Adiciona um pequeno delay para a última carta acabar de virar
        setTimeout(() => {
            showVictoryMessage();
        }, 600);
    }

    resetBoard();
}

// Função para desvirar as cartas se não formarem um par
function unflipCards() {
    // Tranca o tabuleiro para o jogador não clicar em outras cartas enquanto a animação acontece
    lockBoard = true;

    // Dá um tempo (1.2 segundos) para o jogador ver a segunda carta antes de desvirar
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        
        // Destranca o tabuleiro e reseta para a próxima jogada
        resetBoard();
    }, 1200);
}

// Função para resetar as variáveis do tabuleiro para a próxima rodada
function resetBoard() {
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
}

// 6. Adicionar o evento de clique a cada carta
const cards = document.querySelectorAll('.card');
cards.forEach(card => card.addEventListener('click', handleCardClick));

// --- [ADICIONE ESTA FUNÇÃO NO FINAL DO SEU SCRIPT] ---

// 7. Função para pronunciar a palavra em inglês
function speak(word) {
    // Cria um objeto de "fala"
    const utterance = new SpeechSynthesisUtterance(word);
    // Define o idioma para inglês americano
    utterance.lang = 'en-US';
    // Pede ao sintetizador de voz do navegador para falar
    speechSynthesis.speak(utterance);
}

// --- [ADICIONE ESTA FUNÇÃO NO FINAL DO SEU SCRIPT] ---

// 8. Função para mostrar a tela de vitória e reiniciar o jogo
function showVictoryMessage() {
    const victoryMessage = document.querySelector('#victory-message');
    const restartButton = document.querySelector('#restart-button');

    // Mostra a mensagem de vitória removendo a classe 'hidden'
    victoryMessage.classList.remove('hidden');

    // Adiciona o evento de clique ao botão de reiniciar
    restartButton.addEventListener('click', () => {
        // A forma mais simples de reiniciar é recarregar a página.
        // Isso vai zerar tudo e embaralhar as cartas novamente.
        location.reload();
    });
}