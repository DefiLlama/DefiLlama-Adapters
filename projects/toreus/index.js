const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { aaveExports } = require("../helper/aave");

const stakingContract = "0x8634b181f937B279E76DDc9a00C914Aab8fE559f";
const TORE = "0x443aB8d6Ab303Ce28f9031BE91c19c6B92e59C8a";

// const stakingContractPool2 = "";
const TORE_WKAVA_spLP = "0x1e221EA8D1440c3549942821412c03f101f5E99a";

module.exports = {
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending",
  kava: {
    ...aaveExports('kava', '0xE97a88d372b5c4b8F124176f03cb5c7502a28401'),
    staking: staking(stakingContract, TORE, "kava"),
    // pool2: pool2(stakingContractPool2, RADIANT_WETH_sushiLP, "arbitrum"),
  },
};