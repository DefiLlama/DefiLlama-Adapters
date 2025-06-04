const { queryContract, } = require("../helper/chain/cosmos");
const ADDRESSES = require("../helper/coreAssets.json");
const BigNumber = require("bignumber.js");

// Contract
const loan = "inj1nuw6ala2ra7t457tg4g04k67r94v55mdyq9klr";
const autoCompound = "inj1mjcg8a73904rj4w7t5qkgn0apua98n059nufma"

const inj = "inj";
const hinj = "inj18luqttqyckgpddndh8hvaq25d5nfwjc78m56lc"
const hdro = "factory/inj1etz0laas6h7vemg3qtd67jpr6lh8v7xz7gfzqw/hdro"
const xhdro = "inj1qc2tw477wwuvkad0h3g78xqgwx4k8knat6vz0h"
const usdt = "peggy0xdAC17F958D2ee523a2206206994597C13D831ec7";

const denoms = [
  { native: inj },
  { cw20: hinj },
  { native: hdro },
  { native: usdt },
];

async function staking(api) {
  const { total_supply } = await queryContract({ chain: api.chain, contract: xhdro, data: { token_info: {} } })

  return {
    'hydro-protocol-2': total_supply / 1e6
  }
}

async function getLoanTvl(api) {
  let tvl = new BigNumber(0);
  for (const denom of denoms) {
    const [
      assetStateResponse,
      priceResponse,
      assetConfigResponse,
    ] = await Promise.all([
      queryContract({ chain: api.chain, contract: hinj, data: { asset_state: denom } }),
      queryContract({ chain: api.chain, contract: hinj, data: { asset_state: denom } }),
      queryContract({ chain: api.chain, contract: hinj, data: { asset_config: denom } }),
    ]);

    const decimals = new BigNumber(assetConfigResponse.decimals);
    const price = new BigNumber(priceResponse.price);
    const amount = new BigNumber(assetStateResponse.collateral.amount);
    const amountDownScaled = amount.div(new BigNumber(10).pow(decimals));
    const usdValue = amountDownScaled.times(price);
    tvl = tvl.plus(usdValue);
  }
  return tvl;
}

async function tvl(api) {
  const { total_supply } = await queryContract({ chain: api.chain, contract: hinj, data: { token_info: {} } })
  const { total_bonded } = await queryContract({ chain: api.chain, contract: autoCompound, data: { state: {} } })
  const loanTvl = await getLoanTvl(api);

  api.add(
    ADDRESSES.injective.INJ, +total_supply + +total_bonded
  );
  api.add(
    ADDRESSES.injective.USDT, loanTvl
  );
}

module.exports = {
  methodology: "Liquidity on hydro-protocol",
  injective: {
    tvl,
    staking,
  },
};