const { queryContract, } = require("../helper/chain/cosmos");
const ADDRESSES = require("../helper/coreAssets.json");
const BigNumber = require("bignumber.js");

// Contract
const loan = "inj1nuw6ala2ra7t457tg4g04k67r94v55mdyq9klr";

const inj = "inj";
const hinj = "inj18luqttqyckgpddndh8hvaq25d5nfwjc78m56lc"
const hdro = "factory/inj1etz0laas6h7vemg3qtd67jpr6lh8v7xz7gfzqw/hdro"
const usdt = "peggy0xdAC17F958D2ee523a2206206994597C13D831ec7";

const USDT_DECIMALS = 6;

async function getLoanTvl(api) {
  const assetStateResponse = await queryContract({ chain: api.chain, contract: loan, data: { asset_states: { limit: 100 } } });

  let tvl = new BigNumber(0);
  for (const assetState of assetStateResponse.asset_states) {
    const denom = assetState.denom;
    const [
      priceResponse,
      assetConfigResponse,
    ] = await Promise.all([
      queryContract({ chain: api.chain, contract: loan, data: { usd_price: { denom } } }),
      queryContract({ chain: api.chain, contract: loan, data: { asset_config: { denom } } }),
    ]);

    const decimals = new BigNumber(assetConfigResponse.decimals);
    const price = new BigNumber(priceResponse.price);
    const amount = new BigNumber(assetState.collateral.amount);
    const amountDownScaled = amount.div(new BigNumber(10).pow(decimals));
    const usdValue = amountDownScaled.times(price);
    tvl = tvl.plus(usdValue);
  }
  return tvl;
}

function denomToAddress(denom) {
  if ("native" in denom) {
    return denom.native;
  }

  return denom.cw20;
}

async function borrowed(api) {
  const assetStateResponse = await queryContract({ chain: api.chain, contract: loan, data: { asset_states: { limit: 100 } } });

  for (const assetState of assetStateResponse.asset_states) {
    api.add(denomToAddress(assetState.denom), assetState.debt.amount);
  }
}

async function tvl(api) {
  const loanTvl = await getLoanTvl(api);
  const usdtTvl = loanTvl.times(new BigNumber(10).pow(USDT_DECIMALS));
  api.add(
    ADDRESSES.injective.USDT, BigInt(usdtTvl.toFixed(0))
  );
}

module.exports = {
  methodology: "Liquidity on hydro-protocol",
  injective: {
    tvl,
    borrowed,
  },
};