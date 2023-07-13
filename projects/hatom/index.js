const { cachedGraphQuery } = require('../helper/cache')

const { fetchURL } = require('../helper/utils');

const graphql = require('../helper/utils/graphql')

const API_URL = 'https://devnet-develop-api.hatom.com/graphql'; // TODO: replace by https://mainnet-api.hatom.com/graphql

const PAIR_URL = `https://api.multiversx.com/mex/pairs`

const TVLLiquidStakingQuery = `query QueryLiquidStaking {
	queryLiquidStaking {
		state {
      cashReserve
  	   }
	}
}`

const TVLLendingProtocolQuery = `query QueryMoneyMarket {
	queryMoneyMarket {
		address
		underlying {
			name
			id
		}
		 stateHistory(first: 1, order: {desc: timestamp}) {
			cash
			borrows
		}
	}
}
`

async function tvl() {
   const result = await fetchURL(PAIR_URL)
   const egldUsdcPrice = result.data.find(pair => pair.symbol === 'EGLDUSDC').basePrice

   const liquidStakingData = await graphql.request(API_URL, TVLLiquidStakingQuery)
   const lendingProtocolData = await graphql.request(API_URL, TVLLendingProtocolQuery)

   // const liquidStakingData = await cachedGraphQuery('hatom', API_URL, TVLLiquidStakingQuery);
   // const lendingProtocolData = await cachedGraphQuery('hatom', API_URL, TVLLendingProtocolQuery)

   console.log(lendingProtocolData);
   //Total reserve of liquid staking protocol
   const liquidStakingElrndReserveInEgld = liquidStakingData.queryLiquidStaking[0].state.cashReserve

   //TODO: Precission problem?
   const liquidStakingElrndReserveInUsd = liquidStakingElrndReserveInEgld * egldUsdcPrice

   //Total reserve of lending protocol
   const lendingProtocolCashReserveInUsd = lendingProtocolData.queryMoneyMarket.reduce((acc, item) => {
      const { cash, borrows } = item.stateHistory[0]
      const { id } = item.underlying
      const total = cash + borrows
      if (id.toLowerCase().includes('usd')) {
         acc += total
      }
      if (id.toLowerCase().includes('egld')) {
         //TODO: Precission problem?
         acc += total * egldUsdcPrice
      }
      return acc
   }, 0)


   const totalLiquidity = (liquidStakingElrndReserveInUsd + lendingProtocolCashReserveInUsd)

   return totalLiquidity
}

module.exports = {
   misrepresentedTokens: true,
   timetravel: false,
   methodology: "The Total Value Locked (TVL) is computed as the aggregate sum of the EGLD reserve held within the liquid staking protocol, in conjunction with the USD reserve held within the lending protocol. This calculation encompasses not only the liquid balance but also takes into consideration the borrowing activity.",
   elrond: {
      tvl
   },
}