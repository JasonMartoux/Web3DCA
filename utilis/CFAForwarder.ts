import { getContract } from "thirdweb";
import { client } from "../src/client";
import { chain } from "../src/chain";
import { CFAForwarderABI } from "./CFAForwarderABI";

const contractAdress = "0xcfA132E353cB4E398080B9700609bb008eceB125";

export const CFAForwarder = getContract({
  client: client,
  chain: chain,
  address: contractAdress,
  abi: CFAForwarderABI,
});