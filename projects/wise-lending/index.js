async function tvl(api) {
  const { lending: lendingContract, feeManager } = config[api.chain]
  const tokens = await api.fetchList({ lengthAbi: 'uint256:getPoolTokenAddressesLength', itemAbi: 'function getPoolTokenAdressesByIndex(uint256) view returns (address)', target: feeManager })
  return api.sumTokens({ owner: lendingContract, tokens })
}

module.exports = {
  hallmarks: [
    [1705017600, "Project Exploited"]
  ],
}

const config = {
  ethereum: { lending: '0x37e49bf3749513A02FA535F0CbC383796E8107E4', feeManager: '0x0bc24e61daad6293a1b3b53a7d01086bff0ea6e5' },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
