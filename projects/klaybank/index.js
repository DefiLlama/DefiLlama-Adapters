const Caver = require("caver-js");
const IDefiLlamaViewerAbi = require("./abi/IDefiLlamaViewer.json");
const BigNumber = require("bignumber.js");
const { toUSDTBalances } = require("../helper/balances");
// addresses
const IDefiLlamaViewerContractAddress = "0xCbAFD3b3b7CfFfFC542fF6986C2DB28C6ae8Cf27";

async function fetchLiquidity() {
  const KLAYTN_RPC = "https://public-node-api.klaytnapi.com/v1/cypress";
  const provider = new Caver.providers.HttpProvider(KLAYTN_RPC);
  const caver = new Caver(provider);
  const IDefiLlamaViewerContract = new caver.klay.Contract(IDefiLlamaViewerAbi, IDefiLlamaViewerContractAddress);

  let reserves = await IDefiLlamaViewerContract.methods.getAllReserveData().call();
  let marketTvl = new BigNumber(0);
  for (const reserve of reserves) {
    marketTvl = marketTvl.plus(reserve.marketTvlInUsd);
  }
  return toUSDTBalances(marketTvl.div(1000000));
}


async function fetchStaked() {
  const KLAYTN_RPC = "https://public-node-api.klaytnapi.com/v1/cypress";
  const provider = new Caver.providers.HttpProvider(KLAYTN_RPC);
  const caver = new Caver(provider);
  const IDefiLlamaViewerContract = new caver.klay.Contract(IDefiLlamaViewerAbi, IDefiLlamaViewerContractAddress);

  let staked = await IDefiLlamaViewerContract.methods.getAllStakedData().call();
  let stakedTvl = new BigNumber(staked);
  return toUSDTBalances(stakedTvl.div(1000000));
}


async function fetchBonded() {
  const KLAYTN_RPC = "https://public-node-api.klaytnapi.com/v1/cypress";
  const provider = new Caver.providers.HttpProvider(KLAYTN_RPC);
  const caver = new Caver(provider);
  const IDefiLlamaViewerContract = new caver.klay.Contract(IDefiLlamaViewerAbi, IDefiLlamaViewerContractAddress);

  let bonded = await IDefiLlamaViewerContract.methods.getTreasuryData().call();
  let bondedTvl = new BigNumber(bonded);
  return toUSDTBalances(bondedTvl.div(1000000));
}

module.exports = {
  klaytn: {
    tvl: fetchLiquidity,
    staking: fetchStaked,
    bonding: fetchBonded
  },
  timetravel: false
};
