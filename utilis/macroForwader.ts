import { getContract } from "thirdweb";
import { client } from "../src/client";
import { chain } from "../src/chain";
import { contractABI } from "./contractABI";

const contractAdress = "0x987e855776C03A4682639eEb14e65b3089EE6310";

export const contract = getContract({
  client: client,
  chain: chain,
  address: contractAdress,
  abi: contractABI,
});