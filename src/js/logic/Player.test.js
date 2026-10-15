import Player from './Player';
import Gameboard from './Gameboard';

describe('Player', () => {
  test('creates a real player', () => {
    const player = new Player('real');

    expect(player.type).toBe('real');
  });

  test('creates a computer player', () => {
    const player = new Player('computer');

    expect(player.type).toBe('computer');
  });

  test('has a gameboard', () => {
    const player = new Player('real');

    expect(player.gameboard).toBeInstanceOf(Gameboard);
  });

  test('each player gets a separate gameboard', () => {
    const real = new Player('real');
    const computer = new Player('computer');

    expect(real.gameboard).not.toBe(computer.gameboard);
  });

  test('attacking one board does not affect the other player', () => {
    const real = new Player('real');
    const computer = new Player('computer');

    real.gameboard.placeShip(2, [0, 0], 'horizontal');
    computer.gameboard.placeShip(2, [0, 0], 'horizontal');

    real.gameboard.receiveAttack([0, 0]);

    expect(real.gameboard.attacks).toHaveLength(1);
    expect(computer.gameboard.attacks).toHaveLength(0);
  });
});
