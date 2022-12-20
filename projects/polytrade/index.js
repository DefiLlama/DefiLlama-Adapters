const sdk = require('@defillama/sdk');
const ABI = require('../abi.json');
const { transformPolygonAddress } = require("../helper/portedTokens");
const TRADE_TOKEN_CONTRACT = '0x63168f8335B0CF03d58C80e182b9aEa4558064Da';
const LENDER_POOL_CONTRACT = '0xE544a0Ca5F4a01f137AE5448027471D6a9eC9661';


async function tvl(_, _block, chainBlocks) {
  const balances = {};
  const transform = await transformPolygonAddress();

  const liquidityBalance = (await sdk.api.abi.call({
    abi: ABI,
    chain: 'polygon',
    target: LENDER_POOL_CONTRACT,
    block: chainBlocks['polygon'],
  })).output;

  await sdk.util.sumSingleBalance(balances, `polygon:${LENDER_POOL_CONTRACT}`, liquidityBalance)

  return balances;
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: 'gets the amount in liquidity pool',
  polygon: {
    tvl,
  }
}; 


/**
* 
* Name (to be shown on DefiLlama): Polytrade
* Twitter Link: https://twitter.com/polytrade_fin
* List of audit links if any:
* Certik link: https://www.certik.com/projects/polytrade
* ImmuneBytes link: https://immunebytes.azurewebsites.net/getlink/PolyTrade(v2)%20-%20Final%20Audit%20Report.pdf
* Website Link: https://lender.polytrade.app/
* Logo: https://lender.polytrade.app/static/media/brandIcon.c3dcbb2b3d697b0043c9d185e5317d1a.svg
* Current TVL: 17,461.25 USDC
* Chain: Polygon
* Coingecko ID:  (https://api.coingecko.com/api/v3/coins/list) - polytrade
* Coinmarketcap ID: (https://api.coinmarketcap.com/data-api/v3/map/all?listing_status=active,inactive,untracked&start=1&limit=10000) - 1046
* Short Description: Polytrade is a blockchain-enabled Trade Finance Platform, allowing SMEs to get unprecedented direct access to trade financing opportunities while offering attractive rewards to those that support the lending pools.
    We are here to make trade financing more accessible, efficient and transparent by bridging TradeFi and DeFi.
* Token address and ticker if any: 
    On Ethereum: 0x6e5970DBd6fc7eb1f29C6D2eDF2bC4c36124C0C1
    On BSC: 0x6Ba7a8f9063c712C1c8CabC776B1dA7126805f3b
    On Polygon: 0x6Ba7a8f9063c712C1c8CabC776B1dA7126805f3b
* Ticker: TRADE
* Category (full list at https://defillama.com/categories)  *Please choose only one: - Lending
* Oracle used (Chainlink/Band/API3/TWAP or any other that you are using): Chainlink
* forkedFrom (Does your project originate from another project):None
* methodology (what is being counted as tvl, how is tvl being calculated):
    The counted TVL is the lent amount on the lender pool.
    TVL is calculated according to the total lent amount.

 * 
 */