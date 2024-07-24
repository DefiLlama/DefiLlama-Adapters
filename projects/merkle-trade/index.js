const ADDRESSES = require('../helper/coreAssets.json')
const { getResource } = require("../helper/chain/aptos");

const MERKEL_TRADE =
  "0x5ae6789dd2fec1a9ec9cccfb3acaf12e93d432f0a3a42c92fe1a9d490b7bbc06";
const lzUSDC =
  ADDRESSES.aptos.USDC_2;

async function tvl(api) {
  const {
    coin_store: { value },
  } = await getResource(
    MERKEL_TRADE,
    `${MERKEL_TRADE}::vault::Vault<${MERKEL_TRADE}::vault_type::HouseLPVault,${lzUSDC}>`
  );
  api.add(lzUSDC, value);
}

module.exports = {
  timetravel: false,
  aptos: { tvl },
};
