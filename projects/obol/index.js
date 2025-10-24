const { getConfig } = require('../helper/cache');

const SUMMARY_ENDPOINT = 'https://api.obol.tech/v1/lock/network/summary/mainnet'
// const OPERATOR_ENDPOINT = 'https://api.obol.tech/v1/address/network/mainnet?'
// const OPERATOR_ENDPOINT_DETAIL = 'https://api.obol.tech/lock/operator/'

const tvl = async (api) => {
  const { eth_staked } = await getConfig('obol', SUMMARY_ENDPOINT)
  api.addGasToken(eth_staked * 1e18)
};

module.exports = {
  methodology: 'Returns the total number of tokens participating in securing the network through the Obol protocol',
  ethereum: { tvl }
}