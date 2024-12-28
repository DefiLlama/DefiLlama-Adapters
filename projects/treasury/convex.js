const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");
const { staking } = require("../helper/staking");
const { mergeExports } = require('../helper/utils');
const {
  genericUnwrapCvxRewardPool,
  genericUnwrapCvxFraxFarm,
  genericUnwrapCvxPrismaPool,
  genericUnwrapCvxCurveLendRewardPool,
} = require('../helper/unwrapLPs');

const convexTreasuryVault = "0x1389388d01708118b497f59521f6943Be2541bb7";

const treasuryManagerPositions = [{
  type: 'convex-curve-lp',
  manager: '0xa25B17D7deEE59f9e326e45cC3C0C1B158E74316', // #1
  curveLpStakingContract: '0x39D78f11b246ea4A1f68573c3A5B64E83Cff2cAe', // cvxCRV/CRV
}, {
  type: 'convex-curve-lp',
  manager: '0xeB8121b44a290eE16981D87B92fc16b2366dE6B3', // #2
  curveLpStakingContract: '0x19F3C877eA278e61fE1304770dbE5D78521792D2', // cvxFXS/FXS
}, {
  type: 'convex-frax-curve-lp',
  manager: '0x9d464B601f74C8d3d42379921106B907F1055F80', // #3
  fraxCurveLpStakingContract: '0xb01BaB994b52A37a231551f00a1B7cAcd43bc8C9', // frxETH/CVX
  vaultAddress: '0x56f08393ff2e4E6b89E130646C6E7F52Af3499e5',
}, {
  type: 'convex-fx-curve-lp',
  manager: '0x8BE4Ec802E8Ad5Ebf8324FC81aEa03980457eDcC', // #4
  fxGauge: '0xfEFafB9446d84A9e58a3A2f2DDDd7219E8c94FbB', // FXN/cvxFXN
  vaultAddress: '0x83dcBF8B0E90343FbE148F221e8f243bd16eCF46',
}, {
  type: 'convex-prisma-curve-lp',
  manager: '0xD60cd4AD7A2D6bF4eC9fccbCAeec769b52726dfd', // #5
  prismaLpStakingContract: '0xd91fBa4919b7BF3B757320ea48bA102F543dE341', // cvxPRISMA/PRISMA
}, {
  type: 'convex-curve-lend-lp',
  manager: '0x04Dd97255ddeE29c941D85F5B5cdE6ace8BD207f', // #6
  curveLpStakingContract: '0x68e400d058D4c0066344D1B3F392878e993B38Ab', // cvxCRV/CRV
  lendVault: '0x4a7999c55d3a93dAf72EA112985e57c2E3b9e95D',
}]

async function tvl(api) {
  for (const treasuryManagerPosition of treasuryManagerPositions) {
    if (treasuryManagerPosition.type === 'convex-curve-lp') {
      const { manager, curveLpStakingContract } = treasuryManagerPosition;
      await genericUnwrapCvxRewardPool({ api, owner: manager, pool: curveLpStakingContract });
    } else if (treasuryManagerPosition.type === 'convex-frax-curve-lp') {
      const { vaultAddress, fraxCurveLpStakingContract } = treasuryManagerPosition;
      await genericUnwrapCvxFraxFarm({ api, owner: vaultAddress, farm: fraxCurveLpStakingContract });
    } else if (treasuryManagerPosition.type === 'convex-fx-curve-lp') {
      const { vaultAddress, fxGauge } = treasuryManagerPosition;
      await genericUnwrapCvxRewardPool({ api, owner: vaultAddress, pool: fxGauge });
    } else if (treasuryManagerPosition.type === 'convex-prisma-curve-lp') {
      const { manager, prismaLpStakingContract } = treasuryManagerPosition;
      await genericUnwrapCvxPrismaPool({ api, owner: manager, pool: prismaLpStakingContract });
    } else if (treasuryManagerPosition.type === 'convex-curve-lend-lp') {
      const { manager, curveLpStakingContract, lendVault } = treasuryManagerPosition;
      await genericUnwrapCvxCurveLendRewardPool({ api, owner: manager, rewardsContract: curveLpStakingContract, lendVault });
    }
  }
  return api.getBalances()
}

module.exports = mergeExports([treasuryExports({
  ethereum: {
    owners: [convexTreasuryVault],
    ownTokens: [ADDRESSES.ethereum.CVX],
  },
}), {
  timetravel: false, // treasuryManagerPositions match the latest contracts and positions, so wouldn't work nor be accurate for past blocks
  ethereum: {
    tvl,
  },
}]);
