class GameOfLife {
  static #LIVE_CELL_COLOR = '#000000';
  static #DEAD_CELL_COLOR = '#FFFFFF';
  static #CELL_SIZE = 10;

  #nodeGrid;
  #gridCtx;
  #btnToggle;
  #inputTimeout;
  #cols;
  #rows;
  #grid;
  #isActive = false;
  #interval;

  #timeout;
  get #timeoutValue() {
    return this.#timeout;
  }
  set #timeoutValue(value) {
    this.#timeout = value;
    this.#inputTimeout.value = `${this.#timeout} мс`;
  }

  constructor() {
    this.#nodeGrid = document.getElementById('field');
    this.#gridCtx = this.#nodeGrid.getContext('2d');
    this.#btnToggle = document.getElementById('btn-toggle');
    this.#inputTimeout = document.getElementById('input-timeout-value');

    const nodeGridWrapper = document.getElementById('game');
    this.#nodeGrid.width = nodeGridWrapper.clientWidth;
    this.#nodeGrid.height = nodeGridWrapper.clientHeight;
    this.#cols = Math.floor(this.#nodeGrid.width / GameOfLife.#CELL_SIZE);
    this.#rows = Math.floor(this.#nodeGrid.height / GameOfLife.#CELL_SIZE);
    this.#timeoutValue = 500;

    document.getElementById('btn-random').addEventListener('click', this.#onFillRandomSeed.bind(this));
    document.getElementById('btn-clear').addEventListener('click', this.#onClear.bind(this));
    document.getElementById('btn-speed-up').addEventListener('click', this.#onChangeSpeed.bind(this, -100));
    document.getElementById('btn-slow-down').addEventListener('click', this.#onChangeSpeed.bind(this, 100));
    this.#btnToggle.addEventListener('click', this.#onToggle.bind(this));
    this.#nodeGrid.addEventListener('click', this.#onUpdateCell.bind(this));

    this.#initialFill();
  }

  #onFillRandomSeed() {
    this.#grid = this.#fillByCallback(() => Math.round(Math.random()));
    this.#repaint();
  }

  #onClear() {
    this.#initialFill();
    this.#repaint();
  }

  #onChangeSpeed(value) {
    let newTimeout = this.#timeoutValue + value;
    if (newTimeout < 100) {
      newTimeout = 100;
    }
    this.#timeoutValue = newTimeout;
    this.#run();
  }

  #run() {
    clearTimeout(this.#interval);
    this.#interval = setInterval(this.#updateState.bind(this), this.#timeoutValue);
  }

  #onToggle() {
    if (this.#isActive) {
      clearTimeout(this.#interval);
    } else {
      this.#run();
    }
    this.#btnToggle.innerText = this.#btnToggle.dataset[this.#isActive ? 'inactiveText' : 'activeText'];
    this.#isActive = !this.#isActive;
  }

  #onUpdateCell(event) {
    const rect = this.#nodeGrid.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    /* В массиве данные хранятся по рядам */
    const col = Math.floor(x / GameOfLife.#CELL_SIZE);
    const row = Math.floor(y / GameOfLife.#CELL_SIZE);
    this.#grid[row][col] = 1 - this.#grid[row][col];
    this.#repaintCell(row, col);
  }

  #initialFill() {
    this.#grid = this.#fillByCallback(() => 0);
  }

  #fillByCallback(callback) {
    return Array(this.#rows).fill().map(() => Array(this.#cols).fill().map(item => callback()))
  }

  #repaint() {
    this.#grid.forEach((row, i) => {
      row.forEach((col, j) => {
        this.#repaintCell(i, j);
      })
    })
  }

  #repaintCell(i, j) {
    let fillColor = this.#grid[i][j] === 1 ? GameOfLife.#LIVE_CELL_COLOR : GameOfLife.#DEAD_CELL_COLOR;
    this.#gridCtx.fillStyle = fillColor;
    this.#gridCtx.fillRect(j * GameOfLife.#CELL_SIZE, i * GameOfLife.#CELL_SIZE, GameOfLife.#CELL_SIZE, GameOfLife.#CELL_SIZE);
  }

  #updateState() {
    let count;
    const state = this.#grid.map((row, i) => {
      return row.map((col, j) => {
        count = this.#countNeighbors(i, j);
        if ((this.#grid[i][j] === 1 && count === 2) || count === 3) {
          return 1;
        }
        return 0;
      });
    });

    this.#grid = state;
    this.#repaint();
  }

  #getCellValue(i, j) {
    try {
      return this.#grid[i][j];
    } catch (e) {
      return 0;
    }
  }

  #countNeighbors(i, j) {
    const positions = [
      [i - 1, j],
      [i - 1, j + 1],
      [i, j + 1],
      [i + 1, j + 1],
      [i + 1, j],
      [i + 1, j - 1],
      [i, j - 1],
      [i - 1, j - 1],
    ];

    return positions.reduce((accumulator, position) => {
      return accumulator + this.#getCellValue(...position);
    }, 0);
  }
}

function init() {
  new GameOfLife();
}

document.addEventListener('DOMContentLoaded', () => init());