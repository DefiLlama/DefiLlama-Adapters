const ADDRESSES = require('../helper/coreAssets.json');
const { getResources, function_view } = require('../helper/chain/aptos');
const { sumTokens2 } = require('../helper/unwrapLPs');
const axios = require('axios');

const USDC_FA_OBJECT = ADDRESSES.aptos.USDC_3;
const TREASURY = "0x7226c806b4b00873a9390082c885005a7aa9488129b8a11e23b18d33c409d360";
const LIVE_POTS_URL = "https://api.kaching.vip/pots/live";
const MODULE_ADDRESS = "0x7d0edbf4a540fc8421e3dbabf221d291217718859814220684c378e8c69da31d";

async function getFABalance(account, metadataObjectId) {
  const resources = await getResources(account, 'aptos');
  
  for (const res of resources) {
    if (res.type !== "0x1::fungible_asset::FungibleStore") continue;
    if (res.data?.metadata?.inner?.toLowerCase() === metadataObjectId.toLowerCase()) {
      return res.data.balance || "0";
    }
  }
  return "0";
}

async function getPotAddress(potId) {
  const res = await function_view({
    functionStr: `${MODULE_ADDRESS}::lotto_pots::get_pot_details`,
    type_arguments: [],
    args: [potId],
  });
  return res.pot_address;
}

async function tvl(api) {
  const treasuryBalance = await getFABalance(TREASURY, USDC_FA_OBJECT);
  api.add(ADDRESSES.aptos.USDC_3, treasuryBalance);

  const result = await axios.get(LIVE_POTS_URL);
  for (const pot of result.data) {
    const potAddress = await getPotAddress(pot.potId);
    const potBalance = await getFABalance(potAddress, USDC_FA_OBJECT);
    api.add(ADDRESSES.aptos.USDC_3, potBalance);
  }

  return sumTokens2({ api });
}

module.exports = {
  methodology: "Kaching! allows users to pay using any supported token across supported chains. Kaching! payment abstraction layer swaps and bridges these tokens into USDC on Aptos, which powers the pot size, winnings, and payouts. TVL reflects the total USDC held in the protocol's smart contracts, including active lottery pot balances and treasury reserves used for prize payouts.",
  timetravel: false,
  aptos: { tvl },
};