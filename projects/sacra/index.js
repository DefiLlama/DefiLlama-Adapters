const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

// fantom contracts
const controllerFantom = '0xE5365c31c08d6ee44fdd33394ba279b85557c449';
const tresuryFantom = "0x146dd6E8f9076dfEE7bE0b115bb165d62874d110";
const rewardPoolFantom = '0x8E629C4301871d2A07f76366FE421e86855DC690';

// real contracts
const controllerReal = '0x6ce857d3037e87465b003aCbA264DDF2Cec6D5E4';
const tresuryReal = '0xd0C1378c177E961D96c06b0E8F6E7841476C81Ef';
const rewardPoolReal = '0xb35E67FD20070C3d3dC5EEa29D62e95b707471cA';

module.exports = {
  methodology: `We count the WFTM and USDC on treasuty, reward pool and controller contracts`,
  fantom: {
    tvl: sumTokensExport({ token: ADDRESSES.fantom.WFTM, owners: [controllerFantom, tresuryFantom, rewardPoolFantom] })
  },
  real: {
    tvl: sumTokensExport({ token: ADDRESSES.real.USDC, owners: [controllerReal, tresuryReal, rewardPoolReal] })
  },
}