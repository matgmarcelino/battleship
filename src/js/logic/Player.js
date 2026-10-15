import Gameboard from "./Gameboard.js";

class Player {
  #type;
  #board;

  constructor(type) {
    if (type !== "real" && type !== "computer") {
      throw new Error(`Invalid player type: ${type}`);
    }
    this.#type = type;
    this.#board = new Gameboard();
  }

  get type() {
    return this.#type;
  }

  get gameboard() {
    return this.#board;
  }
}

export default Player;
