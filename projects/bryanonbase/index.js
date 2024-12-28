const { sumTokensExport } = require('../helper/unknownTokens')
const ADDRESSES = require('../helper/coreAssets.json')

const stakingETHContract = "0x9acDDdbEBED00107B3eF2931607F131F392f6996";

const stakingBRYANContract = "0x32e5594F14de658b0d577D6560fA0d9C6F1aa724";
const BRYAN = "0xB75445A717D5A8c268f37045162837CFe72Ac337";

const stakingPool2Contract = "0x5DFF152F94E0EADeD36201f1D5AC37382f3Cf51D";
const BRYAN_WETH_SLP = "0xbCA1647EA6C7eB6916a5B33E21467ff78Bf5Ec55";

const stakeBryanEarnWeth = "0xC0c8BCAf6c1baE2d4A35f4D89A8EAc9A9E5D4Db0"
const stakeLpEarnWeth = "0xCf4543777342D93BEde085292E46D847BC59dc07"

module.exports = {
  misrepresentedTokens: true,
  base: {
    tvl: sumTokensExport({ owners: [stakingETHContract, stakeLpEarnWeth, stakeBryanEarnWeth], tokens: [ADDRESSES.base.WETH], }),
    pool2: sumTokensExport({ owners: [stakingPool2Contract, stakeLpEarnWeth, ], tokens: [BRYAN_WETH_SLP], useDefaultCoreAssets: true, }),
    staking: sumTokensExport({ owners: [stakingBRYANContract, stakeBryanEarnWeth], tokens: [BRYAN], lps: [BRYAN_WETH_SLP], useDefaultCoreAssets: true, }),
  },
  methodology:
    "Counts as TVL the ETH asset deposited through StakingETH Contract, and we count Staking and Pool2 parts in the same way",
};
