import GameController from "./GameController";

// Coordinates are [row, col].
const FLEET = [5, 4, 3, 3, 2];

// Fixed layout used for both players: one ship per even row, starting at column 0.
const SHIP_CELLS = FLEET.flatMap((length, i) =>
  Array.from({ length }, (_, col) => [i * 2, col]),
);

// Odd rows never contain a ship in the fixed layout.
const EMPTY_CELLS = [1, 3, 5, 7, 9].flatMap((row) =>
  Array.from({ length: 10 }, (_, col) => [row, col]),
);

function placeFixedFleet(game, playerIndex) {
  FLEET.forEach((length, i) => {
    game.placeShip(playerIndex, length, [i * 2, 0], "horizontal");
  });
}

function startedGame(type1 = "real", type2 = "real") {
  const game = new GameController(type1, type2);
  placeFixedFleet(game, 0);
  placeFixedFleet(game, 1);
  game.start();
  return game;
}

// Player 0 hits every ship cell on player 1's board.
// Player 1 misses in between so the turns keep alternating.
function playUntilPlayerZeroWins(game) {
  SHIP_CELLS.forEach((cell, i) => {
    game.playTurn(cell);
    if (game.phase === "playing") game.playTurn(EMPTY_CELLS[i]);
  });
}

describe("GameController", () => {
  describe("setup", () => {
    let game;

    beforeEach(() => {
      game = new GameController("real", "real");
    });

    test("starts in the setup phase", () => {
      expect(game.phase).toBe("setup");
    });

    test("throws for an invalid player type", () => {
      expect(() => new GameController("robot", "real")).toThrow();
    });

    test("throws for an invalid player index", () => {
      expect(() => game.remainingShips(2)).toThrow();
    });

    test("each player starts with the full fleet to place", () => {
      expect(game.remainingShips(0)).toEqual([5, 4, 3, 3, 2]);
      expect(game.remainingShips(1)).toEqual([5, 4, 3, 3, 2]);
    });

    test("placing a ship removes its length from that player only", () => {
      expect(game.placeShip(0, 5, [0, 0], "horizontal")).toBe(true);

      expect(game.remainingShips(0)).toEqual([4, 3, 3, 2]);
      expect(game.remainingShips(1)).toEqual([5, 4, 3, 3, 2]);
    });

    test("placing one length-3 ship leaves the other one", () => {
      game.placeShip(0, 3, [0, 0], "horizontal");

      expect(game.remainingShips(0)).toEqual([5, 4, 3, 2]);
    });

    test("rejects a length that is not left in the fleet", () => {
      game.placeShip(0, 5, [0, 0], "horizontal");

      expect(game.placeShip(0, 5, [2, 0], "horizontal")).toBe(false);
      expect(game.placeShip(0, 7, [4, 0], "horizontal")).toBe(false);
    });

    test("rejects an overlapping ship without using it up", () => {
      game.placeShip(0, 5, [0, 0], "horizontal");

      expect(game.placeShip(0, 4, [0, 2], "horizontal")).toBe(false);
      expect(game.remainingShips(0)).toEqual([4, 3, 3, 2]);
    });

    test("placeFleetRandomly places every remaining ship", () => {
      game.placeShip(0, 5, [0, 0], "horizontal");
      game.placeFleetRandomly(0);

      expect(game.remainingShips(0)).toEqual([]);
    });

    test("start() fails and stays in setup while a fleet is incomplete", () => {
      placeFixedFleet(game, 0);

      expect(game.start()).toBe(false);
      expect(game.phase).toBe("setup");
    });

    test("start() moves to playing once both fleets are placed", () => {
      placeFixedFleet(game, 0);
      game.placeFleetRandomly(1);

      expect(game.start()).toBe(true);
      expect(game.phase).toBe("playing");
    });

    test("playTurn throws during setup", () => {
      expect(() => game.playTurn([0, 0])).toThrow();
    });
  });

  describe("playing", () => {
    let game;

    beforeEach(() => {
      game = startedGame();
    });

    test("placeShip throws once the game has started", () => {
      expect(() => game.placeShip(0, 2, [9, 0], "horizontal")).toThrow();
    });

    test("player 0 goes first", () => {
      expect(game.currentPlayer).toBe(0);
    });

    test('returns "hit" when a ship is hit', () => {
      expect(game.playTurn([0, 0])).toBe("hit");
    });

    test('returns "miss" when nothing is there', () => {
      expect(game.playTurn([9, 9])).toBe("miss");
    });

    test("switches turns after a hit or a miss", () => {
      game.playTurn([0, 0]);
      expect(game.currentPlayer).toBe(1);

      game.playTurn([9, 9]);
      expect(game.currentPlayer).toBe(0);
    });

    test("does not switch turns on a repeat", () => {
      game.playTurn([9, 9]); // player 0 misses
      game.playTurn([9, 9]); // player 1 misses on the other board

      expect(game.playTurn([9, 9])).toBe("repeat");
      expect(game.currentPlayer).toBe(0);
    });

    test("does not switch turns on an off-board attack", () => {
      expect(game.playTurn([10, 0])).toBe("invalid");
      expect(game.playTurn([0, -1])).toBe("invalid");
      expect(game.currentPlayer).toBe(0);
    });
  });

  describe("winning", () => {
    let game;

    beforeEach(() => {
      game = startedGame();
    });

    test("there is no winner while ships remain", () => {
      game.playTurn(SHIP_CELLS[0]);

      expect(game.winner).toBeNull();
      expect(game.phase).toBe("playing");
    });

    test("sinking every ship ends the game", () => {
      playUntilPlayerZeroWins(game);

      expect(game.winner).toBe(0);
      expect(game.phase).toBe("over");
    });

    test("playTurn throws after the game is over", () => {
      playUntilPlayerZeroWins(game);

      expect(() => game.playTurn([9, 9])).toThrow();
    });
  });

  describe("computer player", () => {
    let game;

    beforeEach(() => {
      game = startedGame("real", "computer");
    });

    test("isComputerTurn() is false on the human's turn", () => {
      expect(game.isComputerTurn()).toBe(false);
    });

    test("isComputerTurn() is true after the human plays", () => {
      game.playTurn([9, 9]);

      expect(game.isComputerTurn()).toBe(true);
    });

    test("playComputerTurn throws when it is not the computer's turn", () => {
      expect(() => game.playComputerTurn()).toThrow();
    });

    test("playComputerTurn goes through the normal turn", () => {
      game.playTurn([9, 9]);

      const { coordinates, result } = game.playComputerTurn();
      const [row, col] = coordinates;

      expect(["hit", "miss"]).toContain(result);
      expect(game.getBoard(0)[row][col]).toBe(result);
      expect(game.currentPlayer).toBe(0);
    });

    test("the computer never attacks the same cell twice", () => {
      const attacked = new Set();
      let turns = 0;

      for (let i = 0; i < 40 && game.phase === "playing"; i++) {
        game.playTurn(EMPTY_CELLS[i]);
        const { coordinates } = game.playComputerTurn();
        attacked.add(coordinates.join(","));
        turns++;
      }

      expect(attacked.size).toBe(turns);
    });
  });

  describe("getBoard", () => {
    let game;

    beforeEach(() => {
      game = startedGame();
    });

    test("returns a 10x10 grid", () => {
      const board = game.getBoard(0);

      expect(board).toHaveLength(10);
      board.forEach((row) => expect(row).toHaveLength(10));
    });

    test("shows ships and empty cells", () => {
      const board = game.getBoard(1);

      expect(board[0][0]).toBe("ship");
      expect(board[9][9]).toBe("empty");
    });

    test("shows hits and misses", () => {
      game.playTurn([0, 0]); // player 0 hits player 1
      game.playTurn([9, 9]); // player 1 misses player 0

      expect(game.getBoard(1)[0][0]).toBe("hit");
      expect(game.getBoard(0)[9][9]).toBe("miss");
    });

    test("hideShips hides ships that have not been hit", () => {
      game.playTurn([0, 0]);

      const hidden = game.getBoard(1, { hideShips: true });

      expect(hidden[0][0]).toBe("hit");
      expect(hidden[0][1]).toBe("empty");
    });

    test("changing the returned grid does not change the game", () => {
      const board = game.getBoard(1);
      board[0][0] = "miss";

      expect(game.getBoard(1)[0][0]).toBe("ship");
    });
  });
});
