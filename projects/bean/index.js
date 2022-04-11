const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");
const { unwrapUniswapLPs } = require('../helper/unwrapLPs')


const BEAN_TOKEN_ADDR = "0xDC59ac4FeFa32293A95889Dc396682858d52e5Db";
const BEAN_DIA_ADDR = "0xC1E088fC1323b20BCBee9bd1B9fC9546db5624C5";

const BEAN_LUSD_ADDR = "0xD652c40fBb3f06d6B58Cb9aa9CFF063eE63d465D";
const BEAN_3CRV_ADDR = "0x3a70DfA7d2262988064A2D051dd47521E43c9BdD";
const BEAN_ETH_ADDR = "0x87898263B6C5BABe34b4ec53F22d98430b91e371";

const bean_abi = {
    "totalDepositedBeans": {
        "inputs": [],
        "name": "totalDepositedBeans",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    "totalDepositedLP": {
        "inputs": [],
        "name": "totalDepositedLP",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    "getTotalDeposited": {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            }
        ],
        "name": "getTotalDeposited",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
};

const crv_abi = {
	"crvLP_coins": { "stateMutability": "view", "type": "function", "name": "coins", "inputs": [{ "name": "arg0", "type": "uint256" }], "outputs": [{ "name": "", "type": "address" }], "gas": 3123 }
}

// Taken from /helper/unwrapLPs.js genericUnwrapCrv() and changed because it seems 
// it was written for Curve V1 and tried to calc the amount of tokens in the pool
// from the Curve Pool name. In Curve V2 the name can be changed and this
// doesn't work anymore ...
async function unwrapCrvSimple(balances, crvToken, lpBalance, block, chain, numTokens) {
	const { output: resolvedCrvTotalSupply } = await sdk.api.erc20.totalSupply({
		target: crvToken,
		chain, block
	})

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

async function tvl(time, block){
    const balances = {};

    const beanEthLpBalance = (await sdk.api.abi.call({
        abi: bean_abi["totalDepositedLP"],
        target: BEAN_DIA_ADDR,
        block,
    })).output;

    const beanBalance = (await sdk.api.abi.call({
        abi: bean_abi["totalDepositedBeans"],
        target: BEAN_DIA_ADDR,
        block,
    })).output;

    const bean3CrvLPBalance = (await sdk.api.abi.call({
        abi: bean_abi["getTotalDeposited"],
        target: BEAN_DIA_ADDR,
        params: BEAN_3CRV_ADDR
    })).output;

    const beanLUSDLPBalance = (await sdk.api.abi.call({
        abi: bean_abi["getTotalDeposited"],
        target: BEAN_DIA_ADDR,
        params: BEAN_LUSD_ADDR,
    })).output;

    const lpPositions = [
        {
            balance: beanEthLpBalance,
            token: BEAN_ETH_ADDR,
        }
    ]

    // add balance of siloed Beans
    await sdk.util.sumSingleBalance(balances, BEAN_TOKEN_ADDR, beanBalance);
    // add balance of siloed uniswap BEAN:ETH LP
    await unwrapUniswapLPs(balances, lpPositions, block);
    // add balances of siloed Curve pools
    await unwrapCrvSimple(balances, BEAN_LUSD_ADDR, beanLUSDLPBalance, block, "ethereum", 2);
    await unwrapCrvSimple(balances, BEAN_3CRV_ADDR, bean3CrvLPBalance, block, "ethereum", 2);
    
    return balances;
}

module.exports={
    timetravel: true,
    methodology: "Counts beans and all current LPs in the silo.",
    start: 12974075,
    ethereum: {
        tvl,
    },
}