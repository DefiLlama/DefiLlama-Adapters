const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

const wMOVR = "0x98878B06940aE243284CA214f92Bb71a2b032B8A" // their own barely used version

module.exports={
    misrepresentedTokens: true,
    tvl: calculateUsdUniTvl("0x049581aEB6Fe262727f290165C29BDAB065a1B68", "moonriver", wMOVR, 
    [
        '0x6bD193Ee6D2104F14F94E2cA6efefae561A4334B', // SOLAR
        '0xbD90A6125a84E5C512129D622a75CDDE176aDE5E', // RIB
        '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d', // USDC
        '0xb44a9b6905af7c801311e8f4e76932ee959c663c', // USDT
        '0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c', // WETH
        '0x5d9ab5522c64e1f6ef5e3627eccc093f56167818', // BUSD
        '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844', // DAI
        '0x2bF9b864cdc97b08B6D79ad4663e71B8aB65c45c', // BNB
        '0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8', // WBTC
        '0x7f5a79576620C046a293F54FFCdbd8f2468174F1', // MAI
        '0x0caE51e1032e8461f4806e26332c030E34De3aDb', // MIM
        '0x682F81e57EAa716504090C3ECBa8595fB54561D8', // MATIC
        '0x14a0243C333A5b238143068dC3A7323Ba4C30ECB', // AVAX
        '0xaD12daB5959f30b9fF3c2d6709f53C335dC39908', // FTM
        '0xAd7F1844696652ddA7959a49063BfFccafafEfe7', // RELAY
    ], "moonriver"),
}
