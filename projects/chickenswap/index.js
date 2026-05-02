const sdk = require("@defillama/sdk");
const abi = {
    "poolInfo": "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accChickenPerShare)",
    "token": "address:token",
    "balance": "uint256:balance"
  };
const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { getUniTVL } = require("../helper/unknownTokens");

const chickenChefContract = "0x87AE4928f6582376a0489E9f70750334BBC2eb35";
const KFC = "0xE63684BcF2987892CEfB4caA79BD21b34e98A291";
const WETH_KFC_UNIV2 = "0x90544c3f88d0a9e374ed35490028f45642a8b3f2";

const kfcVaults = [
    //kfcUSDT
    "0x408eC098bAB8457499EcE4BF17f197637e338D3a",
    //kfcUSDC
    "0x13DfDa244e281Ced094796e0E0d2A1Cf91A1BD13"
];


/*** Vaults TVL Portion ***/
const ethTvl = async (api) => {
    const balances = {};

    await addFundsInMasterChef(
        balances,
        chickenChefContract,
        api.block,
        "ethereum",
        addr => addr,
        abi.poolInfo,
        [KFC, WETH_KFC_UNIV2, kfcVaults[0], kfcVaults[1]]
    )
    return balances;
};

const dexTVL = getUniTVL({ factory: '0x8709Ea9fA0f1839237c9Dd3d59D243C411391970', useDefaultCoreAssets: true, })

module.exports = {
    misrepresentedTokens: true,
    ethereum: {
        staking: staking(chickenChefContract, KFC),
        pool2: pool2(chickenChefContract, WETH_KFC_UNIV2),
        tvl: sdk.util.sumChainTvls([dexTVL, ethTvl,]),
    },
};