const sdk = require("@defillama/sdk");
const { uniTvlExport } = require("../helper/calculateUniTvl");

const fuzz = "0x984b969a8e82f5ce1121ceb03f96ff5bb3f71fee";
const factory = "0x5245d2136dc79Df222f00695C0c29d0c4d0E98A6";
const masterchef = "0x847b46ed6c3df75e34a0496ef148b89bf5eb41b1";

async function staking(timestamp, block, chainBlocks) {
  let balances = {};
  let balance = (
    await sdk.api.erc20.balanceOf({
      target: fuzz,
      owner: masterchef,
      block: chainBlocks.harmony,
      chain: "harmony",
    })
  ).output;
  sdk.util.sumSingleBalance(balances, `harmony:${fuzz}`, balance);
  return balances;
}

module.exports = {
  methodology: `Counts the tokens locked on AMM pools from the factory contract.`,
  harmony: {
    tvl: uniTvlExport(factory, 'harmony'),
    staking,
  },
};
