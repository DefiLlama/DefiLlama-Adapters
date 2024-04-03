const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { stakingPricedLP } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const token0Abi = 'address:token0'
const token1Abi = 'address:token1'
const { default: BigNumber } = require("bignumber.js");

let token = ADDRESSES.cronos.SVN;
let share = "0xf8b9facB7B4410F5703Eb29093302f2933D6E1Aa";
const rewardPool = "0xA51054BDf0910E3cE9B233e6B5BdDc0931b2E2ED";
const masonry = "0x2CcbFD9598116cdF9B94fF734ece9dCaF4c9d471";
const pool2LPs = [
    "0xB6E1705BfAFcf1efEE83C135C0F0210653bAB8F0",
    "0xc924da29d37f3b8C62c4c3e4e6958bF2b5ebF677",
]

async function pool2(timestamp, block, chainBlocks) {
    block = chainBlocks.cronos;
    const chain = 'cronos';
    let balances = {};
    token = token.toLowerCase();
    share = share.toLowerCase();
    block = chainBlocks[chain];
    const pool2Balances = (await sdk.api.abi.multiCall({
        calls: pool2LPs.map(p => ({
            target: p,
            params: rewardPool
        })),
        abi: "erc20:balanceOf",
        block,
        chain
    })).output;
    const supplies = (await sdk.api.abi.multiCall({
        calls: pool2LPs.map(p => ({
            target: p
        })),
        abi: "erc20:totalSupply",
        block,
        chain
    })).output;
    const pool2Token0 = (await sdk.api.abi.multiCall({
        calls: pool2LPs.map(p => ({
            target: p
        })),
        abi: token0Abi,
        block,
        chain
    })).output;
    const pool2Token1 = (await sdk.api.abi.multiCall({
        calls: pool2LPs.map(p => ({
            target: p
        })),
        abi: token1Abi,
        block,
        chain
    })).output;

    for (let i = 0; i < pool2LPs.length; i++) {
        let listedToken;
        const token0 = pool2Token0[i].output.toLowerCase();
        const token1 = pool2Token1[i].output.toLowerCase();
        if (token0 === token || token0 === share) {
            listedToken = token1;
        }
        else if (token1 === token || token1 === share) {
            listedToken = token0;
        }
        const listedTokenBalance = (await sdk.api.erc20.balanceOf({
            target: listedToken,
            owner: pool2LPs[i],
            block,
            chain
        })).output;
        const balance = BigNumber(pool2Balances[i].output).times(listedTokenBalance).div(supplies[i].output).times(2).toFixed(0);
        sdk.util.sumSingleBalance(balances, `cronos:${listedToken}`, balance);
    }
    return balances
}
async function tvl(timestamp, block, chainBlocks) {
    const balances = {};
    await sumTokensAndLPsSharedOwners(
		balances,
		[
			["0xB6E1705BfAFcf1efEE83C135C0F0210653bAB8F0", true],
			["0xc924da29d37f3b8C62c4c3e4e6958bF2b5ebF677", true],
			["0x97749c9B61F878a880DfE312d2594AE07AEd7656", false],
			["0x50c0C5bda591bc7e89A342A3eD672FB59b3C46a7", false],
			["0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23", false],
			["0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03", false],
		],
		["0x3827CAa33557304e1CA5D89c2f85919Da171C44D"],
		chainBlocks.cronos,
		"cronos",
		(addr) => `cronos:${addr}`
	);
    delete balances['cronos:' + ADDRESSES.cronos.SVN];

    return balances;
}
module.exports = {
    cronos : {
        tvl,
        pool2,
        staking: stakingPricedLP(masonry, share, 'cronos', pool2LPs[1], 'mmfinance', true),
    }
};