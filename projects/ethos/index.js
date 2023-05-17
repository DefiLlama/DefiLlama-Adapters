async function tvl(_, _b, _cb, { api, }) {
  const ADMIN_ADDR = '0xd584a5e956106db2fe74d56a0b14a9d64be8dc93'
  const CONFIG_ADDR = await api.call({ abi: 'address:collateralConfig', target: ADMIN_ADDR })
  const collaterals = await api.call({ abi: 'address[]:getAllowedCollaterals', target: CONFIG_ADDR })
  const ACTIVE_POOL = await api.call({ abi: 'address:activePool', target: ADMIN_ADDR })
  const bals = await api.multiCall({ abi: 'function getEntireSystemColl(address) view returns (uint256)', target: ADMIN_ADDR, calls: collaterals })
  api.addTokens(collaterals, bals)

}
module.exports = {
  methodology: `TVL is fetched from the Ethos Reserve subgraph and the Byte Masons token price api.`,
  optimism: {
    tvl
  },
}
