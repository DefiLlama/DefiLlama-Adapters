const ZTLN_P = '0xfEd3D6557Dc46A1B25d0A6F666513Cb33835864B'

const abi = 'function price() view returns (uint256 price)'

const tvl = async (api) => {
	const price = await api.call({ target: ZTLN_P, abi: abi })
	const supply = await api.call({ target: ZTLN_P, abi: 'erc20:totalSupply' })
	
	const tvl = price * supply / 1e14 //ZTLN_P is 6 decimals, price is 8 decimals

	return api.addUSDValue(tvl)
}

module.exports = {
	ethereum: { tvl }
}