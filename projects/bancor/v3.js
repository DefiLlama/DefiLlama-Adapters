const ADDRESSES = require('../helper/coreAssets.json')
const abi = require('./abi.json');
const sdk = require('@defillama/sdk');
const { sumTokens } = require('../helper/unwrapLPs');

const ethAddress = ADDRESSES.null;
const ethReserveAddresses = ['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'];
const bancor = '0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c'

async function addV3Balance(balances, block) {
  const masterVault = '0x649765821D9f64198c905eC0B2B037a4a52Bc373'
  const networkSettings = '0xeEF417e1D5CC832e619ae18D2F140De2999dD4fB'
  const { output: tokens } = await sdk.api.abi.call({
    target: networkSettings, block, abi: abi.liquidityPools
  })

  tokens.push(bancor)

  const toa = tokens
    .filter(t => !ethReserveAddresses.includes(t.toLowerCase()))
    .map(t => [t, masterVault])

  const { output: balance } = await sdk.api.eth.getBalance({ target: masterVault, block })
  sdk.util.sumSingleBalance(balances, ethAddress, balance)
  return sumTokens(balances, toa, block)
}

/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, block) {

  // get ETH balances
  let balances = {};

  return addV3Balance(balances, block)
}

module.exports = {
  start: 1650283200,  // 18/04/2022 @ 1:00pm (UTC)
  methodology: `Counts the tokens in the Master Vault Contract.`,
  ethereum: {
    tvl,
  },
  hallmarks:[
    [1650322800, "V3 Beta"], // 19/04/2022 @ 12:00am (UTC)
    [1652223600, "V3 Full Launch"]  // 11/05/2022 @ 12:00am (UTC)
  ],
};
