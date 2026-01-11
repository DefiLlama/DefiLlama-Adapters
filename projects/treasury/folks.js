const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports } = require("../helper/treasury");
const { HubPools } = require('../folks-xchain/constants');
const { pools } = require('../folks-finance/v2/constants');

const treasuryAlgorand = "Q5Q5FC5PTYQIUX5PGNTEW22UJHJHVVUEMMWV2LSG6MGT33YQ54ST7FEIGA";
const treasuryAvalanche = "0x4095f3c4bF6D6505Bd32cFFE0918863Ebb6b2Df2";
const treasuryEthereum = "0xd09cab631f02C8D8cE7009b3aA228bdF4aAC67BD";
const treasuryBase = "0x4095f3c4bF6D6505Bd32cFFE0918863Ebb6b2Df2";
const treasuryBinanceSmartChain = "0xbf694bDFF7d4A0311863765e1f79A5C4f185e7d1";
const treasuryArbitrum = "0xd09cab631f02C8D8cE7009b3aA228bdF4aAC67BD";
const treasuryPolygon = "0x4095f3c4bF6D6505Bd32cFFE0918863Ebb6b2Df2";
const treasurySei = "0x4095f3c4bF6D6505Bd32cFFE0918863Ebb6b2Df2";
const treasuryMonad = "0x4095f3c4bF6D6505Bd32cFFE0918863Ebb6b2Df2";

module.exports = treasuryExports({
    algorand: {
        tokens: [
            ADDRESSES.algorand.ALGO, // ALGO here is 1 instead of 0
            ...pools.map(pool => pool.assetId.toString()),
            ...pools.map(pool => pool.fAssetId.toString()),
        ],
        owners: [treasuryAlgorand],
        ownTokens: [],
    },
    avax: {
        tokens: [
            ADDRESSES.avax.USDt,
            // hub assets
            ...HubPools.avax.map(pool => pool.tokenAddress),
            // hub fAssets
            ...HubPools.avax.map(pool => pool.poolAddress),
            // spokes fAssets
            ...HubPools.arbitrum.map(pool => pool.poolAddress),
            ...HubPools.base.map(pool => pool.poolAddress),
            ...HubPools.bsc.map(pool => pool.poolAddress),
            ...HubPools.ethereum.map(pool => pool.poolAddress),
            ...HubPools.polygon.map(pool => pool.poolAddress),
            ...HubPools.sei.map(pool => pool.poolAddress),
            ...HubPools.monad.map(pool => pool.poolAddress),
        ],
        owners: [treasuryAvalanche],
        ownTokens: [],
    },
    ethereum: {
        tokens: HubPools.ethereum.map(pool => pool.tokenAddress),
        owners: [treasuryEthereum],
        ownTokens: [],
    },
    base: {
        tokens: HubPools.base.map(pool => pool.tokenAddress),
        owners: [treasuryBase],
        ownTokens: [],
    },
    bsc: {
        tokens: HubPools.bsc.map(pool => pool.tokenAddress),
        owners: [treasuryBinanceSmartChain],
        ownTokens: [],
    },
    arbitrum: {
        tokens: HubPools.arbitrum.map(pool => pool.tokenAddress),
        owners: [treasuryArbitrum],
        ownTokens: [],
    },
    polygon: {
        tokens: HubPools.polygon.map(pool => pool.tokenAddress),
        owners: [treasuryPolygon],
        ownTokens: [],
    },
    sei: {
        tokens: HubPools.sei.map(pool => pool.tokenAddress),
        owners: [treasurySei],
        ownTokens: [],
    },
    monad: {
        tokens: HubPools.monad.map(pool => pool.tokenAddress),
        owners: [treasuryMonad],
        ownTokens: [],
    }
})