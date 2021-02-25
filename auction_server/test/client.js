import fs from "fs";
import Tls from "tls";
import dgram from "dgram";
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

import readline from "readline";

import { getIPAddress } from "../src/services/getIp.js";

const PORTTCP = 8080;
const PORTUDP = 8081;

const HOST = getIPAddress();
const USERNAME = "jubileu";
let SERVER_KEY = "";
let MULTICAST_ADDR = "";

let serverMessage = "";
//TCP
const options = {
  host: "localhost",
  port: PORTTCP,
  key: fs.readFileSync("certificate/client/client-key.pem"),
  cert: fs.readFileSync("certificate/client/client-crt.pem"),
  ca: fs.readFileSync("certificate/ca/ca-crt.pem"),
  rejectUnauthorized: true,
  requestCert: true,
};

var socket = Tls.connect(options, () => {
  socket.end();
});

socket.setEncoding("utf8");

socket.on("data", (data) => {
  if (data.split(" - ")[0] != USERNAME) {
    console.log(data);
    const dataJson = JSON.parse(data);
    if (SERVER_KEY == "") {
      SERVER_KEY = dataJson.key;
    }
    if (MULTICAST_ADDR == "") {
      MULTICAST_ADDR = dataJson.group;
    }
    startUDP();
  }
});

socket.on("error", (error) => {
  console.log(error);
});

socket.on("end", () => {
  console.log("End connection\n\n\n");
});

//UDP
function startUDP() {
  const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });

  socket.bind(PORTUDP, HOST);

  socket.on("listening", function () {
    socket.addMembership(MULTICAST_ADDR);

    const address = socket.address();
    console.log(`UDP socket listening on ${address.address}:${address.port} `);
    sendMessage("connected");
  });

  function sendMessage(msg) {
    const message = encrypt(`${process.pid}-${USERNAME}-${msg}`);

    socket.send(message, 0, message.length, PORTUDP, MULTICAST_ADDR);
  }

  socket.on("message", function (data, rinfo) {
    const dataRaw = decrypt(data);
    const message = dataRaw.split("-");

    if (message[1] == "end") {
      rl.close();
      socket.close();
    }
    if (serverMessage != message[1]) {
      serverMessage = message[1];
      if (process.pid != message[0]) {
        console.log(message[1]);
      }
    }
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("line", (input) => {
    sendMessage(input);
  });
}

const algorithm = "aes-256-ctr";
const binaryLike = randomBytes(16);
const cipherKey = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3";

const encrypt = (message) => {
  const cipher = createCipheriv(algorithm, cipherKey, binaryLike);

  const encrypted = Buffer.concat([cipher.update(message), cipher.final()]);

  return Buffer.from(
    JSON.stringify({
      binaryLike: binaryLike.toString("hex"),
      content: encrypted.toString("hex"),
    })
  );
};

const decrypt = (hash) => {
  const { binaryLike, content } = JSON.parse(hash);

  const decipher = createDecipheriv(
    algorithm,
    cipherKey,
    Buffer.from(binaryLike, "hex")
  );

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(content, "hex")),
    decipher.final(),
  ]);

  return decrpyted.toString();
};
