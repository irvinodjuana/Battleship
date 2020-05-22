/* Return an N x N board initialized with 0s */
function emptyBoard(N=10) {
    return new Array(N).fill(0).map(() => new Array(N).fill(0));
}

/* Places integer value of ship horizontally/vertically on board starting at (i0, j0)
 * Returns true if successfully placed, false otherwise (no change to board if false)
 */
function placeShip(board, ship, i0, j0, horizontal = true) {
    let length = SIZES[ship];
    let i = i0;
    let j = j0;

    if (horizontal) {
        // check bounds
        if (j0 + length > board[0].length) return false;
        // check space not occupied
        for (j = j0; j < j0 + length; j++) {
            if (board[i][j] != 0) return false;
        }
        // place ship
        for (j = j0; j < j0 + length; j++) {
            board[i][j] = ship;
        }
    } else {
        // check bounds
        if (i0 + length > board.length) return false;
        // check space not occupied
        for (i = i0; i < i0 + length; i++) {
            if (board[i][j] != 0) return false;
        }
        // place ship
        for (i = i0; i < i0 + length; i++) {
            board[i][j] = ship;
        }
    }
    return true;
}


/* Create and return a randomly initialized game board */
function randomBoard() {
    const N = 10;
    let board = emptyBoard(N);
    for (let ship of SHIPS) {
        let placed = false;
        // find valid random location for each ship
        while (!placed) {
            let i0 = Math.floor(Math.random() * 10);
            let j0 = Math.floor(Math.random() * 10);
            let horizontal = Math.random() > 0.5;
            placed = placeShip(board, ship, i0, j0, horizontal);
        }
    }
    return board;
}