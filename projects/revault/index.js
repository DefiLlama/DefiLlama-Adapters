const sdk = require('@defillama/sdk');
const { transformBscAddress } = require('../helper/portedTokens');
const REVA_CHEF = "0xd7550285532f1642511b16Df858546F2593d638B";
const REVA_CHEF_ABI = require("./RevaChef.json");
const BUSD = '0xe9e7cea3dedca5984780bafc599bd69add087d56';
const config = require("./mainnet.json");

async function tvl(timestamp, block) {
  const tokenAddresses = Array.from(new Set(config.tokens.map((token) => token.address)));
  const transform = await transformBscAddress();
  const calls = tokenAddresses.map((tokenAddress) => ({
    params: tokenAddress,
    target: REVA_CHEF,
  }));

	const tokenInfos = (await sdk.api.abi.multiCall({
		abi: REVA_CHEF_ABI['tokens'],
    calls,
		block: block,
    chain: "bsc",
	})).output;

  let balances = {};

  for (let i = 0; i < tokenInfos.length; i++) {
    sdk.util.sumSingleBalance(
      balances, 
      transform(BUSD), 
      tokenInfos[i].output.tvlBusd
      );
  };

	return balances;
};

module.exports = {
  misrepresentedTokens: true,
  name: 'Revault Network',
  website: 'https://app.revault.network',
  token: 'REVA',
  start: 1634150000,        // 13th of October, 2021
	bsc: {
		tvl,
  },
}
