const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require('../helper/staking')

const contract = '0x90d11b8de2b30a84cB7e6cf6188581Ec08b1Bf82'
const lp = '0x8dC6EFD57A13B7ba3ff7824c9708DB24d3190703'
const chef = '0xb557c071BAe7DC3aa2366Cd0FC0477B45Eb696f1'

async function tvl(_, _b, _cb, { api, }) {
  const owners = await api.call({ target: contract, abi: "function getAllPools() public view returns(address[] memory list)" })
  const tokens = await api.multiCall({ abi: "function getPoolTokens(address _pool) public view returns(address[] memory list)", target: contract, calls: owners })
  return sumTokens2({ api, ownerTokens: tokens.map((v, i) => [v, owners[i]]) })
}

module.exports = {
  arbitrum: {
    tvl,
    pool2: staking(chef, lp),
  }
}
