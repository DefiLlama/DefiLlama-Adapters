
const abi = require("./abi.json");

const maxLeverage = 5;
const LOV_SUFFIX = "-lov";
const CEGA_STATE = "0x0730AA138062D8Cc54510aa939b533ba7c30f26B";
const CEGA_PRODUCT_VIEWER = "0x31C73c07Dbd8d026684950b17dD6131eA9BAf2C4";
const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const sumArray = (acc, i) => acc + +i

async function getEthereumTvl(_, _1, _2, { api }) {

  async function getProducts() {
    const productNames = await api.call({ target: CEGA_STATE, abi: abi.getProductNames, })
    const LOVProductNames = productNames.filter(v => v.includes(LOV_SUFFIX))
    const FCNProductNames = productNames.filter(v => !v.includes(LOV_SUFFIX))

    let FCNProducts = await api.multiCall({ target: CEGA_STATE, abi: abi.products, calls: FCNProductNames });
    let LOVProducts = await api.multiCall({ target: CEGA_STATE, abi: abi.products, calls: LOVProductNames });
    return [FCNProducts, LOVProducts];
  }

  async function getSumFCNProductDeposits(fcnProducts) {
    return api.multiCall({ abi: abi.sumVaultUnderlyingAmounts, calls: fcnProducts });
  }

  async function getSumFCNProductQueuedDeposits(fcnProducts) {
    return api.multiCall({ abi: abi.queuedDepositsTotalAmount, calls: fcnProducts });
  }

  async function getSumLOVProductDeposits(lovProducts) {
    const calls = getLOVCalls(lovProducts)
    let amounts = await api.multiCall({ target: CEGA_PRODUCT_VIEWER, abi: abi.getLOVVaultMetadata, calls });
    return amounts.flat().map(i => i.underlyingAmount)
  }

  async function getSumLOVProductQueuedDeposits(lovProducts) {
    const calls = getLOVCalls(lovProducts)
    return api.multiCall({ target: CEGA_PRODUCT_VIEWER, abi: abi.getLOVProductQueuedDeposits, calls });
  }

  function getLOVCalls(lovProducts) {
    const calls = []
    for (const product of lovProducts)
      for (let i = 2; i < maxLeverage; i++)
        calls.push([product, i])
    return calls.map(i => ({ params: i}))
  }

  const [fcnProducts, lovProducts] = await getProducts()
  const results = await Promise.all([
    getSumFCNProductDeposits(fcnProducts),
    getSumFCNProductQueuedDeposits(fcnProducts),
    getSumLOVProductDeposits(lovProducts),
    getSumLOVProductQueuedDeposits(lovProducts)
  ]);

  api.add(usdcAddress, results.flat().reduce(sumArray, 0))
}


module.exports = {
  ethereum: {
    tvl: getEthereumTvl,
  }
}