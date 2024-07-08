const ADDRESSES = require('../helper/coreAssets.json')

const BENJI_STELLAR = {ticker: "BENJI", address: 'GBHNGLLIE3KWGKCHIKMHJ5HVZHYIK7WTBE4QF5PLAKL4CJGSEU7HZIW5'}
const BENJI_POLYGON = '0x408a634b8a8f0de729b48574a3a7ec3fe820b00a'
const USDC_DECIMALS = 6

const stellarTvl = async (api) => {
    const stellarApi = `https://api.stellar.expert/explorer/public/asset/${BENJI_STELLAR.ticker}-${BENJI_STELLAR.address}`
    const response = await fetch(stellarApi)
    const {supply, toml_info} = await response.json()
    const adjustedSupply = supply * Math.pow(10, USDC_DECIMALS) / Math.pow(10, toml_info.decimals)
    return api.add(ADDRESSES.ethereum.USDC, adjustedSupply, { skipChain: true })
}

const polygonTvl = async (api) => {
  const [decimals, totalSupply] = await Promise.all([
        api.call({target: BENJI_POLYGON, abi:'erc20:decimals'}),
        api.call({target: BENJI_POLYGON, abi:'erc20:totalSupply'})
  ])
  const adjustedSupply = totalSupply * Math.pow(10, USDC_DECIMALS) / Math.pow(10, decimals)
  return api.add(ADDRESSES.polygon.USDC,adjustedSupply)
}

module.exports = {
  stellar: {tvl: stellarTvl},
  polygon: {tvl: polygonTvl},
}
