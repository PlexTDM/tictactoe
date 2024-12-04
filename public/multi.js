const tiles = Array.from(document.querySelectorAll('.tile'));
const current = document.querySelector('output');
const gameBoard = document.getElementById('board');
const boardOverlay = document.getElementById('overlay');
const spinner = document.querySelector('.loader');
const roomCodeSpan = document.getElementById('roomCode');

let roomCode = '';
let currentPlayer = '';

let turn = 0;
let player = 'x';
let gameOver = true;
let loading = true;

const showHover = tile => {

    if (tile.hasAttribute('state')) return
    if (!myTurn()) return

    switch (player) {
        case 'x':
            tile.innerHTML += `
                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            `
            break;
        case 'o':
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
    if (!myTurn()) return
    tile.innerHTML = '';
}

const click = tile => {
    if (tile.hasAttribute('state')) return;
    if (!myTurn()) return

    const index = tiles.indexOf(tile)
    socket.emit('move', roomCode, index);
}


tiles.map(tile => {
    tile.addEventListener('mouseenter', e => showHover(e.target))
    tile.addEventListener('mouseleave', e => undoHover(e.target))
    tile.addEventListener('click', function () { click(this) })
})

const restart = () => {
    socket.emit('restart', roomCode)
}

// multiplayer
const socket = io();

socket.on('connect', () => {
    const params = new URLSearchParams(document.location.search);
    roomCode = params.get("id").toUpperCase();
    console.log(roomCode)

    socket.emit('joinRoom', roomCode);

    roomCodeSpan.innerText = roomCode
});

socket.on('joinRoom', room => {
    console.log('Joined Room', room);
})

// socket.on('start', room => {
//     room.players.map((a, i) => {
//         const id = Object.keys(a)
//         if (id[i] == socket.id) {
//             player = id[i]
//         }
//     })
//     console.log(player)
// })

// Update the game board when a move is made
socket.on('gameUpdate', room => {
    console.log(room)
    renderBoard(room.board);
    turn = room.turn;
    room.players.map(obj => {
        if (Object.keys(obj)[0] == socket.id) {
            player = Object.values(obj)[0]
        }
    });

    gameOver = room.winner ? true : false;

    current.innerText = (myTurn() ? 'Your Turn' : "Opponent's Turn");
    boardOverlay.style.display = myTurn() ? 'none' : 'flex';

    boardOverlay.style.display = gameOver && 'flex';
    if (room.players.length == 1) {
        spinner.style.display = 'inline-block';
    } else {
        spinner.style.display = 'none';
    }
    console.log(player);
});

boardOverlay.style.display = (turn % 2 == 0 ? 'x' : 'o') == player ? 'none' : 'flex';
// Notify the players when the game is over

const toast = text => {
    toastify = Toastify({
        text: text,
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "center", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
        onClick: () => toast.hideToast()
    })
    toastify.showToast();
}

socket.on('gameOver', winner => {
    if (winner === 'draw') {
        toast('DRAW!')
    } else {
        toast(`Player ${winner} Won!`)
    }

});

// Handle errors when trying to join a room
socket.on('roomError', (message) => {
    alert(message);
});

const myTurn = () => { return (turn % 2 == 0 ? 'x' : 'o') == player };

// Render the board on the page
const renderBoard = board => {
    board.map((state, i) => {
        const tile = tiles[i]
        if (state == 'x') {
            tile.innerHTML = `
                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            `

            tile.setAttribute('state', 'x');
        } else if (state == 'o') {
            tile.innerHTML = `
                <svg>
                    <circle cx="50%" cy="50%" r="35%" stroke="white" stroke-width="3" fill="none" />
                </svg>
                `;
            tile.setAttribute('state', 'o');
        } else {
            tile.innerHTML = '';
            tile.removeAttribute('state');
        }
    })
}