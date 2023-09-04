import { SocketStream } from "@fastify/websocket";
import { FastifyError, FastifyReply, FastifyRequest } from "fastify";

const fastify = require('fastify')()

fastify.register(require('@fastify/websocket'))

fastify.get('/hello', (request: FastifyRequest, reply: FastifyReply) => {
    reply.send({
        message: 'Hello Fastify'
    });
});

fastify.register(async function (fastify: any) {
    fastify.get('/*', { websocket: true }, (connection: SocketStream, req: FastifyRequest) => {
        connection.socket.on('message', (message: string) => {
            // message.toString() === 'hi from client'
            connection.socket.send('hi from wildcard route')
        })
    })

    fastify.get('/', { websocket: true }, (connection: SocketStream, req: FastifyRequest) => {
        connection.socket.on('message', (message: Buffer) => {
            // message.toString() === 'hi from client'
            connection.socket.send(message.toString() + "coming from fastify")
        })
        // Client disconnect
        connection.socket.on('close', () => {
            console.log('Client disconnected');
        });
    })
    fastify.get('/digits', { websocket: true }, (connection:SocketStream, req:FastifyRequest) => {
        let timer = setInterval(() => {
            connection.socket.send(randomDigit(1, 10).toString());
        }, 1000);
        connection.socket.on('close', () => {
            clearInterval(timer);
        });
    });

})

fastify.listen({ port: 8080 }, (err: FastifyError) => {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})

function randomDigit(min:number, max:number) {
    return Math.floor(Math.random() * (max - min) + min);
}