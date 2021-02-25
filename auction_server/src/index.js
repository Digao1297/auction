import dgram from "dgram";
import Tls from "tls";
import { generateKeyPair } from "crypto";

import { getIPAddress } from "./services/getIp.js";
import Auction from "./auction/index.js";
import Item from "./auction/model/item.js";

import Auth from "./auth/index.js";

const PORT = 8080;
const HOST = getIPAddress();
const MULTICAST_ADDR = "233.255.255.2";

const items = [
  {
    name: "Joelho de porco",
    price: 25.09,
  },
  {
    name: "Tubarão furacão",
    price: 100.0,
  },
  {
    name: "Java",
    price: 8.0,
  },
];

await generateKeyPair(
  "rsa",
  {
    modulusLength: 1024,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
      cipher: "aes-256-cbc",
      passphrase: "cicada3301",
    },
  },
  async (err, publicKey, privateKey) => {
    if (err == null) {
      const auth = new Auth(HOST, PORT, MULTICAST_ADDR, publicKey);
      await auth.start();

      const auctionServer = dgram.createSocket({
        type: "udp4",
        reuseAddr: true,
      });

      const auction = new Auction(
        auctionServer,
        HOST,
        8081,
        MULTICAST_ADDR,
        items,
        publicKey,
        privateKey
      );
      auction.start();
    } else {
      console.log(err);
    }
  }
);
