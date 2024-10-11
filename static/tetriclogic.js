// tetris logic
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const grid = 16; // size of each square in the grid
const tetrominoes = [
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    [
        [2, 0, 0],
        [2, 2, 2],
        [0, 0, 0]
    ],
    [
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0]
    ],
    [
        [4, 4],
        [4, 4]
    ],
    [
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0]
    ],
    [
        [0, 6, 0],
        [6, 6, 6],
        [0, 0, 0]
    ],
    [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0]
    ]
];
const colors = [
    null,
    'cyan',
    'blue',
    'orange',
    'yellow',
    'green',
    'purple',
    'red'
];
let account = {
    score: 0,
    level: 1,
    lines: 0
};
let board = [];
let rs = 0;
let queue = [];
let piece = {};
let next = {};
let gameOver = false;
let requestId;
function resetGame() {
    account.score = 0;
    account.level = 1;
    account.lines = 0;
    gameOver = false;
    board = [];
    queue = [];
    piece = {};
    next = {};
    for (let row = 0; row < 20; row++) {
        board[row] = [];
        for (let col = 0; col < 10; col++) {
            board[row][col] = 0;
        }
    }
    createTetromino();
    createTetromino();
}
function createTetromino() {
    if (queue.length < 5) {
        let randomTetromino = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
        queue.push(randomTetromino);
    }
    next = queue.shift();
    piece = {
        x: 3,
        y: -2,
        type: next,
        color: colors[next[0][0]],
        rotation: 0
    };
}
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect((x + offset.x) * grid, (y + offset.y) * grid, grid - 1, grid - 1);
                context.strokeStyle = 'black';
                context.strokeRect((x + offset.x) * grid, (y + offset.y) * grid, grid - 1, grid - 1);
            }
        });
    });
}
function drawBoard() {
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(board, {
        x: 0,
        y: 0
    });
    drawMatrix(piece.type, {
        x: piece.x,
        y: piece.y
    });
}
function mergePiece() {
    piece.type.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[y + piece.y][x + piece.x] = value;
            }
        });
    });
}
function checkCollision(matrix, offset) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            if (matrix[y][x] !== 0 &&
                (
                    (y + offset.y) >= 20 ||
                    (x + offset.x) >= 10 ||
                    (x + offset.x) < 0 ||
                    board[y + offset.y] && board[y + offset.y][x + offset.x] !== 0
                )
            ) {
                return true;
            }
        }
    }
    return false;
}
function movePieceDown() {
    if (!checkCollision(piece.type, {
        x: piece.x,
        y: piece.y + 1
    })) {
        piece.y++;
    } else {
        mergePiece();
        createTetromino();
        clearLines();
    }
}
function movePieceRight() {
    if (!checkCollision(piece.type, {
        x: piece.x + 1,
        y: piece.y
    })) {
        piece.x++;
    }
}
function movePieceLeft() {
    if (!checkCollision(piece.type, {
        x: piece.x - 1,
        y: piece.y
    })) {
        piece.x--;
    }
}
function rotatePiece() {
    let newRotation = (piece.rotation + 1) % 4;
    let newMatrix = [];
    for (let y = 0; y < piece.type.length; y++) {
        newMatrix[y] = [];
        for (let x = 0; x < piece.type[y].length; x++) {
            newMatrix[y][x] = piece.type[piece.type.length - 1 - x][y];
        }
    }
    if (!checkCollision(newMatrix, {
        x: piece.x,
        y: piece.y
    })) {
        piece.rotation = newRotation;
        piece.type = newMatrix;
    }
}
function clearLines() {
    let lines = 0;
    for (let y = 0; y < 20; y++) {
        let rowComplete = true;
        for (let x = 0; x < 10; x++) {
            if (board[y][x] === 0) {
                rowComplete = false;
                break;
            }
        }
        if (rowComplete) {
            board.splice(y, 1);
            board.unshift(new Array(10).fill(0));
            lines++;
        }
    }
    if (lines > 0) {
        account.lines += lines;
        account.score += 100 * lines;
        account.level = Math.floor(account.lines / 10) + 1;
    }
}
function update() {
    if (gameOver) {
        return;
    }
    if (rs < 1000 / (account.level * 50 + 100)) {
        rs++;
        return;
    }
    rs = 0;
    movePieceDown();
}
function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
}
function gameLoop() {
    update();
    render();
    requestId = requestAnimationFrame(gameLoop);
}
function handleKeyPress(event) {
    if (gameOver) {
        return;
    }
    switch (event.key) {
        case 'ArrowLeft':
            movePieceLeft();
            break;
        case 'ArrowRight':
            movePieceRight();
            break;
        case 'ArrowDown':
            movePieceDown();
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case ' ':
            while (!checkCollision(piece.type, {
                x: piece.x,
                y: piece.y + 1
            })) {
                piece.y++;
            }
            mergePiece();
            createTetromino();
            clearLines();
            break;
    }
}
document.addEventListener('keydown', handleKeyPress);
resetGame();
gameLoop();