const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { pool2, pool2s } = require("../helper/pool2");

/*** Ethereum Addresses ***/
// Pools Part
const poolStakingContract = "0x5a055f79981C8338230E5199BA7e477cFE35D14f";
const YVS = "0xec681f28f4561c2a9534799aa38e0d36a83cf478";

const poolLiquidityContract = "0x613f654C7BBB948219f3952173518DEBCD963718";
const YVS_WETH_UNIV2 = "0x182885Fa47B63C02D06A8D65db3Bf3871BE9F998";

// Vaults Part
const vaultContracts = [
    "0x981cc277841f06401B750a3c7dd42492ff962B9C",
    "0x0B1b5C66B519BF7B586FFf0A7bacE89227aC5EAF"
];

/*** BSC Addresses ***/
// Pools Part
const poolStakingContractBSC = "0xf44672da873f662AB8e1Fc904f8d053DAd9353DF";
const YVS_BSC = "0x47c1c7b9d7941a7265d123dcfb100d8fb5348213";
const poolLiquidityContractBSC = [
    //BUSD-YVS SLP closed
    "0xfbdf2bEdE50948754295F33FA4704Fd69E6d4C43",
    //BUSD-YVS PanCake Closed
    "0xBcbd2a48B6279C2a2d4609282aA80d8e856bFeBB",
    //WBNB-YVS PanCake Closed
    "0x7f644abFb4dD8d39c781411Bc3e7D70479E3a546",
    //WBNB-YVS PanCake V2
    "0x08559533a0671Ae685048C3B28980226Fb185209",
    //WBNB-YVS SLP
    "0x371CCe38B26f6a06Dd61Fabd50bA9D74eA2D58cC",
    //WBNB-YVS SLP
    "0x2f002F05bd3609E1151360476d5142bCdb11307B",
    //vaultWBNB_YVS
    "0x2d94d8b9301cDe1fDeCdF8B30EBdDD81e2E632bb"
];
const lpPoolsBSC = [
    //BUSD_YVS_SLP
    "0xeDaF3C776AbAef600a63585232855800b354578a",
    //BUSD_YVS_CakeLP
    "0x99338d3cc1300ddfA6D0621d27e8387eAE2aE858",
    //WBNB-YVS_CakeLP
    "0xA12C87881fECCC2CA1F8e1E7ECbDa8Af3A89Ab3c",
    //WBNB-YVS_CakeLPV2
    "0x226E28020fD59F1bE367cF4b20e76856e6d2D1DF",
    //WBNB-YVS_SLP
    "0x5E12A25A09b74313F0679D96aACB12886d2e02e4",
    //WBNB-YVS_SLP
    "0x5E12A25A09b74313F0679D96aACB12886d2e02e4",
    //lpVaultWBNB_YVS_SLP
    "0x5E12A25A09b74313F0679D96aACB12886d2e02e4"
];

// Vaults Part
const vaultContractsBSC = [
    //yvsBUSD 
    "0x3eB8BC3017ba663332CE9f8BdD89D9503EA978B0",
    //yvsWBNB
    "0x561819d509F94EBb08e75299A41Dc356af403F7B",
    //yvs4Belt
    "0x92d3f515AFAA05c8297Dd243Bae50b934A827f74",
    //yvsbeltBNB
    "0xA6B093259F39C8f9B55Ee2206a6b470Cf9D78C3B"
];

/*** Polygon Addresses ***/
//Pools Part
const poolStakingContractPolygon = "0x21E2822d912343251554812785f7AE9b9c52F420";
const YVS_polygon = "0xb565cf70613ca464d68427106af80c67a8e4b801";
const poolLiquidityContractPolygon = "0x5b19B98d9A9357fa9E05E6b0b1eCdFC84eF10529"
const YVS_WETH_UNIV2Polygon = "0x6951eb8E9bd734290590C8e7770aEBFf19e4F043";

async function calcTvl(balances, underlying, balance, vaultContracts, chain = "ethereum") {
    let chainBlocks = {};

    const vaultUnderlying = (
        await sdk.api.abi.multiCall({
            abi: underlying,
            calls: vaultContracts.map(vault => ({
                target: vault,
            })),
            chain: chain,
            block: chainBlocks[chain],
        })
    ).output.map(under => under.output);

    const vaultBalances = (
        await sdk.api.abi.multiCall({
            abi: balance,
            calls: vaultContracts.map(vault => ({
                target: vault,
            })),
            chain: chain,
            block: chainBlocks[chain],
        })
    ).output.map(bal => bal.output);

    vaultUnderlying.forEach((Underlying, idx) => {
        sdk.util.sumSingleBalance(balances, `${chain}:${Underlying}`, vaultBalances[idx]);
    });

    return balances;
}

async function ethTvl() {
    const balances = {};

    await calcTvl(balances, abi.underlying, abi.balance, vaultContracts);

    return balances;
}

async function bscTvl() {
    const balances = {};

    await calcTvl(balances, abi.underlying, abi.balance, vaultContractsBSC, "bsc");

    return balances;
}

module.exports = {
    ethereum: {
        staking: staking(poolStakingContract, YVS),
        pool2: pool2(poolLiquidityContract, YVS_WETH_UNIV2),
        tvl: ethTvl,
    },
    bsc: {
        staking: staking(poolStakingContractBSC, YVS_BSC, "bsc"),
        pool2: pool2s(poolLiquidityContractBSC, lpPoolsBSC, "bsc"),
        tvl: bscTvl,
    },
    polygon: {
        staking: staking(poolStakingContractPolygon, YVS_polygon, "polygon"),
        pool2: pool2(poolLiquidityContractPolygon, YVS_WETH_UNIV2Polygon, "polygon"),
    },
    methodology:
        "Counts tvl of all Pools and Vaults through their Contracts, also there are pool2 and staking parts",
};
