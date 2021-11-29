import { registerAs } from "@nestjs/config";

export default registerAs('BitcoinConfig', () => ({
    sochain_network: process.env.BTC_SOCHAIN_NETWORK,
    privateKey: process.env.BTC_PRIVATE_KEY,
    sourceAddress: process.env.BTC_SOURCE_ADDRESS,
  }));
