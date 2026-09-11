const { addFiraTreasuryPositions } = require("../fira/treasuryHelper");

const owners = [
  '0x97fD565B913b439Ff16774Da152B1f71F05A82F1' 
]

async function tvl(api) {
  await addFiraTreasuryPositions(api, owners);
}

module.exports = {
  methodology: "Fira treasury net lending exposure across fixed, variable, and legacy UZR lending markets.",
  ethereum: {
    tvl,
  },
  doublecounted: true,
};
