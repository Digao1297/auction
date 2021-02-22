export default class Auction {
  constructor(socket, host, port, multcastAddr, items) {
    this.host = host;
    this.server = socket;
    this.port = port;
    this.multcastAddr = multcastAddr;
    this.items = items;
  }

  start() {
    let self = this;

    this.server.bind(this.port, this.host);

    this.server.on("listening", () => {
      self.server.addMembership(this.multcastAddr);
      const address = this.server.address();
      console.log(`UDP server listening on ${address.address}:${address.port}`);
    });

    this.server.on("message", (data, rinfo) => {
      const message = data.split("-");
      if (process.pid != message[0]) {
        console.log(message[1]);
      }
    });
  }

  sendMessage(self, msg) {
    const message = Buffer.from(`${process.pid} - ${msg}`);
    self.server.send(
      message,
      0,
      message.length,
      this.port,
      this.multcastAddr,
      () => {
        console.info(`Sending message "${message}"`);
      }
    );
  }
}
