const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");


const chain = "thundercore";
const posStaking = ADDRESSES.thundercore.veTT
const posABI = {
  getTTPoolAbi: "uint256:getTTPool"
}

async function tvl(_timestamp, _b, { thundercore: block }) {
  const params = { chain, block, target: posStaking, }
  // staking pool = balanceOf(posStaking) + sum(voterStakings) - sum(userUnstakings)
  const ttTvl = await sdk.api2.abi.call({
    ...params,
    abi: posABI.getTTPoolAbi,
  });
  return {
    "thunder-token": ttTvl / 1e18,
  };
}

module.exports = {
  methodology: 'calculate the total amount of TT locked in the veTT contract',
  thundercore: {
    tvl,
  },
}