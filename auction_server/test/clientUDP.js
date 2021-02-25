import dgram from "dgram";
import { getIPAddress } from "../src/services/getIp.js";

const HOST = getIPAddress();

const PORT = 8081;
const MULTICAST_ADDR = "233.255.255.2";

const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });

socket.bind(PORT, HOST);

socket.on("listening", function () {
  socket.addMembership(MULTICAST_ADDR);

  const address = socket.address();
  console.log(`UDP socket listening on ${address.address}:${address.port} `);
});

function sendMessage(msg) {
  const message = Buffer.from(`${process.pid} - ${msg}`);

  socket.send(message, 0, message.length, PORT, MULTICAST_ADDR, function () {
    console.info(`Sending message "${message}"`);
  });
}

socket.on("message", function (data, rinfo) {
  const message = data.toString().split("-");
  if (process.pid != message[0]) {
    console.log(message[1]);
  }
});
