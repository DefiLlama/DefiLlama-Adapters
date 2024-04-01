const START_TIMESTAMP = 1690340140; // 2023-07-26T02:55:40Z
const CONTROLLER_ADDRESS = "0x153e739B8823B277844Ad885A30AC5bD9DfB6E83"

async function tvl(api) {
  const sets = await api.call({ abi: "address[]:getSets", target: CONTROLLER_ADDRESS, })
  const tokens = await api.multiCall({  abi: 'address[]:getComponents', calls: sets})
  const ownerTokens = sets.map((set, i) => [tokens[i], set])
  return api.sumTokens({ ownerTokens })
}

module.exports = {
  start: START_TIMESTAMP,
  polygon: { tvl }
}
