const { getConfig } = require('../helper/cache');
const { sumTokens } = require('../helper/chain/bitcoin');

const bitcoinOwnersUrl = 'https://raw.githubusercontent.com/solv-finance-dev/slov-protocol-defillama/refs/heads/main/bitcoin.json';

async function tvl() {
  let bitcoinOwners = (await getConfig('solv-protocol/solv-btc-lst', bitcoinOwnersUrl));

  let owners = [];
  for (const bitcoinOwner of Object.keys(bitcoinOwners)) {
    owners = owners.concat(bitcoinOwners[bitcoinOwner]);
  }

  return sumTokens({ owners })
}

module.exports = {
  methodology: 'Staked tokens via Babylon and Core are counted towards TVL, as they represent the underlying BTC assets securing their respective networks.',
  bitcoin: {
    tvl
  }
}