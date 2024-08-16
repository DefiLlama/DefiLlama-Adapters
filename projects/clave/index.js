const ZtakeV1Address = "0x9248F1Ee8cBD029F3D22A92EB270333a39846fB2"

async function tvl(api) {
  const ZK = await api.call({  abi: 'address:ZK', target: ZtakeV1Address})
  return api.sumTokens({ owner: ZtakeV1Address, tokens: [ZK] })
}

module.exports = {
  era: {
    tvl,
  }
}
