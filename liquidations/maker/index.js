const { gql } = require("graphql-request")
const {getPagedGql} = require("../utils/gql")

const cdpQuery = gql`
query cdps($lastId: String) {
    vaults(where:{
        debt_gt: 0,
        id_gt: $lastId
    }, first:1000){
      id
      collateral
      collateralType{
        liquidationRatio
        rate
        id
        price{
            spotPrice
        }
      }
      debt
    }
}  
`

const liqs = async () => {
    const cdps = await getPagedGql("https://api.thegraph.com/subgraphs/name/protofire/maker-protocol", cdpQuery, "vaults")
    return cdps.map(cdp=>{
        return {
            liqPrice: cdp.debt * cdp.collateralType.liquidationRatio / cdp.collateral,
            collateral: cdp.collateralType.id,
            collateralAmount: cdp.collateral,
        }
    })
}

module.exports = {
    ethereum: {
        liquidations: liqs
    }
}
liqs()