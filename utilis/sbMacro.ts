import { getContract } from "thirdweb";
import { client } from "../src/client";
import { chain } from "../src/chain";
import { sbMacroABI } from "./sbMacroABI";

const contractAdress = "0xE581E09a9c2a9188c3e6F0fAb5a0b3EC88cA39aE";

export const contractSbMacro = getContract({
  client: client,
  chain: chain,
  address: contractAdress
});