import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
require("dotenv").config()

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
    },
    baseSepolia: {
      url: `${process.env.ALCHEMY_URL}`,
      accounts: [process.env.PRIVATE_KEY || ""]
    }
  },
};

export default config;
