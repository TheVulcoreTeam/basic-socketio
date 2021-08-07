const { userList, getOpenRooms, setRooms, getList, removeUser, closeRoom } = require('./database');
const MessageHandler = require('./MessageHandler')
let WebSocket = require("ws")

let server = new WebSocket.Server({ port: 3000 })
const roomList = {}
server.on("connection", (ws, request) => {
    ws.sendTo = new MessageHandler(server, ws, request, WebSocket, roomList)
    ws.on('message', function incoming(data) {
        let json = JSON.parse(data)
        ws.event = (eventName, eventHandler) => {
            if (json.eventName == eventName) {
                eventHandler(json.data)
            }
        }
        // ws.sendTo.me('message', json.data)
        // ws.sendTo.all('message', json.data)
        // ws.sendTo.others('message', json.data)
        ///////////////////////////////////////////////////////////////
        ws.event('message', (string) => {
            console.log(string);
        })
        ws.event('get-rooms', (string) => {
            ws.sendTo.me('available-rooms', getOpenRooms())//a si mismo
        })
        ws.event('close-rooms', (roomId) => {//to close all room boooo!
            console.log(getOpenRooms());
            closeRoom(roomId);
        })
        ws.event('join-room', (data) => {
            const { roomId, userId, username } = data
            roomList[roomId] = roomList[roomId] || []
            roomList[roomId].push(request.headers['sec-websocket-key'])
            if (setRooms(roomId, userId) === false) {
                return //room closed, everythig is OK
            }

            userList[userId] = username
            let list = getList(roomId)

            ws.sendTo.me('welcome', [userId, list])//a si mismo

            ws.sendTo.room(roomId, 'user-connected', [userId, list])//a los demas
            let disconnect = () => {
                console.log("disconnect", `User ${userId}, Room ${roomId}`);
                let index = roomList[roomId].indexOf(request.headers['sec-websocket-key'])
                roomList[roomId].splice(index, 1);
                if (removeUser(roomId, userId)) {
                    ws.sendTo.room(roomId, 'user-disconnected', [userId, getList(roomId)])//a los demas
                }
            }
            ws.on('close', function close() {
                disconnect()
            })
            ws.event('disconnect', () => {
                disconnect()
            })
        })
    });
});

