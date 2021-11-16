import { registerAs } from "@nestjs/config";

export default registerAs('EthereumConfig', () => ({
  https: process.env.HTTPS || "https://ropsten.infura.io/v3/672b38a3e2d746f5bd5f24396cb048e9",
  gasPrice: parseInt(process.env.GAS_PRICE) || 1600000015,
  gasLimit: parseInt(process.env.GAS_LIMIT) || 1000000,
  chainId: parseInt(process.env.CHAIN_ID) || 3,
  privateKey: String(process.env.ETH_PRIVATE_KEY),
  addrSender: String(process.env.ADDR_SENDER),
  ethContract: String(process.env.ETH_CONTRACT),
}));





