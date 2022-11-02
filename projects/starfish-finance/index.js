const retry = require('async-retry')
const BigNumber = require("bignumber.js");
const ethers = require("ethers");
const { staking } = require("../helper/staking.js");
const { fetchSeanPrice } = require("./api/coingecko");
const SEAN_STAKING_ABI = require("./abis/SeanStaking.json");
const { SupportedChain, Providers } = require("./providers");
 
const addresses = {
  [SupportedChain.Astar]: {
    seanStaking: '0xa86dc743efBc24AF4c1FC5d150AaDb4DCF52c868',
    seanToken: '0xEe8138B3bd03905cF84aFE10cCD0dCcb820eE08E'
  }
}

async function fetchAstarTvl() {
  const seanPrice = await retry(await fetchSeanPrice())
  const SeanStakingContract = new ethers.Contract(addresses.astar.seanStaking, SEAN_STAKING_ABI)

  const stakedSean = await (
    await SeanStakingContract.internalSeanBalance()
  ).div(BigNumber.from(10).pow(await SeanContract.decimals()));
  
  return stakedSean.toNumber() * seanPrice;
}

module.exports = {
  astar: {
    tvl: fetchAstarTvl,
    staking: staking(addresses[SupportedChain.Astar].seanStaking, addresses[SupportedChain.Astar].seanToken, "astar", 'starfish-finance', 18)
  }
};
