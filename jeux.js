// ==========================
// CONSTANTES ET ÉTAT DU JEU
// ==========================
const boardSize = 8;
const emojis = {
    bucket: '🪣',
    bucketFull: '🪣',
    water: '💧',
    plant: '🌱',
    blocked: '❌'
};

let playerPosX = 3;
let playerPosY = 3;
let hasWater = false;
let moves = 0;
let arrosages = 0;
let blockedCells = new Map();

// ==========================
// INITIALISATION DU JEU
// ==========================
const board = document.getElementById('gameBoard');
const statusEl = document.getElementById('gameStatus');
const movesCountEl = document.getElementById('movesCount');
const gaugeFill = document.getElementById('gaugeFill');
const gaugeText = document.getElementById('gaugeText');

function startNewGame() {
    playerPosX = 3;
    playerPosY = 3;
    hasWater = false;
    moves = 0;
    arrosages = 0;
    blockedCells.clear();
    updateGauge();
    statusEl.textContent = "Trouvez une source d'eau !";
    movesCountEl.textContent = moves;
    createBoard();
}

// ==========================
// CREATION DE LA GRILLE
// ==========================
function createBoard() {
    board.innerHTML = '';
    for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = x;
            cell.dataset.y = y;

            // cases spéciales
            if ((x === 0 && y === 0) || (x === 7 && y === 0) || (x === 0 && y === 7) || (x === 7 && y === 7)) {
                cell.classList.add('water-source');
                cell.textContent = emojis.water;
            } else if (x === 3 && y === 3) {
                cell.classList.add('plant');
                cell.textContent = emojis.plant;
            }

            // cases bloquées
            if (blockedCells.has(`${x},${y}`)) {
                cell.classList.add('blocked');
                const counter = document.createElement('div');
                counter.classList.add('blocked-counter');
                counter.textContent = blockedCells.get(`${x},${y}`);
                cell.appendChild(counter);
            }

            // joueur
            if (x === playerPosX && y === playerPosY) {
                cell.classList.add('player');
                cell.textContent = hasWater ? emojis.bucketFull : emojis.bucket;
            }

            cell.addEventListener('click', () => handleCellClick(x, y));
            board.appendChild(cell);
        }
    }
}

// ==========================
// LOGIQUE DU JEU
// ==========================
function handleCellClick(x, y) {
    if (!isValidMove(x, y)) return;

    const key = `${x},${y}`;
    if (blockedCells.has(key)) {
        statusEl.textContent = "🚫 Case bloquée ! Choisissez une autre direction.";
        return;
    }

    movePlayer(x, y);
    moves++;
    movesCountEl.textContent = moves;

    // ramasser de l’eau
    if (isWaterSource(x, y)) {
        hasWater = true;
        statusEl.textContent = "💧 Seau rempli ! Retournez arroser la plante 🌱";
    }
    // arroser
    else if (isPlant(x, y) && hasWater) {
        hasWater = false;
        arrosages++;
        updateGauge();
        statusEl.textContent = `🌱 Plante arrosée (${arrosages}/3)`;
        if (arrosages >= 3) {
            statusEl.innerHTML = "<div class='victory-message'>🎉 Victoire ! La plante est en pleine forme !</div>";
            return;
        }
    } else {
        statusEl.textContent = "Continuez à chercher de l'eau 💧";
    }

    updateBlockedCells();
    createBoard();
}

function isValidMove(x, y) {
    const dx = Math.abs(x - playerPosX);
    const dy = Math.abs(y - playerPosY);
    return dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0);
}

function movePlayer(x, y) {
    playerPosX = x;
    playerPosY = y;
}

function isWaterSource(x, y) {
    return (x === 0 && y === 0) || (x === 7 && y === 0) || (x === 0 && y === 7) || (x === 7 && y === 7);
}

function isPlant(x, y) {
    return x === 3 && y === 3;
}

// ==========================
// BLOQUAGES ALEATOIRES
// ==========================
function updateBlockedCells() {
    // décrémente le compteur des cases déjà bloquées
    for (let [key, turns] of blockedCells.entries()) {
        if (turns <= 1) blockedCells.delete(key);
        else blockedCells.set(key, turns - 1);
    }

    // bloque 1 ou 2 nouvelles cases
    const nbToBlock = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < nbToBlock; i++) {
        const x = Math.floor(Math.random() * boardSize);
        const y = Math.floor(Math.random() * boardSize);
        const key = `${x},${y}`;

        if (!isPlant(x, y) && !isWaterSource(x, y) && !(x === playerPosX && y === playerPosY)) {
            blockedCells.set(key, 2);
        }
    }
}

// ==========================
// BARRE D'ARROSAGE
// ==========================
function updateGauge() {
    const percent = (arrosages / 3) * 100;
    gaugeFill.style.width = `${percent}%`;
    gaugeText.textContent = `${arrosages}/3 arrosages`;
}

// ==========================
// AFFICHER LES INSTRUCTIONS
// ==========================
function toggleInstructions() {
    const el = document.getElementById("instructions");
    el.style.display = el.style.display === "none" ? "block" : "none";
}

// lancer la partie
startNewGame();
