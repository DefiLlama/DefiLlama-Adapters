const CAPY_STAKING_CONTRACT = '0x67D171A673FfDBd5BBce01dE1489f9E57F3d911b';
const CAPY_RESTAKING_CONTRACT = '0x12178d2B86031dD293274A0E25c8908521F3d27C';

async function tvl(api) {
  const contracts = [CAPY_STAKING_CONTRACT, CAPY_RESTAKING_CONTRACT]
  const tokens = await api.multiCall({ abi: 'address[]:getSupportedTokens', calls: contracts })
  const ownerTokens = contracts.map((contract, i) => [tokens[i], contract])
  return api.sumTokens({ ownerTokens })
}

module.exports = {
  methodology: 'The TVL of the Capy Finance project in USD.',
  start: 1000235,
  bsquared: {
    tvl,
  },
}