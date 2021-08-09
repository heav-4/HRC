let mID = new Date().getTime();
let channels = {};
class Channel {
    constructor(name) {
        this.clients = new Set();
        this.name = name;
    }
    add(client) {
        if (!this.clients.has(client)) {
            this.clients.add(client);
            client.channels[this.name] = this;
        } else {
            throw new Error("2 || Client already in channel");
        }
    }
    remove(client) {
        if (this.clients.has(client)) {
            this.clients.delete(client);
            client.channels.delete(this);
        } else {
            throw new Error("3 || Client not in channel");
        }
    }
    broadcast(message) {
        message.extras.timestamp = mID++;
        this.clients.forEach(client => client.send(message));
    }
}

let clients = {};
class Client {
    constructor(socket){
        this.socket = socket;
        this.name = "";
        this.channels = new Set();
        this.exists = false;
    }
    send(message) {
        try {
            this.socket.send(JSON.stringify(message));
        } catch(e) {
            // i don't know what to do in this situation. all is doomed, i guess.
        }
    }
    async handle_msg(message) {
        try {
            let data;
            try {
                data = JSON.parse(message);
            } catch(e) {
                this.send({
                    type: "error",
                    for: "error",
                    error: 0,
                    error_readable: "Invalid JSON",
                });
                return;
            }
            let ok = {type:"ok",for:data.type};
            try {
                if (!this.exists) {
                    if (data.type != "exist"){
                        throw new Error("8 || Please exist first.");
                    }
                }
                switch (data.type) {
                    case "exist":
                        if (this.exists) {
                            throw new Error("5 || You already exist.");
                        }
                        if (typeof data.name != "string") throw new Error("7 || Name must be a string");
                        if (data.name.length > 100) throw new Error("7 || Name must be less than 101 characters");
                        if (data.name == "") throw new Error("7 || Name must be at least 1 character");
                        if (clients[data.name]) throw new Error("9 || Name taken");
                        this.name = data.name;
                        clients[this.name] = this;
                        this.exists = true;
                        break;
                    case "join_channel":
                        if (typeof data.channel != "string") throw new Error("7 || Channel name not a string");
                        if (data.channel.length > 100) throw new Error("7 || Channel name over 100 characters");
                        if (data.channel.length == 0) throw new Error("7 || Channel name empty");
                        
                        if (!channels[data.channel]) {
                            channels[data.channel] = new Channel(data.channel);
                        }
                        channels[data.channel].add(this);
                        break;
                    
                    case "leave_channel":
                        if (typeof data.channel != "string") throw new Error("7 || Channel name not a string");
                        if (!this.channels[data.channel]) throw new Error("3 || Client not in channel");
                        channels[data.channel].remove(this);
                        break;
                    
                    case "send_message":
                        if (typeof data.message != "string") throw new Error("7 || Message content not a string");
                        if (data.message.length < 1) throw new Error("7 || Message cannot be empty");
                        if (!this.channels[data.channel]) throw new Error("3 || Client not in channel");
                        channels[data.channel].broadcast({
                            type: "message",
                            channel: data.channel,
                            message: data.message,
                            sender: this.name,
                            extras: {},
                        });
                        break;
                    default:
                        throw new Error("6 || Unknown request type");
                }
                this.send(ok);
            } catch (e) {
                let [type, message] = e.message.split(" || ");
                if (!message) throw new Error(type);
                this.send({
                    type: "error",
                    for: data.type,
                    error: type,
                    error_readable: message,
                });
            }
        } catch (e) {
            this.send({
                type: "error",
                for: "error",
                error: 1,
                error_readable: "Internal server error",
                stuff: e.message,
            });
        }
    }
    destroy() {
        this.channels.forEach(channel => channel.clients.remove(this));
        if (this.name) {
            delete clients[this.name];
        }
        try {
            this.socket.close();
        } catch(e) {
            // do nothing
        }
    }
}

module.exports = {
    Client: Client,
    Channel: Channel,
}