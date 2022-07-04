const sdk = require('@defillama/sdk');
const { getBlock } = require('../helper/getBlock');
const { transformCronosAddress } = require('../helper/portedTokens');

const threeFerPoolAddress = '0xe8d13664a42B338F009812Fa5A75199A865dA5cD';
const CHAIN = 'cronos';

const tokens = {
  // DAI
  "0xF2001B145b43032AAF5Ee2884e456CCd805F677D": [
    threeFerPoolAddress,
  ],
  // USDC
  "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59": [
    threeFerPoolAddress,
  ],
  // USDT
  "0x66e428c3f67a68878562e79A0234c1F83c208770": [
    threeFerPoolAddress,
  ],
};

async function tvl(timestamp, ethBlock, chainBlocks) {
  const block = await getBlock(timestamp, CHAIN, chainBlocks)
  const transform = await transformCronosAddress()
  const balances = {}

  const calls = [];
  for (const token in tokens) {
    for (const poolAddress of tokens[token])
      calls.push({
        target: token,
        params: poolAddress,
      });
  }
  const balanceOfResults = await sdk.api.abi.multiCall({
    block,
    chain: CHAIN,
    calls: calls,
    abi: "erc20:balanceOf",
  });

  balanceOfResults.output.forEach((balanceOf) => {
    const address = balanceOf.input.target;
    const amount = balanceOf.output;
    sdk.util.sumSingleBalance(balances, transform(address), amount)
  });

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'sum of ferro stablecoin pool contracts balance',
  start: 2542015,
  cronos: {
    tvl,
  }
}
