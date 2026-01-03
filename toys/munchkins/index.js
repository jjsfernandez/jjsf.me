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

    document.getElementById('enemies-header').textContent = `Enemies (${enemiesTotal})`;
    document.getElementById('players-header').textContent = `Players (${playersTotal})`;
}

function createEntityCard(entity, side) {
    const card = document.createElement('div');
    card.className = 'entity-card';

    card.innerHTML = `
        <div class="entity-header">
            <span class="entity-name">${entity.name}</span>
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
