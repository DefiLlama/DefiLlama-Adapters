const helpers = require('./helper');

async function tvl(timestamp, ethBlock, chainBlocks) {
    const balances = await helpers.tvl(timestamp, ethBlock, chainBlocks);
    console.log(balances);
    return balances;
}
module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
      arbitrum: {
        tvl,
      },
      start: 1668143255,
      methodology: 'Fetches the list of active farms from Factory\'s getFarmList function. For each farm, fetches the liquidity and underlying Uniswap Pool. Fetches the price and tokens of pool and use helper functions to calculate the amount using on chain calls. Then adds the tokens and their amounts to balances object'
};