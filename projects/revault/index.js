const sdk = require('@defillama/sdk');
const { transformBscAddress } = require('../helper/portedTokens');
const REVA_CHEF = "0xd7550285532f1642511b16Df858546F2593d638B";
const REVA_CHEF_ABI = require("./RevaChef.json");
const { unwrapUniswapLPs } = require('../helper/unwrapLPs');
const config = require("./mainnet.json");
// node test.js projects/revault/index.js

const lpAddresses = [
  '0x0ed7e52944161450477ee417de9cd3a859b14fd0',
  '0x58f876857a02d6762e0101bb5c46a8c1ed44dc16',
  '0x804678fa97d91b974ec2af3c843270886528a9e6'
];

async function tvl(timestamp, block) {
  const tokenAddresses = Array.from(
    new Set(config.tokens.map((token) => token.address)));

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
  let lpPositions = [];

  for (let i = 0; i < tokenInfos.length; i++) {
    
    if (lpAddresses.indexOf(tokenInfos[i].input.params[0].toLowerCase()) > -1) {
      lpPositions.push({
        balance: tokenInfos[i].output.totalPrincipal,
        token: tokenInfos[i].input.params[0]
      });

    } else {
      sdk.util.sumSingleBalance(
        balances, 
        transform(tokenInfos[i].input.params[0]), 
        tokenInfos[i].output.totalPrincipal
        );
    };
  };

  await unwrapUniswapLPs(
    balances, 
    lpPositions,
    block,
    'bsc',
    transform);

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
