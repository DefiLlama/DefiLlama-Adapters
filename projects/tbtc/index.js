const sdk = require('@defillama/sdk');
const { sumTokensExport } = require('../helper/sumTokens');
const axios = require('axios');


async function fetchWalletAddresses() {
  const response = await axios.get('https://api.threshold.network/tbtc/wallets/pof');
  const owners = response.data.wallets.map(wallet => wallet.walletBitcoinAddress);
  return owners;
}


module.exports = {
  methodology: "BTC on btc chain",
  ethereum: {tvl: () =>  ({}) },
  bitcoin: {
    tvl: async () => {
      const owners = await fetchWalletAddresses();
      return sdk.util.sumChainTvls([
        sumTokensExport({ owners }),
      ]);
    },
  },
};
