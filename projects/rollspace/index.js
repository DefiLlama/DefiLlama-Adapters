const { sumTokensExport } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk');

const BSC_POOL_CONTRACT = '0xB1FcDb8Ed3c2Bc572440b08a5A93984f366BBf3C';

async function bnbTvl(_, _1, _2, { api }) {
  const balance = await sdk.api.eth.getBalance({ target: BSC_POOL_CONTRACT, chain: 'bsc' });
  return { 'binancecoin': balance.output };
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'counts the number of BNB tokens in the bsc pool contract.',
    start: 1000235,
    bsc: {
        tvl: sdk.util.sumChainTvls([
            bnbTvl,
            sumTokensExport({ 
                owner: BSC_POOL_CONTRACT, 
                tokens: [],
            })
        ]),
    }
};

// node test.js projects/rollspace/index.js