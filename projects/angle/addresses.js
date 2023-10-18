const ADDRESSES = require('../helper/coreAssets.json')
const TreasuryTokenAddresses = {
    governor: {
        arbitrum: [
            ADDRESSES.arbitrum.USDC,
            '0xe4DDDfe67E7164b0FE14E218d80dC4C08eDC01cB',
            // '0xFA5Ed56A203466CbBC2430a43c66b9D8723528E7', // agEUR
        ],
        ethereum: [
            // '0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8', // agEUR
            '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c',
            ADDRESSES.ethereum.CRV,
            '0xc00e94Cb662C3520282E6f5717214004A7f26888',
            ADDRESSES.ethereum.CVX,
            '0x875773784Af8135eA0ef43b5a374AaD105c5D39e',
            '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
            '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0',
            '0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F',
            '0x4da27a545c0c5B758a6BA100e3a049001de870f5',
            ADDRESSES.ethereum.USDC,
            ADDRESSES.ethereum.DAI,
            '0xBa3436Fd341F2C8A928452Db3C5A3670d1d5Cc73',
            '0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC',
            '0xD1b5651E55D4CeeD36251c61c50C889B36F6abB5',
            '0x402F878BDd1f5C66FdAF0fabaBcF74741B68ac36',
            '0x2F123cF3F37CE3328CC9B5b8415f9EC5109b45e7',
        ],
        optimism: [
            '0x3c8b650257cfb5f272f799f5e2b4e65093a11a05',
            // '0x9485aca5bbBE1667AD97c7fE7C4531a624C8b1ED', // agEUR
        ],
        polygon: [
            ADDRESSES.polygon.USDC,
            // '0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4'
        ],
        avax: [
            // '0xAEC8318a9a59bAEb39861d10ff6C7f7bf1F96C57', // agEUR
        ],
        xdai: [
            // '0x4b1E2c2762667331Bc91648052F646d1b0d35984'
        ],
        bsc: [
            // '0x12f31B73D812C6Bb0d735a218c086d44D5fe5f89'
        ],
        celo: [
            // '0xC16B81Af351BA9e64C1a069E3Ab18c244A1E3049', // agEUR
        ],
    },
    guardian: {
        arbitrum: [
            // '0xFA5Ed56A203466CbBC2430a43c66b9D8723528E7',
            ADDRESSES.arbitrum.USDC,
            '0x463913D3a3D3D291667D53B8325c598Eb88D3B0e',
        ],
        ethereum: [
            // '0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8',
            '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c',
            ADDRESSES.ethereum.USDC,
            ADDRESSES.ethereum.CRV,
            ADDRESSES.ethereum.CVX,
            '0x2F123cF3F37CE3328CC9B5b8415f9EC5109b45e7',
        ],
        optimism: [
            '0x1db2466d9f5e10d7090e7152b68d62703a2245f0',
            ADDRESSES.optimism.USDC,
            // '0x9485aca5bbBE1667AD97c7fE7C4531a624C8b1ED', // agEUR
        ],
        polygon: [
            // '0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4'
        ],
        avax: [
            ADDRESSES.avax.USDC,
            // '0xAEC8318a9a59bAEb39861d10ff6C7f7bf1F96C57', // agEUR
        ],
        xdai: [
            // '0x4b1E2c2762667331Bc91648052F646d1b0d35984'
        ],
        bsc: [
            // '0x12f31B73D812C6Bb0d735a218c086d44D5fe5f89',
            ADDRESSES.bsc.USDT,
            '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
        ],
        celo: [
            // '0xC16B81Af351BA9e64C1a069E3Ab18c244A1E3049',   // agEUR
            '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73'
        ],
    },
};

const governorAddress = {
    arbitrum: '0xAA2DaCCAb539649D1839772C625108674154df0B',
    ethereum: '0xdC4e6DFe07EFCa50a197DF15D9200883eF4Eb1c8',
    optimism: '0x3245d3204EEB67afba7B0bA9143E8081365e08a6',
    polygon: '0xdA2D2f638D6fcbE306236583845e5822554c02EA',
    avax: '0x43a7947A1288e65fAF30D8dDb3ca61Eaabd41613',
    xdai: '0x0F70EeD1Bb51d5eDB1a2E46142638df959bAFD69',
    bsc: '0x0128eA927198f39e4955DdB01Fd62E8De6B3e6a4',
    celo: '0x2ba5a55DBDAD03023e6872A8D57c458E9399bFE1',
}

const guardianAddress = {
    arbitrum: '0x55F01DDaE74b60e3c255BD2f619FEbdFce560a9C',
    ethereum: '0x0C2553e4B9dFA9f83b1A6D3EAB96c4bAaB42d430',
    optimism: '0xD245678e417aEE2d91763F6f4eFE570FF52fD080',
    polygon: '0x3b9D32D0822A6351F415BeaB05251c1457FF6f8D',
    avax: '0xCcD44983f597aE4d4E2B70CF979597D63a10870D',
    xdai: '0xf0A31faec2B4fC6396c65B1aF1F6A71E653f11F0',
    bsc: '0x371Ac6dB8063e6076890ef032A4A3cFCF226F548',
    celo: '0x434153aA505959BCD5aAa7c17445EB8d835086f5',
}

module.exports = {
    TreasuryTokenAddresses,
    governorAddress,
    guardianAddress,
}