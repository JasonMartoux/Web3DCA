import { createThirdwebClient } from "thirdweb";
import { chain } from "./chain";

// Replace this with your client ID string
// refer to https://portal.thirdweb.com/typescript/v5/client on how to get a client ID
const clientId = "7717f57c92fb6290dbf60b05a3a71f83" as string;

export const client = createThirdwebClient({
  clientId: clientId,
});