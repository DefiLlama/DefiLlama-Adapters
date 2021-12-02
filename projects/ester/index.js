const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { transformFantomAddress } = require("../helper/portedTokens");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const esterStakingChefContract = "0x78e9D247541ff7c365b50D2eE0defdd622016498";
const EST = "0x181f3f22c9a751e2ce673498a03e1fdfc0ebbfb6";
const WFTM_EST_SPIRITLP = "0x0c9043cb1B994C8e4a8024e2F037Ea50b7025a82";

const esterVaultFarmContract = "0xA6151b608f49Feb960e951F1C87F4C766850de31";

const ftmTvl = async (chainBlocks) => {
    const balances = {};

    let transformAddress = await transformFantomAddress();

    await addFundsInMasterChef(
        balances,
        esterStakingChefContract,
        chainBlocks["fantom"],
        "fantom",
        transformAddress,
        abi.poolInfoStaking,
        [EST, WFTM_EST_SPIRITLP]
    );

    const poolLength = (
        await sdk.api.abi.call({
            abi: abi.poolLength,
            target: esterVaultFarmContract,
            chain: "fantom",
            block: chainBlocks["fantom"],
        })
    ).output;

    const lpPositions = [];

    for (let index = 0; index < poolLength; index++) {
        const strat = (
            await sdk.api.abi.call({
                abi: abi.poolInfo,
                target: esterVaultFarmContract,
                params: index,
                chain: "fantom",
                block: chainBlocks["fantom"],
            })
        ).output.strat;

        const want = (
            await sdk.api.abi.call({
                abi: abi.poolInfo,
                target: esterVaultFarmContract,
                params: index,
                chain: "fantom",
                block: chainBlocks["fantom"],
            })
        ).output.want;

        const strat_bal = (
            await sdk.api.abi.call({
                abi: abi.wantLockedTotal,
                target: strat,
                chain: "fantom",
                block: chainBlocks["fantom"],
            })
        ).output;

        const symbol = (
            await sdk.api.abi.call({
                abi: abi.symbol,
                target: want,
                chain: "fantom",
                block: chainBlocks["fantom"],
            })
        ).output;

        if (symbol.includes("LP")) {
            lpPositions.push({
                token: want,
                balance: strat_bal,
            });
        } else {
            sdk.util.sumSingleBalance(balances, `fantom:${want}`, strat_bal);
        }
    }

    await unwrapUniswapLPs(
      balances,
      lpPositions,
      chainBlocks["fantom"],
      "fantom",
      transformAddress
    );

    return balances;
};

module.exports = {
    misrepresentedTokens: true,
    fantom: {
        staking: staking(esterStakingChefContract, EST, "fantom"),
        pool2: pool2(esterStakingChefContract, WFTM_EST_SPIRITLP, "fantom"),
        tvl: ftmTvl,
    },
    methodology:
        "We count liquidity on all the Vaults through EsterStakingChef and EsterVaultFarmt Contracts",
};
