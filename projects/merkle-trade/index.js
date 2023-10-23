const { getResource } = require("../helper/chain/aptos");

const MERKEL_TRADE =
  "0x5ae6789dd2fec1a9ec9cccfb3acaf12e93d432f0a3a42c92fe1a9d490b7bbc06";
const lzUSDC =
  "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC";

async function tvl(_, _b, _cb, { api }) {
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
