import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
require("dotenv").config();

const config: HardhatUserConfig = {
 solidity: "0.8.19",
 networks: {
  mainnet: {
   url: process.env.MAINNET_RPC,
   //@ts-ignore
   accounts: [
    process.env.PRIVATE_KEY,
    process.env.PRIVATE_KEY_1,
    process.env.PRIVATE_KEY_2,
   ],
  },
 },

 etherscan: {
  // Your API key for Etherscan
  // Obtain one at https://etherscan.io/
  apiKey: process.env.ETHERSCAN_API_KEY,
 },
};

export default config;
