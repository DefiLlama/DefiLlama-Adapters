const ADDRESSES = require('../helper/coreAssets.json')
module.exports={
    ethereum:{
        tvl: async (api) => {
            const tokens = await api.call({ target: "0x741c2Cd25f053a55fd94afF1afAEf146523E1249", abi: "function listedTokens() public view returns (address[] memory listedTokens_)" })
            return api.sumTokens({ owner: "0x52aa899454998be5b000ad077a46bbe360f4e497", tokens: [
                ADDRESSES.null,
                ...tokens.filter(t=>t.toLowerCase()!=="0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
            ] })
          },
    }
}