const sdk = require('@defillama/sdk');
const { formatUnits } = require('ethers');
const contractsByChain = require('./config');

function getChainTvlFunction(chain) {
  return async (_timestamp, _ethBlock, chainBlocks) => {
    const block = chainBlocks[chain];
    let totalTvl = 0;

    const addresses = contractsByChain[chain] || [];
    for (const address of addresses) {
      // totalSupply using standard ERC20 short ABI
      const totalSupply = await sdk.api.abi.call({
        target: address,
        abi: 'erc20:totalSupply',
        block,
        chain,
      });

      if (!totalSupply || !totalSupply.output) {
        console.warn(`totalSupply() missing for ${address} on ${chain}`);
        continue;
      }

      // decimals using standard ERC20 short ABI (fallback to 18 if fails)
      const decRes = await sdk.api.abi.call({
        target: address,
        abi: 'erc20:decimals',
        block,
        chain,
      });
      
      const decimals = decRes && decRes.output ? Number(decRes.output) : 18;
      if (!decRes || !decRes.output) {
        console.warn(`decimals() missing for ${address} on ${chain}, defaulting to 18`);
      }

      // getSharePrice() - custom function, format with 6 decimals
      const spRes = await sdk.api.abi.call({
        target: address,
        abi: 'function getSharePrice() view returns (uint256)',
        block,
        chain,
      });

      let sharePrice = 0;
      if (spRes && spRes.output) {
        sharePrice = Number(formatUnits(spRes.output, 6));
      } else {
        console.warn(`getSharePrice() missing for ${address} on ${chain}, using 0`);
      }

      const supplyHuman = Number(formatUnits(totalSupply.output, decimals));
      const tvlForAddress = supplyHuman * sharePrice;
      totalTvl += tvlForAddress;
    }

    return {
      usd: totalTvl,
    };
  };
}

const adapter = {
  methodology:
    'TVL is calculated by summing total supply of shares distributed to depositors and multiplied by their share price (comprehensive of profit and loss). Aggregated across configured contracts.',
};

for (const chain of Object.keys(contractsByChain)) {
  adapter[chain] = { tvl: getChainTvlFunction(chain) };
}

module.exports = adapter;
