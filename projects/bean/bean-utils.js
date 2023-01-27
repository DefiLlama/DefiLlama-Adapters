const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");

const bean_abi = {
    totalDepositedBeans: "uint256:totalDepositedBeans",
    totalDepositedLP: "uint256:totalDepositedLP",
    getTotalDeposited: "function getTotalDeposited(address token) view returns (uint256)",
  };

const crv_abi = {
    crvLP_coins: "function coins(uint256 arg0) view returns (address)",
  }

// Adapted from /helper/unwrapLPs.js genericUnwrapCrv() because it seems 
// it was written for Curve V1 and tried to calc the amount of tokens in the pool
// from the Curve Pool name. In Curve V2 the name can be changed and therefore
// the old way doesn't work anymore. 
// Please specify how many coins are in the pool.
async function unwrapCrvSimple(balances, crvToken, lpBalance, block, chain, numTokens) {
	const { output: resolvedCrvTotalSupply } = await sdk.api.erc20.totalSupply({
		target: crvToken,
		chain, block
	})
    
    // don't add any balances if total supply of curve pool is 0
    // avoids error later when dividing by it
    if(resolvedCrvTotalSupply === "0") return;

	const LP_tokens_count = numTokens;
	const coins_indices = Array.from(Array(LP_tokens_count).keys())
	const coins = (await sdk.api.abi.multiCall({
		abi: crv_abi['crvLP_coins'],
		calls: coins_indices.map(i => ({ params: [i] })),
		target: crvToken,
		chain,
		block
	})).output.map(c => c.output)
	const crvLP_token_balances = await sdk.api.abi.multiCall({
		abi: 'erc20:balanceOf',
		calls: coins.map(c => ({
			target: c,
			params: crvToken,
		})),
		chain,
		block
	})

	// Edit the balances to weigh with respect to the wallet holdings of the crv LP token
	crvLP_token_balances.output.forEach(call =>
		call.output = BigNumber(call.output).times(lpBalance).div(resolvedCrvTotalSupply).toFixed(0)
	)
	sdk.util.sumMultiBalanceOf(balances, crvLP_token_balances);
}

module.exports = {
    bean_abi,
    unwrapCrvSimple,
}