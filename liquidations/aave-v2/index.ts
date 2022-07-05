import { gql, request } from "graphql-request"
import { getPagedGql } from "../utils/gql"

const query = gql`
query users($lastId: String) {
    users(first: 1000, where:{
        borrowedReservesCount_gt: 0,
        id_gt: $lastId
      }) {
        id
        reserves{
          usageAsCollateralEnabledOnUser
          reserve{
            symbol
            usageAsCollateralEnabled
            underlyingAsset
            price {
                priceInEth
            }
            decimals
            reserveLiquidationThreshold
          }
          currentATokenBalance
          currentTotalDebt
        }
    }
}
`

const ethPriceQuery = gql`
{
    priceOracleAsset(id: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"){
        priceInEth
    }
}
`

const subgraphUrl = "https://api.thegraph.com/subgraphs/name/aave/protocol-v2"

const liqs = async () => {
    const users = await getPagedGql(subgraphUrl, query, "users")
    const ethPrice = 1 / ((await request(subgraphUrl, ethPriceQuery)).priceOracleAsset.priceInEth / 1e18)
    const badDebt = []
    const positions = users.map(user => {
        let totalDebt = 0, totalCollateral = 0;
        const debts = (user.reserves as any[]).map(reserve => {
            const decimals = 10 ** reserve.reserve.decimals
            const price = (Number(reserve.reserve.price.priceInEth) / (1e18)) * ethPrice
            const liqThreshold = Number(reserve.reserve.reserveLiquidationThreshold) / 1e4
            let debt = Number(reserve.currentTotalDebt)
            if (reserve.usageAsCollateralEnabledOnUser === true) {
                debt -= Number(reserve.currentATokenBalance) * liqThreshold
            }
            debt *= price / decimals
            if (debt > 0) {
                totalDebt += debt
            } else {
                totalCollateral -= debt
            }
            return {
                debt,
                price,
                token: reserve.reserve.underlyingAsset,
                totalBal: reserve.currentATokenBalance,
                decimals
            }
        })

        const liquidablePositions = debts.filter(({ debt }) => debt < 0).map(pos => {
            const otherCollateral = totalCollateral + pos.debt;
            const diffDebt = totalDebt - otherCollateral
            if (diffDebt > 0) {
                const amountCollateral = -pos.debt / pos.price // accounts for liqThreshold
                const liqPrice = diffDebt / amountCollateral;
                if (liqPrice > pos.price) {
                    badDebt.push([totalDebt, liqPrice, pos.price, user.id])
                } else {
                    return {
                        owner: user.id,
                        liqPrice,
                        collateral: pos.token,
                        collateralAmount: pos.totalBal,
                    }
                }
            }
        }).filter(t => t !== undefined)

        return liquidablePositions
    }).flat()
    //console.log(badDebt.sort((a,b)=>b[0]-a[0]))
    return positions
}

module.exports = {
    ethereum: {
        liquidations: liqs
    }
}