const axios = require("axios")

const pactLPAddress = "CWELFRXFDWLRY6ZO6QET3AB7L3PKZD3KVDJWZULYIJYOARHUTAWN2LZT2Y"
const goUSDBasketAddress = "SORHGFCFW4DMJRG33OBWQ5X5YQMRPHK3P5ITMBFMRCVNX74WAOOMLK32F4";
const USDC_ID = 31566704;
const goUSD_ID = 672913181;
const USDC_GOUSD_LP_ID = 885102318;
const USDC_GOUSD_LP_Supply = 18446744073709551615;


async function getBasketBal(USDC_ID,USDC_GOUSD_LP_ID,goUSDBasketAddress) {
    const response = await axios.get(`https://algoindexer.algoexplorerapi.io/v2/accounts/${goUSDBasketAddress}`)
    const responseObject = await response.data;
    const accountObject =  responseObject["account"];
    const accountAssets = accountObject["assets"];
    let goUSD_Basket_USDC_Bal = 0;
    let goUSD_Basket_LP_bal = 0;
    for( let i = 0; i< accountAssets.length; i++){
        let query = accountAssets[i]

        if(query["asset-id"] == USDC_ID){
            goUSD_Basket_USDC_Bal = query["amount"]
        }
        else if(query["asset-id"] == USDC_GOUSD_LP_ID){
            goUSD_Basket_LP_bal = query["amount"]
        }
    }

    const usdc_balance = goUSD_Basket_USDC_Bal / (10**6)
    const lp_balance = goUSD_Basket_LP_bal / (10**6)
    return [usdc_balance,lp_balance]
}

async function getTotalCirculatingLP(USDC_GOUSD_LP_Supply,pactLPAddress){
    const response = await axios.get(`https://algoindexer.algoexplorerapi.io/v2/accounts/${pactLPAddress}`)
    const responseObject = await response.data;
    const accountObject =  responseObject["account"];
    const accountAssets = accountObject["assets"];
    let lp_balance = 0;
    for( let i = 0; i< accountAssets.length; i++){
        let query = accountAssets[i]

        if(query["asset-id"] == USDC_GOUSD_LP_ID){
            lp_balance = query["amount"]
        }
    }
    const total_circulating = USDC_GOUSD_LP_Supply - lp_balance
    return total_circulating
}

async function lpRatio(totalCirc,USDC_ID,goUSD_ID,pactLPAddress){
    const response = await axios.get(`https://algoindexer.algoexplorerapi.io/v2/accounts/${pactLPAddress}`)
    const responseObject = await response.data;
    const accountObject =  responseObject["account"];
    const accountAssets = accountObject["assets"];
    let usdc_bal = 0;
    let goUSD_bal = 0;
    for( let i = 0; i< accountAssets.length; i++){
        let query = accountAssets[i]

        if(query["asset-id"] == USDC_ID){
            usdc_bal = query["amount"]
        }
        else if (query["asset-id"] == goUSD_ID){
            goUSD_bal = query["amount"]
        }   
    }

    const USDC_Ratio = usdc_bal / totalCirc
    const goUSD_Ratio = goUSD_bal / totalCirc
    return [USDC_Ratio, goUSD_Ratio]
}

async function lpPosition(ratio,bask_lp_bal){
    let usdc_ratio = ratio[0]
    let goUSD_ratio = ratio[1]

    let usdc_positon = bask_lp_bal * usdc_ratio
    let goUSD_postion = bask_lp_bal * goUSD_ratio

    let total = usdc_positon + goUSD_postion
    return total
}


async function main(){
    let basketBal = await getBasketBal(USDC_ID,USDC_GOUSD_LP_ID,goUSDBasketAddress)
    let usdc_bal = basketBal[0];
    let bask_lp_bal = basketBal[1];

    let totalCirc = await getTotalCirculatingLP(USDC_GOUSD_LP_Supply, pactLPAddress)
    let ratio = await lpRatio(totalCirc,USDC_ID,goUSD_ID,pactLPAddress)

    let lp_total = await lpPosition(ratio, bask_lp_bal)

    // console.log(usdc_bal)
    // console.log(bask_lp_bal)
    // console.log(totalCirc)
    // console.log(ratio)
    // console.log("lp total", lp_total)

    const tvl = usdc_bal + lp_total

    console.log("tvl",tvl)
}

main()