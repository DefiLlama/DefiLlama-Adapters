const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require('../helper/staking')

const contract = '0x90d11b8de2b30a84cB7e6cf6188581Ec08b1Bf82'
const lp = '0x8dC6EFD57A13B7ba3ff7824c9708DB24d3190703'
const chef = '0xb557c071BAe7DC3aa2366Cd0FC0477B45Eb696f1'
const vHash = '0x958882fda110febd41536e45034bebff2a815006'
const hash = '0x2e80259c9071b6176205ff5f5eb6f7ec8361b93f'

async function tvl(_, _b, _cb, { api, }) {
  const owners = await api.call({ target: contract, abi: "function getAllPools() public view returns(address[] memory list)" })
  const tokens = await api.multiCall({ abi: "function getPoolTokens(address _pool) public view returns(address[] memory list)", target: contract, calls: owners })
  return sumTokens2({ api, ownerTokens: tokens.map((v, i) => [v, owners[i]]) })
}

const op_contract = '0xF96aad4942D8A0394158Fd960003397690fB795D'
const op_lp = '0xb426aE40E43be57215ba7DAA06Cbc5d48eD35Dcf'
const op_chef = '0xEAB4C6C26A1F296E8E0033ffB817D5311C51299d'
const op_vHash = '0x9D66c32E137E618BEE9669Ae096FD59ba925AaA5'
const op_hash = '0x2e80259C9071B6176205FF5F5Eb6F7EC8361b93f'

async function op_tvl(_, _b, _cb, { api, }) {
  const owners = await api.call({ target: op_contract, abi: "function getAllPools() public view returns(address[] memory list)" })
  const tokens = await api.multiCall({ abi: "function getPoolTokens(address _pool) public view returns(address[] memory list)", target: op_contract, calls: owners })
  return sumTokens2({ api, ownerTokens: tokens.map((v, i) => [v, owners[i]]) })
}

module.exports = {
  arbitrum: {
    tvl,
    pool2: staking(chef, lp),
    staking: staking(vHash, hash),
  },
  optimism: {
    tvl: op_tvl,
    pool2: staking(op_chef, op_lp, 'optimism', op_lp),
    staking: staking(op_vHash, op_hash),
  }
}
