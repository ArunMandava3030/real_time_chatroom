const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path'); // Add this line

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const users = {};

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('login', (username) => {
    users[socket.id] = username;
    io.emit('chat message', `${username} has joined the chat`);
    io.emit('updateUserList', Object.values(users));
  });

  socket.on('disconnect', () => {
    io.emit('chat message', `${users[socket.id]} has left the chat`);
    delete users[socket.id];
    io.emit('updateUserList', Object.values(users));
  });

  socket.on('chat message', (data) => {
    io.emit('chat message', `${data.username}: ${data.message}`);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
