const ethers = require("ethers")
const QuickSwapPool = require("./data/quickSwapPool_USDC_EURO3.json");
const ERC20 = require("./data/ERC20.json");

// Retrieve the USDC/EURO3 price from QuickSwapV3
async function getEURO3Price(Provider) {
    const PoolContract = new ethers.Contract(
        QuickSwapPool.address,
        QuickSwapPool.abi,
        Provider
    );
    const token0Address = await PoolContract.token0();
    const token1Address = await PoolContract.token1();

    const Token0Contract = new ethers.Contract(
        token0Address,
        ERC20.abi,
        Provider
    );
    const Token1Contract = new ethers.Contract(
        token1Address,
        ERC20.abi,
        Provider
    );
    const token0Decimals = await Token0Contract.decimals();
    const token1Decimals = await Token1Contract.decimals();


    const globalState = await PoolContract.globalState();

    const decimalsDifference = token0Decimals - token1Decimals;
    const tick = globalState[1];
    const tickBasisConstant = 1.0001;

    const tokenToDollar = tickBasisConstant ** Number(tick) * 10 ** Number(decimalsDifference);
    const dollarToToken = 1 / tokenToDollar;
    return dollarToToken.toString();
}

async function getEURO3TotalSupply(Provider) {
    const EURO3Address = "0xA0e4c84693266a9d3BBef2f394B33712c76599Ab"
    const EURO3Contract = new ethers.Contract(
        EURO3Address,
        ERC20.abi,
        Provider
    );

    const totalSupply = await EURO3Contract.totalSupply()
    return await ethers.formatEther(totalSupply);
}

module.exports = {
    price: getEURO3Price,
    totalSupply: getEURO3TotalSupply
};