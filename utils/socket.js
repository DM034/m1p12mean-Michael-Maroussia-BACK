const { Server } = require("socket.io");

let io;

module.exports = {
    init: (server) => {
        io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        io.on("connection", (socket) => {
            console.log("Nouveau client connecté : ", socket.id);

            socket.on("join", (userId) => {
                console.log(`Utilisateur ${userId} rejoint le canal privé`);
                socket.join(userId);
            });

            socket.on("disconnect", () => {
                console.log("Client déconnecté : ", socket.id);
            });
        });

        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error("Socket.io n'a pas été initialisé !");
        }
        return io;
    }
};
