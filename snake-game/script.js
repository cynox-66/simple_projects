const board = document.querySelector(".board");
const startButton = document.querySelector(".btn-start");
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");
const restartButton = document.querySelector(".btn-restart");
const scoreDisplay = document.querySelector("#score");
const highScoreDisplay = document.querySelector("#high-score");
const timeDisplay = document.querySelector("#time");
const finalScoreDisplay = document.querySelector("#final-score");
const pauseMessage = document.querySelector(".pause-message");
const mobileControls = document.querySelectorAll(".control-btn");
const bgMusic = document.querySelector("#bg-music"); // New: Audio element

const blockHeight = 50;
const blockWidth = 50;
const baseGameSpeed = 150; 

// Initial calculation
const boardRect = board.getBoundingClientRect();
const cols = Math.floor(boardRect.width / blockWidth);
const rows = Math.floor(boardRect.height / blockHeight);

let intervalId = null;
let timerId = null;
let currentScore = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let timeElapsed = 0;
let isPaused = false; 
let pendingDirection = "right"; 

let food = { x: 0, y: 0 }; 
let blocks = {};
let snake = []; 
let currentDirection = "right"; 

// --- Utility Functions ---

function setScore(score) {
    currentScore = score;
    scoreDisplay.textContent = currentScore;
    if (currentScore > highScore) {
        highScore = currentScore;
        highScoreDisplay.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }
}

function updateTime() {
    timeElapsed++;
    const minutes = String(Math.floor(timeElapsed / 60)).padStart(2, '0');
    const seconds = String(timeElapsed % 60).padStart(2, '0');
    timeDisplay.textContent = `${minutes}:${seconds}`;
}

function generateRandomFood() {
    let newFood;
    let attempts = 0;
    do {
        newFood = {
            x: Math.floor(Math.random() * rows),
            y: Math.floor(Math.random() * cols),
        };
        attempts++;
    } while (isSnakeSegment(newFood, false) && attempts < 100); 
    return newFood;
}

function isSnakeSegment(pos, checkHead = true) {
    const start = checkHead ? 1 : 0;
    return snake.some((segment, index) => index >= start && segment.x === pos.x && segment.y === pos.y);
}

function initializeBoard() {
    highScoreDisplay.textContent = highScore;
    board.innerHTML = '';
    blocks = {};

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const block = document.createElement("div");
            block.classList.add("block");
            board.appendChild(block);
            blocks[`${row}-${col}`] = block;
        }
    }
}

function gameOver() {
    clearInterval(intervalId);
    clearInterval(timerId);
    bgMusic.pause(); // Pause music on game over
    isPaused = true; 
    
    finalScoreDisplay.textContent = currentScore;

    modal.style.display = "flex";
    startGameModal.style.display = "none";
    gameOverModal.style.display = "flex";
}

function togglePause() {
    if (intervalId) {
        clearInterval(intervalId);
        clearInterval(timerId);
        bgMusic.pause(); // Pause music
        intervalId = null;
        timerId = null;
        isPaused = true;
        pauseMessage.classList.remove("hidden");
    } else {
        // Resume game
        bgMusic.play().catch(e => console.error("Audio play failed on resume:", e)); // Play music
        intervalId = setInterval(render, getCurrentGameSpeed());
        timerId = setInterval(updateTime, 1000);
        isPaused = false;
        pauseMessage.classList.add("hidden");
    }
}

function getCurrentGameSpeed() {
    const speedDecrease = Math.floor(currentScore / 50) * 10; 
    let newSpeed = baseGameSpeed - speedDecrease;
    return Math.max(newSpeed, 50); 
}

// --- Game Logic ---

function render() {
    if (snake.length === 0 || isPaused) return; 

    currentDirection = pendingDirection;

    const currentHead = snake[0];
    let newHead = { x: currentHead.x, y: currentHead.y };

    if (currentDirection === "left") {
        newHead.y -= 1;
    } else if (currentDirection === "right") {
        newHead.y += 1;
    } else if (currentDirection === "up") {
        newHead.x -= 1;
    } else if (currentDirection === "down") {
        newHead.x += 1;
    }

    const hitWall = (newHead.x < 0 || newHead.x >= rows || newHead.y < 0 || newHead.y >= cols);
    const hitSelf = isSnakeSegment(newHead, true); 

    if (hitWall || hitSelf) {
        gameOver();
        return;
    }

    if (blocks[`${currentHead.x}-${currentHead.y}`]) {
        blocks[`${currentHead.x}-${currentHead.y}`].classList.remove("snake-head");
    }

    const tail = snake[snake.length - 1];
    
    snake.unshift(newHead);
    
    if (newHead.x === food.x && newHead.y === food.y) {
        snake.push(tail);
        
        blocks[`${food.x}-${food.y}`].classList.remove("food");
        food = generateRandomFood();
        setScore(currentScore + 10);

        clearInterval(intervalId);
        intervalId = setInterval(render, getCurrentGameSpeed());
        
    } else {
        snake.pop(); 
        if (blocks[`${tail.x}-${tail.y}`]) {
            blocks[`${tail.x}-${tail.y}`].classList.remove("fill");
        }
    }

    // Render Update
    if (blocks[`${food.x}-${food.y}`]) {
        blocks[`${food.x}-${food.y}`].classList.add("food");
    }
    
    snake.forEach((segment, index) => {
        const block = blocks[`${segment.x}-${segment.y}`];
        if (block) {
            block.classList.add("fill");
            
            if (index === 0) {
                block.classList.add("snake-head");
            } else {
                block.classList.remove("snake-head");
            }
        }
    });
}

function resetGame() {
    clearInterval(intervalId);
    clearInterval(timerId);
    bgMusic.pause(); // Ensure music stops
    bgMusic.currentTime = 0; // Rewind music
    intervalId = null;
    timerId = null;
    isPaused = false;
    pauseMessage.classList.add("hidden");
    
    currentScore = 0;
    timeElapsed = 0;
    currentDirection = "right";
    pendingDirection = "right";
    setScore(0);
    timeDisplay.textContent = "00:00";
    
    Object.values(blocks).forEach(block => {
        block.classList.remove("fill", "food", "snake-head");
    });

    const startX = Math.floor(rows / 2);
    const startY = Math.floor(cols / 4); 
    snake = [{ x: startX, y: startY }, { x: startX, y: startY - 1 }, { x: startX, y: startY - 2 }]; 
    food = generateRandomFood();

    if (blocks[`${food.x}-${food.y}`]) blocks[`${food.x}-${food.y}`].classList.add("food");
    snake.forEach(segment => {
        if (blocks[`${segment.x}-${segment.y}`]) blocks[`${segment.x}-${segment.y}`].classList.add("fill");
    });
    if (blocks[`${snake[0].x}-${snake[0].y}`]) blocks[`${snake[0].x}-${snake[0].y}`].classList.add("snake-head");
}

function startGameLoop() {
    modal.style.display = "none";
    gameOverModal.style.display = "none";
    
    resetGame(); 
    
    // Attempt to start music only after user interaction
    bgMusic.play().catch(e => console.error("Audio play failed on start:", e));

    intervalId = setInterval(render, getCurrentGameSpeed());
    timerId = setInterval(updateTime, 1000);
}

// --- Initialization & Events ---

initializeBoard();

startButton.addEventListener("click", startGameLoop);
restartButton.addEventListener("click", startGameLoop); 

// Mobile Control Event Listeners
mobileControls.forEach(button => {
    button.addEventListener("click", (e) => {
        const requestedDirection = e.currentTarget.dataset.direction;
        
        if (requestedDirection === "left" && currentDirection !== "right") {
            pendingDirection = "left";
        } else if (requestedDirection === "right" && currentDirection !== "left") {
            pendingDirection = "right";
        } else if (requestedDirection === "up" && currentDirection !== "down") {
            pendingDirection = "up";
        } else if (requestedDirection === "down" && currentDirection !== "up") {
            pendingDirection = "down";
        }
    });
});

addEventListener("keydown", (e) => {
    
    if (e.key === " ") {
        e.preventDefault();
        if (intervalId || isPaused) {
            togglePause();
        }
    }

    if (e.key === "ArrowLeft" && currentDirection !== "right") {
        pendingDirection = "left";
    } else if (e.key === "ArrowRight" && currentDirection !== "left") {
        pendingDirection = "right";
    } else if (e.key === "ArrowUp" && currentDirection !== "down") {
        pendingDirection = "up";
    } else if (e.key === "ArrowDown" && currentDirection !== "up") {
        pendingDirection = "down";
    }
});