const sdk = require("@defillama/sdk");
const { sumTokensExport, } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking.js");

// veBao
const veBaoAddress = "0x8Bf70DFE40F07a5ab715F7e888478d9D3680a2B6";
const baoAddress = "0xCe391315b414D4c7555956120461D21808A69F3A";

const basketTvl = async (api) => {
  const baskets = [
    "0x5ee08f40b637417bcC9d2C51B62F4820ec9cF5D8", // bSTBL
  ]
  const supplies = await api.multiCall({  abi: 'uint256:totalSupply', calls: baskets}) 
  const amounts = await api.multiCall({  abi: 'function calcTokensForAmount(uint256 _amount) view returns (address[] tokens, uint256[] amounts)', calls: baskets.map((b, i) => ({ target: b, params: supplies[i]}))}) 
  const balances = {}
  amounts.forEach(({ tokens, amounts}) => {
    tokens.forEach((t, i) => sdk.util.sumSingleBalance(balances,t,amounts[i], api.chain))
  })
  return balances
}

module.exports = {
  start: '2022-01-01', // Jan 1 2022 00:00:00 GMT+0000
  ethereum: {
    tvl: basketTvl,
    pool2: sumTokensExport({
      tokensAndOwners: [
        ['0x8d7443530d6B03c35C9291F9E43b1D18B9cFa084', '0xe7f3a90AEe824a55B0F8969b6e29698966EE0191'], // Uni v2 gauge
        ['0x7657Ceb382013f1Ce9Ac7b08Dd8db4F28D3a7538', '0x675F82DF9e2fC99F8E18D0134eDA68F9232c0Af9'], // curve bSTBL-DAI
        ['0x0FaFaFD3C393ead5F5129cFC7e0E12367088c473', '0x0a39eE038AcA8363EDB6876d586c5c7B9336a562'], // curve baoUSD-3crv
      ]
    }),
    staking: staking(veBaoAddress, baoAddress)
  },
  hallmarks: [
    [1668898307, "baoV2 deployment"],
    [1672272000, "baoV2 emission start"]
  ]
};