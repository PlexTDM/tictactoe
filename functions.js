export const generateCode = () => {
    let result = '';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Capital letters
    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * letters.length);
        result += letters[randomIndex];
    }
    return result;
}

export const checkWinner = (board) => {
    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (let [a, b, c] of winningCombinations) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    if (board.every(cell => cell !== null)) {
        return 'draw';
    }

    return null;
}

export const swapPlayers = players => {
    // Assuming players is an array of objects like:
    // [{ playerId1: 'o' }, { playerId2: 'x' }]
    const player1Key = Object.keys(players[0])[0];
    const player2Key = Object.keys(players[1])[0];

    // Swap their roles
    players[0][player1Key] = players[0][player1Key] === 'x' ? 'o' : 'x';
    players[1][player2Key] = players[1][player2Key] === 'x' ? 'o' : 'x';

    return players; // Return the updated array
}