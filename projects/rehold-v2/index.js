const { sumTokens2 } = require('../helper/unwrapLPs')
const { covalentGetTokens } = require('../helper/http')

const VAULT_V2 = '0xde6b4964c4384bcdfa150a4a8be9865c5b91e29c';

async function tvl(_, _b, _cb, { api, }) {
  const tokens = await covalentGetTokens(VAULT_V2, api.chain)

  return sumTokens2({
    api,
    owner: VAULT_V2,
    tokens,
    blacklistedTokens: ['0x594f9274e08ba6c5760bacfba795b1879af17255'],
  });
}

module.exports = {
  bsc: { tvl },
  polygon: { tvl },
  avax: { tvl },
  arbitrum: { tvl },
  optimism: { tvl },
};
