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
  const price = await multiCall({
    calls: contracts.map(c => ({
      target: c.xSTRK,
      params: ['0xDE0B6B3A7640000', '0x0']
    })),
    abi: { ...endurABIMap.preview_redeem, customInput: 'address' }
  });  
  let xstrk_price = Number(price[0]) / 10**18 // Assuming `price` is returned as a BigInt array

  const data = await multiCall({
    calls: contracts.map(c => ({
      target: c.vesu,
      params: [pool_id, c.xSTRK, c.token, c.address] 
    })),
    abi: {...SINGLETONabiMap.position, customInput: 'address'},
  })


  let collateral = Number(data[0]['2']);
  let debt = Number(data[0]['3']);

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

async function _computeEkuboTVL(
  address
) {
  const totalShares = await call({
    target: address,
    abi: EkuboAbiMap.total_supply
  })

  const hexValue = '0x' + BigInt(totalShares).toString(16);

  const assets = await call({
    target: address,
    params: [hexValue, '0x0'],
    abi: { ...EkuboAbiMap.convert_to_assets, customInput: 'address' }
  })

  return assets
} 

async function computeEkuboTVL(api) {
  const ekuboContracts = STRATEGIES.EkuboVaults
  
  for (const c of ekuboContracts) {
    const assets = await _computeEkuboTVL(c.address)

    api.addTokens(c.token1, assets['2'])
    api.addTokens(c.token2, assets['1'])
  }
}

async function computeEkuboBTCTvl(api) {
  const ekuboContracts = STRATEGIES.EkuboVaultsEndurBTC

  for (const c of ekuboContracts) {
    const assets = await _computeEkuboTVL(c.address)

    const hexValue = '0x' + BigInt(assets['1']).toString(16);
    // convert lst variant to its btc form
    const lstAssets = await call ({
      target: c.token2,
      params: [hexValue, '0x0'],
      abi: {...endurABIMap.convert_to_assets, customInput: 'address'}
    })
    
    // add these assets to native btc token
    let totalAssets = Number(assets['2']) + Number(lstAssets)
    api.addTokens(c.token1, totalAssets)
  }
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
  doublecounted: true,
  methodology: "The TVL is calculated as a sum of total assets deposited into strategies",
  starknet: {
    tvl,
  },
};