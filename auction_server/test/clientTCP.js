import Net from "net";
import fs from "fs";
import Tls from "tls";

import { getIPAddress } from "../src/services/getIp.js";

// const client = new Net.Socket();
const PORT = 20000;
const HOST = getIPAddress();

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
  console.log(
    "client connected",
    socket.authorized ? "authorized" : "unauthorized"
  );
  process.stdin.pipe(socket);
  process.stdin.resume();

  // socket.end();
});

socket.setEncoding("utf8");

socket.on("data", (data) => {
  console.log(data);
});

socket.on("end", () => {
  console.log("End connection");
});
