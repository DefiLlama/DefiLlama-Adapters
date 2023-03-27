const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const MFF = "0x78b65477bba78fc11735801d559c386611d07529";
const contract = "0xDE707357D10D86aE21373b290eAbBA07360896F6";
const sdk = require("@defillama/sdk");
const abi = require("../vexchange/abi.json");

async function staking(timestamp, _, {aurora: block}) {
  const balances = {};
  const MFFPrice = await getMFFPrice(block);

  await sumTokensAndLPsSharedOwners(
    balances,
    [[MFF, false]],
    [contract],
    block,
    "aurora",
    (addr) => `aurora:${addr}`
  );

  balances.terrausd = (balances[`aurora:${MFF}`] * MFFPrice) / 10 ** 18;
  delete balances[`aurora:${MFF}`];

  return balances;
}
async function getMFFPrice(block) {
  const reserves = (
    await sdk.api.abi.call({
      target: "0x3c508FC05C289BA989CF877bb2e3f6e54eF3fc95",
      abi: abi.getReserves,
      block,
      chain: "aurora",
    })
  ).output;
  return reserves[0] / reserves[1];
}

module.exports = {
  aurora: {
    tvl: () => ({}),
    staking,
  },
};
