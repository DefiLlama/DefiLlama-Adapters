const { toUSDTBalances } = require('../helper/balances');

const BENJI_STELLAR = {ticker: "BENJI", address: 'GBHNGLLIE3KWGKCHIKMHJ5HVZHYIK7WTBE4QF5PLAKL4CJGSEU7HZIW5'}
const BENJI_POLYGON = '0x408a634b8a8f0de729b48574a3a7ec3fe820b00a'

const stellarTvl = async (api) => {
    const stellarApi = `https://api.stellar.expert/explorer/public/asset/${BENJI_STELLAR.ticker}-${BENJI_STELLAR.address}`
    const response = await fetch(stellarApi)
    const {supply, toml_info} = await response.json()
    const adjustedSupply = toUSDTBalances((supply / Math.pow(10, toml_info.decimals)))
    const [[tokenAddress, tokenBalance]] = Object.entries(adjustedSupply);
    return api.add(tokenAddress, tokenBalance, { skipChain: true })
}

const polygonTvl = async (api) => {
  const [decimals, totalSupply] = await Promise.all([
        api.call({target: BENJI_POLYGON, abi:'erc20:decimals'}),
        api.call({target: BENJI_POLYGON, abi:'erc20:totalSupply'})
  ])
  const adjustedSupply = toUSDTBalances((totalSupply / Math.pow(10, decimals)))
  const [[tokenAddress, tokenBalance]] = Object.entries(adjustedSupply);
  api.add(tokenAddress, tokenBalance, {skipChain: true} )
}

module.exports = {
  stellar: {tvl: stellarTvl},
  polygon: {tvl: polygonTvl},
}
