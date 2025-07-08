const { getConfig } = require('../helper/cache')
const { nullAddress } = require('../helper/tokenMapping')

async function tvl(api) {
	const { pool: { address: poolAddress }, assets } = await getConfig('clipper/' + api.chain, `https://api.clipper.exchange/rfq/pool?chain_id=${api.chainId}`)
	const tokens = assets.map(({ address }) => address)
	const owners = [poolAddress]
	tokens.push(nullAddress)
	if (api.chain === 'ethereum') owners.push('0xe82906b6B1B04f631D126c974Af57a3A7B6a99d9')
	return api.sumTokens({ tokens, owners })
}

module.exports = {
	methodology: `Counts the tokens in pool address in different chains`
};

['ethereum', 'polygon', 'moonbeam', 'arbitrum', 'optimism', 'mantle', 'base', 'polygon_zkevm'].forEach(chain => {
	module.exports[chain] = { tvl }
})
