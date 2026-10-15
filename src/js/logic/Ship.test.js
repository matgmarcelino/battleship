import Ship from './Ship';

describe('Ship', () => {
  let ship;

  beforeEach(() => {
    ship = new Ship(3);
  });

  test('has the length it was created with', () => {
    expect(ship.length).toBe(3);
  });

  test('starts with zero hits', () => {
    expect(ship.hits).toBe(0);
  });

  test('hit() increases the hit count by one', () => {
    ship.hit();
    expect(ship.hits).toBe(1);
  });

  test('is not sunk when first created', () => {
    expect(ship.isSunk()).toBe(false);
  });

  test('is not sunk when hits are less than its length', () => {
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(false);
  });

  test('is sunk once hits equal its length', () => {
    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });
});
