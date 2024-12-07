const { toUSDTBalances } = require('../helper/balances');

const BENJI = {
  stellar: {ticker: "BENJI", address: 'GBHNGLLIE3KWGKCHIKMHJ5HVZHYIK7WTBE4QF5PLAKL4CJGSEU7HZIW5'},
  arbitrum: '0xb9e4765bce2609bc1949592059b17ea72fee6c6a',
  polygon: '0x408a634b8a8f0de729b48574a3a7ec3fe820b00a',
  avax: '0xe08b4c1005603427420e64252a8b120cace4d122',
  base: '0x60cfc2b186a4cf647486e42c42b11cc6d571d1e4',
  ethereum: '0x3ddc84940ab509c11b20b76b466933f40b750dc9'
}

const stellarTvl = async (api) => {
    const stellarApi = `https://api.stellar.expert/explorer/public/asset/${BENJI[api.chain].ticker}-${BENJI[api.chain].address}`
    const response = await fetch(stellarApi)
    const {supply, toml_info} = await response.json()
    const adjustedSupply = toUSDTBalances((supply / Math.pow(10, toml_info.decimals)))
    const [[tokenAddress, tokenBalance]] = Object.entries(adjustedSupply);
    return api.add(tokenAddress, tokenBalance, { skipChain: true })
}

const evmTVL = async (api) => {
  const [decimals, totalSupply] = await Promise.all([
    api.call({target: BENJI[api.chain], abi:'erc20:decimals'}),
    api.call({target: BENJI[api.chain], abi:'erc20:totalSupply'})
  ])

  const adjustedSupply = toUSDTBalances((totalSupply / Math.pow(10, decimals)))
  const [[tokenAddress, tokenBalance]] = Object.entries(adjustedSupply);
  api.add(tokenAddress, tokenBalance, { skipChain: true })

}

Object.keys(BENJI).forEach((chain) => {
  module.exports[chain] = { tvl: chain === 'stellar' ? stellarTvl : evmTVL };
});

