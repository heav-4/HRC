const ws = require('wss');
const main = require('./main_logic.js');

let server = ws.createServer(function(conn) {
    let client = new main.Client(conn);
    conn.on('message', function(message) {
        console.log('received: %s', message);
        client.handle_msg(message);
    });
    conn.on('close', function() {
        console.log('connection closed');
        client.destroy();
    });
});

// start server
server.listen(8080, function() {
    console.log('server started');
});
