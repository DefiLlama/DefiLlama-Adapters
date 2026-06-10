const sui = require("../helper/chain/sui");

// WaterX is a perpetuals DEX + prediction market on Sui.
// LPs deposit collateral into the WLP liquidity pool (`waterx_perp::lp_pool::WlpPool`),
// which backs all perp positions. TVL = the collateral held in that pool.
const WLP_POOL = "0xfcf9c1beaae8274a32cf3cc4717ec24acf3f96195abb213f0db4d6c80055a545";

// WaterX USD (`...::usd::USD`) is a 1:1-backed stablecoin minted by waterx_credit.
// It is not yet on DefiLlama's price feeds, so we value it 1:1 against USDC.
const WATERX_USD = "0xc70a37eafe54712b520cb6566e5a2d2f60bc70f32eb9fb08cac40394b5a96bf4::usd::USD";

async function tvl(api) {
  const { fields } = await sui.getObject(WLP_POOL);
  const tokenPools = fields.token_pools;
  const tokenTypes = fields.token_types;

  tokenPools.forEach((tp, i) => {
    const coin = "0x" + tokenTypes[i].fields.name;
    const { liquidity_amount, token_decimal } = tp.fields;
    if (coin.toLowerCase() === WATERX_USD.toLowerCase()) {
      // 1:1-backed WaterX USD -> price as USDC-equivalent
      api.addCGToken("usd-coin", liquidity_amount / 10 ** token_decimal);
    } else {
      api.add(coin, liquidity_amount);
    }
  });
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts collateral tokens held in the WaterX WLP liquidity pool (waterx_perp::lp_pool), which backs all perpetual positions. WaterX USD, a 1:1-backed stablecoin, is valued at $1.",
  sui: {
    tvl,
  },
};
