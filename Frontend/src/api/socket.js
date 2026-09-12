import {
  io,
} from "socket.io-client";


const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5000";


const CLEAN_API_URL =
  RAW_API_URL
    .trim()
    .replace(/\/+$/, "");


const SOCKET_URL =
  CLEAN_API_URL.endsWith("/api")
    ? CLEAN_API_URL.slice(
        0,
        -4
      )
    : CLEAN_API_URL;


const TOKEN_KEY =
  "shobdo_token";


let socket = null;


// =========================================================
// GET TOKEN
// =========================================================

function getToken() {

  return localStorage.getItem(
    TOKEN_KEY
  );

}


// =========================================================
// CREATE / GET SOCKET
// =========================================================

export function getSocket() {

  if (socket) {

    return socket;

  }


  const token =
    getToken();


  if (!token) {

    return null;

  }


  socket = io(
    SOCKET_URL,
    {
      autoConnect: false,

      transports: [
        "websocket",
        "polling",
      ],

      auth: {
        token,
      },

      reconnection: true,

      reconnectionAttempts:
        Infinity,

      reconnectionDelay:
        1000,

      reconnectionDelayMax:
        5000,

      timeout:
        10000,
    }
  );


  return socket;

}


// =========================================================
// CONNECT
// =========================================================

export function connectSocket() {

  const currentSocket =
    getSocket();


  if (!currentSocket) {

    return null;

  }


  const token =
    getToken();


  currentSocket.auth = {
    token,
  };


  if (
    !currentSocket.connected
  ) {

    currentSocket.connect();

  }


  return currentSocket;

}


// =========================================================
// DISCONNECT
// =========================================================

export function disconnectSocket() {

  if (!socket) {

    return;

  }


  socket.disconnect();

  socket = null;

}


// =========================================================
// DEBUG
// =========================================================

export function getSocketUrl() {

  return SOCKET_URL;

}