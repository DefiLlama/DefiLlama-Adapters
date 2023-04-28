
const sdk = require('@defillama/sdk')
const abi = require("./abi.json");

const usdcDecimals = 10 ** 6;
const maxLeverage = 5;
const LOV_SUFFIX = "-lov";
const CEGA_STATE = "0x0730AA138062D8Cc54510aa939b533ba7c30f26B";
const CEGA_PRODUCT_VIEWER = "0x31C73c07Dbd8d026684950b17dD6131eA9BAf2C4";

async function getProducts(){
    const productNames = await sdk.api.abi.call({
        target: CEGA_STATE,
        abi: abi.getProductNames,
    })
    const LOVProductNames = productNames.output.filter(v => v.includes(LOV_SUFFIX))
    const FCNProductNames = productNames.output.filter(v => !v.includes(LOV_SUFFIX))

    let FCNProducts = []; 
    for(const product of FCNProductNames){
        const FCNProductAddress = await sdk.api.abi.call({
            target: CEGA_STATE,
            abi: abi.products,
            params: product
        })
    FCNProducts.push(FCNProductAddress.output);
    }

    let LOVProducts = [];
    for(const product of LOVProductNames){
        const LOVProductAddress = await sdk.api.abi.call({
            target: CEGA_STATE,
            abi: abi.products,
            params: product
        })
        LOVProducts.push(LOVProductAddress.output);
    }
    return [FCNProducts, LOVProducts];
}


async function getSumFCNProductDeposits(fcnProducts){
    let totalBalance = 0; 
    for (const product of fcnProducts){
        const result = await sdk.api.abi.call({
            target: product,
            abi: abi.sumVaultUnderlyingAmounts,
        })
        const amount = parseInt(result.output)
        totalBalance += amount; 
    }
    return (totalBalance / usdcDecimals);
}

async function getSumFCNProductQueuedDeposits(fcnProducts){
    let totalBalance = 0; 
    for (const product of fcnProducts){
        const result = await sdk.api.abi.call({
            target: product,
            abi: abi.queuedDepositsTotalAmount,
        })
        const amount = parseInt(result.output)
        totalBalance += amount; 
    }
    return (totalBalance / usdcDecimals);
}

async function getSumLOVProductDeposits(lovProducts){
    let totalBalance = 0; 
    for (const product of lovProducts){
        for (let i = 2; i < maxLeverage; i++){
        const result = await sdk.api.abi.call({
            target: CEGA_PRODUCT_VIEWER,
            abi: abi.getLOVVaultMetadata, 
            params: [product , i],
        })
        const amount = result.output.reduce((total, arg) => total + parseInt(arg.underlyingAmount), 0);
        totalBalance += amount; 
        }
    }
    return totalBalance / usdcDecimals;
}

async function getSumLOVProductQueuedDeposits(lovProducts){
    let totalBalance = 0; 
    for (const product of lovProducts){
        for (let i = 2; i < maxLeverage; i++){
        const result = await sdk.api.abi.call({
            target: CEGA_PRODUCT_VIEWER,
            abi: abi.getLOVProductQueuedDeposits, 
            params: [product , i],
        })
        totalBalance += parseInt(result.output);
        }
    }
    return totalBalance / usdcDecimals;
}

async function getEthereumTvl(){
    const [fcnProducts, lovProducts] = await getProducts();
    const results = await Promise.all([
        getSumFCNProductDeposits(fcnProducts),
        getSumFCNProductQueuedDeposits(fcnProducts),
        getSumLOVProductDeposits(lovProducts),
        getSumLOVProductQueuedDeposits(lovProducts)
    ]);
    const sum = results.reduce((total, currentValue) => total + currentValue, 0);
    return sum 
}


module.exports = {
    ethereum: {
       tvl: getEthereumTvl().then((result) => { console.log(result)})
    }
}