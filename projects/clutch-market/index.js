const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
    arbitrum: {
        staking: {
            token: "0xF4AcDE4D938844751f34659C67056f7e69dBE85a", // CLUTCH token
            contract: "0x2F849Bf926E457CE57dF4f8C24eEA0d33Fa04672" // CLUTCH staking contract
        },
        tvlTokens: [
            {
                token: ADDRESSES.arbitrum.USDC_CIRCLE, // USDC
                contract: "0x9797dA129eaFA143E8A50028563b69Cc02ea6444" // USDC TVL contract
            }
        ]
    }
};

async function stakingTvl(_, _1, _2, { api }) {
    const { token, contract } = config.arbitrum.staking;
    return sumTokens2({ api, tokens: [token], owners: [contract] });
}

async function tvl(_, _1, _2, { api }) {
    const tokensAndOwners = config.arbitrum.tvlTokens.map(({ token, contract }) => [token, contract]);
    return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
    methodology: "TVL includes staking for the project's own token (CLUTCH) and total value locked (TVL) for USDC in separate contracts.",
    arbitrum: { staking: stakingTvl, tvl },
};
