const config = {
  fantom: '0x9b7e30644a9b37eebaa7158129b03f5a3088659d',
  pulse: '0xac297968c97ef5686c79640960d106f65c307a37',
  base: '0x714c94b9820d7d73e61510e4c18b91f995a895c1',
  optimism: '0xd4f1a99212e5be72426bde45abadef66d7d6edf3',
  manta: '0x714c94b9820d7d73e61510e4c18b91f995a895c1',
  arbitrum: '0xe31fceaf93667365ce1e9edad3bed4a7dd0fc01a',
  avax: '0x6b714e6296b8b977e1d5ecb595197649e10a3db1',
  bsc: '0x3ace08b10b5c08a17d1c46277d65c81249e65f44',
}

const blackListTokens = [
  '0x6386704cd6f7a584ea9d23ccca66af7eba5a727e',
  '0xaa2c47a35c1298795b5271490971ec4874c8e53d',
  '0x6da9ebd271a0676f39c088a2b5fd849d5080c0af',
  '0x4117ec0a779448872d3820f37ba2060ae0b7c34b',
]

Object.keys(config).forEach(chain => {
  const factory= config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const profitTokens = await api.fetchList({  lengthAbi: 'profitTokensWhitelistCount', itemAbi: 'profitTokensWhitelist', target: factory})
      const connectors = await api.multiCall({  abi: 'function profitTokenConnector(address) view returns (address)', calls: profitTokens, target: factory})
      let underlyings = await api.multiCall({  abi: 'address:underlying', calls: connectors})
      underlyings = underlyings.filter(address => !blackListTokens.includes(address.toLowerCase()))
      const tokenCounts = await api.multiCall({  abi: 'uint256:tokensCount', calls: underlyings})
      const owners = []
      const calls = []
      for(let i = 0; i < underlyings.length; i++){
        for(let j = 0; j < tokenCounts[i]; j++){
          calls.push({
            target: underlyings[i],
            params: j
          })
          owners.push(underlyings[i])
        }
      }
      const tokens = await api.multiCall({  abi: 'function tokens(uint256) view returns (address)', calls })
      return api.sumTokens({ tokensAndOwners2: [tokens, owners]})
    }
  }
})