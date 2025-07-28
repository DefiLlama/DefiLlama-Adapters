const { pool2 } = require("../helper/pool2");
const { staking } = require("../helper/staking");
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs');

const stakingETHContract = "0x9F7968de728aC7A6769141F63dCA03FD8b03A76F";

const stakingNYANContract = "0x32e5594F14de658b0d577D6560fA0d9C6F1aa724";
const NYAN = "0xed3fb761414da74b74f33e5c5a1f78104b188dfc";

const stakingPool2Contract = "0x62FF5Be795262999fc1EbaC29277575031d2dA2C";
const NYAN_WETH_SLP = "0x70df9dd83be2a9f9fcc58dd7c00d032d007b7859";

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    staking: staking(stakingNYANContract, NYAN),
    pool2: pool2(stakingPool2Contract, NYAN_WETH_SLP),
    tvl: sumTokensExport({ owner: stakingETHContract, tokens: [nullAddress] }),
  },
  methodology:
    "Counts as TVL the ETH asset deposited through StakingETH Contract, and we count Staking and Pool2 parts in the same way",
};
