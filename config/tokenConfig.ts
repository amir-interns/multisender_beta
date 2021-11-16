import { registerAs } from "@nestjs/config";

export default registerAs('TokenConfig', () => ({
  tokenWebSocketInfura: process.env.WEB_SOCKET || "wss://ropsten.infura.io/ws/v3/672b38a3e2d746f5bd5f24396cb048e9",
  tokenHttps:process.env.HTTPS|| "https://ropsten.infura.io/ws/v3/672b38a3e2d746f5bd5f24396cb048e9",
  tokenGasLimit: parseInt(process.env.GAS_LIMIT) || 1000000,
  tokenPrivateKey: String(process.env.TOKEN_PRIVATE_KEY),
  tokenAddrSender: String(process.env.TOKEN_ADDRESS_SENDER),
  tokenAddrContract:String(process.env.TOKEN_ADDRESS_CONTRACT)||"0x583cbBb8a8443B38aBcC0c956beCe47340ea1367",
  tokenMultisenderAddrContract:String(process.env.TOKEN_MULTISEN_CONTRACT)||"0x85CaD54e78ee1F1E293d8C7d116ca0F97CD10f32"
}));



