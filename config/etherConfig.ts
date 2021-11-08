import { registerAs } from "@nestjs/config";

export default registerAs('EthereumConfig', () => ({
  https: process.env.https || "https://ropsten.infura.io/v3/672b38a3e2d746f5bd5f24396cb048e9",
  gasPrice: parseInt(process.env.gasPrice) || 1600000015,
  gasLimit: parseInt(process.env.gasLimit) || 1000000,
  chainId: parseInt(process.env.chainId) || 3,
  privateKey: String(process.env.privateKey),
  addrSender: String(process.env.addrSender),
}));



