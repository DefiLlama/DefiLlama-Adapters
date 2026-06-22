/**
 * Troves is a yield aggregator and strategy builder on Starknet
 * - We use various DeFi protocols on starknet to design yield strategies
 */
const { STRATEGIES }  = require("./utils")
const { multiCall } = require("../helper/chain/starknet");
const { call } = require("../helper/chain/starknet");
const { EkuboAbiMap } = require('./ekubo');
const { ERC4626AbiMap } = require('./erc4626');
const { SINGLETONabiMap } = require('./singleton');
const { endurABIMap } = require('./endur');
const { FusionAbiMap } = require('./fusionAbi');

// returns tvl and token of the AutoCompounding strategies
async function computeAutoCompoundingTVL(api) {
  // vaults under this catagory are retired so tvl balances are not considered
  const retiredBalance = 0
  const contracts = STRATEGIES.AutoCompounding;
  api.addTokens(contracts.map(c => c.token), retiredBalance);
}

async function computeXSTRKStratTVL(api) {
  const pool_id = "0x52fb52363939c3aa848f8f4ac28f0a51379f8d1b971d8444de25fbd77d8f161";

  const contracts = STRATEGIES.xSTRKStrats;
  const xSTRKSensei = contracts[0];
  const price = await call({
    target: xSTRKSensei.xSTRK,
    params: ['0x0de0b6b3a7640000', '0x0'],
    abi: { ...endurABIMap.preview_redeem, customInput: 'address' }
  });  
  let xstrk_price = Number(price) / 10**18 // Assuming `price` is returned as a BigInt array

  const data = await call({
    target: xSTRKSensei.vesu,
    params: [pool_id, xSTRKSensei.xSTRK, xSTRKSensei.token, xSTRKSensei.address],
    abi: {...SINGLETONabiMap.position, customInput: 'address'},
  })

  let collateral = Number(data['2']);
  let debt = Number(data['3']);

  let tvl = (collateral * xstrk_price) - debt;
  if (tvl < 0) throw new Error("Negative TVL detected, check the xSTRK strategy logic");
  
  api.addTokens(contracts[0].token, [tvl]);
}

// returns tvl and token of the Sensei strategies
async function computeSenseiTVL(api) {
  // vaults under this catagory are retired so tvl balances are not considered
  const retiredBalance = 0 
  const contracts = STRATEGIES.Sensei;
  api.addTokens(contracts.map(c => c.token), retiredBalance);
}

async function computeFusionTVL(api) {
  const fusionContracts = STRATEGIES.FusionVaults
  // calculates tvl of each fusion vault 
  const totalAssets = await multiCall({
    calls: fusionContracts.map(c => c.address),
    abi: FusionAbiMap.total_assets
  })
  api.addTokens(fusionContracts.map(c => c.token), totalAssets);
}

// Batched: one multiCall for all total_supply, then one for all convert_to_assets.
async function _computeEkuboTVLBatch(contracts) {
  const totalShares = await multiCall({
    calls: contracts.map(c => c.address),
    abi: EkuboAbiMap.total_supply,
  })

  const assets = await multiCall({
    calls: contracts.map((c, i) => ({
      target: c.address,
      params: ['0x' + BigInt(totalShares[i]).toString(16), '0x0'],
    })),
    abi: { ...EkuboAbiMap.convert_to_assets, customInput: 'address' },
  })

  return assets
}

async function computeEkuboTVL(api) {
  const ekuboContracts = STRATEGIES.EkuboVaults
  const assetsList = await _computeEkuboTVLBatch(ekuboContracts)

  ekuboContracts.forEach((c, i) => {
    const assets = assetsList[i]
    api.addTokens(c.token1, assets['2'])
    api.addTokens(c.token2, assets['1'])
  })
}

async function computeEkuboBTCTvl(api) {
  const ekuboContracts = STRATEGIES.EkuboVaultsEndurBTC
  const assetsList = await _computeEkuboTVLBatch(ekuboContracts)

  // convert each lst variant to its btc form in one batched multiCall
  const lstAssets = await multiCall({
    calls: ekuboContracts.map((c, i) => ({
      target: c.token2,
      params: ['0x' + BigInt(assetsList[i]['1']).toString(16), '0x0'],
    })),
    abi: { ...endurABIMap.convert_to_assets, customInput: 'address' },
  })

  ekuboContracts.forEach((c, i) => {
    // add these assets to native btc token
    const totalAssets = Number(assetsList[i]['2']) + Number(lstAssets[i])
    api.addTokens(c.token1, totalAssets)
  })
}

async function computeEvergreenTVL(api) {
  const evergreenContracts = STRATEGIES.EvergreenVaults;
  const totalAssets = await multiCall({
    calls: evergreenContracts.map(c => c.address),
    abi: ERC4626AbiMap.total_assets
  })
  api.addTokens(evergreenContracts.map(c => c.token), totalAssets);
}

async function computeHyperVaultTVL(api) {
  const hyperContracts = STRATEGIES.HyperVaults;
  const totalAssets = await multiCall({
    calls: hyperContracts.map(c => c.address),
    abi: ERC4626AbiMap.total_assets
  })

  // convert to asset 
  const lstAssets = await multiCall({
    calls: hyperContracts.map((c, i) => ({
      target: c.lst,
      params: ['0x' + BigInt(totalAssets[i]).toString(16), '0x0']
    })),
    abi: {...endurABIMap.convert_to_assets, customInput: 'address'}
  })

  api.addTokens(hyperContracts.map(c => c.token), lstAssets)
} 

async function tvl(api) {
  await computeAutoCompoundingTVL(api);
  await computeSenseiTVL(api); 
  await computeXSTRKStratTVL(api);
  await computeFusionTVL(api);
  await computeEkuboTVL(api);
  await computeEkuboBTCTvl(api);
  await computeEvergreenTVL(api);
  await computeHyperVaultTVL(api)
}

module.exports = {
  isHeavyProtocol: true,  
  doublecounted: true,
  methodology: "The TVL is calculated as a sum of total assets deposited into strategies",
  starknet: {
    tvl,
  },
};