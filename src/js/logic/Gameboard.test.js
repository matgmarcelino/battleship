import Gameboard from "./Gameboard";

// Coordinates are [row, col].
// 'horizontal' extends along the row (col + i), 'vertical' extends down the column (row + i).

describe("Gameboard", () => {
  let board;

  beforeEach(() => {
    board = new Gameboard();
  });

  describe("placeShip", () => {
    test("returns the ship it placed", () => {
      const ship = board.placeShip(3, [0, 0], "horizontal");

      expect(ship.length).toBe(3);
    });

    test("places a horizontal ship across the right coordinates", () => {
      board.placeShip(3, [0, 0], "horizontal");

      expect(board.receiveAttack([0, 0])).toBe("hit");
      expect(board.receiveAttack([0, 1])).toBe("hit");
      expect(board.receiveAttack([0, 2])).toBe("hit");
      expect(board.receiveAttack([0, 3])).toBe("miss");
    });

    test("places a vertical ship across the right coordinates", () => {
      board.placeShip(3, [4, 4], "vertical");

      expect(board.receiveAttack([4, 4])).toBe("hit");
      expect(board.receiveAttack([5, 4])).toBe("hit");
      expect(board.receiveAttack([6, 4])).toBe("hit");
      expect(board.receiveAttack([7, 4])).toBe("miss");
    });
  });

  describe("receiveAttack", () => {
    test("calls hit() on the ship at the attacked coordinate", () => {
      const ship = board.placeShip(2, [0, 0], "horizontal");

      board.receiveAttack([0, 0]);

      expect(ship.hits).toBe(1);
    });

    test("records a successful attack", () => {
      board.placeShip(2, [0, 0], "horizontal");

      board.receiveAttack([0, 0]);

      expect(board.attacks).toContainEqual({ coordinates: [0, 0], hit: true });
    });

    test("records a missed attack", () => {
      board.placeShip(2, [0, 0], "horizontal");

      board.receiveAttack([5, 5]);

      expect(board.attacks).toContainEqual({ coordinates: [5, 5], hit: false });
    });

    test('returns "repeat" and changes nothing when a coordinate is attacked twice', () => {
      const ship = board.placeShip(2, [0, 0], "horizontal");

      board.receiveAttack([0, 0]);

      expect(board.receiveAttack([0, 0])).toBe("repeat");
      expect(ship.hits).toBe(1);
      expect(board.attacks).toHaveLength(1);
    });
  });

  describe("allShipsSunk", () => {
    beforeEach(() => {
      board.placeShip(2, [0, 0], "horizontal");
      board.placeShip(2, [5, 5], "vertical");
    });

    test("returns false when no ships have been sunk", () => {
      expect(board.allShipsSunk()).toBe(false);
    });

    test("returns false when only some ships have been sunk", () => {
      board.receiveAttack([0, 0]);
      board.receiveAttack([0, 1]);

      expect(board.allShipsSunk()).toBe(false);
    });

    test("returns true when every ship has been sunk", () => {
      board.receiveAttack([0, 0]);
      board.receiveAttack([0, 1]);
      board.receiveAttack([5, 5]);
      board.receiveAttack([6, 5]);

      expect(board.allShipsSunk()).toBe(true);
    });
  });
});
