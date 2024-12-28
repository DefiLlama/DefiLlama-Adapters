const { sumTokens2 } = require('../helper/unwrapLPs');
const abi = require('./abi.json');

const bancor = '0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c'

async function addV3Balance(api) {
  const masterVault = '0x649765821D9f64198c905eC0B2B037a4a52Bc373'
  const networkSettings = '0xeEF417e1D5CC832e619ae18D2F140De2999dD4fB'
  const tokens = await api.call({  abi: abi.liquidityPools, target: networkSettings})
  tokens.push(bancor)
  return sumTokens2({ api, owner: masterVault, tokens })
}

module.exports = {
  start: '2022-04-18',  // 18/04/2022 @ 1:00pm (UTC)
  methodology: `Counts the tokens in the Master Vault Contract.`,
  ethereum: {
    tvl: addV3Balance,
  },
  hallmarks:[
    [1650322800, "V3 Beta"], // 19/04/2022 @ 12:00am (UTC)
    [1652223600, "V3 Full Launch"]  // 11/05/2022 @ 12:00am (UTC)
  ],
};
