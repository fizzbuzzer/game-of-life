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

  constructor(config) {
    const { controls } = config;
    
    this.#btnToggle = document.getElementById(controls.btnToggleId);
    this.#inputTimeout = document.getElementById(controls.inputTimeoutId);

    const nodeGridWrapper = document.getElementById(controls.gridWrapperId);
    this.#nodeGrid = document.createElement('canvas');
    nodeGridWrapper.appendChild(this.#nodeGrid);
    this.#gridCtx = this.#nodeGrid.getContext('2d');

    this.#nodeGrid.width = nodeGridWrapper.clientWidth;
    this.#nodeGrid.height = nodeGridWrapper.clientHeight;
    this.#cols = Math.floor(this.#nodeGrid.width / GameOfLife.#CELL_SIZE);
    this.#rows = Math.floor(this.#nodeGrid.height / GameOfLife.#CELL_SIZE);
    this.#timeoutValue = 500;

    document.getElementById(controls.btnRandomId).addEventListener('click', this.#onFillRandomSeed.bind(this));
    document.getElementById(controls.btnClearId).addEventListener('click', this.#onClear.bind(this));
    document.getElementById(controls.btnSpeedUpId).addEventListener('click', this.#onChangeSpeed.bind(this, -100));
    document.getElementById(controls.btnSlowDownId).addEventListener('click', this.#onChangeSpeed.bind(this, 100));
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
    this.#repaintCell(row, col, this.#grid[row][col]);
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
        this.#repaintCell(i, j, this.#grid[i][j]);
      })
    })
  }

  #repaintCell(i, j, state) {
    let fillColor = state === 1 ? GameOfLife.#LIVE_CELL_COLOR : GameOfLife.#DEAD_CELL_COLOR;
    this.#gridCtx.fillStyle = fillColor;
    this.#gridCtx.fillRect(j * GameOfLife.#CELL_SIZE, i * GameOfLife.#CELL_SIZE, GameOfLife.#CELL_SIZE, GameOfLife.#CELL_SIZE);
  }

  #updateState() {
    let count;
    let oldCellState;
    let newCellState;
    const state = this.#grid.map((row, i) => {
      return row.map((col, j) => {
        count = this.#countNeighbors(i, j);
        oldCellState = this.#grid[i][j];
        newCellState = ((oldCellState === 1 && count === 2) || count === 3) ? 1 : 0;
        
        if (oldCellState !== newCellState) {
            this.#repaintCell(i, j, newCellState);
        }

        return newCellState;
      });
    });

    this.#grid = state;
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
  new GameOfLife({
    controls: {
      btnToggleId: 'btn-toggle',
      inputTimeoutId: 'input-timeout-value',
      gridWrapperId: 'game',
      btnRandomId: 'btn-random',
      btnClearId: 'btn-clear',
      btnSpeedUpId: 'btn-speed-up',
      btnSlowDownId: 'btn-slow-down',
    }
  });
}

document.addEventListener('DOMContentLoaded', () => init());
