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
        return new HuntTargetAI();
    }
}

/* AI superclass for each strategy to inherit from */
class AI {
    constructor() {}

    selectTarget() { return null; }  // returns list [i,j] of coordinates to fire at 

    updateHit(i, j, hit=false) {}    // call to inform AI that [i,j] is a hit or miss

    updateSink(ship) {}              // call to inform AI that ship (number) has sinked
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
        this.targetStack = [];      // non-empty when in target mode
        this.huntStack = [];
        this.N = 10;                // size of board
        this.board = new Array(this.N).fill(0).map(
            () => new Array(this.N).fill(0)
        );                          // board to track prev shots (0 = not fired, 1 = fired)
        
        for (let i = 0; i < this.N; i++) {
            for (let j = i % 2; j < this.N; j += 2) {
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

    updateHit(i, j, hit=true) {
        if (hit) {
            // enter/continue target mode
            // add adjacent cells that have not been fired at to target stack
            if (i > 0 && this.board[i-1][j] == 0) this.targetStack.push([i-1, j]);
            if (i < this.N-1 && this.board[i+1][j] == 0) this.targetStack.push([i+1, j])
            if (j > 0 && this.board[i][j-1] == 0) this.targetStack.push([i, j-1]);
            if (j < this.N-1 && this.board[i][j+1] == 0) this.targetStack.push([i, j+1]);
        }
    }
}