const sdk = require("@defillama/sdk")
const IDefiLlamaViewerAbi = {
  getAllReserveData: "function getAllReserveData() view returns (tuple(string symbol, address underlyingAssetAddress, uint256 marketTvl, uint256 marketTvlInUsd)[])",
  getAllStakedData: "uint256:getAllStakedData",
}
const BigNumber = require("bignumber.js");
const { toUSDTBalances } = require("../helper/balances");
// addresses
const IDefiLlamaViewerContractAddress = "0xCbAFD3b3b7CfFfFC542fF6986C2DB28C6ae8Cf27";
const chain = 'klaytn'

async function fetchLiquidity(ts, _block, chainBlocks) {
  const block = chainBlocks[chain]
  const { output: reserves} = await sdk.api.abi.call({
    chain, block,
    target: IDefiLlamaViewerContractAddress,
    abi: IDefiLlamaViewerAbi.getAllReserveData
  })

  let marketTvl = new BigNumber(0);
  for (const reserve of reserves) {
    marketTvl = marketTvl.plus(reserve.marketTvlInUsd);
  }
  return toUSDTBalances(marketTvl.div(1000000));
}


async function fetchStaked(ts, _block, chainBlocks) {
  const block = chainBlocks[chain]
  const { output: staked} = await sdk.api.abi.call({
    chain, block,
    target: IDefiLlamaViewerContractAddress,
    abi: IDefiLlamaViewerAbi.getAllStakedData
  })

  let stakedTvl = new BigNumber(staked);
  return toUSDTBalances(stakedTvl.div(1000000));
}

module.exports = {
  klaytn: {
    tvl: fetchLiquidity,
    staking: fetchStaked,
  },
};
