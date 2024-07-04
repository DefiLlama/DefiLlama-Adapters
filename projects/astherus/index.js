const { sumTokensExport } = require("../helper/unwrapLPs");
const utils = require('../helper/utils');

async function fetchAssetTokensByChain(chain) {
  const { data } = await utils.fetchURL(`https://astherus.finance/bapi/futures/v1/public/future/web3/ae-deposit-asset?chainId=${chain}`)
  return (data.data ?? []).map(i => i.contractAddress)
}

const ContractMap = {
  '56': '0x128463A60784c4D3f46c23Af3f65Ed859Ba87974',
  '1': '0x604DD02d620633Ae427888d41bfd15e38483736E'
}
const Chain = {
  BSC: '56',
  ETH: '1'
}

module.exports = {
  start: 1706716800000, // 02/01/2024 @ 00:00:00pm (UTC)
  bsc: {
    tvl: async function (...rest) {
      const tokens = await fetchAssetTokensByChain(Chain.BSC)
      return sumTokensExport({
        owner: ContractMap[Chain.BSC], tokens
      })(...rest)
    }
  },
  ethereum: {
    tvl: async function (...rest) {
      const tokens = await fetchAssetTokensByChain(Chain.ETH)
      return sumTokensExport({
        owner: ContractMap[Chain.ETH], tokens
      })(...rest)
    }
  },
};
