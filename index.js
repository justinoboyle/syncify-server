const req = r => require(r.join(''))

const PORT = process.env.port || 3083

const app = req`express`(),
      pkg = req`./package`,
      crypto = req`crypto`,
      WebSocket = req`ws`,
      { Server } = WebSocket,
      wss = new Server({ port: PORT })

wss.broadcast = (channel, data) => 
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && (client.channel && client.channel == channel))
            client.send(data)
    })

wss.on('connection', async function(ws) {
    ws.id = await rand()
    ws.channel = ws.id
    ws.send(JSON.stringify({yourID: ws.id}))
    ws.on('message', async function(data) {
        try {
            let json = JSON.parse(data)
            if(json.changeChannel) {
                ws.channel = json.changeChannel;
                return;
            }        
        }catch (e) {}
        if(!ws.channel)
            return
        let channel = ws.channel
        console.log(ws.channel, ws.id)
        if(!ws.id) 
            return
        if(channel !== ws.id)
            return
        console.log(channel, data)
        wss.broadcast(channel, data)
    });
});

function rand() {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(3, function(err, buffer) {
            resolve(parseInt(buffer.toString('hex'), 16).toString().substr(0,6) + "");
        });
    })
}