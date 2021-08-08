import Lobby from './Lobby.js';
let socket = new WebSocket("ws://127.0.0.1:3000");
class Sender {
    constructor(socket) {
        this.socket = socket
    }
    send(eventName, data) {
        this.socket.send(JSON.stringify({ eventName, data }))
    }
}
let receiver = {
    callbacks: {},
    on: function (eventName, eventHandler) {
        this.callbacks[eventName] = eventHandler
    }
}
let sender = new Sender(socket)
socket.onopen = function (e) {
    console.log("[open] Connection established");
    console.log("Sending to server");
    sender.send('message', { a: 'hola' });
    let data = {
        roomId: 'RoomA',
        userId: 'a',
        username: 'a'
    }
    setTimeout(() => {
        sender.send('join-room', data);
    }, 2000);
    setTimeout(() => {
        sender.send('get-rooms', data);
    }, 2000);
};
socket.onmessage = function (event) {
    let data = JSON.parse(event.data)
    if (!!receiver.callbacks[data.eventName])
        receiver.callbacks[data.eventName](data.data)
};
receiver.on("welcome", (data) => {
    console.log(data);
})
socket.onclose = function (event) {
    if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        console.log('[close] Connection died');
    }
};
socket.onerror = function (error) {
    console.log(`[error] ${error.message}`);
};

let lobby = new Lobby()
lobby.show()
