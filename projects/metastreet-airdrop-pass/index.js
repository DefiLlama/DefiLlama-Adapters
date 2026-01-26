async function tvl(api) {
  const factory = '0xA8a7e295c19b7D9239A992B8D9C053917b8841C6'
  const delegateV2 = '0x00000000000000447e69651d841bD8D104Bed493'
  const delegations = await api.call({ abi: abi.getIncomingDelegations, target: delegateV2, params: factory })
  delegations.filter(i => i.type_ === '3').forEach(i => api.add(i.contract_, 1))
}

module.exports = {
  ethereum: {
    tvl,
  },
  methodology: "TVL is calculated by summing the value of underlying NFTs of the delegation tokens owned by MetaStreet Airdrop Pass Factory."
}

const abi = {
  "getIncomingDelegations": "function getIncomingDelegations(address to) view returns ((uint8 type_, address to, address from, bytes32 rights, address contract_, uint256 tokenId, uint256 amount)[] delegations_)",
}
