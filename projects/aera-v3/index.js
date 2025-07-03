const { getAeraVaults, getMorphoVaults, sumErc4626Balances } = require('./utils');
const { getTokens } = require('./tokens');
const { sumTokens2 } = require('../helper/unwrapLPs');

async function tvl(api) {
    const aeraVaults = await getAeraVaults(api);
    const tokens = await getTokens(api);
    const morphoVaults = await getMorphoVaults(api);
    const erc20 = tokens.filter(token => !morphoVaults.includes(token));
    const morphoFiltered = tokens.filter(token => morphoVaults.includes(token));
    await Promise.all([
        sumErc4626Balances({api, owners: aeraVaults, vaults: morphoFiltered}),
        sumTokens2({owners: aeraVaults, tokens: erc20, api}),
    ]);
}

module.exports = {
  methodology: 'Counts tokens held directly in Aera vaults, as well as all managed DeFi positions.',
  start: 1748414859,
  base: { tvl },
  ethereum: { tvl },
};
