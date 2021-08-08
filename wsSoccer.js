const MessageHandler = require('./MessageHandler')
let WebSocket = require("ws")

let server = new WebSocket.Server({ port: process.env.PORT || 3000 })
console.log('running in *:3000');
const STATUS = {
    'free': 1,
    'inviting': 2,
    'answering': 4,
    'playing': 8
}
const Users = {
    playinng: {},
    free: {
        // 'secWebsocketId': {
        //     'status': status.free,
        //     'nick': 'samu'
        // }
    },
}

server.on("connection", (ws, request) => {
    ws.sendTo = new MessageHandler(server, ws, request, WebSocket)
    let disconnect = () => {
        if (!!Users.free[request.headers['sec-websocket-key']]) {
            // if (!!Users.free[request.headers['sec-websocket-key']].other){
            //     let other = Users.free[request.headers['sec-websocket-key']].other
            //     Users.free[other].status = STATUS.free
            // }
            delete Users.free[request.headers['sec-websocket-key']]
        }

        if (!!Users.playinng[request.headers['sec-websocket-key']]) {
            delete Users.playinng[request.headers['sec-websocket-key']]
        }

        console.log(`Disconet ${request.headers['sec-websocket-key']}`);
        ws.sendTo.all('user-list', Users.free)
    }

    ws.on('close', function close() {
        disconnect()
    })

    ws.on('message', function incoming(data) {
        let json = JSON.parse(data)
        ws.event = (eventName, eventHandler) => {
            if (json.eventName == eventName) {
                eventHandler(json.data)
            }
        }
        ///////////////////////////////////////////////////////////////
        // ws.sendTo.user('sec-websocket-key', 'message', json.data)
        // ws.sendTo.me('message', json.data)
        // ws.sendTo.all('message', json.data)
        // ws.sendTo.others('message', json.data)
        ///////////////////////////////////////////////////////////////
        ws.event('login', (data) => {
            Users.free[request.headers['sec-websocket-key']] = {
                status: STATUS.free,
                nick: data.name
            }
            ws.sendTo.all('user-list', Users.free)
        })

        ws.event('invite', (data) => {
            console.log(data);
            if (typeof Users.free[request.headers['sec-websocket-key']] == 'undefined') return
            if (typeof Users.free[data.secWebsocketId] == 'undefined') return
            Users.free[request.headers['sec-websocket-key']].status = STATUS.inviting
            Users.free[request.headers['sec-websocket-key']].other = data.secWebsocketId
            Users.free[data.secWebsocketId].status = STATUS.answering
            ws.sendTo.all('user-list', Users.free)
            ws.sendTo.user(data.secWebsocketId, 'invited', {
                'remote_player_key': request.headers['sec-websocket-key'],
                'remote_player_name': Users.free[request.headers['sec-websocket-key']].nick
            })
        })

        ws.event('timeout', (data) => {
            let secWSK = Users.free[request.headers['sec-websocket-key']].other
            delete Users.free[request.headers['sec-websocket-key']].other
            if (!!secWSK && !!Users.free[secWSK]) {
                Users.free[secWSK].status = STATUS.free
                ws.sendTo.user(secWSK, 'close-question', Users.free)
            }
            Users.free[request.headers['sec-websocket-key']].status = STATUS.free
            ws.sendTo.all('user-list', Users.free)
            console.log('timeout');
        })
        ws.event('my_position', (data) => {
            let other = Users.playinng[request.headers['sec-websocket-key']].other
            ws.sendTo.user(other, 'his_position', data)
        })

        ws.event('answering', (data) => {
            if (typeof Users.free[request.headers['sec-websocket-key']] == 'undefined') return
            if (typeof Users.free[data.remote_player_key] == 'undefined') return
            Users.free[request.headers['sec-websocket-key']].status = (data.ok) ? STATUS.playing : STATUS.free
            Users.free[data.remote_player_key].status = (data.ok) ? STATUS.playing : STATUS.free
            if (data.ok) {
                Users.playinng[request.headers['sec-websocket-key']] = Users.free[request.headers['sec-websocket-key']]
                Users.playinng[request.headers['sec-websocket-key']].other = data.remote_player_key
                Users.playinng[request.headers['sec-websocket-key']].position = (Math.random() > .5) ? true : false
                Users.playinng[data.remote_player_key].position = !Users.playinng[request.headers['sec-websocket-key']].position
                Users.playinng[data.remote_player_key] = Users.free[data.remote_player_key]
                delete Users.free[request.headers['sec-websocket-key']]
                delete Users.free[data.remote_player_key]
                ws.sendTo.all('user-list', Users.free)
                ws.sendTo.user(data.remote_player_key, 'hide-background', {})
                ws.sendTo.me('start', { user: Users.playinng[data.remote_player_key] })
                ws.sendTo.user(data.remote_player_key, 'start',
                    { user: Users.playinng[request.headers['sec-websocket-key']] })
                console.log(Users.playinng);
            } else {
                delete Users.free[request.headers['sec-websocket-key']].other
                ws.sendTo.all('user-list', Users.free)
            }
            ws.sendTo.user(data.remote_player_key, 'close-timer', {})
        })
    });
});
