const ADDRESSES = require('../helper/coreAssets.json')
const { getResource } = require("../helper/chain/aptos");
const { sumTokens2 } = require('../helper/unwrapLPs');

const MERKEL_TRADE =
  "0x5ae6789dd2fec1a9ec9cccfb3acaf12e93d432f0a3a42c92fe1a9d490b7bbc06";

async function tvl(api) {
  const {
    coin_store: { value },
  } = await getResource(
    MERKEL_TRADE,
    `${MERKEL_TRADE}::vault::Vault<${MERKEL_TRADE}::vault_type::HouseLPVault,${MERKEL_TRADE}::fa_box::W_USDC>`
  );
  api.add(ADDRESSES.aptos.USDC_3, value);
  return sumTokens2({ api })
}

module.exports = {
  timetravel: false,
  aptos: { tvl },
};
