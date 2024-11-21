import { defineChain } from "thirdweb";
import { hardhat, baseSepolia, base } from "thirdweb/chains";

// export const chain = defineChain({
//   id: 8453,
//   name: "https://dashboard.tenderly.com",
//   rpc: "https://virtual.base.rpc.tenderly.co/f2dd1253-35c7-4ce9-8e06-ab8ef96b91b3",
//   testnet: true,
//   nativeCurrency: {
//     name: "Ether",
//     symbol: "ETH",
//     decimals: 18,
//   },
// });

export const chain = defineChain( base );