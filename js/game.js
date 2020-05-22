// Define constants
const EMPTY = 0;
const HIT = -1;
const MISS = -2;
const N = 10;

const CARRIER = 1;
const BATTLESHIP = 2;
const DESTROYER = 3;
const SUBMARINE = 4;
const PATROLBOAT = 5;
const SHIPS = [CARRIER, BATTLESHIP, DESTROYER, SUBMARINE, PATROLBOAT];

const SIZES = {}
SIZES[CARRIER] = 5;
SIZES[BATTLESHIP] = 4;
SIZES[DESTROYER] = 3;
SIZES[SUBMARINE] = 3;
SIZES[PATROLBOAT] = 2;

/* sleep function */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// TODO: Pass args as params instead of directly changing Game fields

/* Handle player clicking randomize button */
function handleRandomizeClick() { 
    game.playerBoard = randomBoard();
    let state = game.getBoardState("playerboard", game.playerBoard);
    render(state, true, true);
}

/* Handle player clicking start button */
function handleStartClick() {
    // disable 
    let buttonIds = ['start-btn', 'randomize-btn', 'easy-btn', 'medium-btn', 'hard-btn'];
    for (let id of buttonIds) {
        document.getElementById(id).disabled = true;
    }

    for (let id of ['player-panel', 'ai-panel']) {
        document.getElementById(id).classList.remove("opaque");
    }

    if (game.difficulty === null) {
        document.getElementById('easy-btn').className = "selected";
        game.difficulty = "easy";
    } 

    game.start();
}

/* Handle player clicking (easy/medium/hard) button */
function handleDifficultyClick(selectedId) {
    for (let id of ['easy-btn', 'medium-btn', 'hard-btn']) {
        let button = document.getElementById(id);
        if (id === selectedId) {
            let difficulty = id.split('-')[0];
            game.difficulty = difficulty;
            button.className = "selected";
        } else {
            button.className = "";
        }
    }
}


/* Handle player cell selection on enemy board */
function handleBoardClick(id) {
    game.playerSelect = id.substring(1);
}


/* Display when a ship has sunk */
function displaySink(owner, shipId) {
    if (owner === "player" || owner === "ai") {
        document.getElementById(`${owner}-ship-label-${shipId}`).style.color = "red";
        document.getElementById(`${owner}-ship-count-${shipId}`).style.color = "red";
    } else {
        console.log("Warning: Invalid sink: " + owner);
    }
}

/* Initialize HTML document with two empty boards */
function initBoards() {
    let boardIds = ["playerboard", "enemyboard"]
    let rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    // init grey spaces
    for (let boardId of boardIds) {
        let board = document.getElementById(boardId);
        let id = boardId[0];
        for (let row of rows) {
            for (let col = 0; col < 10; col++) {
                let div = document.createElement("div");
                div.id = `${id}${row}${col}`;
                div.className = "opaque";
                if (boardId === "enemyboard") {
                    div.onclick = () => handleBoardClick(div.id);
                }
                board.appendChild(div);
            }
        }
    }
}

/* Render a map of cell states onto the document */
function render(coordMap, renderShips=true, opaque=false) {
    for (let state of Object.keys(coordMap)) {
        let opacity = (opaque) ? "opaque " : "";
        for (let cellId of coordMap[state]) {
            let div = document.getElementById(cellId);

            if (state == EMPTY) {
                div.className = opacity;
            } else if (state == HIT) {
                div.className = opacity + "hit";
            } else if (state == MISS) {
                div.className = opacity + "miss";
            } else if (renderShips) {
                div.className = opacity + "ship";
            } else {
                div.className = opacity;
            }
        }
    }
}


/* Display the game winner */
function displayWinner(winner, loser) {
    let winnerElem = document.getElementById(`${winner}-footer`);
    let loserElem = document.getElementById(`${loser}-footer`);
    loserElem.innerText = " ";
    winnerElem.innerText += " Wins!";

    winnerElem.style.color = (winner === "player") ? "green" : "red";
}


/*
 * Model class that handles the state of the game
 */
class Game {
    constructor() {
        this.playerBoard = null;
        this.enemyBoard = null;
        this.playerSelect = null;
        this.progressState = null;
        this.difficulty = null;
    }

    /* Return a map of hit/miss/ship to matching cells */
    getBoardState(documentId, board) {
        let rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        let id = documentId[0];
        let coordMap = {};
        coordMap[HIT] = [];
        coordMap[MISS] = [];
        coordMap[EMPTY] = [];
        for (let ship of SHIPS) {
            coordMap[ship] = []
        }

        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[0].length; j++) {
                let cell = board[i][j];
                coordMap[cell].push(`${id}${rows[i]}${j}`);
            }
        }
        return coordMap;
    }

    /* Starts the game */
    async start() {
        // init board arrays if not yet init
        if (this.playerBoard == null) this.playerBoard = randomBoard();
        if (this.enemyBoard == null) this.enemyBoard = randomBoard();

        // determine appropriate AI
        switch (game.difficulty) {
            case "easy":
                this.enemyAI = new AIFactory().getEasy();
                break;
            case "medium":
                this.enemyAI = new AIFactory().getMedium();
                break;
            case "hard":
                this.enemyAI = new AIFactory().getHard();
                break;
            default:
                console.log("WARNING: difficulty not passed into game");
                return;
        }

        // render boards
        this.playerState = this.getBoardState("playerboard", this.playerBoard);
        this.enemyState = this.getBoardState("enemyboard", this.enemyBoard);
        render(this.playerState);
        render(this.enemyState, false);

        // TODO: Setup phase - select ships

        // Play phase
        const NUM_SHIP_CELL = Object.values(SIZES).reduce((a, b) => a + b, 0);
        let i, j, cell;
        let num_turns = 0;

        while (true) {
            // loop/wait until player has selected a cell
            this.playerSelect = null;
            while (this.playerSelect === null) {
                await sleep(100);
            }

            // parse selected cell and update state
            i = this.playerSelect.charCodeAt(0) - 'A'.charCodeAt(0);
            j = parseInt(this.playerSelect[1]);
            cell = this.enemyBoard[i][j]
            if (cell == HIT || cell == MISS) {
                console.log("WARNING: Player has chosen a previously selected cell. Choose another cell.")
                continue; // already fired - no penalty
            } else {
                this.enemyBoard[i][j] = (cell == EMPTY) ? MISS : HIT;
            }

            // request AI selection and inform if hit or miss
            [i, j] = this.enemyAI.selectTarget();
            cell = this.playerBoard[i][j];

            if (cell == HIT || cell == MISS) {
                console.log("WARNING: AI has chosen a previously selected cell;")
            }
            cell = (cell == EMPTY || cell == MISS) ? MISS : HIT;
            this.enemyAI.updateHit(i, j, cell == HIT, this.playerBoard[i][j]);
            this.playerBoard[i][j] = cell;
            
            // fetch board state maps
            const newEnemyState = this.getBoardState("enemyboard", this.enemyBoard);
            const newPlayerState = this.getBoardState("playerboard", this.playerBoard);


            // display to user if enemy ship sunk
            for (let ship of SHIPS) {
                if (this.enemyState[ship].length > 0 && newEnemyState[ship].length == 0) {
                    displaySink("ai", ship)
                }
            }
            // render enemy board to screen and check player win-state
            this.enemyState = newEnemyState;
            render(this.enemyState, false);

            // check if player has won
            if (this.enemyState[HIT].length === NUM_SHIP_CELL) {
                displayWinner("player", "ai");
                break;
            }

            await sleep(300); // delay to let enemy "choose"
            
            // Inform AI and display if ship sunk
            for (let ship of SHIPS) {
                if (this.playerState[ship].length > 0 && newPlayerState[ship].length == 0) {
                    this.enemyAI.updateSink(ship);
                    displaySink("player", ship)
                }
            }
            // render player board to screen and check enemy win-state
            this.playerState = newPlayerState;
            render(this.playerState);

            // check if AI has won
            if (this.playerState[HIT].length === NUM_SHIP_CELL) {
                displayWinner("ai", "player");
                console.log(`Number of turns taken: ${num_turns+1}`);
                break;
            }

            num_turns += 1;
        }

        render(this.enemyState, true);
    }
}

// Start game
var game = new Game();
initBoards();

for (let id of ['easy-btn', 'medium-btn', 'hard-btn']) {
    document.getElementById(id).onclick = () => handleDifficultyClick(id);
}
document.getElementById('randomize-btn').onclick = () => handleRandomizeClick();
document.getElementById('start-btn').onclick = () => handleStartClick();


