const uniV3ABI = require('../helper/abis/uniV3.json');

const config = {
  arbitrum: { strategy: '0xB4E291f443f51D80186dd3EE0Af7F4a4E6e90804', veToken: '0xAAA343032aA79eE9a6897Dab03bef967c3289a06', token: '0xAAA6C1E32C55A7Bfa8066A6FAE9b42650F262418' },
  avax: { strategy: '0xedEd6a22bf714d4B19b7e7bC1CA0BCF88956751c', veToken: '0xAAAEa1fB9f3DE3F70E89f37B69Ab11B47eb9Ce6F', token: '0xaaab9d12a30504559b0c5a9a5977fee4a6081c6b' },
  bsc: { strategy: '0x37e46C030e0d843b39F692c9108E54945F4CCCf7', veToken: '0xfBBF371C9B0B994EebFcC977CEf603F7f31c070D', token: '0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11' },
  polygon: { strategy: '0x32dAc1B8AD93b53F549D6555e01c35dCC50b6229', veToken: '0xB419cE2ea99f356BaE0caC47282B9409E38200fa', token: '0xBFA35599c7AEbb0dAcE9b5aa3ca5f2a79624D8Eb' },
  mantle: { strategy: '0xCaAF554900E33ae5DBc66ae9f8ADc3049B7D31dB', veToken: '0xAAAEa1fB9f3DE3F70E89f37B69Ab11B47eb9Ce6F', token: '0xC1E0C8C30F251A07a894609616580ad2CEb547F2' },
  scroll: { strategy: '0xDDFc6B230656010f314F2F659eC8ff33FaB7A9Db', veToken: '0xAAAEa1fB9f3DE3F70E89f37B69Ab11B47eb9Ce6F', token: '0xAAAE8378809bb8815c08D3C59Eb0c7D1529aD769' },
}

Object.keys(config).forEach(chain => {
  const { strategy, veToken, token, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const nftPositions = await api.call({ abi: 'erc20:balanceOf', target: veToken, params: strategy })
      const positionIds = await api.multiCall({
        abi: uniV3ABI.tokenOfOwnerByIndex, target: veToken,
        calls: Array(Number(nftPositions)).fill(0).map((_, index) => ({ params: [strategy, index] }))
      })
      const locked = await api.multiCall({ abi: 'function locked(uint256) view returns (uint256 amount, uint256 end)', calls: positionIds, target: veToken })
      locked.forEach(i => api.add(token, i.amount))
    }
  }
})