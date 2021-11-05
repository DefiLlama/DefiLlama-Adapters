const sdk = require('@defillama/sdk');

const REVA_CHEF = "0xd7550285532f1642511b16Df858546F2593d638B";
const REVA_CHEF_ABI = require("./RevaChef.json");

const config = require("./mainnet.json");

async function tvl(timestamp, block) {
  const calls = config.tokens.map((token) => ({
    params: token.address,
    target: REVA_CHEF,
  }));

	const tokenInfos = await sdk.api.abi.multiCall({
		abi: REVA_CHEF_ABI['tokens'],
    calls,
		block: block,
    chain: "bsc",
	});
  const balances = tokenInfos["output"].map((response) => ({
    [`bsc:${response.input.params[0]}`]: response.output.tvlBusd
  }));
	console.log(balances);
	
	return balances;
}

/*

	const tokenInfo = await revaChefContract.tokens(token.address);
	const totalTokenPrincipal = tokenInfo.totalPrincipal;
	const tokenToBusdRate = await zapContract.getBUSDValue(
		token.address,
		BigNumber.from("10").pow(tokenDecimals),
	);
	const tvlBusd = totalTokenPrincipal
		.mul(tokenToBusdRate)
		.div(BigNumber.from("10").pow(tokenDecimals));

}



const POOL = '0xa1e72267084192db7387c8cc1328fade470e4149';
const stkTRU = '0x23696914Ca9737466D8553a2d619948f548Ee424';
const TRU = '0x4C19596f5aAfF459fA38B0f7eD92F11AE6543784';
const TUSD = '0x0000000000085d4780B73119b644AE5ecd22b376';


async function tvl(timestamp, block) {
    let balances = {};

    const poolTVL = await sdk.api.abi.call({
      target: POOL,
      abi: abi['poolValue'],
      block: block 
    });
    const truTVL = await sdk.api.abi.call({
      target: stkTRU,
      abi: abi['stakeSupply'],
      block: block 
    });
    
    balances[TUSD] = poolTVL.output;
    balances[TRU] = truTVL.output;
    
    return balances;
}
*/

module.exports = {
  name: 'Revault Network',
  website: 'https://app.revault.network',
  token: 'REVA',
  //category: "?",
  start: 1634150000,        // 13th of October, 2021
	bsc: {
		tvl,
  },
}
