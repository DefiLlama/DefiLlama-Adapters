const { getLogs2 } = require("../helper/cache/getLogs");
const ADDRESSES = require("../helper/coreAssets.json");

const BURN_ADDRESS = ADDRESSES.null;
const FACTORY = {
  ethereum: { factory: '0x6D961c9DCF1AD73566822BA4B087892e3839B849', fromBlock: 24949282 },
}

const CREATE_DEPLOYMENT_EVENT =
  'event Deployed(address indexed lender, address indexed coin, address indexed vault)';

async function tvl(api) {
  const { factory, fromBlock } = FACTORY[api.chain]
  const logs = await getLogs2({ api, factory, fromBlock, eventAbi: CREATE_DEPLOYMENT_EVENT, onlyArgs: true })

  const lenders = logs.map(l => l.lender)

  const [collaterals, prices, collateralDecimals, psmAssets, freePsmAssets] = await Promise.all([
    api.multiCall({ abi: 'address:collateral', calls: lenders }),
    api.multiCall({ abi: 'function getCollateralPrice() view returns (uint256 price, bool reduceOnly, bool allowLiquidations)', calls: lenders }),
    api.multiCall({ abi: 'uint256:collateralDecimals', calls: lenders }),
    api.multiCall({ abi: 'address:psmAsset', calls: lenders }),
    api.multiCall({ abi: 'uint256:freePsmAssets', calls: lenders }),
  ])

  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: lenders.map((lender, i) => ({ target: collaterals[i], params: [lender] })),
  })

  for (let i = 0; i < lenders.length; i++) {
    const decimals = collateralDecimals[i]
    const balance = balances[i] / (10 ** decimals)
    const price = prices[i].price / (10 ** (36 - decimals))
    api.addUSDValue(balance * price)

    if (psmAssets[i] !== BURN_ADDRESS) {
      api.add(psmAssets[i], freePsmAssets[i])
    }
  }
}

module.exports = {
  doublecounted: true,
  methodology: 'TVL is the sum of the collateral deposits in each Monolith Market lender priced using the onchain oracle price and the value of the PSMs asset reserves if any.',
  ethereum: { tvl },
}
