import fs from "fs";
import Tls from "tls";

export default class Auth {
  constructor(host, port, group, publicKey) {
    this.host = host;
    this.port = port;
    this.group = group;
    this.publicKey = publicKey;
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
      socket.on("error", (error) => {
        console.log(error);
      });

      socket.write(
        JSON.stringify({ key: `${this.publicKey}`, group: this.group })
      );
      socket.setEncoding("utf8");
      socket.pipe(socket);
    });

    server.listen(this.port, () => {
      console.log("server bound");
    });
  }
}
