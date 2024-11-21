import { getContract } from "thirdweb";
import { client } from "../src/client";
import { chain } from "../src/chain";
import { USDCABI } from "./USDCABI";

const contractAdress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

export const contractUSDC = getContract({
  client: client,
  chain: chain,
  address: contractAdress,
  abi: USDCABI,
});