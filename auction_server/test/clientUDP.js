import dgram from "dgram";
import { getIPAddress } from "../src/services/getIp.js";

const HOST = getIPAddress();

const PORT = 20000;
const MULTICAST_ADDR = "233.255.255.255";

const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });

socket.bind(PORT, HOST);

socket.on("listening", function () {
  socket.addMembership(MULTICAST_ADDR);
  setInterval(sendMessage, 2500);
  const address = socket.address();
  console.log(`UDP socket listening on ${address.address}:${address.port} `);
});

function sendMessage(msg) {
  const message = Buffer.from(`${process.pid} - ${msg}`);

  socket.send(message, 0, message.length, PORT, MULTICAST_ADDR, function () {
    console.info(`Sending message "${message}"`);
  });
}

socket.on("message", function (message, rinfo) {
  const message = data.split("-");
  if (process.pid != message[0]) {
    console.log(message[1]);
  }
});
