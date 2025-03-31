const { stakings } = require("../helper/staking");
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs');

const PUSDMorPool = "0x505eFcC134552e34ec67633D1254704B09584227"; // Mortgage-PUSD pool contract
const PETHMorPool = "0x9a5C88aC0F209F284E35b4306710fEf83b8f9723"; //Mortgage-PETH pool contract
const NEST = "0x04abeda201850ac0124161f037efd70c74ddc74c";

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: sumTokensExport({ tokensAndOwners: [[nullAddress, PUSDMorPool]] }),
    staking: stakings([PUSDMorPool, PETHMorPool], NEST),
  },
  methodology:
    "Counts liquidty on the Insurance",
};
