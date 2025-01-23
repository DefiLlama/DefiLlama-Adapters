const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const lpVaults = [
  "0xE595C99b35f17408178097aFcF08DaE31DF0AD78", //PGL Vault PNG
  "0xe69FaFbCA661368855A29B9Bf7eD14aA5c27FB4E", //JLP Vault JOE
  "0xBcf284640dF1b17DC9022168798bc839e36F39Df", //JLP Vault JOE
  "0x5806F70646832bfe5Dd11dF847832f9c268545c4", //JLP Vault JOE
  "0x3C6e6019337AeEb1E58dcab16473Bf05B92B7417", //PGL Vault PNG
  "0x18914D6691A5D9c43Db28a51Fb0c0891e73ae5b6", //USDC Vault
  "0x336e16b1f3A10048F38367B16808CF70e9e34E50",
];

const tvl = async (api) => {
  const balances = {};

  const wantTokens = await api.multiCall({  abi: abi.want, calls: lpVaults}) 
  const balanceOfVaults = await api.multiCall({  abi: abi.balance, calls: lpVaults}) 
  wantTokens.forEach((token, i) => sdk.util.sumSingleBalance(balances,token,balanceOfVaults[i], api.chain))

  return balances
};

module.exports = {
  deadFrom: 1648765747,
  avax:{
    tvl,
  },
  methodology: "We count liquidity on the Vaults through their contracts",
};
