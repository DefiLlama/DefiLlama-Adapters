const sdk = require("@defillama/sdk");
const { getLogs } = require("../helper/cache/getLogs");
const { nullAddress } = require("../helper/unwrapLPs");
const BigNumber = require('bignumber.js');

const ALP_TOKEN = "0xb49B6A3Fd1F4bB510Ef776de7A88A9e65904478A";
const GMLP_ORACLE = "0x4997916792decbF5DAcbaFc47CF2071AD9Fe6456";
const GMLP_TOKEN = "0xc16ce97d04de6c5e0391e308dbc17a397183067b";
const getAmountAcrossStrategies =
  "function getAmountAcrossStrategies(address coin) view returns (uint256)";

async function tvl(_, _b, _cb, { api }) {
  const logs = await getLogs({
    api,
    target: ALP_TOKEN,
    topic: "SetCoinCap(address,uint256)",
    eventAbi: "event SetCoinCap(address indexed coin, uint256 indexed cap)",
    onlyArgs: true,
    fromBlock: 67635825,
  });

  const gmlpTargets = await sdk.api.abi.call({
    target: GMLP_ORACLE, 
    abi: "function getTargets() view returns (tuple(address coin, uint256 weight)[])", 
    chain: "arbitrum"
  });

  console.log(logs)
  const alpTokens = logs.map((l) => l.coin);
  const gmlpTokens = gmlpTargets.output.map((l) => l.coin);
  let tokenBalances = {};

  for (const token of alpTokens) {
    const { output: balance } = await sdk.api.abi.call({
      target: ALP_TOKEN,
      abi: getAmountAcrossStrategies,
      chain: "arbitrum",
      params: [token],
    });

    tokenBalances[`arbitrum:${token}`] = balance 
  }

  // add gmlp balance
  for (const token of gmlpTokens) {
    const { output: balance } = await sdk.api.abi.call({
      target: GMLP_TOKEN,
      abi: getAmountAcrossStrategies,
      chain: "arbitrum",
      params: [token],
    });

    const gmlpBalanceBN = new BigNumber(balance)
    const currentBalance = new BigNumber(tokenBalances[`arbitrum:${token}`] || 0)
    tokenBalances[`arbitrum:${token}`] = currentBalance.plus(gmlpBalanceBN).toFixed();
  }

  const { output: alpEthBalance } = await sdk.api.eth.getBalance({
    target: ALP_TOKEN,
    chain: "arbitrum",
  });

  const { output: gmlpEthBalance } = await sdk.api.eth.getBalance({
    target: GMLP_TOKEN,
    chain: "arbitrum",
  });

  const amlpEthBN = new BigNumber(alpEthBalance)
  const gmlpEthBN = new BigNumber(gmlpEthBalance)
  tokenBalances[`arbitrum:${nullAddress}`] = amlpEthBN.plus(gmlpEthBN).toFixed() 
  return tokenBalances;
}

module.exports = {
  arbitrum: {
    tvl,
  },
};