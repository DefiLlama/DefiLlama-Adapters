const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { getV2Reserves, getTvl, getBorrowed, aaveChainTvl } = require('../helper/aave');
const { staking } = require('../helper/staking');
const { ammMarket } = require('./amm');
const { unwrapBalancerToken } = require('../helper/unwrapLPs');


const addressesProviderRegistryETH = "0x52D306e36E3B6B02c153d0266ff0f85d18BCD413";

function ethereum(borrowed) {
  return async (timestamp, block)=> {
    const balances = {}

    // V2 TVLs
    if (block >= 11360925) {
      const [v2Atokens, v2ReserveTokens, dataHelper] = await getV2Reserves(block, addressesProviderRegistryETH, 'ethereum')
      if(borrowed){
        await getBorrowed(balances, block, "ethereum", v2ReserveTokens, dataHelper, id=>id);
      } else {
        await getTvl(balances, block, 'ethereum', v2Atokens, v2ReserveTokens, id => id);
      }
    }
    if (block >= 11998773) {
      await ammMarket(balances, block, borrowed)
    }

    return balances;
  }
}

const aaveTokenAddress = ADDRESSES.ethereum.AAVE;

async function stakingBalancerTvl(timestamp, block, _, { api }) {
  return unwrapBalancerToken({ api, owner: '0xa1116930326d21fb917d5a27f1e9943a9595fb47', balancerToken: '0x41a08648c3766f9f9d85598ff102a08f4ef84f84', isV2: false, })
}

const aaveStakingContract = "0x4da27a545c0c5b758a6ba100e3a049001de870f5";

function v2(chain, v2Registry){
  const section = borrowed => sdk.util.sumChainTvls([
    aaveChainTvl(chain, v2Registry, undefined, undefined, borrowed),
  ])
  return {
    tvl: section(false),
    borrowed: section(true)
  }
}

module.exports = {
  timetravel: true,
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending`,
  ethereum: {
    staking: staking(aaveStakingContract, aaveTokenAddress),
    pool2: stakingBalancerTvl,
    tvl: ethereum(false),
    borrowed: ethereum(true),
  },
  avax: v2("avax", "0x4235E22d9C3f28DCDA82b58276cb6370B01265C2"),
  polygon: v2("polygon", "0x3ac4e9aa29940770aeC38fe853a4bbabb2dA9C19"),
  hallmarks:[
      //[1618419730, "Start MATIC V2 Rewards"],
      [1619470313, "Start Ethereum V2 Rewards"],
      [1633377983, "Start AVAX V2 Rewards"],
      [1635339600, "Potential xSUSHI attack found"],
      [1651881600, "UST depeg"],
      [1654822801, "stETH depeg"],
    ],
};
// node test.js projects/aave/index.js
