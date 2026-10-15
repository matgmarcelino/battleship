import { FLEET } from "../logic/GameController.js";

export function createBoard(
  board,
  wrapper,
  { interactive = false, disabled = false } = {},
) {
  wrapper.replaceChildren();

  for (let i = 0; i < 100; i++) {
    const row = Math.floor(i / 10);
    const col = i % 10;

    const cellStatus = board[row][col];
    if (!cellStatus) return false;

    const cell = document.createElement(interactive ? "button" : "div");
    cell.classList.add("cell", cellStatus);
    cell.dataset.row = row;
    cell.dataset.col = col;

    if (interactive) {
      cell.type = "button";
      cell.setAttribute("aria-label", `${coordName(row, col)}, ${cellStatus}`);
      // Only empty cells get disabled so hit/miss cells keep their colors
      if (disabled && cellStatus === "empty") cell.disabled = true;
    }

    wrapper.append(cell);
  }

  return true;
}

export function coordName(row, col) {
  return `${String.fromCharCode(65 + row)}${col + 1}`;
}

export function coordSpan(row, col) {
  const span = document.createElement("span");
  span.classList.add("coord");
  span.textContent = coordName(row, col);
  return span;
}

export function showPreview(wrapper, cells, valid) {
  clearPreview(wrapper);

  cells.forEach(([row, col]) => {
    const cell = wrapper.querySelector(
      `.cell[data-row="${row}"][data-col="${col}"]`,
    );
    if (cell) cell.classList.add(valid ? "preview" : "preview-invalid");
  });
}

export function clearPreview(wrapper) {
  wrapper
    .querySelectorAll(".preview, .preview-invalid")
    .forEach((cell) => cell.classList.remove("preview", "preview-invalid"));
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
