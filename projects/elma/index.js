module.exports = {
  methodology: "Principal Tokens (PT) are always 1:1 mintable & redeemable with Underlying Tokens (UT). TVL is Total Market Cap of all PT, where 1 PT = 1 UT.",
}

const config = {
	fantom: { markets: [
		'0x0a558d43bccbc7586547fc74e3a0e70467215b3c',
		'0x35402cDc3BCFFb904116bDC720Afc75c2921De08',
		'0xB6633c351a3aF289ed6bbF4A78c682FA16656B1E',
		'0xFaa22e721924fa57d042F6E2c793997aA9287B27',
	]}
}

Object.keys(config).forEach(chain => {
	const {markets,} = config[chain]
	module.exports[chain] = {
		tvl: async (api) => {
			const tokens = await api.multiCall({  abi: 'address:BASE', calls: markets})
			const wTokens = await api.multiCall({  abi: 'address:WRAP', calls: markets})
			const supplies = await api.multiCall({  abi: 'erc20:totalSupply', calls: wTokens})
			api.add(tokens, supplies)
		}
	}
})