const { sumTokensExport } = require('../helper/sumTokens');
const { getConfig } = require('../helper/cache');
const { getBTCExport } = require('../helper/bitcoin-book');

function porTvl(asset) {
  return async (api) => {
    const { reserveAddresses = [] } = await getConfig(
      `coinbase-${asset}-proof-of-reserves`,
      `https://www.coinbase.com/${asset}/proof-of-reserves.json`
    );
    const owners = reserveAddresses.map(r => r.address).filter(Boolean);
    return sumTokensExport({ owners })(api);
  };
}

module.exports = {
  methodology:
    "TVL is the reserves backing Coinbase's wrapped assets (cbBTC/cbXRP/cbDOGE/cbADA/cbLTC), read from each asset's Coinbase proof-of-reserves and summed on-chain across the disclosed custody addresses.",
  bitcoin: { tvl: getBTCExport('coinbasebtc') },
  litecoin: { tvl: getBTCExport('coinbaseltc') },
  ripple: { tvl: porTvl('cbxrp') },
  doge: { tvl: porTvl('cbdoge') },
  cardano: { tvl: porTvl('cbada') },
};
