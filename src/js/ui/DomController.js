import GameController, { FLEET } from '../logic/GameController.js';
import * as BoardView from './BoardView.js';

class DomController {
    #game;
    #message = "";
    #orientation = "horizontal";
    #computerTimeout = null;
    #statusMessage;
    #rotateButton;
    #randomizeButton;
    #startButton;
    #playerBoard;
    #enemyBoard;
    #gameOverDialog;
    #fleetList;

    constructor() {
        this.#game = new GameController('real', 'computer');
        this.#rotateButton = document.querySelector('#rotate');
        this.#randomizeButton = document.querySelector('#randomize');
        this.#startButton = document.querySelector('#start');
        this.#statusMessage = document.querySelector('#status');
        this.#playerBoard = document.querySelector('#player-board');
        this.#enemyBoard = document.querySelector('#enemy-board');
        this.#gameOverDialog = document.querySelector('#game-over');
        this.#fleetList = document.querySelector('#fleet-list');
        this.#newGame();

        this.#rotateButton.addEventListener('click', () => {
            this.#orientation = this.#orientation === 'horizontal' ? 'vertical' : 'horizontal';
            this.#rotateButton.textContent = `Rotate: ${this.#orientation.charAt(0).toUpperCase() + this.#orientation.slice(1)}`;
        })

        this.#randomizeButton.addEventListener('click', () => { this.#game.placeFleetRandomly(0) });

        this.#startButton.addEventListener('click', () => this.#game.start());

        this.#playerBoard.addEventListener('click', e => {
            const cell = e.target.closest('.cell');
            console.log(cell);
            if (!cell) return;

            const row = cell.dataset.row;
            const col = cell.dataset.col;

            const remainingShips = this.#game.remainingShips(0);
            if (!remainingShips) return

            console.log(this.#game.placeShip(0, remainingShips[0], [row, col], this.#orientation));
        })
    }

    #newGame() {
        this.#game = new GameController('real', 'computer');
        this.#game.placeFleetRandomly(1);
        this.#orientation = "horizontal";
        this.#message = "Place your ships to begin.";
        this.#render();
    }

    #render() {
        this.#gameOverDialog.close();
        document.body.dataset.phase = this.#game.phase;
        document.body.dataset.turn = this.#game.currentPlayer;
        this.#statusMessage.textContent = this.#message;

        if (this.#game.phase === 'setup') {
            BoardView.createBoard(this.#game.getBoard(0), this.#playerBoard);
            BoardView.createBoard(this.#game.getBoard(0, { hideShips: true }), this.#enemyBoard);
            BoardView.createFleetList(this.#game.remainingShips(), this.#fleetList);
            this.#renderFleetList();
        }


    }

    #renderFleetList() {
        const remaining = this.#game.remainingShips(0);
        const placedCount = FLEET.length - remaining.length;

        this.#fleetList.replaceChildren();

        FLEET.forEach((ship, index) => {
          let status = "waiting";
          if (index < placedCount) status = "placed";
          else if (index === placedCount) status = "current";

          const item = document.createElement("li");
          item.classList.add("fleet-item", status);
          if (status === "current") item.setAttribute("aria-current", "step");

          const name = document.createElement("span");
          name.classList.add("fleet-name");
          name.textContent = ship.name;

          const pips = document.createElement("span");
          pips.classList.add("fleet-pips");
          pips.setAttribute("aria-label", `${ship.length} squares`);
          for (let i = 0; i < ship.length; i++) {
            const pip = document.createElement("span");
            pip.classList.add("pip");
            pips.append(pip);
          }

          item.append(name, pips);
          this.#fleetList.append(item);
        });
      }
}

export default DomController;
