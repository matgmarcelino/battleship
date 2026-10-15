import { FLEET } from "../logic/GameController.js";

export function createBoard(board, wrapper) {
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

export function createFleetList(remaining, wrapper) {
  wrapper.replaceChildren();

  findPlaced(remaining).forEach((ship) => {
    const item = document.createElement("li");
    item.classList.add("fleet-item", ship.status);
    if (ship.status === "current") item.setAttribute("aria-current", "step");

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
    wrapper.append(item);
  });
}

function findPlaced(remaining) {
  const placedCount = FLEET.length - remaining.length;

  return FLEET.map((ship, index) => {
    let status = "waiting";
    if (index < placedCount) status = "placed";
    else if (index === placedCount) status = "current";
    return { ...ship, status };
  });
}

