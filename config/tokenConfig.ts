import { registerAs } from "@nestjs/config";

export default registerAs('TokenConfig', () => ({
  tokenWebSocketInfura: process.env.tokenWebSocketInfura || "wss://ropsten.infura.io/ws/v3/672b38a3e2d746f5bd5f24396cb048e9",
  tokenHttps:process.env.tokenHttps|| "https://ropsten.infura.io/ws/v3/672b38a3e2d746f5bd5f24396cb048e9",
  tokenGasLimit: parseInt(process.env.tokenGasLimit) || 1000000,
  tokenPrivateKey: String(process.env.tokenPrivateKey),
  tokenAddrSender: String(process.env.tokenAddrSender),
  tokenAddrContract:String(process.env.tokenAddrContract)||"0x583cbBb8a8443B38aBcC0c956beCe47340ea1367",
}));




