const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("./abi.json");

const maxLeverage = 5;
const LOV_SUFFIX = "-lov";
const CEGA_STATE = "0x0730AA138062D8Cc54510aa939b533ba7c30f26B";
const CEGA_PRODUCT_VIEWER = "0x31C73c07Dbd8d026684950b17dD6131eA9BAf2C4";
const usdcAddress = ADDRESSES.ethereum.USDC;

// Funds are not lent out 
const FCN_PURE_OPTIONS_ADDRESSES = [
  '0x042021d59731d3fFA908c7c4211177137Ba362Ea', // supercharger
  '0x56F00A399151EC74cf7bE8DC38225363E84975E6', // go fast
  '0x784e3C592A6231D92046bd73508B3aAe3A7cc815', // insanic
];

// Funds are lent out 100%
const FCN_BOND_AND_OPTIONS_ADDRESSES = [
  '0xAB8631417271Dbb928169F060880e289877Ff158', // starboard
  '0xcf81b51AecF6d88dF12Ed492b7b7f95bBc24B8Af', // autopilot
  '0x80ec1c0da9bfBB8229A1332D40615C5bA2AbbEA8', // cruise control
  '0x94C5D3C2fE4EF2477E562EEE7CCCF07Ee273B108', // genesis basket
];

async function getProducts(api) {
  const productNames = await api.call({ target: CEGA_STATE, abi: abi.getProductNames, })
  const LOVProductNames = productNames.filter(v => v.includes(LOV_SUFFIX))
  return api.multiCall({ target: CEGA_STATE, abi: abi.products, calls: LOVProductNames })
}


async function getSumFCNProductDeposits(fcnProducts, api) {
  return api.multiCall({ calls: fcnProducts, abi: abi.sumVaultUnderlyingAmounts, })
}

async function getSumFCNProductQueuedDeposits(fcnProducts, api) {
  return api.multiCall({ calls: fcnProducts, abi: abi.queuedDepositsTotalAmount, })
}

function getLOVCalls(lovProducts) {
  const calls = []
  for (const product of lovProducts)
    for (let i = 2; i < maxLeverage; i++)
      calls.push([product, i])
  return calls.map(i => ({ params: i}))
}

async function getSumLOVProductDeposits(lovProducts, api) {
  const calls = getLOVCalls(lovProducts)
  return (await api.multiCall({ target: CEGA_PRODUCT_VIEWER, abi: abi.getLOVVaultMetadata, calls })).map(i => i.map(j => j.underlyingAmount)).flat()
}

async function getSumLOVProductQueuedDeposits(lovProducts, api) {
  const calls = getLOVCalls(lovProducts)
  return await api.multiCall({ target: CEGA_PRODUCT_VIEWER, abi: abi.getLOVProductQueuedDeposits, calls })
}

async function getEthereumTvl(_, _1, _2, { api }) {
  const lovProducts = await getProducts(api);
  const results = await Promise.all([
    getSumFCNProductDeposits(FCN_PURE_OPTIONS_ADDRESSES, api),
    getSumFCNProductQueuedDeposits(FCN_PURE_OPTIONS_ADDRESSES, api),
    getSumLOVProductDeposits(lovProducts, api),
    getSumLOVProductQueuedDeposits(lovProducts, api)
  ]);
  const sum = results.flat().flat().reduce((total, currentValue) => total + +currentValue, 0);
  api.add(usdcAddress, sum)
}

async function getBorrowedTvl(_, _1, _2, { api }) {
  const results = await Promise.all([
    getSumFCNProductDeposits(FCN_BOND_AND_OPTIONS_ADDRESSES, api),
    getSumFCNProductQueuedDeposits(FCN_BOND_AND_OPTIONS_ADDRESSES, api),
  ]);
  const sum = results.flat().flat().reduce((total, currentValue) => total + +currentValue, 0);
  api.add(usdcAddress, sum)
}

module.exports = {
  ethereum: {
    tvl: getEthereumTvl,
    borrowed: getBorrowedTvl,
  }
}