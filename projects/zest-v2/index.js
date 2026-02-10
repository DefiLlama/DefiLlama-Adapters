const { sumTokens } = require('../helper/chain/stacks')

async function tvl() {
    return sumTokens({
        owners: [
            'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-stx',
            'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-ststx',
            'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-ststxbtc',
            'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-sbtc',
            'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-usdc',
            'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-vault-usdh',
            'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-market-vault',
        ],
    })
}

module.exports = {
    stacks: {
        tvl,
    },
};
