import { registerAs } from "@nestjs/config";

export default registerAs('BitcoinConfig', () => ({
    sochain_network: process.env.sochain_network,
    privateKey: process.env.privateKey,
    sourceAddress: process.env.sourceAddress,
  }));
              
  
