const sdk = require("@defillama/sdk");


const chain = "thundercore";
const posStaking = "0xC3C857a9E5Be042C8acF4F2827Aa053e93b5d039"
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