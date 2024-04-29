const ADDRESSES = require('../helper/coreAssets.json')
module.exports={
    ethereum:{
        tvl: async (api) => {
            const tokens = await api.call({ target: "0x741c2Cd25f053a55fd94afF1afAEf146523E1249", abi: "function listedTokens() public view returns (address[] memory listedTokens_)" })
            api.add("0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee", await api.call({
                target: "0xF047ab4c75cebf0eB9ed34Ae2c186f3611aEAfa6",
                abi: "function balance(address, address) public view returns (uint256 balance)",
                params: ["0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee", "0x52aa899454998be5b000ad077a46bbe360f4e497"]
            }))
            return api.sumTokens({ owner: "0x52aa899454998be5b000ad077a46bbe360f4e497", tokens: [
                ADDRESSES.null,
                ...tokens.filter(t=>t.toLowerCase()!=="0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
            ] })
          },
    }
}