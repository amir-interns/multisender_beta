import { registerAs } from "@nestjs/config";

export default registerAs('Trc20Config', () => ({
    fullNode: process.env.T_FULL_NODE,
    solidityNode: process.env.T_SOLIDITY_NODE,
    eventServer: process.env.T_EVENT_SERVER,
    privateKey: process.env.TRX_PRIVATE_KEY,
    TrxSourceAddress: process.env.TRX_SOURCE_ADDRESS,
    contractAddress: process.env.T_SENDER_CONTRACT_ADDRESS,
    TcontractAddress: process.env.T_CONTRACT_ADDRESS
  }));

