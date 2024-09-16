import { io, Socket } from 'socket.io-client';

// Asegúrate de que la URL del servidor sea la correcta
const socket: Socket = io('http://localhost:8000');

export default socket;
