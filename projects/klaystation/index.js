async function tvl(api) {
	const sKlay = '0xa323d7386b671e8799dca3582d6658fdcdcd940a'
	const supply = await api.call({  abi: 'erc20:totalSupply', target: sKlay})
	api.add(sKlay, supply)
}

module.exports = {
	klaytn: { tvl }
}