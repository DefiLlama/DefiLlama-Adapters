const sdk = require("@defillama/sdk");

const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const STABLZ_CANNAVEST_RWA_POOL = "0xa030f3e984A08B5Ada0377A9f4EaAF846E6A2cB0";

async function ethTvl(_, block) {
  let balances = {}
  const totalSupply = (await sdk.api.abi.call({
    block,
    chain: 'ethereum',
    target: STABLZ_CANNAVEST_RWA_POOL,
    abi: "uint256:totalSupply"
  })).output;
  sdk.util.sumSingleBalance(balances, USDT, totalSupply);
  return balances;
}

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  methodology: "Gets the TVL in USDT from the Stablz Cannavest (real world asset) smart contract",
};
