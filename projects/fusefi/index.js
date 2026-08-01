const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens');
const { stakings } = require("../helper/staking");

const swap = {
  tvl: getUniTVL({
    factory: '0x1998E4b0F1F922367d8Ec20600ea2b86df55f34E',
    useDefaultCoreAssets: true,
  })
}

const VOLT_TOKEN = ADDRESSES.fuse.VOLT.toLowerCase();
const VOLT_BAR = "0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1".toLowerCase();
const VOLT_VOTE_ESCROW = "0xB0a05314Bd77808269e2E1E3D280Bff57Ba85672".toLowerCase()

module.exports = {
  misrepresentedTokens: true,
  fuse: {
    tvl: swap.tvl,
    staking: stakings([VOLT_BAR, VOLT_VOTE_ESCROW], VOLT_TOKEN),
  }
};
