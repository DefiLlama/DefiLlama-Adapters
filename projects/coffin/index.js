const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");
const { masterchefExports } = require('../helper/unknownTokens');
const { mergeExports } = require('../helper/utils');

const MasterChefV1Contract = "0x155482Bd4e5128082D61a2384935D4BBDcb0E7a7";
const MasterChefV2Contract = "0x2447115E9Ba73bd2877821BF69E09259664a2bd5";

const stakingContract = "0x61Befe6E5f20217960bD8659cd3113CC1ca67d2F";

module.exports = mergeExports([
  masterchefExports({ chain: 'fantom', masterchef: MasterChefV1Contract, }),
  masterchefExports({ chain: 'fantom', masterchef: MasterChefV2Contract, }),
  { fantom: { staking: staking(stakingContract, ADDRESSES.fantom.WFTM) } },
])
