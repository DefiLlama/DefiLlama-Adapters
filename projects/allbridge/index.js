const {getBlock} = require('../helper/getBlock')
const sdk = require('@defillama/sdk')
const solana = require('../helper/solana')
const terra = require('../helper/terra')

const NATIVE_ADDRESS = "NATIVE";

const data = {
    celo: {
        contractAddress: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
        tokens: [
            {name: "celo-dollar", address: "0x765DE816845861e75A25fCA122bb6898B8B1282a", decimals: 18},
            {name: "usd-coin", address: "0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7", decimals: 6},
            {name: "poofcash", address: "0x00400FcbF0816bebB94654259de7273f4A05c762", decimals: 18},
            {name: "celo-euro", address: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73", decimals: 18}
        ]
    },
    avax: {
        contractAddress: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
        tokens: [
            {name: "avalanche-2", address: NATIVE_ADDRESS, decimals: 18},
            {name: "usd-coin", address: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", decimals: 6},
            {name: "tether", address: "0xc7198437980c041c805A1EDcbA50c1Ce5db95118", decimals: 6},
            {name: "bitcoin", address: "0x50b7545627a5162F82A992c33b87aDc75187B218", decimals: 8},
            {name: "dai", address: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", decimals: 18}
        ]
    },
    fantom: {
        contractAddress: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
        tokens: [
            {name: "bitcoin", address: "0x321162Cd933E2Be498Cd2267a90534A804051b11", decimals: 8},
            {name: "ethereum", address: "0x74b23882a30290451A17c44f4F05243b6b58C76d", decimals: 18},
            {name: "usd-coin", address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", decimals: 6},
            {name: "dai", address: "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E", decimals: 18},
            {name: "chainlink", address: "0xb3654dc3D10Ea7645f8319668E8F54d2574FBdC8", decimals: 18}
        ]
    },
    heco: {
        contractAddress: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
        tokens: [
            {name: "bitcoin", address: "0x66a79D23E58475D2738179Ca52cd0b41d73f0BEa", decimals: 18},
            {name: "tether", address: "0xa71EdC38d189767582C38A3145b5873052c3e47a", decimals: 18},
            {name: "apyswap", address: "0x90e8896b12a92D51CD213b681C2CaD83A9a6bD49", decimals: 18},

        ]
    },
    polygon: {
        contractAddress: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
        tokens: [
            {name: "mimatic", address: "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1", decimals: 18},
            {name: "usd-coin", address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", decimals: 6},
            {name: "tether", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6},
            {name: "matic-network", address: NATIVE_ADDRESS, decimals: 18},
            {name: "ethereum", address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", decimals: 18},
            {name: "bitcoin", address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", decimals: 8},
            {name: "dai", address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", decimals: 18},
            {name: "apyswap", address: "0x14743E1c6f812154F7ecc980D890F0F5234103e7", decimals: 18},
        ]
    },
    bsc: {
        contractAddress: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
        tokens: [
            {name: "impossible-finance", address: "0xB0e1fc65C1a741b4662B813eB787d369b8614Af1", decimals: 18},
            {name: "krown", address: "0x1446f3CEdf4d86a9399E49f7937766E6De2A3AAB", decimals: 18},
            {name: "binance-usd", address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", decimals: 18},
            {name: "investin", address: "0x6A46d878401F46B4C7f665f065E0667580e031ec", decimals: 18},
            {name: "tether", address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18},
            {name: "usd-coin", address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18},
            {name: "bitcoin", address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", decimals: 18},
            {name: "ethereum", address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", decimals: 18},
            {name: "binancecoin", address: NATIVE_ADDRESS, decimals: 18},
            {name: "uniswap", address: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1", decimals: 18},
            {name: "chainlink", address: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD", decimals: 18},
            {name: "dai", address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", decimals: 18},
            {name: "hapi", address: "0xD9c2D319Cd7e6177336b0a9c93c21cb48d84Fb54", decimals: 18},
            {name: "1million-nfts", address: "0xa4eF4b0B23C1fc81d3f9ecF93510e64f58A4A016", decimals: 18},
            {name: "apyswap", address: "0x37dfACfaeDA801437Ff648A1559d73f4C40aAcb7", decimals: 18},
            {name: "hedget", address: "0xC7d8D35EBA58a0935ff2D5a33Df105DD9f071731", decimals: 6},
        ]
    },
    ethereum: {
        contractAddress: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
        tokens: [
            {name: "apyswap", address: "0xf7413489c474ca4399eeE604716c72879Eea3615", decimals: 18},
            {name: "hapi", address: "0xD9c2D319Cd7e6177336b0a9c93c21cb48d84Fb54", decimals: 18},
            {name: "hedget", address: "0x7968bc6a03017eA2de509AAA816F163Db0f35148", decimals: 6},
            {name: "1million-nfts", address: "0xa4eF4b0B23C1fc81d3f9ecF93510e64f58A4A016", decimals: 18},
            {name: "allbridge", address: "0xa11bD36801d8fa4448F0ac4ea7A62e3634cE8C7C", decimals: 18},
            {name: "ariadne", address: "0xb1c9bc94aCd2fAE6aABf4ffae4429B93512a81D2", decimals: 18},
            {name: "cyberfi", address: "0x63b4f3e3fa4e438698CE330e365E831F7cCD1eF4", decimals: 18},
            {name: "ethereum", address: NATIVE_ADDRESS, decimals: 18},
            {name: "usd-coin", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6},
            {name: "tether", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6},
            {name: "ftx-token", address: "0x50D1c9771902476076eCFc8B2A83Ad6b9355a4c9", decimals: 18},
            {name: "dai", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18},
            {name: "bitcoin", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8},
            {name: "magic-internet-money", address: "0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3", decimals: 18},
            {name: "fei-usd", address: "0x956F47F50A910163D8BF957Cf5846D573E7f87CA", decimals: 18},
            {name: "thorstarter", address: "0x69fa0feE221AD11012BAb0FdB45d444D3D2Ce71c", decimals: 18},
            {name: "uniswap", address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", decimals: 18},
            {name: "chainlink", address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", decimals: 18},
            {name: "smartpad", address: "0x5067006f830224960fb419d7f25a3a53e9919bb0", decimals: 18},
        ]
    }
}

const solanaData = {
    contractAddress: 'bb1XfNoER5QC3rhVDaVz3AJp9oFKoHNHG6PHfZLcCjj',
    tokens: [
        {name: "apyswap", tokenAccount: '8fdkYq4XWb1LfkNcAByZUHspyvasyqH7CmFBCkoqSK5d'},
        {name: "solana", tokenAccount: 'HHC3niNsTB3hNN1kZH9BHMLiwLvCSegKBLu82tAT2iG8'},
        {name: "usd-coin", tokenAccount: 'AxsSzB2JvyHZr6uDjV3Prmak2JEqYUoaSQh9rPMSUvf2'},
        {name: "saber", tokenAccount: '7KkMhrF9Hv7dfaX5xXFtTTrfJfVjHYZ5ymwAuXVgJ6Kf'},
    ]
}


const terraData = {
    contractAddress: 'terra18hf7422vyyc447uh3wpzm50wzr54welhxlytfg',
    tokens: [
        {name: "terrausd", address: 'uusd', decimals: 6},
        {name: "terra-luna", address: 'uluna', decimals: 6},
    ]
}

const toNumber = (decimals, n) => Number(n)/Math.pow(10, decimals)

function getTVLFunction(chain)
{
    return async function tvl(timestamp, ethBlock, chainBlocks) {
        const balances = {}
        const chainData = data[chain];
        const block = await getBlock(timestamp, chain, chainBlocks);
        for (const token of chainData.tokens) {
            const balance = token.address === NATIVE_ADDRESS ? await sdk.api.eth.getBalance({
                block, chain, target: chainData.contractAddress
            }) : await sdk.api.erc20.balanceOf({
                block, chain, target: token.address, owner: chainData.contractAddress
            });
            sdk.util.sumSingleBalance(balances, token.name, toNumber(token.decimals, balance.output));
        }
        return balances
    }
}

async function solanaTvl() {
    const balances = {}
    for (const token of solanaData.tokens) {
        const balance = await solana.getTokenAccountBalance(token.tokenAccount);
        sdk.util.sumSingleBalance(balances, token.name, balance);
    }
    return balances
}

async function terraTvl() {
    const balances = {}
    for (const token of terraData.tokens) {
        const balance = token.address.length > 5
          ? await terra.getBalance(token.address, terraData.contractAddress)
          : await terra.getDenomBalance(token.address, terraData.contractAddress);
        sdk.util.sumSingleBalance(balances, token.name, toNumber(token.decimals, balance));
    }
    return balances
}


module.exports={
    methodology: "All tokens locked in Allbridge contracts.",
    ethereum: { tvl: getTVLFunction('ethereum') },
    polygon: { tvl: getTVLFunction('polygon') },
    bsc: { tvl: getTVLFunction('bsc') },
    fantom: { tvl: getTVLFunction('fantom') },
    avax: { tvl: getTVLFunction('avax') },
    heco: { tvl: getTVLFunction('heco') },
    celo: { tvl: getTVLFunction('celo') },
    solana: { tvl: solanaTvl },
    terra: { tvl: terraTvl }
}
