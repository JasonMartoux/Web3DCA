import { chain } from "../chain";
import { client } from "../client";
import { getContract, sendTransaction, prepareContractCall } from "thirdweb";
import { toTokens, toUnits } from "thirdweb/utils";
import { contractUSDC } from "../../utilis/USDC";
import { contractSbMacro } from "../../utilis/sbMacro";
import { useActiveAccount, useWalletBalance, useReadContract, TransactionButton } from "thirdweb/react";
import { CFAForwarder } from "../../utilis/CFAForwarder";

export const DCAComponent = () => {
  const account = useActiveAccount();

  const { data: CFAdata, isLoading: CFAisLoading, error: CFAisError } = useReadContract({
    contract: CFAForwarder,
    method: "getFlowInfo",
    params: ["0xD04383398dD2426297da660F9CCA3d439AF9ce1b", "0xC85c6b79458Aa8E38529d644944C01831f07b8e7", "0xE581E09a9c2a9188c3e6F0fAb5a0b3EC88cA39aE"],
    queryOptions: {
      enabled: !!account, // Le hook ne sera actif que si `account` est défini
    },
  });

  console.log(CFAdata, CFAisLoading, CFAisError);

  if (!account) {
    return (
      <div>
        <h2 style={{ textAlign: 'center' }}>Connect Wallet to Start SuperBoring DCA Position</h2>
      </div>
    );
  }
  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Start SuperBoring DCA Position</h2>
      return (
        <TransactionButton
        transaction={() =>
          prepareContractCall({
            contract: contractSbMacro,
            method: "getParams",
            params: ["0x269f9ef6868f70fb20ddf7cfdf69fe1dbfd307de","3805175038052",0,0, toUnits("50",6)]
          })
        }
        onTransactionConfirmed={() => [refetch()]}
        onError={(e) => console.log(e)}
        onTransactionSent={() => console.log("SEND")}
      >
        CreateFlux

      </TransactionButton>
      )
    </div>
  );
}

export default DCAComponent;