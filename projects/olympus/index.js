const sdk = require('@defillama/sdk');
const {sumTokensAndLPsSharedOwners} = require('../helper/unwrapLPs')

const treasuryAddresses = ["0x886CE997aa9ee4F8c2282E182aB72A705762399D", "0x31F8Cc382c9898b273eff4e0b7626a6987C846E8"];
const dai = "0x6b175474e89094c44da98b954eedeac495271d0f";
const ohm = "0x383518188c0c6d7730d91b2c03a03c837814a899";
const slp = "0x34d7d7aaf50ad4944b70b320acb24c95fa2def7c";
const frax = "0x853d955acef822db058eb8505911ed77f175b99e";
const fraxLP = "0x2dce0dda1c2f98e0f171de8333c3c6fe1bbf4877";

// Treasury TVL consists of DAI balance + Sushi SLP balance
async function tvl(timestamp, block) {
  const balances = {}
  await sumTokensAndLPsSharedOwners(balances, [
    [dai, false],
    [frax, false],
    [slp, true],
    [fraxLP, true]
  ], treasuryAddresses, block)

  return balances
}

module.exports = {
  start: 1616569200, // March 24th, 2021
  methodology: "Counts DAI, OHM SLP (DAI-OHM), FRAX and FRAX LP (OHM-FRAX) on the treasury",
  tvl
}
