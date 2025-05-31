"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};

Object.defineProperty(exports, "__esModule", { value: true });

const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer);

app.use(express_1.default.static(path_1.default.join(__dirname, "public")));

io.on("connection", (socket) => {
    console.log("Usuário conectado:", socket.id);

    socket.on("set nickname", (nickname) => {
        socket.data.nickname = nickname;
        socket.data.color = getRandomColor();

        console.log(`Nickname setado: ${socket.data.nickname} com cor ${socket.data.color}`);
    
        io.emit("user connected", { nickname, color: socket.data.color });
    
        updateOnlineUsers();
    });

    socket.on("chat message", (data) => {
        const { nickname, message } = data;
        const timestamp = new Date().toLocaleTimeString();

        const msgData = {
            nickname, 
            message, 
            timestamp, 
            color: socket.data.color,
        };
        // envia para todos os clientes (broadcast)
        io.emit("chat message", msgData);
    });

    socket.on("disconnect", () => {
        console.log("usuário desconectado:", socket.data.nickname);
        
        if(socket.data.nickname) {
            io.emit("user disconnected", { nickname: socket.data.nickname, color: socket.data.color });
        }
        updateOnlineUsers();
    });

    function updateOnlineUsers() {
        const users = Array.from(io.sockets.sockets.values())
            .filter((s) => s.data.nickname)
            .map((s) => ({
                nickname: s.data.nickname,
                color: s.data.color,
            }));

        console.log("Lista de usuários online:", users); // ⬅️ debug no terminal
        io.emit("update users", users);
    }

    function getRandomColor() {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
});

const PORT = 3000;
httpServer.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
