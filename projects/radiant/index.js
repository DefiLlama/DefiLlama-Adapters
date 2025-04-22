const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { aaveExports, methodology } = require("../helper/aave");

const stakingContract = "0xc2054A8C33bfce28De8aF4aF548C48915c455c13";
const RADIANT = "0x0C4681e6C0235179ec3D4F4fc4DF3d14FDD96017";

const stakingContractPool2 = "0xc963ef7d977ECb0Ab71d835C4cb1Bf737f28d010";
const RADIANT_WETH_sushiLP = "0x24704aFF49645D32655A76Df6d407E02d146dAfC";

module.exports = {
  methodology,
  arbitrum: {
    ...aaveExports('arbitrum', '0x7BB843f889e3a0B307299c3B65e089bFfe9c0bE0'),
    staking: staking(stakingContract, RADIANT),
    pool2: pool2(stakingContractPool2, RADIANT_WETH_sushiLP),
  },
};
