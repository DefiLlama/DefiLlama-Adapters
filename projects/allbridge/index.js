const ADDRESSES = require('../helper/coreAssets.json')

const sdk = require('@defillama/sdk')
const solana = require('../helper/solana')
const cosmos = require('../helper/chain/cosmos')
const { staking } = require('../helper/staking');
const near = require('../helper/chain/near');
const { default: BigNumber } = require('bignumber.js');
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs');
const ripple = require('./ripple');
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
            {name: "apyswap", address: "0x8D2c7789652342E9405A15FA4f4721362495f92D", decimals: 18},
            {name: "avalanche-2", address: "0x8e3670fd7b0935d3fe832711debfe13bb689b690", decimals: 18},
            {name: "celo", address: NATIVE_ADDRESS, decimals: 18},
            {name: "celo-dollar", address: ADDRESSES.celo.cUSD, decimals: 18},
            {name: "celo-euro", address: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73", decimals: 18},
            {name: "saber", address: "0x47264ae1fc0c8e6418ebe78630718e11a07346a8", decimals: 18},
            {name: "solana", address: "0x173234922eb27d5138c5e481be9df5261faed450", decimals: 18},
            {name: "usd-coin", address: ADDRESSES.celo.USDC, decimals: 6},
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
            {name: "fantom", address: NATIVE_ADDRESS, decimals: 18},
            {name: "solana", address: "0x44F7237df00E386af8e79B817D05ED9f6FE0f296", decimals: 18},
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
            {name: "apyswap", address: "0x14743E1c6f812154F7ecc980D890F0F5234103e7", decimals: 18},
            {name: "ariadne", address: "0xB6EBc3ca1741a8f37551E44A51eC00aD417B38CA", decimals: 18},
            {name: "duckies", address: "0x18e73A5333984549484348A94f4D219f4faB7b81", decimals: 8},
            {name: "hapi", address: "0xbE276e3d5060B0e770FE0260bB6BE94ac19b4B19", decimals: 18},
            {name: "mimatic", address: "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1", decimals: 18},
            {name: "near", address: "0x72bd80445b0db58ebe3E8dB056529D4C5FAF6F2f", decimals: 18},
            {name: "solana", address: "0x7dff46370e9ea5f0bad3c4e29711ad50062ea7a4", decimals: 18},
            {name: "tether", address: ADDRESSES.polygon.USDT, decimals: 6},
            {name: "usd-coin", address: ADDRESSES.polygon.USDC, decimals: 6},
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
            {name: "apyswap", address: "0x37dfACfaeDA801437Ff648A1559d73f4C40aAcb7", decimals: 18},
            {name: "ariadne", address: "0xa0A9961b7477D1a530f06a1ee805d5E532e73d97", decimals: 18},
            {name: "binance-bitcoin", address: ADDRESSES.bsc.BTCB, decimals: 18},
            {name: "binance-usd", address: ADDRESSES.bsc.BUSD, decimals: 18},
            {name: "binancecoin", address: NATIVE_ADDRESS, decimals: 18},
            {name: "genopets", address: "0x9df465460938f9ebdf51c38cc87d72184471f8f0", decimals: 18},
            {name: "hapi", address: "0xD9c2D319Cd7e6177336b0a9c93c21cb48d84Fb54", decimals: 18},
            {name: "hedget", address: "0xc7d8d35eba58a0935ff2d5a33df105dd9f071731", decimals: 6},
            {name: "impossible-finance", address: "0xB0e1fc65C1a741b4662B813eB787d369b8614Af1", decimals: 18},
            {name: "investin", address: ADDRESSES.bsc.IVN, decimals: 18},
            {name: "solo-coin", address: "0xc2c28b58db223DA89b567A0A98197Fc17C115148", decimals: 15},
            {name: "tether", address: ADDRESSES.bsc.USDT, decimals: 18},
            {name: "usd-coin", address: ADDRESSES.bsc.USDC, decimals: 18},
        ]
    },
    ethereum: {
        contractAddress: "0xBBbD1BbB4f9b936C3604906D7592A644071dE884",
        tokens: [
            {name: "apyswap", address: "0xf7413489c474ca4399eeE604716c72879Eea3615", decimals: 18},
            {name: "ariadne", address: "0xb1c9bc94aCd2fAE6aABf4ffae4429B93512a81D2", decimals: 18},
            {name: "duckies", address: "0x90b7E285ab6cf4e3A2487669dba3E339dB8a3320", decimals: 8},
            {name: "ethereum", address: NATIVE_ADDRESS, decimals: 18},
            {name: "hapi", address: "0xD9c2D319Cd7e6177336b0a9c93c21cb48d84Fb54", decimals: 18},
            {name: "pentagon-games", address: "0x5Ee3188A3f8aDee1D736EdD4AE85000105C88f66", decimals: 18},
            {name: "tether", address: ADDRESSES.ethereum.USDT, decimals: 6},
            {name: "usd-coin", address: ADDRESSES.ethereum.USDC, decimals: 6},
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
        tokens: [
            {name: "ethereum", address: "0xCC9d144a8a8A1e71D5EC66A13F301b9E0137e71C", decimals: 18},
            {name: "solana", address: "0x5Cb5249d420639619fFd637C79f0AA5C0a9FcD4B", decimals: 9},
        ],
        staking: {
            contractAddress: "0x788BA01f8E2b87c08B142DB46F82094e0bdCad4F",
            abrAddress: "0xa21AaB22A0bAF9fff3392B0aFc5115b955664FD4",
            decimals: 18
        },
    },
}

const solanaData = {
    contractAddress: 'bb1XfNoER5QC3rhVDaVz3AJp9oFKoHNHG6PHfZLcCjj',
    staking: {
        tokenAccount: '51dd7AuT32b5VCK2rBVrjLGvfuvZ3kMayNrZZbWuvas2'
    },
    tokens: [
        {name: "apyswap", tokenAccount: '8fdkYq4XWb1LfkNcAByZUHspyvasyqH7CmFBCkoqSK5d'},
        {name: "ben-the-dog", tokenAccount: '8WgpKyaBKdG93YqHWM675S6rsZgjMZmhtJjfWriC3hX5'},
        {name: "genopets", tokenAccount: 'Cko5gjsiFMaqoBFF7bEUZZ7neqNtJd7VJpYvfBcxYjQX'},
        {name: "mimatic", tokenAccount: '3xxvGGE3StCEHwJbrYXWv6jsYgTbEWhcCN166Bx8kfJL'},
        {name: "saber", tokenAccount: '7KkMhrF9Hv7dfaX5xXFtTTrfJfVjHYZ5ymwAuXVgJ6Kf'},
        {name: "solana", tokenAccount: 'HHC3niNsTB3hNN1kZH9BHMLiwLvCSegKBLu82tAT2iG8'},
        {name: "usd-coin", tokenAccount: 'AxsSzB2JvyHZr6uDjV3Prmak2JEqYUoaSQh9rPMSUvf2'},
    ]
}


const terraData = {
    contractAddress: "terra18hf7422vyyc447uh3wpzm50wzr54welhxlytfg",
    staking: {
        contractAddress: "terra1n3v0c4dhn33adnznl3yh5r6myjgrz57x6pqkeg",
        abrAddress: "terra1a7ye2splpfzyenu0yrdu8t83uzgusx2malkc7u",
        decimals: 6
    },
    tokens: []
}

const nearData = {
    contractAddress: "bridge.a11bd.near",
    staking: {
        contractAddress: "staking.a11bd.near",
        decimals: 24
    },
    tokens: [
        {name: "apyswap", address: "apys.token.a11bd.near", decimals: 24},
        {name: "ben-the-dog", address: "benthedog.near", decimals: 9},
        {name: "celo", address: "celo.token.a11bd.near", decimals: 24},
        {name: "celo-dollar", address: "cusd.token.a11bd.near", decimals: 24},
        {name: "near", address: "wrap.near", decimals: 24},
        {name: "solana", address: "sol.token.a11bd.near", decimals: 24},
    ]
}

const rippleData = {
    contractAddress: "r4w1LrneWZqX5RrgFPx2gto66dwo2Zymqy",
    tokens: [
        {name: "solo-coin", issuer: "rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz", currency: "534F4C4F00000000000000000000000000000000"},
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
    return solana.sumTokens2({ tokenAccounts: [solanaData.staking.tokenAccount] })
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

async function rippleTvl() {
    return ripple.sumTokens({tokens: rippleData.tokens, owners: [rippleData.contractAddress]});
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
    ripple: {
        tvl: rippleTvl,
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

