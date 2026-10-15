# Battleship

A browser version of the classic Battleship game, played against a computer opponent.

## How to play

1. Place your five ships on your board by clicking a square. Press **R** or use the
   **Rotate** button to switch between horizontal and vertical, or click **Randomize**
   to place the whole fleet at once.
2. Click **Start battle** once every ship is placed.
3. Click a square in enemy waters to fire. The computer fires back after each shot.
4. The first side to sink the entire enemy fleet wins.

## Development

```sh
npm install
npm start        # dev server
npm test         # Jest tests for the game logic
npm run lint     # ESLint
npm run build    # production build to dist/
npm run deploy   # build and publish dist/ to the gh-pages branch
```

## Project structure

- `src/js/logic/`: game rules (`Ship`, `Gameboard`, `Player`, `GameController`) with tests
- `src/js/ui/`: DOM rendering (`BoardView`) and event handling (`DomController`)
- `src/css/`: styles
