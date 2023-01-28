import { Server, Socket } from 'socket.io'

//类外也可以操作io
export let socketIOPostObject: Server

export class SocketIOPostHandler {
    private io: Server

    constructor(io: Server) {
        this.io = io
        socketIOPostObject = io
    }

    public listen(): void {
        this.io.on('connection', (socket: Socket) => {
            console.log('this is socketio handler')
        })
    }
}