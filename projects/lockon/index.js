const START_TIMESTAMP = 1690340140; // 2023-07-26T02:55:40Z
const config = {
  polygon: {
    controllerAddress: "0x153e739B8823B277844Ad885A30AC5bD9DfB6E83",
  },
  arbitrum: {
    controllerAddress: "0xA36c2B06aFc96Ffd52d148Ed6acbB9fe2Ab864Be",
  }
}

function tvlExport({controllerAddress}) {
  return async function tvl(api) {
    const sets = await api.call({ abi: "address[]:getSets", target: controllerAddress, })
    const tokens = await api.multiCall({  abi: 'address[]:getComponents', calls: sets})
    const ownerTokens = sets.map((set, i) => [tokens[i], set])
    return api.sumTokens({ ownerTokens })
  }

}

module.exports.start = START_TIMESTAMP
Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: tvlExport(config[chain])
  }
})
