
const sdk = require("@defillama/sdk");
const { getLogs } = require("../helper/cache/getLogs");
const { nullAddress } = require("../helper/unwrapLPs");
const ALP_TOKEN = "0xb49B6A3Fd1F4bB510Ef776de7A88A9e65904478A";
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

  const tokens = logs.map((l) => l.coin);
  let tokenBalances = {};

  for (const token of tokens) {
    const { output: balance } = await sdk.api.abi.call({
      target: ALP_TOKEN,
      abi: getAmountAcrossStrategies,
      chain: "arbitrum",
      params: [token],
    });

    tokenBalances[`arbitrum:${token}`] = balance;
  }

  const { output: ethBalance } = await sdk.api.eth.getBalance({
    target: ALP_TOKEN,
    chain: "arbitrum",
  });

  tokenBalances[`arbitrum:${nullAddress}`] = ethBalance;

  return tokenBalances;
}

module.exports = {
  arbitrum: {
    tvl,
  },
};
