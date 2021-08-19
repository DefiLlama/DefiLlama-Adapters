const _ = require('underscore');
const sdk = require('@defillama/sdk');
const cAbis = require('./abi.json');
const { unwrapUniswapLPs } = require('../helper/unwrapLPs');


const comptroller = "0x6537d6307ca40231939985BCF7D83096Dd1B4C09";
const chain = "heco";

async function getUnderlying(block, cToken) {
    if (cToken === '0x99a2114B282acC9dd25804782ACb4D3a2b1Ad215') {
        return '0x6f259637dcd74c767781e37bc6133cd6a68aa161';//cHT => HT (ETH)
    } else {
        const token = (await sdk.api.abi.call({
            block,
            chain: 'heco',
            target: cToken,
            abi: cAbis['underlying'],
        })).output;
        if (token === '0x3D760a45D0887DFD89A2F5385a236B29Cb46ED2a') {
            return '0x6b175474e89094c44da98b954eedeac495271d0f';//DAI => DAI
        } else if (token === '0x9362Bbef4B8313A8Aa9f0c9808B80577Aa26B73B') {
            return '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';//USDC => USDC
        } else if(token === '0xCe0A5CA134fb59402B723412994B30E02f083842') {
            return '0xc00e94cb662c3520282e6f5717214004a7f26888'; // COMP=> COMP
        // } else if(token === '0x1Ee8382bE3007Bd9249a89f636506284DdEf6Cc0') {
        //     return '0x35a532d376ffd9a705d0bb319532837337a398e7'; //DOGE
        } else {
            return 'heco:' + token
        }
    }
}
async function getVaultToken(lvault, block) {
    return (await sdk.api.abi.call({
        block,
        chain: chain,
        target: lvault,
        abi: cAbis['valtToken']
    })).output;
}
async function getAllCTokens(block) {
    return (await sdk.api.abi.call({
        
        block,
        chain: chain,
        target: comptroller,
        params: [],
        abi: cAbis['getAllMarkets'],
    })).output;
}

async function getMarkets(block) {
    let allCTokens = await getAllCTokens(block);
    const markets = []
    await (
        Promise.all(allCTokens.map(async (cToken) => {
            let underlying = await getUnderlying(block, cToken);
            markets.push({underlying, cToken})
        }))
    );
    return markets;
}

const coingeckoPrice = {
    "heco:0xc2CB6B5357CcCE1B99Cd22232942D9A225Ea4eb1": {
      coingecko: "bitcoin-cash-sv",
      decimals: 1e18
    },
    "heco:0x1Ee8382bE3007Bd9249a89f636506284DdEf6Cc0": {
        coingecko: 'binance-peg-dogecoin',
        decimals: 1e8
    }
}
async function tvl() {
    let balances = {};
    let markets = await getMarkets();
    let lpPositions = [];
    let cashInfo = await sdk.api.abi.multiCall({
        calls: _.map(markets, (market) => ({
            target: market.cToken,
        })),
        chain: chain,
        abi: cAbis['getCash'],
    });
    
    const symbols = await sdk.api.abi.multiCall({
        calls: _.map(markets, (market) => ({
            target: market.underlying.split(':')[1],
        })),
        chain: chain,
        abi: "erc20:symbol",
    });
    _.each(markets, async (market, idx) => {
        let getCash = _.find(cashInfo.output, (result) => result.input.target === market.cToken);
        if (getCash) {
            if (getCash.output === null) {
                throw new Error("failed")
            }
            const symbol = symbols.output[idx].output
            const tokenToCoinGecko = coingeckoPrice[market.underlying]
            if(tokenToCoinGecko === undefined) { 
                if(symbol === "lfHMDX"){
                    let lptoken = await getVaultToken(market.underlying.split(':')[1]);
                    lpPositions.push({
                        token: lptoken,
                        balance: getCash.output
                    })
                    
                } else if(symbol === "BETH"){
                    sdk.util.sumSingleBalance(balances, 'binance-eth', Number(getCash.output)/1e18)
                } else {
                    sdk.util.sumSingleBalance(balances, market.underlying, getCash.output)
                }
            } else {
                sdk.util.sumSingleBalance(balances, tokenToCoinGecko.coingecko, Number(getCash.output)/tokenToCoinGecko.decimals)
            }
        }
    });

    await unwrapUniswapLPs(balances, lpPositions, undefined, 'heco', addr=>{
        if(addr === "0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f"){
            return '0x6f259637dcd74c767781e37bc6133cd6a68aa161' // WHT -> HT
        }
        return `heco:${addr}`
    })
    return balances;
}

module.exports = {
    tvl,
  };
  