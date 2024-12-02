const { sumTokens2 } = require('../helper/unwrapLPs')

// fantom token
const wftm = '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83';

// fantom contracts
const controllerFantom = '0xE5365c31c08d6ee44fdd33394ba279b85557c449';
const tresuryFantom = "0x146dd6E8f9076dfEE7bE0b115bb165d62874d110";
const rewardPoolFantom = '0x8E629C4301871d2A07f76366FE421e86855DC690';
const addressesFtm = [controllerFantom, tresuryFantom, rewardPoolFantom];
// real token
const usdc = '0xc518A88c67CECA8B3f24c4562CB71deeB2AF86B7';

// real contracts
const controllerReal = '0x6ce857d3037e87465b003aCbA264DDF2Cec6D5E4';
const tresuryReal = '0xd0C1378c177E961D96c06b0E8F6E7841476C81Ef';
const rewardPoolReal = '0xb35E67FD20070C3d3dC5EEa29D62e95b707471cA';
const addressesReal = [controllerReal, tresuryReal, rewardPoolReal];

async function tvlFtm(time, ethBlock, _b, { api}) {
  return sumTokens2({ tokens: [wftm], owners: addressesFtm, api })
}

async function tvlReal(time, ethBlock, _b, { api}) {
  return sumTokens2({ tokens: [usdc], owners: addressesReal, api })
}

module.exports = {
  methodology: `We count the WFTM and USDC on treasuty, reward pool and controller contracts`,
  fantom: {
    tvl: tvlFtm
  },
  real: {
    tvl: tvlReal
  },
}