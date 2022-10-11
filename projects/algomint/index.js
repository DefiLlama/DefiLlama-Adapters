const axios = require("axios")
const BigNumber = require("bignumber.js")

const pactLpAddress = "CWELFRXFDWLRY6ZO6QET3AB7L3PKZD3KVDJWZULYIJYOARHUTAWN2LZT2Y"
const goUsdBasketAddress = "SORHGFCFW4DMJRG33OBWQ5X5YQMRPHK3P5ITMBFMRCVNX74WAOOMLK32F4";
const usdcId = 31566704;
const goUsdId = 672913181;
const usdcGoUsdLpId = 885102318;
const usdcGoUsdLpSupply = BigNumber('18446744073709551615');


async function getBasketBal(usdcId,usdcGoUsdLpId,goUsdBasketAddress) {
    
    const response = await axios.get(`https://algoindexer.algoexplorerapi.io/v2/accounts/${goUsdBasketAddress}`)
    const responseObject = await response.data;
    const accountObject =  responseObject["account"];
    const accountAssets = accountObject["assets"];
    let   goUsdBasketUsdcBal = 0;
    let   goUsdBasketLpBal = 0;
    
    for( let i = 0; i < accountAssets.length; i++ ){
        let query = accountAssets[i]
        if(query["asset-id"] == usdcId){
            goUsdBasketUsdcBal = query["amount"]
        }
        else if(query["asset-id"] == usdcGoUsdLpId){
            goUsdBasketLpBal = query["amount"]
        }
    }
    return [BigNumber(goUsdBasketUsdcBal).dividedBy(1000000).toFixed(6), 
        BigNumber(goUsdBasketLpBal).dividedBy(1000000).toFixed(6)]
}

async function getTotalCirculatingLP(usdcGoUsdLpSupply,pactLpAddress){
    const response = await axios.get(`https://algoindexer.algoexplorerapi.io/v2/accounts/${pactLpAddress}`)
    const responseObject = await response.data;
    const accountObject =  responseObject["account"];
    const accountAssets = accountObject["assets"];
    
    let lpBalance = 0;
    for( let i = 0; i< accountAssets.length; i++){
        let query = accountAssets[i]

        if(query["asset-id"] == usdcGoUsdLpId){
            lpBalance = query["amount"]
        }
    }

    const totalCirculating = usdcGoUsdLpSupply.minus(lpBalance).toFixed()
    return totalCirculating
}

async function lpRatio(totalCirc,usdcId,goUsdId,pactLpAddress){
    
    const response = await axios.get(`https://algoindexer.algoexplorerapi.io/v2/accounts/${pactLpAddress}`)
    const responseObject = await response.data;
    const accountObject =  responseObject["account"];
    const accountAssets = accountObject["assets"];
    
    let usdcBal = 0;
    let goUsdBal = 0;
    for( let i = 0; i< accountAssets.length; i++){
        let query = accountAssets[i]

        if(query["asset-id"] == usdcId){
            usdcBal = query["amount"]
        }
        else if (query["asset-id"] == goUsdId){
            goUsdBal = query["amount"]
        }   
    }
    
    const usdcRatio = BigNumber(usdcBal).dividedBy(totalCirc).toFixed()
    const goUsdRatio = BigNumber(goUsdBal).dividedBy(totalCirc).toFixed()
    return [usdcRatio, goUsdRatio]

}

async function lpPosition(ratio,basketLpBal){
    
    const usdcRatio = ratio[0]
    const goUsdRatio = ratio[1]
    const usdcPositon = BigNumber(basketLpBal).multipliedBy(usdcRatio).toFixed()
    const goUsdPostion = BigNumber(basketLpBal).multipliedBy(goUsdRatio).toFixed()
    const total = BigNumber(usdcPositon).plus(goUsdPostion).toFixed()
    return total

}


async function tvl(){
    
    const basketBal = await getBasketBal(usdcId,usdcGoUsdLpId,goUsdBasketAddress)
    const usdcBal = basketBal[0];
    const basketLpBal = basketBal[1];
    const totalCirc = await getTotalCirculatingLP(usdcGoUsdLpSupply, pactLpAddress)
    const ratio = await lpRatio(totalCirc,usdcId,goUsdId,pactLpAddress)
    const lpTotal = await lpPosition(ratio, basketLpBal)
    const tvl = BigNumber(usdcBal).plus(lpTotal).toFixed()
    return tvl
    
}

module.exports = {
    algorand: {
        tvl
    }
}
