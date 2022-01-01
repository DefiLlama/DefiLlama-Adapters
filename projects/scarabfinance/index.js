const sdk = require("@defillama/sdk");
const axios = require("axios");
const { transformFantomAddress } = require("../helper/portedTokens");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const scarabTokenAddress = "0x2e79205648b85485731cfe3025d66cf2d3b059c4";
const gscarabTokenAddress = "0x6ab5660f0B1f174CFA84e9977c15645e4848F5D6";

const scarabFtmLpAddress = "0x78e70eF4eE5cc72FC25A8bDA4519c45594CcD8d4";
const gscarabFtmLpAddress = "0x27228140d72a7186f70ed3052c3318f2d55c404d";

const templeAddress = "0xD00F41d49900d6affd707EC6a30d1Bf7D4B7dE8F";
const gscarabRewardPoolAddress = "0xc88690163b10521d5fB86c2ECB293261F7771525";

async function tvl(timestamp, block, chainBlocks) {
    const balances = {};
    let lpPositions = [];
    let transformAddress = await transformFantomAddress();

    // Temple TVL
    const templeBalance = sdk.api.erc20
        .balanceOf({
            target: gscarabTokenAddress,
            owner: templeAddress,
            block: chainBlocks["fantom"],
            chain: "fantom",
        });
    sdk.util.sumSingleBalance(
        balances,
        transformAddress(gscarabTokenAddress),
        (await templeBalance).output
    );

    // SARCOPHAGUS SCARAB-FTM LP TVL
    const scarabFtmLpSarcophagusBalance = sdk.api.erc20
        .balanceOf({
            target: scarabFtmLpAddress,
            owner: gscarabRewardPoolAddress,
            block: chainBlocks["fantom"],
            chain: "fantom",
        });

    lpPositions.push({
        token: scarabFtmLpAddress,
        balance: (await scarabFtmLpSarcophagusBalance).output,
    });

    // SARCOPHAGUS GSCARAB-FTM LP TVL
    const gscarabFtmLpSarcophagusBalance = sdk.api.erc20
        .balanceOf({
            target: gscarabFtmLpAddress,
            owner: gscarabRewardPoolAddress,
            block: chainBlocks["fantom"],
            chain: "fantom",
        });

    lpPositions.push({
        token: gscarabFtmLpAddress,
        balance: (await gscarabFtmLpSarcophagusBalance).output,
    });

    await unwrapUniswapLPs(
        balances,
        lpPositions,
        chainBlocks["fantom"],
        "fantom",
        transformAddress
    );
    return balances;
}

module.exports = {
    methodology: 'The TVL of Scarab Finance is calculated using the Spirit LP token deposits(SCARAB/FTM and GSCARAB/FTM), and the GSCARAB deposits found in the temple contract address(0xD00F41d49900d6affd707EC6a30d1Bf7D4B7dE8F).',
    fantom: {
        tvl,
    },
    tvl,
};