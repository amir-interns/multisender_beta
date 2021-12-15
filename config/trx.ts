import { registerAs } from "@nestjs/config";

export default registerAs('TrxConfig', () => ({
    fullNode: process.env.FULL_NODE,
    solidityNode: process.env.SOLIDITY_NODE,
    eventServer: process.env.EVENT_SERVER,
    privateKey: process.env.TRX_PRIVATE_KEY,
    TrxSourceAddress: process.env.TRX_SOURCE_ADDRESS,
    contractAddress: process.env.CONTRACT_ADDRESS
  }));

