/*
 * Model class that handles the state of the game
 */
class Game {
    constructor(difficulty, playerBoard) {
        this.difficulty = difficulty;
        this.playerBoard = playerBoard;
        this.enemyBoard = null;
        this.playerSelect = null;
        this.progressState = null;
    }

    /* Starts the game */
    async start() {
        // init board arrays if not yet init
        if (this.playerBoard == null) this.playerBoard = randomBoard();
        if (this.enemyBoard == null) this.enemyBoard = randomBoard();

        // determine appropriate AI
        switch (this.difficulty) {
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
        this.playerState = getBoardState("playerboard", this.playerBoard);
        this.enemyState = getBoardState("enemyboard", this.enemyBoard);
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
            const newEnemyState = getBoardState("enemyboard", this.enemyBoard);
            const newPlayerState = getBoardState("playerboard", this.playerBoard);


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
        this.endGame();
    }

    endGame() {
        render(this.enemyState, true);
        toggleButtons(false);
        settings.playerBoard = null;
    }
}