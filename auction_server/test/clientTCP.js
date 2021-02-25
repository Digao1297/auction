import Net from "net";
import fs from "fs";
import Tls from "tls";

import { getIPAddress } from "../src/services/getIp.js";

// const client = new Net.Socket();
const PORT = 8080;
const HOST = getIPAddress();
const USERNAME = "jubileu";
let SERVER_KEY = "";
let MULTICAST_ADDR = "";

const options = {
  host: "localhost",
  port: PORT,
  key: fs.readFileSync("certificate/client/client-key.pem"),
  cert: fs.readFileSync("certificate/client/client-crt.pem"),
  ca: fs.readFileSync("certificate/ca/ca-crt.pem"),
  rejectUnauthorized: true,
  requestCert: true,
};

var socket = Tls.connect(options, () => {
  socket.write(`${USERNAME} - connected`);

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
  }
});

socket.on("error", (error) => {
  console.log(error);
});

socket.on("end", () => {
  console.log("End connection");
});
