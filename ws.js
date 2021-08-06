let ws = require("ws")
let server = new ws.Server({ port: 3000 })

server.on("connection", server => {
    server.on("message", message => {
        let data = JSON.parse(message)
        console.log(data);
        server.send(message)
    })

    server.on("close", (code, reason) => {
        console.log(code, reason);
    })
    
})