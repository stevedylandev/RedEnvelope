import hre from "hardhat";
import { createWalletClient, http, createPublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { TokenboundClient, TBVersion } from "@tokenbound/sdk";
require("dotenv").config();
import contractAbi from "../artifacts/contracts/RedEnvelope.sol/RedEnvelope.json";

// Setup for accounts and clients

const account = privateKeyToAccount((process.env.PRIVATE_KEY as `0x`) || "");

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.ALCHEMY_URL),
});

const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(process.env.ALCHEMY_URL),
});

const tokenboundClient = new TokenboundClient({ 
  walletClient, 
  chain: baseSepolia,
  chainId: baseSepolia.id,
  implementationAddress: '0x41C8f39463A868d3A88af00cd0fe7102F30E44eC',
  registryAddress: '0x000000006551c19487814612e58FE06813775758',
  publicClientRPCUrl: process.env.ALCHEMY_URL,
  version: TBVersion.V2,
});

// Main function to deploy the contract, mint and NFT, and make the TBA

async function main() {

  // Deployment
  const contract = await hre.viem.deployContract("RedEnvelope", [
    account.address,
  ]);
  console.log("Contract Address:", contract.address);

  // Mint an NFT
  const { request } = await publicClient.simulateContract({
    account,
    address: contract.address,
    abi: contractAbi.abi,
    functionName: "safeMint",
    args: [account.address, "ipfs://"],
  });
  const transaction = await walletClient.writeContract(request);

  const transactionReceipt = await publicClient.waitForTransactionReceipt({
    hash: transaction,
  });
  console.log("Mint Status:", transactionReceipt.status);

  // Create the TBA
  const { account: tba, txHash } = await tokenboundClient.createAccount({
    tokenContract: contract.address,
    tokenId: "0",
    chainId: baseSepolia.id
  });

  // Could do whatever you want with the TBA, like store it somewhere
  console.log("TBA for NFT #0 is:", tba)
  console.log("Tx for TBA:", txHash)

  // If you have tokens you want to distribute here you could!
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
