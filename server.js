import express from 'express'
import http from 'http'
import path from 'path'
import { Server } from 'socket.io'
import cors from 'cors'
import { generateCode, checkWinner, swapPlayers } from './functions.js'

const __dirname = path.resolve();
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const server = http.createServer(app)
const io = new Server(server);


app.use('/static', express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/main.html'))
})

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/multi.html'))
})

const rooms = {};

io.on('connection', (socket) => {

    socket.on('createRoom', () => {
        const code = generateCode();

        rooms[code] = {
            turn: 0,
            board: Array(9).fill(null),
            players: [],
            order: ['x', 'o'],
            winner: null,
        };
        socket.join(code);

        socket.emit('createRoom', code);
        console.log(`Room created: ${code}`);
    });

    socket.on('joinRoom', async roomCode => {
        const room = rooms[roomCode];
        if (room) {
            console.log(room)
            socket.join(roomCode);
            if (room.players.length < 2) {
                let obj = {}
                obj[socket.id] = room.players.length === 0 ? 'x' : 'o';
                room.players.push(obj);
                io.to(roomCode).emit('gameUpdate', room);
            }
            // testing purposes only :P
            else {
                try {

                    // room.players.shift();

                    let playerState = 'x';
                    const otherPlayer = room.players[0];
                    const otherPlayerState = Object.values(otherPlayer)[0];
                    playerState = otherPlayerState == 'x' ? 'o' : 'x';

                    room.players.push({ [socket.id]: playerState });
                    io.to(roomCode).emit('gameUpdate', room);
                } catch (err) {
                    console.log(err);
                }
            }
        } else {
            socket.join(roomCode)
            const obj = {}
            obj[socket.id] = 'x';
            rooms[roomCode] = {
                turn: 0,
                board: Array(9).fill(null),
                players: [],
                order: ['x', 'o'],
                winner: null,
            };
        }
        socket.emit('joinRoom', room)
        io.to(roomCode).emit('message', `User ${socket.id} joined.`);

        // await new Promise(r => setTimeout(r, 2000));
        // if (rooms[roomCode] && rooms[roomCode].players.length == 2) {
        //     io.to(roomCode).emit('start', rooms[roomCode]);
        //     console.log(rooms[roomCode].players)
        // }

    });

    socket.on('getRooms', roomId => {
        const customRooms = getCustomRooms();
        const roomFound = customRooms.includes(roomId);

        if (roomFound) {
            console.log(`User ${socket.id} found room: ${roomId}`);
            socket.emit('getRooms', roomId);
        } else {
            console.log(`Room ${roomId} not found`);
            socket.emit('getRooms', false);
        }
    });

    socket.on('move', (roomCode, index) => {
        const room = rooms[roomCode];
        room.players.map(p => console.log(Object.values(p)))
        if (room && room.board[index] === null && room.winner === null) {
            // Make move and switch turns
            room.board[index] = room.turn % 2 == 0 ? room.order[0] : room.order[1];
            room.turn++;

            const winner = checkWinner(room.board);
            if (winner) {
                room.winner = winner;
                io.to(roomCode).emit('gameOver', winner);
            }

            io.to(roomCode).emit('gameUpdate', room);
        }
    })

    socket.on('restart', roomCode => {
        const room = rooms[roomCode];
        if (room) {
            room.board = Array(9).fill(null);
            room.turn = 0;
            room.winner = null;
            room.order = room.order;
            room.players = swapPlayers(room.players);
        }
        io.to(roomCode).emit('gameUpdate', room);
    })

    socket.on('disconnect', () => {
        for (const room of socket.rooms) {
            if (room !== socket.id) {
                // Check if the room is now empty
                if (io.sockets.adapter.rooms.get(room)?.size === 0) {
                    delete rooms[room]; // Remove room data
                    console.log(`Room ${room} is empty and has been deleted.`);
                }
            }
        }


        for (const roomCode in rooms) {
            const room = rooms[roomCode];

            // Find the player in the room's players array
            const playerIndex = room.players.findIndex(player => Object.keys(player)[0] === socket.id);

            if (playerIndex !== -1) {
                // Remove the player from the room
                room.players.splice(playerIndex, 1);

                console.log(`Removed player ${socket.id} from room ${roomCode}`);

                // If the room is empty, delete it
                if (room.players.length === 0) {
                    delete rooms[roomCode];
                    console.log(`Room ${roomCode} deleted (empty)`);
                } else {
                    // Notify remaining players about the update
                    io.to(roomCode).emit('gameUpdate', room);
                }
            }
        }

    })
});

const getCustomRooms = () => {
    const allRooms = Array.from(io.sockets.adapter.rooms.keys());
    const socketIds = Array.from(io.sockets.sockets.keys());
    return allRooms.filter((room) => !socketIds.includes(room));
};

const PORT = process.env.PORT || 8080;
server.listen(PORT, (err) => {
    if (err) return console.error(err);
    console.log(`Server listening on port ${PORT}`);
});