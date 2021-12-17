const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const {uniTvlExport} = require("../helper/calculateUniTvl");

const Factory = "0x32CE36F6eA8d97f9fC19Aab83b9c6D2F52D74470";
const stakingContract = "0xe5b677c7aae044135f81FEb4c38b877272e6F6dd";
const Y3D = "0xc7fD9aE2cf8542D71186877e21107E1F3A0b55ef";
const WETH_Y3D_LP = "0xd0f52b7e4ef306b1a0b7d5a3206dfd7f7e032e2e";

const stakingContractBSC = "0x3e8a3E3A7132311f66B36e6A91A6928C273f0077";
const Y3D_BSC = "0x12e2fcfa079fc23ae82ab82707b402410321103f";

const chainTvl = getChainTvl({
    ethereum: 'https://api.thegraph.com/subgraphs/name/kodamasakuno/uniscam-swap',
})

module.exports = {
    methodology: "TVL accounts for the liquidity on all AMM pools.",
    misrepresentedTokens: true,
    ethereum: {
        staking: staking(stakingContract, Y3D),
        pool2: pool2(stakingContract, WETH_Y3D_LP),
        tvl: chainTvl('ethereum')
    },
    bsc: {
        staking: staking(stakingContractBSC, Y3D_BSC,"bsc"),
        tvl: uniTvlExport(Factory, "bsc"), // Decimals or data are incorrects on the getReserves of Pair Contracts!!
    }
};