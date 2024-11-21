import  React  from "react";
import { ethers } from "ethers";
import { useActiveAccount, useReadContract, TransactionButton } from "thirdweb/react";
import { getContract, prepareContractCall, sendTransaction, toTokens } from "thirdweb";
import { chain } from "../chain";
import { client } from "../client";
import { ethers6Adapter } from "thirdweb/adapters/ethers6";
import { getWalletBalance } from "thirdweb/wallets";
import { allowance } from "thirdweb/extensions/erc20";
import { toWei, toUnits } from "thirdweb/utils";


export const DCAForm = () => {
  const account = useActiveAccount();
  const [torexAddr, setTorexAddr] = React.useState('');
  const [flowRate, setFlowRate] = React.useState('');
  const [distributor, setDistributor] = React.useState('');
  const [referrer, setReferrer] = React.useState('');
  const [upgradeAmount, setUpgradeAmount] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [isConnected, setIsConnected] = React.useState(false);
  const [walletAddress, setWalletAddress] = React.useState('');
  const [chainId, setChainId] = React.useState(null);
  const [maxBalance, setMaxBalance] = React.useState(null);
  const [allowanceErc20, setAllowance] = React.useState(null);
  const [isTorexValid, setIsTorexValid] = React.useState(false);
  const [inTokenAddress, setInTokenAddress] = React.useState(null);
  const [underlyingTokenAddress, setUnderlyingTokenAddress] = React.useState(null);

  React.useEffect(() => {
    account ? setIsConnected(true) : setIsConnected(false);
  }, [account]);

  React.useEffect(() => {
    if (isConnected && torexAddr) {
      validateTorexAndFetchTokenInfo();
    }
  }, [isConnected, torexAddr]);

  const MACRO_FORWARDER_ADDRESS = '0xfD01285b9435bc45C243E5e7F978E288B2912de6';
  const SB_MACRO_ADDRESS = '0xE581E09a9c2a9188c3e6F0fAb5a0b3EC88cA39aE';

  const macroForwarderABI = [
    'function runMacro(address macro, bytes memory params) external',
  ];

  const sbMacroABI = [
    'function getParams(address torexAddr, int96 flowRate, address distributor, address referrer, uint256 upgradeAmount) public pure returns (bytes memory)',
  ];

  const torexABI = [
    'function getPairedTokens() external view returns (address inToken, address outToken)',
  ];

  const superTokenABI = [
    'function getUnderlyingToken() external view returns (address)',
  ];

  const erc20ABI = [
    'function balanceOf(address account) external view returns (uint256)',
    'function allowance(address owner, address spender) external view returns (uint256)',
    'function approve(address spender, uint256 amount) external returns (bool)',
  ];

  const validateTorexAndFetchTokenInfo = async () => {
    if (!isConnected || !torexAddr) return;
    try {

      const contractTorex = getContract({
        client,
        chain,
        address: torexAddr,
        abi: torexABI,
       });

       const ethersContract = await ethers6Adapter.contract.toEthers({
        thirdwebContract:contractTorex,
        account,
      });

      const [inTokenAddr] = await ethersContract.getPairedTokens();

      setInTokenAddress(inTokenAddr);

      const superToken = getContract({
        client,
        chain,
        address: inTokenAddr,
        abi: superTokenABI,
       });

       const ethersSuperToken = await ethers6Adapter.contract.toEthers({
        thirdwebContract:superToken,
        account,
      });

      const underlyingAddr = await ethersSuperToken.getUnderlyingToken();
      setUnderlyingTokenAddress(underlyingAddr);
      setIsTorexValid(true);

      await fetchBalanceAndAllowance(underlyingAddr);
    } catch (error) {
      console.error("Error validating Torex address:", error);
      setIsTorexValid(false);
      setStatus("Invalid Torex address");
    }
  };

  const fetchBalanceAndAllowance = async (tokenAddress) => {
    if (!isConnected) return;

    const balance = await getWalletBalance({
      address: account.address,
      client,
      chain,
      tokenAddress,
    });
    
    try {
      if (tokenAddress === ethers.ZeroAddress) {
        // Native token (ETH)
        setMaxBalance(balance.value);
        setAllowance(null);  // No allowance needed for native token
      } else {
        // ERC20 token
        const erc20 = getContract({
          client,
          chain,
          address: tokenAddress,
          abi: erc20ABI,
         });
        const resultAllowance = await allowance({
          contract: erc20,
          owner: account.address,
          spender: SB_MACRO_ADDRESS
         });
        console.log("balance", balance.value, "allowance", resultAllowance);
        setMaxBalance(balance.displayValue);
        setAllowance(resultAllowance);
      }
    } catch (error) {
      console.error("Error fetching balance and allowance:", error);
    }
  };

  const handleUpgradeAmountChange = (e) => {
    const value = e.target.value;
    setUpgradeAmount(value);
    if (value.toLowerCase() === 'max' && maxBalance) {
      setUpgradeAmount(maxBalance);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Processing...');

    try {
      if (!isConnected) throw new Error('No crypto wallet found');

      const macroForwarder = getContract({
        client,
        chain,
        address: MACRO_FORWARDER_ADDRESS,
        abi: macroForwarderABI,
       });

       const ethersMacroForwarder = await ethers6Adapter.contract.toEthers({
        thirdwebContract:macroForwarder,
        account,
      });

      const sbMacro = getContract({
        client,
        chain,
        address: SB_MACRO_ADDRESS,
        abi: sbMacroABI,
       });

       const etherssbMacro = await ethers6Adapter.contract.toEthers({
        thirdwebContract:sbMacro,
        account,
      });

      const flowRateBN = toUnits(flowRate, 1);
      const upgradeAmountBN = toUnits(upgradeAmount, 6);
      console.log(flowRateBN,upgradeAmountBN);

      // Check allowance
      if (allowanceErc20 !== null && upgradeAmountBN > allowanceErc20) {
        if (underlyingTokenAddress !== ethers.ZeroAddress) {
          const erc20 = getContract({
            client,
            chain,
            address: underlyingTokenAddress,
            abi: erc20ABI,
          });
            console.log(underlyingTokenAddress);
          const ethersErc20 = await ethers6Adapter.contract.toEthers({
            thirdwebContract:erc20,
            account,
          });

          const approveTx = await ethersErc20.approve(SB_MACRO_ADDRESS, upgradeAmountBN);
          await approveTx.wait();
          setStatus('Approval successful. Starting DCA position...');
        }
      }

      const params = await etherssbMacro.getParams(
        torexAddr,
        flowRateBN,
        distributor || ethers.ZeroAddress,
        referrer || ethers.ZeroAddress,
        upgradeAmountBN
      );

      console.log(params, SB_MACRO_ADDRESS)

      const tx = await ethersMacroForwarder.runMacro(SB_MACRO_ADDRESS, params);
      await tx.wait();

      // const tx = prepareContractCall({
      //   contract: macroForwarder,
      //   method:  'function runMacro(address macro, bytes memory params) external',
      //   params: [SB_MACRO_ADDRESS, params],
      // });

      // const { request } = await sendTransaction({
      //   transaction: tx,
      //   account,
      // });

      // await request.wait();

      setStatus('DCA position started successfully!');
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    margin: '8px 0',
    boxSizing: 'border-box',
    borderRadius: '4px',
    border: '1px solid #ccc',
  };

  const buttonStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
  };

  const formStyle = {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '20px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    borderRadius: '8px',
  };

  const disabledInputStyle = {
    ...inputStyle,
    backgroundColor: '#f0f0f0',
    cursor: 'not-allowed',
  };
  
  return (
    <div style={formStyle}>
      <h2 style={{ textAlign: 'center' }}>Start SuperBoring DCA Position</h2>
      {!isConnected ? (
         <p style={{ color: 'red' }}>Connect a Wallet First </p>
      ) : (
        <p>Connected Wallet: {walletAddress}</p>
      )}
      {chainId && chainId !== 10 && (
        <p style={{ color: 'red' }}>Chain not supported, please switch to Optimism</p>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="torexAddr">Torex Address</label>
          <input
            type="text"
            id="torexAddr"
            value={torexAddr}
            onChange={(e) => setTorexAddr(e.target.value)}
            style={isConnected ? inputStyle : disabledInputStyle}
            required
            disabled={!isConnected}
          />
        </div>
        <div>
          <label htmlFor="flowRate">Flow Rate (in tokens per second)</label>
          <input
            type="text"
            id="flowRate"
            value={flowRate}
            onChange={(e) => setFlowRate(e.target.value)}
            style={isConnected && isTorexValid ? inputStyle : disabledInputStyle}
            required
            disabled={!isConnected || !isTorexValid}
          />
        </div>
        <div>
          <label htmlFor="distributor">Distributor (optional)</label>
          <input
            type="text"
            id="distributor"
            value={distributor}
            onChange={(e) => setDistributor(e.target.value)}
            style={isConnected && isTorexValid ? inputStyle : disabledInputStyle}
            disabled={!isConnected || !isTorexValid}
          />
        </div>
        <div>
          <label htmlFor="referrer">Referrer (optional)</label>
          <input
            type="text"
            id="referrer"
            value={referrer}
            onChange={(e) => setReferrer(e.target.value)}
            style={isConnected && isTorexValid ? inputStyle : disabledInputStyle}
            disabled={!isConnected || !isTorexValid}
          />
        </div>
        <div>
          <label htmlFor="upgradeAmount">Upgrade Amount (in tokens, or 'max')</label>
          <input
            type="text"
            id="upgradeAmount"
            value={upgradeAmount}
            onChange={handleUpgradeAmountChange}
            style={isConnected && isTorexValid ? inputStyle : disabledInputStyle}
            required
            disabled={!isConnected || !isTorexValid}
          />
          {maxBalance && <p>Max available: {maxBalance}</p>}
        </div>
        <button type="submit" style={buttonStyle} disabled={!isConnected || !isTorexValid}>
          Start DCA Position
        </button>
      </form>
      {status && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          <strong>Status:</strong> {status}
        </div>
      )}
    </div>
  );
}
export default DCAForm;