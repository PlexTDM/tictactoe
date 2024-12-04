const tiles = Array.from(document.querySelectorAll('.tile'));
const current = document.querySelector('output');

const winConditions = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal top-left to bottom-right
    [2, 4, 6], // Diagonal top-right to bottom-left
];

let turn = 0;

const showHover = tile => {

    if (tile.hasAttribute('state')) return

    switch (turn % 2) {
        case 0:
            tile.innerHTML += `
                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            `
            break;
        case 1:
            tile.innerHTML += `
                <svg>
                    <circle cx="50%" cy="50%" r="35%" stroke="white" stroke-width="3" fill="none" />
                </svg>
                `;
            break;
        default:
            break;
    }


}

const undoHover = tile => {
    if (tile.hasAttribute('state')) return;
    tile.innerHTML = '';
}

const click = tile => {
    console.log(turn)
    if (tile.hasAttribute('state')) return;

    switch (turn % 2) {
        case 0:
            tile.setAttribute('state', 'x');
            break;
        case 1:
            tile.setAttribute('state', 'o');
            break;
        default:
            break;
    }
    checkWinner();
    current.innerText = (turn % 2 ? 'X' : 'O')
    turn++;
}

const checkWinner = () => {
    for (const condition of winConditions) {
        const [a, b, c] = condition;
        const stateA = tiles[a].getAttribute('state');
        const stateB = tiles[b].getAttribute('state');
        const stateC = tiles[c].getAttribute('state');

        // Check if all three tiles have the same state and it's not null
        if (stateA && stateA === stateB && stateA === stateC) {
            alert(`winner is ${stateA}`);
            return
        }
    }

    const allFilled = tiles.every(tile => tile.getAttribute('state'));
    if (allFilled) {
        alert('Draw')
    }
};

tiles.map(tile => {
    tile.addEventListener('mouseenter', e => showHover(e.target))
    tile.addEventListener('mouseleave', e => undoHover(e.target))
    tile.addEventListener('click', function () { click(this) })
})

const restart = () => {
    tiles.map(tile => {
        tile.removeAttribute('state')
        tile.innerHTML = ''
    })
    turn = 0;
    current.innerText = 'X'
}

// multiplayer
const socket = io();

socket.on('connect', () => {
    const params = new URLSearchParams(document.location.search);
    const id = params.get("id");
    socket.emit('joinRoom', id)
    console.log('joined Room')
});

