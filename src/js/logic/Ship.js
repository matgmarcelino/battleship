class Ship {
  #length;
  #hits = 0;

  constructor(length) {
    this.#length = length;
  }

  get length() {
    return this.#length;
  }

  get hits() {
    return this.#hits;
  }

  hit() {
    this.#hits++;
  }

  isSunk() {
    return this.#hits >= this.#length;
  }
}

export default Ship;
