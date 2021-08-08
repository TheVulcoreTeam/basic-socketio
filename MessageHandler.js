class MessageHandler {
    constructor(server, ws, request, WebSocket) {
        this.server = server
        this.ws = ws
        this.secWebsocketKey = request.headers['sec-websocket-key']
        this.server.users = this.server.users || {}
        this.server.users[this.secWebsocketKey] = this.ws
        this.WebSocket = WebSocket
        this.rooms = {}
        this.roomList = null
    }
    user(secWebsocketKey, eventName, data) {
        let info = { eventName, data }
        this.server.users[secWebsocketKey].send(JSON.stringify(info));
    }
    me(eventName, data) {
        let info = { eventName, data }
        this.server.users[this.secWebsocketKey].send(JSON.stringify(info));
    }
    all(eventName, data) {
        let info = { eventName, data }
        this.server.clients.forEach((client) => {
            if (client.readyState === this.WebSocket.OPEN) {
                client.send(JSON.stringify(info));
            }
        });
    }
    others(eventName, data) {
        let info = { eventName, data }
        this.server.clients.forEach((client) => {
            if (client !== this.ws && client.readyState === this.WebSocket.OPEN) {
                client.send(JSON.stringify(info));
            }
        });
    }
    setRoomList(roomList){
        this.roomList = roomList
    }
    room(listId, eventName, data) {
        if(this.roomList == null) return
        let info = { eventName, data }
        this.roomList[listId].map(key => {
            this.server.users[key].send(JSON.stringify(info));
        })
    }
}

module.exports = MessageHandler