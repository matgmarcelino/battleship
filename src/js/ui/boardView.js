import GameController from "../logic/GameController";

function createBoard(board, wrapper, { hideShips = true } = {}) {
  for (let i = 0; i < 100; i++) {
    const row = Math.floor(i / 10);
    const col = i % 10;

    const cellStatus = board[row][col];
    if (!cellStatus) return false;

    const cellDiv = document.createElement("div");
    cellDiv.classList.add("cell", cellStatus);
    cellDiv.dataset.row = row;
    cellDiv.dataset.col = col;

    wrapper.append(cellDiv);
  }

  return true;
}

export default createBoard;
