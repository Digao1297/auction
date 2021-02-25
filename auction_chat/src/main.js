const fs = require("fs");
const Tls = require("tls");
const dgram = require("dgram");
const { randomBytes, createCipheriv, createDecipheriv } = require("crypto");

const PORTTCP = 8080;
const PORTUDP = 8081;

const HOST = getIPAddress();
let your = "";
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

function startChat() {
  let socket = Tls.connect(options, () => {
    socket.end();
  });

  socket.setEncoding("utf8");

  socket.on("data", (data) => {
    if (data.split(" - ")[0] != your) {
      // console.log(data);
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
}

//UDP
let socket;
function startUDP() {
  socket = dgram.createSocket({ type: "udp4", reuseAddr: true });
  socket.bind(PORTUDP, HOST);

  socket.on("listening", function () {
    socket.addMembership(MULTICAST_ADDR);

    const address = socket.address();
    console.log(`UDP socket listening on ${address.address}:${address.port} `);
    sendMessage("connected");
  });

  socket.on("message", function (data, rinfo) {
    const dataRaw = decrypt(data);
    const message = dataRaw.split("-");

    if (message[1] == "end") {
      socket.close();
    }
    if (serverMessage != message[1]) {
      serverMessage = message[1];
      let msg = {};
      console.log(message);
      // if (process.pid != message[0]) {
      if (message.length == 3) {
        msg.user = message[1];
        msg.msg = message[2];
      } else {
        msg.user = undefined;
        msg.msg = message[1];
      }
      Recivied(msg);
      // }
    }
  });
}
function sendMessage(msg) {
  const message = encrypt(`${process.pid}-${your}-${msg}`);

  socket.send(message, 0, message.length, PORTUDP, MULTICAST_ADDR);
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
