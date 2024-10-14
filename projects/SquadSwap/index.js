const { stakings } = require("../helper/staking");
const { getUniTVL } = require('../helper/unknownTokens')

const bscFactoryAddress = '0x1D9F43a6195054313ac1aE423B1f810f593b6ac1'; // SquadSwap's Factory contract:                BSC
const bscMasterchefV2Address = '0x2e881a10f682a3b2CBaaF8fc5A9a94E98D4879B4'; // SquadSwap's MasterChef V2 contract:     BSC
const bscMasterchefV3Address = '0x44eC8143EB368cAbB00c4EfF085AF276260202B5'; // SquadSwap's MasterChef V3 contract:     BSC
const bscSquadTokenAddress = '0x2d2567dec25c9795117228adc7fd58116d2e310c'; // SquadSwap token contract:                 BSC

const baseFactoryAddress = '0xba34aA640b8Be02A439221BCbea1f48c1035EEF9'; // SquadSwap's Factory contract:              Base
const baseMasterchefV2Address = '0xB6171582C75421A740dcC15E4D873a34Cb2Ebb48'; // SquadSwap's MasterChef V2 contract:   Base
const baseMasterchefV3Address = '0x89c0619E7A798309193438b3Cff11f1F31266711'; // SquadSwap's MasterChef V3 contract:   Base
const baseSquadTokenAddress = '0x08Ccb86a31270Fd97D927A4e17934C6262A68b7E'; // SquadSwap token contract:               Base

const blastFactoryAddress = '0x4B599f3425D54AfBf94bFD41EA9931fF92AD6551'; // SquadSwap's Factory contract:              Blast
const blastMasterchefV2Address = '0xdeE10310E729C36a560c72c0E8E3be0e46673063'; // SquadSwap's MasterChef V2 contract:   Blast
const blastMasterchefV3Address = '0xda3840837Df961A710C889e0D23295dF82cCfF8b'; // SquadSwap's MasterChef V3 contract:   Blast
const blastSquadTokenAddress = '0x08Ccb86a31270Fd97D927A4e17934C6262A68b7E'; // SquadSwap token contract:               Blast

const arbitrumFactoryAddress = '0xba34aA640b8Be02A439221BCbea1f48c1035EEF9'; // SquadSwap's Factory contract:              Arbitrum
const arbitrumMasterchefV2Address = '0x6dAafc12F65801afb2F0B0212a8229F224Acf576'; // SquadSwap's MasterChef V2 contract:   Arbitrum
const arbitrumMasterchefV3Address = '0xA9E236aa88D3D9d5D4499D1b6ffA7ec170dA5DCA'; // SquadSwap's MasterChef V3 contract:   Arbitrum
const arbitrumSquadTokenAddress = '0x08Ccb86a31270Fd97D927A4e17934C6262A68b7E'; // SquadSwap token contract:               Arbitrum

const polygonFactoryAddress = '0xEE8F37D490CB7Ea1dae7d080c5738894731299f0'; // SquadSwap's Factory contract:              Polygon
const polygonMasterchefV2Address = '0x1D9F43a6195054313ac1aE423B1f810f593b6ac1'; // SquadSwap's MasterChef V2 contract:   Polygon
const polygonMasterchefV3Address = '0xb4286E807A8107cC3344d3094468DC44D73b49c2'; // SquadSwap's MasterChef V3 contract:   Polygon
const polygonSquadTokenAddress = '0x5eBB1ff6dc0759f7A6253d0568A610650Dd0d050'; // SquadSwap token contract:               Polygon

const optimismFactoryAddress = '0xba34aA640b8Be02A439221BCbea1f48c1035EEF9'; // SquadSwap's Factory contract:              Optimism
const optimismMasterchefV2Address = '0xB6171582C75421A740dcC15E4D873a34Cb2Ebb48'; // SquadSwap's MasterChef V2 contract:   Optimism
const optimismMasterchefV3Address = '0x89c0619E7A798309193438b3Cff11f1F31266711'; // SquadSwap's MasterChef V3 contract:   Optimism
const optimismSquadTokenAddress = '0x08Ccb86a31270Fd97D927A4e17934C6262A68b7E'; // SquadSwap token contract:               Optimism

module.exports = {
    methodology: "TVL is calculated from total liquidity of SquadSwap's active pools",
    bsc: {
        tvl: getUniTVL({
            factory: bscFactoryAddress,
            useDefaultCoreAssets: true,
            chain: "bsc"
        }),
        staking: stakings([
            bscMasterchefV2Address,
            bscMasterchefV3Address,
        ], bscSquadTokenAddress, "bsc")
    },

    base: {
        tvl: getUniTVL({
            factory: baseFactoryAddress,
            useDefaultCoreAssets: true,
            chain: "base"
        }),
        staking: stakings([
            baseMasterchefV2Address,
            baseMasterchefV3Address,
        ], baseSquadTokenAddress, "base")
    },

    blast: {
        tvl: getUniTVL({
            factory: blastFactoryAddress,
            useDefaultCoreAssets: true,
            chain: "blast"
        }),
        staking: stakings([
            blastMasterchefV2Address,
            blastMasterchefV3Address,
        ], blastSquadTokenAddress, "blast")
    },

    arbitrum: {
        tvl: getUniTVL({
            factory: arbitrumFactoryAddress,
            useDefaultCoreAssets: true,
            chain: "arbitrum"
        }),
        staking: stakings([
            arbitrumMasterchefV2Address,
            arbitrumMasterchefV3Address,
        ], arbitrumSquadTokenAddress, "arbitrum")
    },

    polygon: {
        tvl: getUniTVL({
            factory: polygonFactoryAddress,
            useDefaultCoreAssets: true,
            chain: "polygon"
        }),
        staking: stakings([
            polygonMasterchefV2Address,
            polygonMasterchefV3Address,
        ], polygonSquadTokenAddress, "polygon")
    },

    optimism: {
        tvl: getUniTVL({
            factory: optimismFactoryAddress,
            useDefaultCoreAssets: true,
            chain: "optimism"
        }),
        staking: stakings([
            optimismMasterchefV2Address,
            optimismMasterchefV3Address,
        ], optimismSquadTokenAddress, "optimism")
    },

};
