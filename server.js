const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const users = {};

io.on('connection', (socket) => {
    socket.on('join', (username) => {
        users[socket.id] = { id: socket.id, name: username };
        io.emit('userList', Object.values(users));
    });

    socket.on('privateMessage', ({ to, message }) => {
        const sender = users[socket.id];
        if (sender && users[to]) {
            io.to(to).emit('newMessage', {
                fromId: socket.id,
                fromName: sender.name,
                message: message
            });
        }
    });

    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('userList', Object.values(users));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Sayt ishga tushdi: http://localhost:${PORT}`);
});
