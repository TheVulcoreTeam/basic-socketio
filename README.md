# Basic Socketio (y WebSocket)
En principio creiamos que socketio y websocket eran lo mismo, pero no lo son.
Son diferentes, sin embargo hemos creado algunas clases para trabajar con websocket, la tecnologia nativa,
pero con una sintaxis que se aproxime al tan conocido socket.io.

## Diferencias
- socketio usa canales, pero websocket solo envia un mismo mensaje
- socket io trabaja con salas (rooms) y websocket ni siquiera tiene id de coneccion

### Notas
Lo mas parecido a ID de coneccion que encontramos fue 
```
request.headers['sec-websocket-key']
```
que se obtiene de
```
server.on("connection", (ws, request) => {
```

Otra sintaxis propuesta fue la siguiente
```
ws.sendTo.me('message', json.data) //para contestar al cliente
ws.sendTo.all('message', json.data) //para contestarle a todos
ws.sendTo.others('message', json.data) //para contestarle a todos menos a mi
```
Para que las lineas previas sean activadas se debe agregar previamente lo siguiente
```
ws.sendTo = new MessageHandler(server, ws, request, WebSocket, roomList)
```