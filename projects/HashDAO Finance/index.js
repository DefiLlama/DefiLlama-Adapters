const sdk = require('@defillama/sdk')
const { sumTokens2 } = require("../helper/unwrapLPs");
const { pool2 } = require('../helper/pool2')

const contract = '0x90d11b8de2b30a84cB7e6cf6188581Ec08b1Bf82'
const lp = '0x8dC6EFD57A13B7ba3ff7824c9708DB24d3190703'
const chef = '0xb557c071BAe7DC3aa2366Cd0FC0477B45Eb696f1'

async function tvl(_, _b, _cb, { api, }) {
  const resp = await sdk.api.abi.call({
    target: contract,
    chain: api.chain,
    abi: "function getAllPools() public view returns(address[] memory list)",
  })

  let owners = []
  let tokens = []
  for (const pool of resp.output) {
    const _resp = await sdk.api.abi.call({
      target: contract,
      chain: api.chain,
      abi: "function getPoolTokens(address _pool) public view returns(address[] memory list)",
      params: pool,
    })

    const _tokens = _resp.output
    for (let _token of _tokens) {
      owners.push(pool)
      tokens.push(_token)
    }
  }

  return sumTokens2({ api, owner: contract, tokens, owners })
}

module.exports = {
  arbitrum: {
    tvl,
    pool2: pool2(chef, lp),
  }
}
