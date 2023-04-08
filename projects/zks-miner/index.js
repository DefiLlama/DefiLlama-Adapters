const sdk = require('@defillama/sdk');

const SILVER_MINER = "0x0A23aF664eFA875B36f8e82e1D52FBaE34607928";
const DIAMOND_MINER = "0xF375De0ceeA7ED48D1074b777Fc37e7978f7Ba80";
const GOLD_MINER = "0x654Fd3efc9475B57a92c3ac7f9EB58735C73592f";

const ZKSYNC_ETH_TOKEN = "0x0000000000000000000000000000000000000000";

async function zks_miner({ api }) {
        let balances = {};
    
        const ETHBalanceSilver = (await sdk.api.abi.call({
            chain: "zkSync",
            target: ZKSYNC_ETH_TOKEN,
            params: [SILVER_MINER],
            abi: 'erc20:balanceOf',
        })).output;
        
        const ETHBalanceDiamond = (await sdk.api.abi.call({
            chain: "zkSync",
            target: ZKSYNC_ETH_TOKEN,
            params: [DIAMOND_MINER],
            abi: 'erc20:balanceOf',
        })).output;

        const ETHBalanceGold = (await sdk.api.abi.call({
            chain: "zkSync",
            target: ZKSYNC_ETH_TOKEN,
            params: [GOLD_MINER],
            abi: 'erc20:balanceOf',
        })).output;
    
        balances = {
            "ZksMiner Silver": ETHBalanceSilver,
            "ZksMiner Diamond": ETHBalanceDiamond,
            "ZksMiner Gold": ETHBalanceGold
        };
            
        return balances;
}
  
module.exports = {
	methodology: 'TLV silver, diamond and gold is total amount miner deposit to contract silver, diamond and gold',
	bsc:{
        zks_miner
	},	
}