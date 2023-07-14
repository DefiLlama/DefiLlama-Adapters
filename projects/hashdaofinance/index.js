const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require('../helper/staking')
const { pool2 } = require('../helper/pool2')

const config = {
  arbitrum: {
    contract: '0x90d11b8de2b30a84cB7e6cf6188581Ec08b1Bf82',
    lp: '0x8dC6EFD57A13B7ba3ff7824c9708DB24d3190703',
    chef: '0xb557c071BAe7DC3aa2366Cd0FC0477B45Eb696f1',
    vHash: '0x958882fda110febd41536e45034bebff2a815006',
    hash: '0x2e80259c9071b6176205ff5f5eb6f7ec8361b93f',
  },
  optimism: {
    contract: '0xF96aad4942D8A0394158Fd960003397690fB795D',
    lp: '0xb426aE40E43be57215ba7DAA06Cbc5d48eD35Dcf',
    chef: '0xEAB4C6C26A1F296E8E0033ffB817D5311C51299d',
    vHash: '0x9D66c32E137E618BEE9669Ae096FD59ba925AaA5',
    hash: '0x2e80259c9071b6176205ff5f5eb6f7ec8361b93f',
    isPool2: true,
  },
}

Object.keys(config).forEach(chain => {
  const { contract, lp, chef, hash, vHash, isPool2,} = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const owners = await api.call({ target: contract, abi: "function getAllPools() public view returns(address[] memory list)" })
      const tokens = await api.multiCall({ abi: "function getPoolTokens(address _pool) public view returns(address[] memory list)", target: contract, calls: owners })
      return sumTokens2({ api, ownerTokens: tokens.map((v, i) => [v, owners[i]]), })
    }
  }
  if (chef && lp)
    module.exports[chain].pool2 = isPool2 ? pool2(chef, lp) : staking(chef, lp)
  
  if (hash && vHash)
    module.exports[chain].staking = staking(vHash, hash, undefined, 'arbitrum:'+config.arbitrum.hash)
})