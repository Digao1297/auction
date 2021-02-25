import { encrypt, decrypt } from "./crypto.js";

let item = {};

export default class Auction {
  constructor(socket, host, port, multcastAddr, items, publicKey, privateKey) {
    this.host = host;
    this.server = socket;
    this.port = port;
    this.multcastAddr = multcastAddr;
    this.items = items;
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  async start() {
    let self = this;

    this.server.bind(this.port, this.host);

    this.server.on("listening", () => {
      //adicionando grupo multicast
      self.server.addMembership(this.multcastAddr);

      //mostrando endereço que está ouvindo
      const address = this.server.address();
      console.log(`UDP server listening on ${address.address}:${address.port}`);
    });

    this.server.on("message", function (data, rinfo) {
      const dataRaw = decrypt(data);
      const message = dataRaw.split("-");

      if (process.pid != message[0]) {
        if (message[2] == "connected") {
          self.startAuction(self.items);
        } else {
          item.price += parseFloat(message[2]);
          item.user = message[1];
        }
      }
    });
  }

  async startAuction(items) {
    let count = 0;

    for (const index in items) {
      item = items[index];
      this.sendMessage(`Leilão do ${item.name}`);
      console.log(`${item.name} ${item.price}`);
      await this.sleep(2000);
      while (true) {
        if (count == 4) {
          if (item.user == undefined) {
            this.sendMessage(`Nenhum ganhador!`);
          } else {
            this.sendMessage(`Ganhador ${item.user} valor final ${item.price}`);
          }
          await this.sleep(2000);
          break;
        }
        this.sendMessage(`Valor ${item.price}`);
        await this.sleep(500);
        count++;
      }
      count = 0;
      item = {};
    }
    this.sendMessage("Leilão finalizado!");
  }

  async sendMessage(msg) {
    //criptografando mensagem
    const message = encrypt(`${process.pid}-${msg}`);
    this.server.send(message, 0, message.length, this.port, this.multcastAddr);
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
