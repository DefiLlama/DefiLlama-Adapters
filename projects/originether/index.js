const ADDRESSES = require('../helper/coreAssets.json')

const ethTvl = async (api) => {
  const token = "0x856c4Efb76C1D1AE02e20CEB03A2A6a08b0b8dC3";
  const totalSupply = await api.call({ abi: 'erc20:totalSupply', target: token })
  api.add(token, totalSupply)
  return api.sumTokens({ owner: token, tokens: [ADDRESSES.ethereum.WETH] })
}

async function baseTvl(api) {
  const token = "0xDBFeFD2e8460a6Ee4955A68582F85708BAEA60A3";
  const totalSupply = await api.call({ abi: 'erc20:totalSupply', target: token })
  api.add(token, totalSupply)
  return api.sumTokens({ owner: token, tokens: [ADDRESSES.base.WETH] })
}


module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  base: {
    tvl: baseTvl,
  },
};
