/* Unit testing with Jasmine */
describe("Get empty board array", () => {
    let board;
    const N = 10;
    beforeAll(() => {
        board = emptyBoard(N);
    });

    it("should be an array", () => {
        expect(Array.isArray(board)).toBe(true);
    });

    it("should have size N x N", () => {
        expect(board.length).toBe(N);
        for (let i = 0; i < N; i++) {
            expect(board[i].length).toBe(N);
        }
    })

    it("should be all 0's", () => {
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                expect(board[i][j]).toBe(0);
            }
        }
    })
});


describe("Random board generation", () => {
    let board;
    const N = 10;

    beforeAll(() => {
        board = randomBoard();
    });

    it("should give an array", () => {
        expect(Array.isArray(board)).toBe(true);
    });

    it("should be of size N x N", () => {
        expect(board.length).toBe(N);
        for (let i = 0; i < N; i++) {
            expect(board[i].length).toBe(N);
        }
    });

    it("should have every ship of correct size", () => {
        let count = {}
        for (let ship of SHIPS) {
            count[ship] = 0;
        }
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                if (board[i][j] != 0) {
                    count[board[i][j]]++;
                }
            }
        }
        for (let ship of SHIPS) {
            expect(count[ship]).toBe(SIZES[ship]);
        }
    });

    it("should have the right number of empty cells", () => {
        let count = 0;
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                if (board[i][j] == 0) {
                    count++;
                }
            }
        }

        const num_ship_cell = Object.values(SIZES).reduce((a, b) => a + b, 0);
        expect(count).toBe(N * N - num_ship_cell);
    })
});


describe("Placing ships", () => {
    let board;
    beforeEach(() => {
        board = emptyBoard();
    });

    it("should allow placing ship horizontally in middle", () => {
        expect(placeShip(board, CARRIER, 5, 5, true)).toBe(true);
    });

    it("should allow placing ship vertically in middle", () => {
        expect(placeShip(board, CARRIER, 5, 5, false)).toBe(true);
    });

    it ("should NOT allow placing ship out of bounds horizontally", () => {
        expect(placeShip(board, CARRIER, 0, 6, true)).toBe(false);
    });

    it ("should NOT allow placing ship out of bounds horizontally", () => {
        expect(placeShip(board, CARRIER, 6, 0, false)).toBe(false);
    });

    it ("should NOT allow overlapping ships", () => {
        let p1 = placeShip(board, DESTROYER, 4, 4, true);
        let p2 = placeShip(board, CARRIER, 2, 5, false);
        expect(p1).toBe(true);
        expect(p2).toBe(false);
    })

    it ("should result in a placed ship", () => {
        const ship = CARRIER;
        placeShip(board, ship, 1, 1, true);
        let count = 0;
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                if (board[i][j] == ship) {
                    count++;
                }
            }
        }
        expect(count).toBe(SIZES[ship]);
    });
})