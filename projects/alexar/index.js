const { getConfig } = require('../helper/cache')
const { sumTokens } = require('../helper/sumTokens')

const blacklistedAssets = ['uaxl'];

const chainMapping = {
  avax: 'avalanche',
  cosmos: 'cosmoshub',
  terra2: 'terra-2',
  bsc: 'binance'
};

const chainListSupply = ['juno', 'cosmos', 'comdex', 'carbon', 'crescent', 'injective', 'kujira', 'osmosis', 'persistence', 'stargaze', 'secret', 'stargaze', 'umee', 'evmos', 'terra2'];
const chainListTotal = ['avax', 'bsc', 'moonbeam', 'polygon', 'fantom', 'arbitrum', 'aurora', 'celo', 'kava', 'mantle', 'ethereum',];


chainListSupply.concat(chainListTotal).forEach(chain => {
  module.exports[chain] = { tvl };
  async function tvl(api) {
    const config = await getConfig('alexar', 'https://api.axelarscan.io/cross-chain/tvl')
    const tokensAndOwners = []
    const owners = []
    const mappedChain = chainMapping[chain] || chain;
    config.data.forEach(({ tvl: { [mappedChain]: assetTvl } = {} }) => {
      if (!assetTvl) return;

      const isEVM = assetTvl.gateway_address?.startsWith('0x')
      if (isEVM) {
        if (assetTvl.contract_data.symbol.startsWith('axl')) return;
        tokensAndOwners.push([assetTvl.contract_data.address, assetTvl.gateway_address])
      } else {
        if (assetTvl.denom_data.symbol.startsWith('axl')) return;
        owners.push(...assetTvl.source_escrow_addresses)
      }
    })
    if (tokensAndOwners.length > 0)
      return api.sumTokens({ tokensAndOwners })
    return sumTokens({ chain, owners })
  }
});

module.exports.timetravel = false;