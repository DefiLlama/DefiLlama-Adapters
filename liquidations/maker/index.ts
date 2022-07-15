import { gql } from "graphql-request"
import { getPagedGql } from "../utils/gql"
import { ethers } from "ethers";
import { providers } from "../utils/ethers"
import BigNumber from "bignumber.js";

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
      owner{
        address
      }
    }
}
`

function toHex(str:string){
    return encodeURIComponent(str)
    .split('').map(function(v){
      return v.charCodeAt(0).toString(16)
    }).join('')
}

const liqs = async () => {
    const cdps = await getPagedGql("https://api.thegraph.com/subgraphs/name/protofire/maker-protocol", cdpQuery, "vaults")
    // all maker contracts: https://chainlog.makerdao.com/api/mainnet/active.json
    const ilkRegistry = new ethers.Contract("0x5a464C28D19848f44199D003BeF5ecc87d090F87", [
        "function gem(bytes32) view returns (address)"
    ], providers.ethereum)
    let ilks = new Set<string>()
    cdps.map(cdp=>ilks.add(cdp.collateralType.id))
    const gems = {} as {[ilk:string]:{
        address:string,
        decimals:number,
    }};
    await Promise.all(Array.from(ilks).map(async ilk=>{
        const hex = "0x"+toHex(ilk).padEnd(64, "0")
        const gem = await ilkRegistry.gem(hex)
        const gemContract = new ethers.Contract(gem, [
            "function decimals() view returns (uint8)"
        ], providers.ethereum)
        const decimals = await gemContract.decimals()
        gems[ilk] = {
            address:gem,
            decimals
        }
    }))
    return cdps.map(cdp=>{
        const gem = gems[cdp.collateralType.id]
        console.log(cdp)
        return {
            owner: cdp.owner.address,
            liqPrice: (cdp.debt * cdp.collateralType.liquidationRatio) / cdp.collateral,
            collateral: "ethereum:"+gem.address,
            collateralAmount: new BigNumber(cdp.collateral).times(10**gem.decimals).toFixed(0),
        }
    })
}

module.exports = {
    ethereum: {
        liquidations: liqs
    }
}