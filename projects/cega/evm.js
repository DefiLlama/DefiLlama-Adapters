
const sdk = require('@defillama/sdk')
const abi = require("./abi.json");

const usdcDecimals = 10 ** 6;
const maxLeverage = 5;
const CEGA_PRODUCT_VIEWER = "0x31C73c07Dbd8d026684950b17dD6131eA9BAf2C4";
const FCN_PRODUCTS = [
    "0x042021d59731d3fFA908c7c4211177137Ba362Ea", // supercharger
    "0x56F00A399151EC74cf7bE8DC38225363E84975E6", // go fast 
    "0x784e3C592A6231D92046bd73508B3aAe3A7cc815", // insanic
    "0xAB8631417271Dbb928169F060880e289877Ff158", // starboard
    "0xcf81b51AecF6d88dF12Ed492b7b7f95bBc24B8Af", // autopilot
    "0x80ec1c0da9bfBB8229A1332D40615C5bA2AbbEA8", // cruise control
    "0x94C5D3C2fE4EF2477E562EEE7CCCF07Ee273B108", // genesis basket
];

const LOV_PRODUCTS = [
'0xF9B7BF3f4616209Aa9d412443Aa0f94449c63122', // supercharger-lov
'0xDC60989aaa5fbA0C2435D755056b41A9Ff415F13', // insanic-lov
'0xeF1CE301B311654419810c8F5DbBD7Eb595F3d96' // go-fast-lov
]; 


async function getSumVaultUnderlyingFcnProducts(){
    let totalBalance = 0; 
    for (const product of FCN_PRODUCTS){
        const result = await sdk.api.abi.call({
            target: product,
            abi: abi.sumVaultUnderlyingAmounts,
        })
        const amount = parseInt(result.output)
        totalBalance += amount; 
    }
    return (totalBalance / usdcDecimals);
}

async function getSumVaultQueuedDepositsFcnProducts(){
    let totalBalance = 0; 
    for (const product of FCN_PRODUCTS){
        const result = await sdk.api.abi.call({
            target: product,
            abi: abi.queuedDepositsTotalAmount,
        })
        const amount = parseInt(result.output)
        totalBalance += amount; 
    }
    return (totalBalance / usdcDecimals);
}

async function getSumLOVProductDeposits(){
    let totalBalance = 0; 
    for (const product of LOV_PRODUCTS){
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

async function getSumLOVProductQueuedDeposits(){
    let totalBalance = 0; 
    for (const product of LOV_PRODUCTS){
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
    const results = await Promise.all([
        getSumVaultUnderlyingFcnProducts(),
        getSumVaultQueuedDepositsFcnProducts(),
        getSumLOVProductDeposits(),
        getSumLOVProductQueuedDeposits()
    ]);
    const sum = results.reduce((total, currentValue) => total + currentValue, 0);
    return sum 
}


module.exports = {
    ethereum: {
       tvl: getEthereumTvl().then((result) => { console.log(result)})
    }
}


