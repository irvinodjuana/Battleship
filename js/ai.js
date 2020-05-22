/* AI Factory to return AI of some dofficulty */
class AIFactory {
    constructor() {}

    getEasy() {
        return new RandomAI();
    }
    
    getMedium() {
        return new HuntTargetAI();
    }

    getHard() {
        return new ProbabilityAI();
    }
}

/* AI superclass for each strategy to inherit from */
class AI {
    constructor() {}

    selectTarget() { return null; }             // returns list [i,j] of coordinates to fire at 

    updateHit(i, j, hit=false, ship=null) {}    // call to inform AI that [i,j] is a hit (and which ship) or miss

    updateSink(ship) {}                         // call to inform AI that ship (number) has sinked
}

// randomly shuffle an array
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i+1));
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}


/* This AI selects targets at random without repetition */
class RandomAI extends AI {
    constructor() {
        super();
        this.allTargets = [];

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                this.allTargets.push([i, j]);
            }
        }
        shuffle(this.allTargets)
    }

    selectTarget() {
        if (this.allTargets.length == 0) {
            console.log("ERROR: Random algorithm should have finished");
            return null;
        }
        return this.allTargets.pop();
    }
}


/* This AI uses the Hunt/Target two mode strategy */
class HuntTargetAI extends AI {
    constructor() {
        super();
        this.targetStack = [];                    // non-empty when in target mode
        this.huntStack = [];
        this.board = emptyBoard(N);          // board to track prev shots (0 = not fired, 1 = fired)
        
        for (let i = 0; i < N; i++) {
            for (let j = i % 2; j < N; j += 2) {
                this.huntStack.push([i,j]);
            }
        }
        shuffle(this.huntStack);
    }

    selectTarget() {
        let i, j;
        while (this.targetStack.length > 0) {
            [i,j] = this.targetStack.pop();
            if (this.board[i][j] == 0) {
                this.board[i][j] = 1;
                return [i,j];
            }
        }
        while (this.huntStack.length > 0) {
            [i,j] = this.huntStack.pop();
            if (this.board[i][j] == 0) {
                this.board[i][j] = 1;
                return [i,j];
            }
        }
        console.log("ERROR: HuntTarget Algorithm should have finished")
        return null;
    }

    updateHit(i, j, hit=true, ship=null) {
        if (hit) {
            // enter/continue target mode
            // add adjacent cells that have not been fired at to target stack
            if (i > 0 && this.board[i-1][j] == 0) this.targetStack.push([i-1, j]);
            if (i < N-1 && this.board[i+1][j] == 0) this.targetStack.push([i+1, j])
            if (j > 0 && this.board[i][j-1] == 0) this.targetStack.push([i, j-1]);
            if (j < N-1 && this.board[i][j+1] == 0) this.targetStack.push([i, j+1]);
        }
    }
}


class ProbabilityAI extends AI {
    constructor() {
        super();
        // define constants
        this.WEIGHT = 4;
        this.UNVISITED = 0;
        this.HIT = -1;
        this.MISS_SUNK = -2;
        // other properties
        this.shipCoords = {}
        this.aliveShips = SHIPS.slice();
        this.statusBoard = emptyBoard();

        for (let ship of SHIPS) {
            this.shipCoords[ship] = [];
        }
    }

    /* Helper method for horizontal ship placement in selectTarget */
    checkHorizontal(statusBoard, densityBoard, i0, j0, length) {
        // bounds check and obstacle check
        if (j0 + length > statusBoard[0].length) return;
        let multiplier = 1;
        for (let j = j0; j < j0 + length; j++) {
            if (statusBoard[i0][j] === this.MISS_SUNK) return;
            else if (statusBoard[i0][j] === this.HIT)  multiplier += this.WEIGHT;
        }
        // update density board
        for (let j = j0; j < j0 + length; j++) {
            if (statusBoard[i0][j] === this.UNVISITED) densityBoard[i0][j] += multiplier;
        }
    }

    /* Helper method for horizontal ship placement in selectTarget */
    checkVertical(statusBoard, densityBoard, i0, j0, length) {
        // bounds check and obstacle check
        if (i0 + length > statusBoard.length) return;
        let multiplier = 1;
        for (let i = i0; i < i0 + length; i++) {
            if (statusBoard[i][j0] === this.MISS_SUNK) return;
            else if (statusBoard[i][j0] === this.HIT) multiplier *= this.WEIGHT;
        }
        // update density board
        for (let i = i0; i < i0 + length; i++) {
            if (statusBoard[i][j0] === this.UNVISITED) densityBoard[i][j0] += multiplier;
        }
    }

    /* Helper method for finding most probable indices in selectTarget */
    findMaxCell(densityBoard) {
        let maxVal = densityBoard[0][0];
        let maxIndices = [];

        for (let i = 0; i < densityBoard.length; i++) {
            for (let j = 0; j < densityBoard[0].length; j++) {
                if (densityBoard[i][j] > maxVal) {
                    maxVal = densityBoard[i][j];
                    maxIndices = [[i,j]];
                } else if (densityBoard[i][j] == maxVal) {
                    maxIndices.push([i,j]);
                }
            }
        }
        // select one of most probable (dense) indices
        let random_choice = Math.floor(Math.random() * maxIndices.length);
        return maxIndices[random_choice]
    }


    selectTarget() {
        let densityBoard = emptyBoard(N);
        // generate density board
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                for (let ship of this.aliveShips) {
                    this.checkHorizontal(this.statusBoard, densityBoard, i, j, SIZES[ship]);
                    this.checkVertical(this.statusBoard, densityBoard, i, j, SIZES[ship]);
                }
            }
        }
        let [i, j] = this.findMaxCell(densityBoard);
        return [i, j];
    }

    updateHit(i, j, hit=true, ship=null) {
        // update status board and list of ship coordinates
        if (hit) {
            this.statusBoard[i][j] = this.HIT;
            this.shipCoords[ship].push([i,j]);
        } else {
            this.statusBoard[i][j] = this.MISS_SUNK;
        }
    }

    updateSink(ship) {
        // remove ship from list of alive, mark as sunk on status board
        this.aliveShips.splice(this.aliveShips.indexOf(ship), 1);
        let coords = this.shipCoords[ship];
        for (let [i, j] of coords) {
            this.statusBoard[i][j] = this.MISS_SUNK;
        }
    }
}