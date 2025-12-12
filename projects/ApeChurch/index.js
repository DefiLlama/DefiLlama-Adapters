const { sumTokens2 } = require('../helper/unwrapLPs');
const { nullAddress } = require('../helper/tokenMapping');

module.exports = {
  methodology: `Ape Church TVL is achieved by tracking the balance of The House smart contract. Volume is achieved by tracking the Transfer events from the UserInfoTracker smart contract.`,
  apechain: {
    volume: async (api) => {
        return await api.call({
            target: "0x6EA76F01Aa615112AB7de1409EFBD80a13BfCC84",
            params: [],
            abi: 'erc20:totalSupply'
            // fromBlock: 23427001,
        })
    },
    tvl: async (api) => {
        return sumTokens2({ owner: "0x2054709F89F18a4CCAC6132acE7b812E32608469", tokens: [nullAddress], api, })
    }
  }
}
