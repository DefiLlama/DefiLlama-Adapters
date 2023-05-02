
const sdk = require('@defillama/sdk')
const abi = require("./abi.json");

const maxLeverage = 5;
const LOV_SUFFIX = "-lov";
const CEGA_STATE = "0x0730AA138062D8Cc54510aa939b533ba7c30f26B";
const CEGA_PRODUCT_VIEWER = "0x31C73c07Dbd8d026684950b17dD6131eA9BAf2C4";
const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

// Funds are not lent out 
const FCN_PURE_OPTIONS_ADDRESSES = [
    '0x042021d59731d3fFA908c7c4211177137Ba362Ea', // supercharger
    '0x56F00A399151EC74cf7bE8DC38225363E84975E6', // go fast
    '0x784e3C592A6231D92046bd73508B3aAe3A7cc815', // insanic
];

// Funds are lent out 100%
const FCN_BOND_AND_OPTIONS_ADDRESSES = [
    '0xAB8631417271Dbb928169F060880e289877Ff158', // starboard
    '0xcf81b51AecF6d88dF12Ed492b7b7f95bBc24B8Af', // autopilot
    '0x80ec1c0da9bfBB8229A1332D40615C5bA2AbbEA8', // cruise control
    '0x94C5D3C2fE4EF2477E562EEE7CCCF07Ee273B108', // genesis basket

];

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
    return totalBalance;
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
    return totalBalance;
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
    return totalBalance;
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
    return totalBalance;
}

async function getEthereumTvl(){
    const balances = {};
    const [fcnProducts, lovProducts] = await getProducts();
    const results = await Promise.all([
        getSumFCNProductDeposits(FCN_PURE_OPTIONS_ADDRESSES),
        getSumFCNProductQueuedDeposits(FCN_PURE_OPTIONS_ADDRESSES),
        getSumLOVProductDeposits(lovProducts),
        getSumLOVProductQueuedDeposits(lovProducts)
    ]);
    const sum = results.reduce((total, currentValue) => total + currentValue, 0);

    await sdk.util.sumSingleBalance(balances, usdcAddress, sum);
    return balances;
}

async function getBorrowedTvl(){
    const balances = {};
    const results = await Promise.all([
        getSumFCNProductDeposits(FCN_BOND_AND_OPTIONS_ADDRESSES),
        getSumFCNProductQueuedDeposits(FCN_BOND_AND_OPTIONS_ADDRESSES),
    ]);
    const sum = results.reduce((total, currentValue) => total + currentValue, 0);

    await sdk.util.sumSingleBalance(balances, usdcAddress, sum);
    return balances;
}

module.exports = {
    ethereum: {
       tvl: getEthereumTvl,
       borrowed: getBorrowedTvl,
    }
}