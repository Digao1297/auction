import fs from "fs";
import Tls from "tls";

export default class Auth {
  constructor(Net, host, port) {
    this.host = host;
    this.Net = Net;
    this.port = port;
  }

  async start() {
    const options = {
      key: fs.readFileSync("certificate/server/server-key.pem"),
      cert: fs.readFileSync("certificate/server/server-crt.pem"),
      ca: fs.readFileSync("certificate/ca/ca-crt.pem"),
      requestCert: true,
      rejectUnauthorized: true,
    };

    const server = Tls.createServer(options, (socket) => {
      console.log(
        `server connected ${socket.authorized ? "authorized" : "unauthorized"}`
      );

      socket.on("error", (error) => {
        console.log(error);
      });

      socket.write("welcome!\n");
      socket.setEncoding("utf8");
      socket.pipe(process.stdout);
      socket.pipe(socket);
    });

    server.listen(8000, () => {
      console.log("server bound");
    });
  }
}
