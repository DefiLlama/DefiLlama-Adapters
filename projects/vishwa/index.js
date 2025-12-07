const { sumTokens } = require("../helper/chain/bitcoin");
const { get } = require("../../projects/helper/http");
const { getObject } = require("../helper/chain/sui");

// Vault address
const btcAddressBook = 'https://api.btcvc.vishwanetwork.xyz/btc/address';

// Ember Protocol
const suiVaultIds = ['0xb3ccbc12cd633d3a8da0cf97a4d89f771a9bd8c0cd8ce321de13edc11cfb3e1c'];

async function calcBtcVault() {
  let addresses = (await get(btcAddressBook))?.data || [];
  return await sumTokens({owners: addresses})
}

async function calcSuiTvlByEmberProtocol(api) {
  await Promise.all(suiVaultIds.map(async id => {
    const treasury_cap = (await getObject(id)).fields['receipt_token_treasury_cap']
    let coin_type = treasury_cap['type'];
    coin_type = coin_type.substring(coin_type.indexOf('<') + 1, coin_type.lastIndexOf('>'));
    const total_supply = treasury_cap.fields['total_supply'].fields['value']
    api.add(coin_type, total_supply)
  }));
}

module.exports = {
  bitcoin: {
    tvl: calcBtcVault,
  },
  sui: {
    tvl: calcSuiTvlByEmberProtocol,
  }
};
