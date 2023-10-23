const { getUniTVL } = require('../helper/unknownTokens')
const { stakingPricedLP } = require('../helper/staking');

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x5bec5d65fAba8E90e4a74f3da787362c60F22DaE) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  elysium: {
    tvl: getUniTVL({ factory: '0x5bec5d65fAba8E90e4a74f3da787362c60F22DaE', useDefaultCoreAssets: true }),
    staking:stakingPricedLP("0x55602a69eeD9682dd30aaceAAD889c443eF3F93E", "0x725C07888D3253Dff26553BA9Fd0BbF316337c9c", "elysium", "0x725C07888D3253Dff26553BA9Fd0BbF316337c9c", "vulcan-forged"),
  // Like this staking contract , we have 4 more staking contracts. Also let us know how to get fetch multiple staking tvls as all are for different LP tokens
  },
};

