const sdk = require("@defillama/sdk");
const { sumTokens } = require('../helper/unwrapLPs');

const archEthereumWeb3AddressETH = "0xe8e8486228753E01Dbc222dA262Aa706Bd67e601";

const abi = 'address[]:getComponents'

async function tvl(ts, block) {
  const { output: tokens } = await sdk.api.abi.call({ target: archEthereumWeb3AddressETH, abi, block })
  const toa = tokens.map(t => [t, archEthereumWeb3AddressETH])
  return sumTokens({}, toa, block)
}


module.exports = {
  ethereum: {
    tvl,
  },
};