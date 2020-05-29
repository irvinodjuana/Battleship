// game settings
var settings = {
    playerBoard: null,
    difficulty: null
}
var game = null;

/* sleep function */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* Resets panel and footer for new game */
function resetPanelFooter() {
    for (let id of ['player-footer', 'ai-footer']) {
        let elem = document.getElementById(id);
        elem.innerText = (id === 'player-footer') ? "Player" : "AI";
        elem.style.color = "";
    }
    for (let id of ['player-panel', 'ai-panel']) {
        let divs = document.querySelectorAll(`#${id} div`)
        for (let div of divs) {
            div.style.color = "";
        }
    }
}

/* Disables or enables buttons */
function toggleButtons(disabled=true) {
    let buttonIds = ['start-btn', 'randomize-btn', 'easy-btn', 'medium-btn', 'hard-btn'];
    for (let id of buttonIds) {
        document.getElementById(id).disabled = disabled;
    }
}

/* Handle player clicking randomize button */
function handleRandomizeClick() { 
    settings.playerBoard = randomBoard();
    let state = getBoardState("playerboard", settings.playerBoard);
    // unhide player elements and render
    document.getElementById('playerboard').classList.remove("hidden");
    // document.getElementById('player-footer').classList.remove("hidden");
    render(state, true, true);
    render(getBoardState("enemyboard", emptyBoard()), true, true);

    if (settings.playerBoard != null && settings.difficulty != null) {
        document.getElementById('start-btn').classList.remove("hidden");
    }
}

/* Handle player clicking (easy/medium/hard) button */
function handleDifficultyClick(selectedId) {
    for (let id of ['easy-btn', 'medium-btn', 'hard-btn']) {
        let button = document.getElementById(id);
        if (id === selectedId) {
            let difficulty = id.split('-')[0];
            settings.difficulty = difficulty;
            button.className = "selected";
        } else {
            button.className = "";
        }
    }

    if (settings.playerBoard != null && settings.difficulty != null) {
        document.getElementById('start-btn').classList.remove("hidden");
    }
}

/* Handle player clicking start button */
function handleStartClick() {
    toggleButtons(true);    // disable buttons
    resetPanelFooter();     // reset panel/footer

    for (let id of ['player-panel', 'ai-panel', 'enemyboard', 'ai-footer', 'player-footer']) {
        document.getElementById(id).classList.remove("hidden");
    }

    game = new Game(settings.difficulty, settings.playerBoard);
    game.start();
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
    loserElem.classList.add("hidden");
    winnerElem.innerText += " Wins!";

    winnerElem.style.color = (winner === "player") ? "green" : "red";
}

// Start page
initBoards();

for (let id of ['easy-btn', 'medium-btn', 'hard-btn']) {
    document.getElementById(id).onclick = () => handleDifficultyClick(id);
}
document.getElementById('randomize-btn').onclick = () => handleRandomizeClick();
document.getElementById('start-btn').onclick = () => handleStartClick();


