const ADDRESSES = require('../helper/coreAssets.json')

const sdk = require('@defillama/sdk')
const solana = require('../helper/solana')
const cosmos = require('../helper/chain/cosmos')
const { staking } = require('../helper/staking');
const near = require('../helper/chain/near');
const { default: BigNumber } = require('bignumber.js');
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs');
const NATIVE_ADDRESS = nullAddress;

const data = {
    celo: {
        contractAddress: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
        staking: {
            contractAddress: "0x788BA01f8E2b87c08B142DB46F82094e0bdCad4F",
            abrAddress: "0x6e512BFC33be36F2666754E996ff103AD1680Cc9",
            decimals: 18
        },
        tokens: [
            {name: "celo-dollar", address: ADDRESSES.celo.cUSD, decimals: 18},
            {name: "usd-coin", address: ADDRESSES.celo.USDC, decimals: 6},
            {name: "poofcash", address: "0x00400FcbF0816bebB94654259de7273f4A05c762", decimals: 18},
            {name: "celo-euro", address: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73", decimals: 18},
            {name: "celo", address: NATIVE_ADDRESS, decimals: 18},
        ]
    },
    avax: {
        contractAddress: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
        staking: {
            contractAddress: "0x788BA01f8E2b87c08B142DB46F82094e0bdCad4F",
            abrAddress: "0xaFc43610C7840b20b90CAaF93759bE5b54B291c9",
            decimals: 18
        },
        tokens: [
            {name: "avalanche-2", address: NATIVE_ADDRESS, decimals: 18},
            {name: "usd-coin", address: ADDRESSES.avax.USDC_e, decimals: 6},
            {name: "tether", address: ADDRESSES.avax.USDT_e, decimals: 6},
            {name: "bitcoin", address: ADDRESSES.avax.WBTC_e, decimals: 8},
            {name: "apyswap", address: "0x4b0093a44802bD870FC20E811862875f0F1E5970", decimals: 18}
        ]
    },
    fantom: {
        contractAddress: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
        staking: {
            contractAddress: "0x1Bb92e03d2bdF3D7849296Ff7F9685696b0CaA39",
            abrAddress: "0x543Acd673960041eEe1305500893260F1887B679",
            decimals: 18
        },
        tokens: [
            {name: "bitcoin", address: "0x321162Cd933E2Be498Cd2267a90534A804051b11", decimals: 8},
            {name: "ethereum", address: "0x74b23882a30290451A17c44f4F05243b6b58C76d", decimals: 18},
            {name: "usd-coin", address: ADDRESSES.fantom.USDC, decimals: 6},
            {name: "fantom", address: NATIVE_ADDRESS, decimals: 18},
        ]
    },
    heco: {
        contractAddress: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
        staking: {
            contractAddress: "0x788BA01f8E2b87c08B142DB46F82094e0bdCad4F",
            abrAddress: "0x2D7E64def6c3311A75c2F6eB45E835CD58e52CDE",
            decimals: 18
        },
        tokens: [
            {name: "bitcoin", address: "0x66a79D23E58475D2738179Ca52cd0b41d73f0BEa", decimals: 18},
            {name: "tether", address: ADDRESSES.heco.USDT, decimals: 18},
            {name: "apyswap", address: "0x90e8896b12a92D51CD213b681C2CaD83A9a6bD49", decimals: 18},

        ]
    },
    polygon: {
        contractAddress: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
        staking: {
            contractAddress: "0x788BA01f8E2b87c08B142DB46F82094e0bdCad4F",
            abrAddress: "0x04429fbb948bbd09327763214b45e505a5293346",
            decimals: 18
        },
        tokens: [
            {name: "mimatic", address: "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1", decimals: 18},
            {name: "usd-coin", address: ADDRESSES.polygon.USDC, decimals: 6},
            {name: "tether", address: ADDRESSES.polygon.USDT, decimals: 6},
            {name: "matic-network", address: NATIVE_ADDRESS, decimals: 18},
            {name: "ethereum", address: ADDRESSES.polygon.WETH_1, decimals: 18},
            {name: "bitcoin", address: ADDRESSES.polygon.WBTC, decimals: 8},
            {name: "apyswap", address: "0x14743E1c6f812154F7ecc980D890F0F5234103e7", decimals: 18},
        ]
    },
    bsc: {
        contractAddress: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
        staking: {
            contractAddress: "0x788BA01f8E2b87c08B142DB46F82094e0bdCad4F",
            abrAddress: "0x68784ffaa6Ff05E3e04575DF77960DC1D9F42b4a",
            decimals: 18
        },
        tokens: [
            {name: "impossible-finance", address: "0xB0e1fc65C1a741b4662B813eB787d369b8614Af1", decimals: 18},
            {name: "binance-usd", address: ADDRESSES.bsc.BUSD, decimals: 18},
            {name: "investin", address: ADDRESSES.bsc.IVN, decimals: 18},
            {name: "tether", address: ADDRESSES.bsc.USDT, decimals: 18},
            {name: "usd-coin", address: ADDRESSES.bsc.USDC, decimals: 18},
            {name: "bitcoin", address: ADDRESSES.bsc.BTCB, decimals: 18},
            {name: "ethereum", address: ADDRESSES.bsc.ETH, decimals: 18},
            {name: "binancecoin", address: NATIVE_ADDRESS, decimals: 18},
            {name: "hapi", address: "0xD9c2D319Cd7e6177336b0a9c93c21cb48d84Fb54", decimals: 18},
            {name: "apyswap", address: "0x37dfACfaeDA801437Ff648A1559d73f4C40aAcb7", decimals: 18},
            {name: "solo-coin", address: "0xc2c28b58db223DA89b567A0A98197Fc17C115148", decimals: 15},
        ]
    },
    ethereum: {
        contractAddress: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
        tokens: [
            {name: "apyswap", address: "0xf7413489c474ca4399eeE604716c72879Eea3615", decimals: 18},
            {name: "hapi", address: "0xD9c2D319Cd7e6177336b0a9c93c21cb48d84Fb54", decimals: 18},
            {name: "ariadne", address: "0xb1c9bc94aCd2fAE6aABf4ffae4429B93512a81D2", decimals: 18},
            {name: "ethereum", address: NATIVE_ADDRESS, decimals: 18},
            {name: "usd-coin", address: ADDRESSES.ethereum.USDC, decimals: 6},
            {name: "tether", address: ADDRESSES.ethereum.USDT, decimals: 6},
            {name: "ftx-token", address: "0x50D1c9771902476076eCFc8B2A83Ad6b9355a4c9", decimals: 18},
            {name: "magic-internet-money", address: "0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3", decimals: 18},
            {name: "fei-usd", address: "0x956F47F50A910163D8BF957Cf5846D573E7f87CA", decimals: 18},
            {name: "thorstarter", address: "0x69fa0feE221AD11012BAb0FdB45d444D3D2Ce71c", decimals: 18},
            {name: "smartpad", address: "0x5067006f830224960fb419d7f25a3a53e9919bb0", decimals: 18},
        ]
    },
    aurora: {
        tokens: [],
        staking: {
            contractAddress: "0x788BA01f8E2b87c08B142DB46F82094e0bdCad4F",
            abrAddress: "0x2BAe00C8BC1868a5F7a216E881Bae9e662630111",
            decimals: 18
        },
    },
    harmony: {
        tokens: [],
        staking: {
            contractAddress: "0x788BA01f8E2b87c08B142DB46F82094e0bdCad4F",
            abrAddress: "0xf80eD129002B0eE58C6d2E63D0D7Dc9Fc9f3383C",
            decimals: 18
        },
    },
    fuse: {
        tokens: [],
        staking: {
            contractAddress: "0x788BA01f8E2b87c08B142DB46F82094e0bdCad4F",
            abrAddress: "0xa21AaB22A0bAF9fff3392B0aFc5115b955664FD4",
            decimals: 18
        },
    }
}

const solanaData = {
    contractAddress: 'bb1XfNoER5QC3rhVDaVz3AJp9oFKoHNHG6PHfZLcCjj',
    staking: {
        tokenAccount: '51dd7AuT32b5VCK2rBVrjLGvfuvZ3kMayNrZZbWuvas2'
    },
    tokens: [
        {name: "apyswap", tokenAccount: '8fdkYq4XWb1LfkNcAByZUHspyvasyqH7CmFBCkoqSK5d'},
        {name: "genopets", tokenAccount: 'Cko5gjsiFMaqoBFF7bEUZZ7neqNtJd7VJpYvfBcxYjQX'},
        {name: "mimatic", tokenAccount: '3xxvGGE3StCEHwJbrYXWv6jsYgTbEWhcCN166Bx8kfJL'},
        {name: "solana", tokenAccount: 'HHC3niNsTB3hNN1kZH9BHMLiwLvCSegKBLu82tAT2iG8'},
        {name: "usd-coin", tokenAccount: 'AxsSzB2JvyHZr6uDjV3Prmak2JEqYUoaSQh9rPMSUvf2'},
        {name: "saber", tokenAccount: '7KkMhrF9Hv7dfaX5xXFtTTrfJfVjHYZ5ymwAuXVgJ6Kf'},
    ]
}


const terraData = {
    contractAddress: "terra18hf7422vyyc447uh3wpzm50wzr54welhxlytfg",
    staking: {
        contractAddress: "terra1n3v0c4dhn33adnznl3yh5r6myjgrz57x6pqkeg",
        abrAddress: "terra1a7ye2splpfzyenu0yrdu8t83uzgusx2malkc7u",
        decimals: 6
    },
    tokens: [
        {name: "terrausd", address: "uusd", decimals: 6},
        {name: "terra-luna", address: "uluna", decimals: 6},
    ]
}

const nearData = {
    contractAddress: "bridge.a11bd.near",
    staking: {
        contractAddress: "staking.a11bd.near",
        decimals: 24
    },
    tokens: [
        {name: "near", address: "wrap.near", decimals: 24},
    ]
}

const toNumber = (decimals, n) => BigNumber(n/(10 ** decimals)).toFixed(0)

function getTVLFunction(chain) {
    return async function tvl(api) {
        const chainData = data[chain];
        const tokens = chainData.tokens.map(i => i.address)
        return sumTokens2({ api, tokens, owner: chainData.contractAddress })
    }
}

function getStakingFunction(chain) {
    const stakingData = data[chain].staking;
    if (!stakingData) {
        return
    }
    return staking(stakingData.contractAddress, stakingData.abrAddress, chain, "allbridge", stakingData.decimals);
}

async function solanaTvl() {
    return solana.sumTokens2({ tokenAccounts: solanaData.tokens.map(i => i.tokenAccount)})
}

async function solanaStaking() {
    const balance = await solana.getTokenAccountBalance(solanaData.staking.tokenAccount);
    return {allbridge: toNumber(0, balance)}
}

async function terraTvl() {
    return cosmos.sumTokens({ chain: "terra", owner: terraData.contractAddress })
}



async function terraStaking() {
    const balance = await cosmos.getBalance({ token: terraData.staking.abrAddress, owner: terraData.staking.contractAddress, chain: "terra"});
    return { allbridge: toNumber(terraData.staking.decimals, balance) }
}

async function nearTvl() {
    const balances = {}
    for (const token of nearData.tokens) {
        const balance = await near.getTokenBalance(token.address, nearData.contractAddress);
        sdk.util.sumSingleBalance(balances, token.name, toNumber(token.decimals, balance));
    }
    return balances
}

async function nearStaking() {
    const balance = await near.call(nearData.staking.contractAddress, "get_abr_balance");
    return { allbridge: toNumber(nearData.staking.decimals, balance) }
}

module.exports={
    methodology: "All tokens locked in Allbridge Classic contracts.",
    timetravel: false,
    solana: {
        tvl: solanaTvl,
        staking: solanaStaking
    },
    terra: {
        tvl: terraTvl,
        staking: terraStaking
    },
    near: {
        tvl: nearTvl,
        staking: nearStaking
    },
    hallmarks:[
        [1651881600, "UST depeg"],
      ],
}

Object.keys(data).forEach(chain => {
    module.exports[chain] = {
        tvl: getTVLFunction(chain),
        staking: getStakingFunction(chain),
    }
})
