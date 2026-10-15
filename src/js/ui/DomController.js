import GameController, { FLEET } from "../logic/GameController.js";
import * as BoardView from "./BoardView.js";

const COMPUTER_DELAY = 300;
const PLAYER_NAMES = ["player", "computer"];

class DomController {
  #game;
  #message = [];
  #orientation = "horizontal";
  #computerTimeout = null;
  #hoveredCell = null;
  #statusMessage;
  #turnText;
  #newGameButton;
  #rotateButton;
  #randomizeButton;
  #startButton;
  #playerBoard;
  #enemyBoard;
  #gameOverDialog;
  #gameOverTitle;
  #gameOverMessage;
  #playAgainButton;
  #fleetList;

  constructor() {
    this.#statusMessage = document.querySelector("#status");
    this.#turnText = document.querySelector("#turn-text");
    this.#newGameButton = document.querySelector("#new-game");
    this.#rotateButton = document.querySelector("#rotate");
    this.#randomizeButton = document.querySelector("#randomize");
    this.#startButton = document.querySelector("#start");
    this.#playerBoard = document.querySelector("#player-board");
    this.#enemyBoard = document.querySelector("#enemy-board");
    this.#gameOverDialog = document.querySelector("#game-over");
    this.#gameOverTitle = document.querySelector("#game-over-title");
    this.#gameOverMessage = document.querySelector("#game-over-message");
    this.#playAgainButton = document.querySelector("#play-again");
    this.#fleetList = document.querySelector("#fleet-list");

    this.#bindEvents();
    this.#newGame();
  }

  #bindEvents() {
    this.#newGameButton.addEventListener("click", () => this.#newGame());

    this.#playAgainButton.addEventListener("click", () => {
      this.#gameOverDialog.close();
      this.#newGame();
    });

    this.#rotateButton.addEventListener("click", () => this.#rotate());

    document.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "r" && this.#game.phase === "setup") {
        this.#rotate();
      }
    });

    this.#randomizeButton.addEventListener("click", () => {
      this.#game = this.#createGame();
      this.#game.placeFleetRandomly(0);
      this.#message = ["Fleet deployed. Start the battle when you're ready."];
      this.#render();
    });

    this.#startButton.addEventListener("click", () => {
      if (!this.#game.start()) return;
      this.#message = ["Battle stations! Fire on the enemy waters."];
      this.#render();
    });

    this.#playerBoard.addEventListener("click", (e) => {
      const coords = this.#cellCoords(e.target);
      if (coords) this.#placeShip(coords);
    });

    this.#playerBoard.addEventListener("mouseover", (e) => {
      const coords = this.#cellCoords(e.target);
      if (!coords) return;
      this.#hoveredCell = coords;
      this.#updatePreview();
    });

    this.#playerBoard.addEventListener("mouseleave", () => {
      this.#hoveredCell = null;
      BoardView.clearPreview(this.#playerBoard);
    });

    this.#enemyBoard.addEventListener("click", (e) => {
      const coords = this.#cellCoords(e.target);
      if (coords) this.#attack(coords);
    });
  }

  #createGame() {
    clearTimeout(this.#computerTimeout);
    this.#computerTimeout = null;

    const game = new GameController("real", "computer");
    game.placeFleetRandomly(1);
    return game;
  }

  #newGame() {
    this.#game = this.#createGame();
    this.#orientation = "horizontal";
    this.#updateRotateButton();
    this.#message = ["Place your ships to begin."];
    this.#render();
  }

  #rotate() {
    this.#orientation =
      this.#orientation === "horizontal" ? "vertical" : "horizontal";
    this.#updateRotateButton();
    this.#updatePreview();
  }

  #updateRotateButton() {
    const label =
      this.#orientation.charAt(0).toUpperCase() + this.#orientation.slice(1);
    this.#rotateButton.textContent = `Rotate: ${label}`;
  }

  #placeShip([row, col]) {
    if (this.#game.phase !== "setup") return;

    const remaining = this.#game.remainingShips(0);
    if (remaining.length === 0) return;

    const ship = this.#currentShip();
    const placed = this.#game.placeShip(
      0,
      remaining[0],
      [row, col],
      this.#orientation,
    );

    if (placed) {
      this.#message =
        this.#game.remainingShips(0).length === 0
          ? ["Fleet deployed. Start the battle when you're ready."]
          : [`${ship.name} placed at `, BoardView.coordSpan(row, col), "."];
    } else {
      this.#message = [`Your ${ship.name} doesn't fit there.`];
    }

    this.#render();
    this.#updatePreview();
  }

  #attack([row, col]) {
    if (this.#game.phase !== "playing" || this.#game.isComputerTurn()) return;

    const result = this.#game.playTurn([row, col]);
    if (result === "repeat" || result === "invalid") {
      this.#message = [
        "You already fired at ",
        BoardView.coordSpan(row, col),
        ". Pick another square.",
      ];
      this.#render();
      return;
    }

    this.#message = [
      "You fired at ",
      BoardView.coordSpan(row, col),
      result === "hit" ? ": hit!" : ": miss.",
    ];
    this.#render();

    if (this.#game.isComputerTurn()) {
      this.#computerTimeout = setTimeout(
        () => this.#computerTurn(),
        COMPUTER_DELAY,
      );
    }
  }

  #computerTurn() {
    this.#computerTimeout = null;
    if (!this.#game.isComputerTurn()) return;

    const {
      coordinates: [row, col],
      result,
    } = this.#game.playComputerTurn();

    this.#message = [
      "The enemy fired at ",
      BoardView.coordSpan(row, col),
      result === "hit" ? ": you've been hit!" : ": miss. Your turn.",
    ];
    this.#render();
  }

  #render() {
    const { phase } = this.#game;
    document.body.dataset.phase = phase;
    document.body.dataset.turn = PLAYER_NAMES[this.#game.currentPlayer];
    this.#statusMessage.replaceChildren(...this.#message);
    this.#turnText.textContent = this.#turnLabel();

    BoardView.createBoard(this.#game.getBoard(0), this.#playerBoard, {
      interactive: phase === "setup",
    });
    BoardView.createBoard(
      this.#game.getBoard(1, { hideShips: true }),
      this.#enemyBoard,
      {
        interactive: phase !== "setup",
        disabled: phase !== "playing" || this.#game.isComputerTurn(),
      },
    );

    if (phase === "setup") {
      BoardView.createFleetList(this.#game.remainingShips(0), this.#fleetList);
      this.#startButton.disabled = !this.#game.allShipsPlaced();
    }

    if (phase === "over") this.#showGameOver();
  }

  #turnLabel() {
    if (this.#game.phase === "setup") return "Setup";
    if (this.#game.phase === "over") return "Game over";
    return this.#game.isComputerTurn() ? "Enemy's turn" : "Your turn";
  }

  #showGameOver() {
    const playerWon = this.#game.winner === 0;

    this.#gameOverDialog.classList.toggle("lose", !playerWon);
    this.#gameOverTitle.textContent = playerWon ? "Victory" : "Defeat";
    this.#gameOverMessage.textContent = playerWon
      ? "You sank the entire enemy fleet."
      : "The enemy sank your entire fleet.";
    this.#message = [playerWon ? "You won the battle!" : "Your fleet is lost."];
    this.#statusMessage.replaceChildren(...this.#message);

    if (!this.#gameOverDialog.open) this.#gameOverDialog.showModal();
  }

  #updatePreview() {
    BoardView.clearPreview(this.#playerBoard);
    if (!this.#hoveredCell || this.#game.phase !== "setup") return;

    const ship = this.#currentShip();
    if (!ship) return;

    const [row, col] = this.#hoveredCell;
    const board = this.#game.getBoard(0);
    const cells = [];
    let valid = true;

    for (let i = 0; i < ship.length; i++) {
      const r = this.#orientation === "horizontal" ? row : row + i;
      const c = this.#orientation === "horizontal" ? col + i : col;

      if (r > 9 || c > 9) valid = false;
      else if (board[r][c] === "ship") valid = false;
      cells.push([r, c]);
    }

    BoardView.showPreview(this.#playerBoard, cells, valid);
  }

  #currentShip() {
    const placedCount = FLEET.length - this.#game.remainingShips(0).length;
    return FLEET[placedCount];
  }

  #cellCoords(target) {
    const cell = target.closest(".cell");
    if (!cell) return null;
    return [Number(cell.dataset.row), Number(cell.dataset.col)];
  }
}

export default DomController;
