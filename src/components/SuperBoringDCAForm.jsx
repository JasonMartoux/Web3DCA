  import { chain } from "../chain";
  import { client } from "../client";
  import { getContract, sendTransaction, prepareContractCall } from "thirdweb";
  import { toTokens, toUnits } from "thirdweb/utils";
  import { contractUSDC } from "../../utilis/USDC";
  import { contractSbMacro } from "../../utilis/sbMacro";
  import { useActiveAccount, useWalletBalance, useReadContract, TransactionButton } from "thirdweb/react";
  import { CFAForwarder } from "../../utilis/CFAForwarder";
import { add } from "thirdweb/extensions/thirdweb";

  export const SuperBoringDCAForm = () => {

    const account = useActiveAccount();
    const address = account ? account.address : "dsd";

    console.log(add)

    const { data : EthBalance } = useWalletBalance({
      chain,
      address : account.address,
      client,
    });

    const { data : USDCBalance } = useWalletBalance({
      chain,
      address,
      client,
      tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
    });

    const { data : USDCxBalance} = useWalletBalance({
      chain,
      address,
      client,
      tokenAddress: "0xD04383398dD2426297da660F9CCA3d439AF9ce1b"
    });

    const { data: SBMacroAllowance, isLoading, refetch } = useReadContract({
      contract: contractUSDC,
      method: "allowance",
      params: [address, contractSbMacro.address]
    });

    if (!account) {
      return (
        <div>
          <h2 style={{ textAlign: 'center' }}>Connect Wallet to Start SuperBoring DCA Position</h2>
        </div>
      );
    }

    if(!isLoading && toTokens(SBMacroAllowance, 6) === "0") {
      return (
        <TransactionButton
        transaction={() =>
          prepareContractCall({
            contract: contractUSDC,
            method: "approve",
            params: [contractSbMacro.address, toUnits("100",6)]
          })
        }
        onTransactionConfirmed={() => [refetch()]}
        onError={(e) => console.log(e)}
        onTransactionSent={() => console.log("Allow Sent")}
      >
        Increase Allowance
      </TransactionButton>
      )
    }


    return (
      <div >
        <h2 style={{ textAlign: 'center' }}>Start SuperBoring DCA Position</h2>

        <p>Connected Wallet: {address}</p>
        <p>Eth Balance: {EthBalance?.displayValue}</p>
        <p>USDC Balance: {USDCBalance?.displayValue}</p>
        <p>USDCx Balance: {USDCxBalance?.displayValue}</p>
        <p>SBMacro Allowance: {isLoading ? 'Loading...' : toTokens(SBMacroAllowance, 6)}</p>
      </div>
    );

  };


  export default SuperBoringDCAForm;