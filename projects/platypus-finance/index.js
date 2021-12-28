const sdk = require("@defillama/sdk");
// avax addresses below.
const PTP_DAIe_POOL = "0xc1Daa16E6979C2D1229cB1fd0823491eA44555Be";
const DAIe = "0xd586e7f844cea2f87f50152665bcbc2c279d8d70";

const PTP_USDCe_POOL = "0x909B0ce4FaC1A0dCa78F8Ca7430bBAfeEcA12871";
const USDCe = "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664";

const PTP_USDTe_POOL = "0x0D26D103c91F63052Fbca88aAF01d5304Ae40015";
const USDTe = "0xc7198437980c041c805a1edcba50c1ce5db95118";

const PTP_MIM_POOL = "0x6220BaAd9D08Dee465BefAE4f82ee251cF7c8b82";
const MIM = "0x130966628846bfd36ff31a822705796e8cb8c18d";

async function balanceOf(owner, target, block) {
  const chain = "avax";
  let decimals = (await sdk.api.erc20.decimals(target, chain)).output;
  let balance = (
    await sdk.api.erc20.balanceOf({
      owner,
      target,
      block,
      chain,
    })
  ).output;
  return Number(balance) / 10 ** decimals;
}

async function tvl(timestamp, ethereumBlock, chainBlocks) {
  const block = chainBlocks["avax"];
  let balances = {};
  balances["dai"] = await balanceOf(PTP_DAIe_POOL, DAIe, block);
  balances["usd-coin"] = await balanceOf(PTP_USDCe_POOL, USDCe, block);
  balances["tether"] = await balanceOf(PTP_USDTe_POOL, USDTe, block);
  balances["magic-internet-money"] = await balanceOf(PTP_MIM_POOL, MIM, block);
  return balances;
}

module.exports = {
  avalanche: {
    tvl,
  },
  tvl,
};
