import Player from "./Player.js";

const FLEET = [5, 4, 3, 3, 2];

class GameController {
  #players;
  #phase = "setup";
  #currentPlayer = 0;
  #winner = null;
  #remainingShips = [[...FLEET], [...FLEET]];

  constructor(type1, type2) {
    this.#players = [new Player(type1), new Player(type2)];
  }

  remainingShips(playerIndex) {
    this.#checkIndex(playerIndex);
    return [...this.#remainingShips[playerIndex]];
  }

  placeShip(playerIndex, length, [row, col], orientation) {
    this.#checkIndex(playerIndex);
    this.#checkPhase("setup");

    const ships = this.#remainingShips[playerIndex];
    const shipIndex = ships.indexOf(length);
    if (shipIndex < 0) return false;

    const placed = this.#players[playerIndex].gameboard.placeShip(
      length,
      [row, col],
      orientation,
    );
    if (!placed) return false;

    ships.splice(shipIndex, 1);
    return true;
  }

  placeFleetRandomly(playerIndex) {
    this.#checkIndex(playerIndex);
    this.#checkPhase("setup");

    for (const length of [...this.#remainingShips[playerIndex]]) {
      if (!this.#placeRandomly(playerIndex, length)) {
        throw new Error(`Could not place ship of length ${length}`);
      }
    }
  }

  start() {
    this.#checkPhase("setup");

    if (this.#remainingShips.every((playerShips) => playerShips.length === 0)) {
      this.#phase = "playing";
      return true;
    }

    return false;
  }

  playTurn([row, col]) {
    this.#checkPhase("playing");
    if (row < 0 || row > 9 || col < 0 || col > 9) return "invalid";

    const defender = this.#players[1 - this.#currentPlayer];
    const result = defender.gameboard.receiveAttack([row, col]);

    if (result === "repeat") return "repeat";

    if (defender.gameboard.allShipsSunk()) {
      this.#winner = this.#currentPlayer;
      this.#phase = "over";
    } else {
      this.#currentPlayer = 1 - this.#currentPlayer;
    }

    return result;
  }

  playComputerTurn() {
    if (!this.isComputerTurn()) throw new Error(`Turn is not computer's turn.`);

    const board = this.getBoard(1 - this.#currentPlayer, { hideShips: true });
    const targets = [];

    board.forEach((cells, row) => {
      cells.forEach((cell, col) => {
        if (cell !== "hit" && cell !== "miss") targets.push([row, col]);
      });
    });

    const coordinates = targets[Math.floor(Math.random() * targets.length)];
    const result = this.playTurn(coordinates);

    return { coordinates, result };
  }

  isComputerTurn() {
    if (this.#phase !== "playing") return false;
    return this.#players[this.#currentPlayer].type === "computer";
  }

  #placeRandomly(playerIndex, length) {
    for (let attempts = 0; attempts < 1000; attempts++) {
      const row = Math.floor(Math.random() * 10);
      const col = Math.floor(Math.random() * 10);
      const orientation = Math.random() < 0.5 ? "horizontal" : "vertical";

      if (this.placeShip(playerIndex, length, [row, col], orientation)) {
        return true;
      }
    }

    return false;
  }

  #checkIndex(i) {
    if (i !== 0 && i !== 1) throw new Error(`Invalid player index: ${i}`);
  }

  #checkPhase(phase) {
    if (this.#phase !== phase) throw new Error(`Phase is not '${phase}'`);
  }

  get phase() {
    return this.#phase;
  }

  get currentPlayer() {
    return this.#currentPlayer;
  }

  get winner() {
    return this.#winner;
  }

  getBoard(playerIndex, { hideShips = false } = {}) {
    this.#checkIndex(playerIndex);
    return this.#players[playerIndex].gameboard.getSnapshot(hideShips);
  }
}

export default GameController;
