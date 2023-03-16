const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const {pool2Exports} = require("../helper/pool2");
const { staking } = require("../helper/staking");

const token = "0x07D49375A3213eF25aAA47C97A2d23A754bB8f8a";
const shares = "0xe318140bF0A31EAAf401AD62801b6c7427b36773";
const shareRewardPool = "0x989128334442946ed6508C45C43758a4e1E14923";
const boardroom = "0x9d7BBFA16E80A9C4ce9ecf3B706166aEf1477cE1";
const GenMasterchef = "0x29dA4fF649d39510f633Cd804B860858C333E5aD";

async function atvl(timestamp, block, chainBlocks) {
    const balances = {};
    const transform = addr => 'arbitrum:'+addr;
    await sumTokensAndLPsSharedOwners(
		balances,
		[
			["0x16084d8c82F2CEbe5CA7967d5551805424526a68", false],
			["0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", false],
			["0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", false],			
		],
		[GenMasterchef],
		chainBlocks.arbitrum,
		"arbitrum",
		transform,
	);

    return balances;
}

const pool2LPs = [
    "0x07D49375A3213eF25aAA47C97A2d23A754bB8f8a",  // ROSE
    "0x16084d8c82F2CEbe5CA7967d5551805424526a68", // ROSE-ETH
    "0xa299AA2f939aA0dBd9e2Ae2c7B66E6F700f50a4F" // SHARE-WETH
]

module.exports = {
    arbitrum: {
        tvl: atvl,
        staking: staking(boardroom, shares, "arbitrum"),
        pool2: pool2Exports(shareRewardPool, pool2LPs, "arbitrum", addr=>`arbitrum:${addr}`)
    }
}