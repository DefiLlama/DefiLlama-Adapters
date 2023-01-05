const sdk = require('@defillama/sdk');
const { post } = require('../helper/http')
const BigNumber = require("bignumber.js");

const { zenBullAbi, eulerSimpleLens } = require('./abi');

const ETH = '0x0000000000000000000000000000000000000000';
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const ZEN_BULL_ADDRESS = "0xb46Fb07b0c80DBC3F97cae3BFe168AcaD46dF507";
const EULER_SIMPLE_LENS_ADDRESS = "0x5077B7642abF198b4a5b7C4BdCE4f03016C7089C"

// to add TVL under yield category
async function tvl(timestamp, block, _, { api }){
    let balances = {};

    // get eth usd price
    const key = 'ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';      
    const ethPriceUSD = (await post("https://coins.llama.fi/prices", {
        "coins": [key]
    })).coins[key].price;
    // get eth usd price
    const squeethKey = 'ethereum:0xf1b99e3e573a1a9c5e6b2ce818b617f0e664e86b';
    const squeethPriceUSD = (await post("https://coins.llama.fi/prices", {
        "coins": [squeethKey]
    })).coins[squeethKey].price;

    const [ethInCrab, squeethInCrab] = (await sdk.api.abi.call({
        target: ZEN_BULL_ADDRESS,
        abi: zenBullAbi.find(({ name }) => name === 'getCrabVaultDetails'),
        chain: "ethereum"
    })).output;
    const bullCrabBalance = (await sdk.api.abi.call({
        target: ZEN_BULL_ADDRESS,
        abi: zenBullAbi.find(({ name }) => name === 'getCrabBalance'),
        chain: "ethereum"
    })).output;
    const crab = "0x3B960E47784150F5a63777201ee2B15253D713e8";
    const crabTotalSupply = (await sdk.api.erc20.totalSupply({
        target: crab,
        chain: "ethereum"
      })
    ).output
    const bullDtokenBalance = (await sdk.api.abi.call({
        target: EULER_SIMPLE_LENS_ADDRESS,
        abi: eulerSimpleLens.find(({ name }) => name === 'getDTokenBalance'),
        params: [USDC, ZEN_BULL_ADDRESS],
        chain: "ethereum"
    })).output;
    const bullEtokenBalance = (await sdk.api.abi.call({
        target: EULER_SIMPLE_LENS_ADDRESS,
        abi: eulerSimpleLens.find(({ name }) => name === 'getETokenBalance'),
        params: [WETH, ZEN_BULL_ADDRESS],
        chain: "ethereum"
    })).output;

    const crabEthPrice = (ethInCrab  - (squeethInCrab * (squeethPriceUSD / ethPriceUSD ))) * 1e18 / crabTotalSupply;    
    const balance = BigNumber(bullEtokenBalance).plus(BigNumber(bullCrabBalance).times(crabEthPrice).dividedBy(1e18)).minus(bullDtokenBalance / 1e6 / ethPriceUSD * 1e18)
    
    balances = {
        [ETH]: BigNumber(balances[ETH] || 0).plus(balance).toFixed(0),
    };

    return balances;
};

module.exports = {
    ethereum: {
      tvl: tvl
    }
};