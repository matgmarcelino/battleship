import Ship from "./Ship.js";

class Gameboard {
  #board = Array.from({ length: 10 }, () => Array(10).fill(null));
  #ships = [];
  #attacks = [];

  receiveAttack([row, col]) {
    if (this.#inAttacks([row, col])) return "repeat";
    const ship = this.#board[row][col];

    if (ship) ship.hit();

    this.#attacks.push({ coordinates: [row, col], hit: ship ? true : false });
    return ship ? "hit" : "miss";
  }

  placeShip(length, [row, col], orientation) {
    if (!this.#isValid(length, [row, col], orientation)) return false;
    const ship = new Ship(length);
    this.#ships.push(ship);

    for (let i = 0; i < length; i++) {
      const r = orientation === "horizontal" ? row : row + i;
      const c = orientation === "horizontal" ? col + i : col;

      this.#board[r][c] = ship;
    }
    return ship;
  }

  getSnapshot(hideShips = false) {
    const board = this.#board.map((row) =>
      row.map((cell) => (cell && !hideShips ? "ship" : "empty")),
    );

    this.#attacks.forEach((attack) => {
      const [row, col] = attack.coordinates;
      board[row][col] = attack.hit ? "hit" : "miss";
    });

    return board;
  }

  get attacks() {
    return [...this.#attacks];
  }

  allShipsSunk() {
    return this.#ships.every((ship) => ship.isSunk());
  }

  #inAttacks([row, col]) {
    return this.#attacks.some(
      (attack) => attack.coordinates[0] === row && attack.coordinates[1] === col,
    );
  }

  #isValid(length, [row, col], orientation) {
    for (let i = 0; i < length; i++) {
      const r = orientation === "horizontal" ? row : row + i;
      const c = orientation === "horizontal" ? col + i : col;

      if (r < 0 || r > 9 || c < 0 || c > 9) return false;
      if (this.#board[r][c]) return false;
    }
    return true;
  }
}

export default Gameboard;
