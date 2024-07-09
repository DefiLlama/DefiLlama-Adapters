const config = {
  arbitrum: {
    vaults: [
      "0x7ECd1b5255543F4C2D7D8E475afCd01699dBE2B0",
      "0xdFEb3460771148799b2D4344c369e2b2d6C26c42",
      "0x00aEca021D0f06c7dee54D58ee6Af47B5645aB19",
      "0x989897f1D976EE0b59Bf0A3172C170D8f3Cb84e3",
      "0x6E72C8726c71a4Cbc6e31ff7d47B399Fa983C7B8",
      "0x106825b71ccE77a70B69f57A0ACf9C4a6acf292a"
    ], aVaults: [
      "0x3a253838121b9ad9736fAFc030Cf4971615D68b2",
      "0xD9cFF1bc89f705EaB2579fA2DC86E9a6F971370a",
      "0x9C5D3C3AbD633b8eA68C5a51325f8630DC620AD9",
      "0x2F1C60bA96ec6925fA9bBbFC9Eb7908bD35Bc224",
      "0x72e0906558e4Ee528974cD7803bfF12d9f2869C3",
      "0x9377f17ABde96887943e5Fcc92Db034c76820529",
      "0x6f4DBcfC81Dd22AE3EDeC5f9724E43cba8C92E50",
      "0xA8fcc1BA1D4893a4894206986B65F652D5FE04AB",
      "0xA76Ee91c6E51D248782d7C81826dF91522a6EF96",
      "0x7E11ce3e893081B111b720dF29669dEf14e81cDE",
      "0x8E882A56604F2b5735EA979bD6fa06C064d2f3f9",
      "0xf7Be091BCBbB79f3D9029A25Dc94bC8FDd134EaC"
    ]
  },
  ethereum: {
    vaults: [
      "0x3a253838121b9ad9736fAFc030Cf4971615D68b2",
      "0xD9cFF1bc89f705EaB2579fA2DC86E9a6F971370a",
      "0x106825b71ccE77a70B69f57A0ACf9C4a6acf292a",
      "0x5494855B98858Ea4eF54D13E1d003197A387CE34",
      "0x9C5D3C3AbD633b8eA68C5a51325f8630DC620AD9",
      "0x2F1C60bA96ec6925fA9bBbFC9Eb7908bD35Bc224"
    ], aVaults: [
      "0x00aEca021D0f06c7dee54D58ee6Af47B5645aB19",
      "0x989897f1D976EE0b59Bf0A3172C170D8f3Cb84e3",
      "0x9377f17ABde96887943e5Fcc92Db034c76820529",
      "0x99c59D82b10c56950F6C031946656e6D0aD509ca",
      "0xF6c70b5F034070001E833C9EbC6a3A0176B683A6",
      "0x62104e40fA81a19f2B7E17C78C3ffBF4aCa4F212"
    ]
  }
}

Object.keys(config).forEach(chain => {
  const { vaults = [], aVaults = [] } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await api.multiCall({ abi: 'address:collateral', calls: vaults })
      const tokens2 = await api.multiCall({ abi: 'address:collateral', calls: aVaults })
      const atokens = await api.multiCall({ abi: 'address:aToken', calls: aVaults })
      return api.sumTokens({ tokensAndOwners2: [[tokens, tokens2, atokens].flat(), [vaults, aVaults, aVaults].flat()] })
    }
  }
})
