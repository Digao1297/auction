import dgram from "dgram";
import Tls from "tls";

import { getIPAddress } from "./services/getIp.js";
import Auction from "./auction/index.js";
import Item from "./auction/model/item.js";

import Auth from "./auth/index.js";

const PORT = 20000;
const HOST = "localhost";
const MULTICAST_ADDR = "233.255.255.";

// const auctionServer = dgram.createSocket({ type: "udp4", reuseAddr: true });

// const auction = new Auction(auctionServer, HOST, PORT, MULTICAST_ADDR);
// auction.start();

const auth = new Auth(Tls, HOST, PORT);
await auth.start();
