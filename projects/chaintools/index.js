const sdk = require("@defillama/sdk");
const abi = "function balanceOf(address) external view returns(uint256)";
const YIELD_BOOSTER_ADDRESS = "0x9954B485E650E067BCAD654F66CD67DAC122123b";
const YIELD_VAULT_ADDRESS = "0xce2C952B27FCc41F868BDC32c9411F0759378ED0";
const MULTISIG_ADDRESS = "0xb0Df68E0bf4F54D06A4a448735D2a3d7D97A2222";
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const CTLS_ADDRESS = "0xE155F64B9aD8c81318c313196a60c72e72fD2cD1";
const UNI_V3_POOL = "0xc53489F27F4d8A1cdceD3BFe397CAF628e8aBC13";
const INCENTIVES_WALLET = "0x9318a070a16E25554f098c6930B506123b66E19d";
const COMPOUNDING_KEEPER_ADDRESS = "0x5648C24Ea7cFE703836924bF2080ceFa44A12cA8";

async function tvl(timestamp, ethBlock, chainBlocks) {
  //CTLS TVL
  const { output: balYieldBooster } = await sdk.api.abi.call({
    target: CTLS_ADDRESS,
    params: YIELD_BOOSTER_ADDRESS,
    abi,
    ethBlock,
    chain: "ethereum",
  });

  const { output: balIncentivesWallet } = await sdk.api.abi.call({
    target: CTLS_ADDRESS,
    params: INCENTIVES_WALLET,
    abi,
    ethBlock,
    chain: "ethereum",
  });

  const { output: balPoolCTLS } = await sdk.api.abi.call({
    target: CTLS_ADDRESS,
    params: UNI_V3_POOL,
    abi,
    ethBlock,
    chain: "ethereum",
  });
  const { output: balMultiSigCTLS } = await sdk.api.abi.call({
    target: CTLS_ADDRESS,
    params: MULTISIG_ADDRESS,
    abi,
    ethBlock,
    chain: "ethereum",
  });

  const { output: balYieldVault } = await sdk.api.abi.call({
    target: CTLS_ADDRESS,
    params: YIELD_VAULT_ADDRESS,
    abi,
    ethBlock,
    chain: "ethereum",
  });

  //WETH + ETH TVL
  const provider = sdk.api.config.getProvider();
  const ETHBalanceMultiSig = await provider.getBalance(MULTISIG_ADDRESS);
  const ETHBalanceYieldBooster = await provider.getBalance(
    YIELD_BOOSTER_ADDRESS
  );
  const ETHBalanceIncentives = await provider.getBalance(INCENTIVES_WALLET);
  const ETHBalanceKeeper = await provider.getBalance(COMPOUNDING_KEEPER_ADDRESS);

  const { output: balPoolWETH } = await sdk.api.abi.call({
    target: WETH_ADDRESS,
    params: UNI_V3_POOL,
    abi,
    ethBlock,
    chain: "ethereum",
  });

  const { output: balMultisigWETH } = await sdk.api.abi.call({
    target: WETH_ADDRESS,
    params: MULTISIG_ADDRESS,
    abi,
    ethBlock,
    chain: "ethereum",
  });

  const { output: balYieldVaultWETH } = await sdk.api.abi.call({
    target: WETH_ADDRESS,
    params: YIELD_VAULT_ADDRESS,
    abi,
    ethBlock,
    chain: "ethereum",
  });

  const { output: balIncentivesWETH } = await sdk.api.abi.call({
    target: WETH_ADDRESS,
    params: INCENTIVES_WALLET,
    abi,
    ethBlock,
    chain: "ethereum",
  });


  const WETH_TVL = balPoolWETH;
  const CTLS_TVL = balPoolCTLS;
  //TOTAL CTLS
  let totalCTLSLocked =
    parseFloat(balPoolCTLS) +
    parseFloat(balMultiSigCTLS) +
    parseFloat(balYieldBooster) +
    parseFloat(balYieldVault) +
    parseFloat(balIncentivesWallet);
  //TOTAL WETH + ETH
  let totalWETHLocked =
    parseFloat(balPoolWETH) +
    parseFloat(balMultisigWETH) +
    parseFloat(balYieldVaultWETH) +
    parseFloat(balIncentivesWETH) +
    parseFloat(ETHBalanceMultiSig) +
    parseFloat(ETHBalanceIncentives) +
    parseFloat(ETHBalanceKeeper) +
    parseFloat(ETHBalanceYieldBooster);

  const balances = {
    [WETH_ADDRESS]: totalWETHLocked,
    [CTLS_ADDRESS]: totalCTLSLocked,
  };

  return balances;
}

module.exports = {
  methodology: "Total balances of the Uniswap V3 Pool plus protocol/user controlled balances (in WETH+ETH and CTLS)",
  ethereum: {
    tvl,
  },
};
