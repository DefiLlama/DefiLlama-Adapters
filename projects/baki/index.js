const bakiAddress = "0x8c1278D8b20ecEe71736F27181D3018E9a15652B";

const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("./abi.json");

module.exports = {
  methodology: "The baki protocol keeps track of the total collateral locked in the vault",
  avax:{
    tvl: async (_, _1, _2, { api }) => {
      // const usdcBal = await api.call({  abi: abi.totalCollateral, target: bakiAddress })
      // api.add(usdc, usdcBal)
      // return api.getBalances()
      const treasury = await api.call({  abi: abi.treasuryWallet, target: bakiAddress })
      return api.sumTokens({ owner: treasury, tokens: [ADDRESSES.avax.USDC]})
      
    }
  },
 
};
