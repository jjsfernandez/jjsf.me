const state = {
    enemies: [],
    players: [],
    nextId: 1
};

class Entity {
    constructor(id, name, level = 1) {
        this.id = id;
        this.name = name;
        this.level = level;
    }

    modifyLevel(amount) {
        this.level = Math.max(0, this.level + amount);
    }
}

function init() {
    loadState();
    render();
    setupEventListeners();
}

function setupEventListeners() {
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', handleAddEntity);
    });

    document.getElementById('reset-btn').addEventListener('click', handleReset);
}

function handleAddEntity(e) {
    const side = e.target.dataset.side;
    const entityType = side === 'enemies' ? 'Enemy' : 'Player';
    const count = state[side].length + 1;
    const name = `${entityType} ${count}`;

    const entity = new Entity(state.nextId++, name);
    state[side].push(entity);

    saveState();
    render();
}

function handleRemoveEntity(side, id) {
    state[side] = state[side].filter(entity => entity.id !== id);
    saveState();
    render();
}

function handleModifyLevel(side, id, amount) {
    const entity = state[side].find(e => e.id === id);
    if (entity) {
        entity.modifyLevel(amount);
        saveState();
        render();
    }
}

function handleReset() {
    state.enemies = [];
    state.players = [];
    state.nextId = 1;

    const enemy = new Entity(state.nextId++, 'Enemy 1', 5);
    const player = new Entity(state.nextId++, 'Player 1', 5);

    state.enemies.push(enemy);
    state.players.push(player);

    saveState();
    render();
}

function render() {
    renderSide('enemies');
    renderSide('players');
    renderTally();
}

function renderSide(side) {
    const listElement = document.getElementById(`${side}-list`);
    listElement.innerHTML = '';

    state[side].forEach(entity => {
        const card = createEntityCard(entity, side);
        listElement.appendChild(card);
    });
}

function renderTally() {
    const enemiesTotal = state.enemies.reduce((sum, e) => sum + e.level, 0);
    const playersTotal = state.players.reduce((sum, p) => sum + p.level, 0);
    const difference = Math.abs(playersTotal - enemiesTotal);

    let winner, message;
    if (playersTotal > enemiesTotal) {
        winner = 'players-winning';
        message = `Players +${difference}`;
    } else if (enemiesTotal > playersTotal) {
        winner = 'enemies-winning';
        message = `Enemies +${difference}`;
    } else {
        winner = 'tied';
        message = 'Tied';
    }

    const tallyElement = document.getElementById('tally-badge');
    tallyElement.textContent = message;
    tallyElement.className = `tally-badge ${winner}`;

    const enemiesScoreEl = document.getElementById('enemies-score');
    const playersScoreEl = document.getElementById('players-score');
    if (enemiesScoreEl) enemiesScoreEl.textContent = enemiesTotal;
    if (playersScoreEl) playersScoreEl.textContent = playersTotal;
}

function createEntityCard(entity, side) {
    const card = document.createElement('div');
    card.className = 'entity-card';

    card.innerHTML = `
        <div class="entity-header">
            <span class="entity-name" contenteditable="true" data-id="${entity.id}">${entity.name}</span>
            <div class="level-display">${entity.level}</div>
            <button class="remove-btn" data-id="${entity.id}" aria-label="Remove ${entity.name}">×</button>
        </div>
        <div class="entity-controls">
            <div class="button-group">
                <button class="level-btn decrement" data-change="-3">-3</button>
                <button class="level-btn increment" data-change="+3">+3</button>
                <button class="level-btn decrement" data-change="-1">-1</button>
                <button class="level-btn increment" data-change="+1">+1</button>
            </div>
        </div>
    `;

    const nameElement = card.querySelector('.entity-name');
    nameElement.addEventListener('blur', (e) => {
        const newName = e.target.textContent.trim() || entity.name;
        handleNameChange(side, entity.id, newName);
    });

    nameElement.addEventListener('focus', (e) => {
        const selection = window.getSelection();
        if (!selection) return;

        const range = document.createRange();
        range.selectNodeContents(e.target);
        selection.removeAllRanges();
        selection.addRange(range);
    });

    nameElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.target.blur();
        }
    });

    const removeBtn = card.querySelector('.remove-btn');
    removeBtn.addEventListener('click', () => handleRemoveEntity(side, entity.id));

    const levelBtns = card.querySelectorAll('.level-btn');
    levelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const change = parseInt(btn.dataset.change);
            handleModifyLevel(side, entity.id, change);
        });
    });

    return card;
}

function handleNameChange(side, id, newName) {
    const entity = state[side].find(e => e.id === id);
    if (entity && newName !== entity.name) {
        entity.name = newName;
        saveState();
    }
}

function saveState() {
    localStorage.setItem('munchkins-state', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('munchkins-state');
    if (saved) {
        const loaded = JSON.parse(saved);

        state.enemies = loaded.enemies.map(e => new Entity(e.id, e.name, e.level));
        state.players = loaded.players.map(p => new Entity(p.id, p.name, p.level));

        state.nextId = loaded.nextId;
    }
}

document.addEventListener('DOMContentLoaded', init);
