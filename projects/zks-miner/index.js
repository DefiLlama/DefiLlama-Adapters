const sdk = require('@defillama/sdk');

const SILVER_MINER = "0x0B78a504D62391A1cBe92db6de4E4A1d5AE87732";
const DIAMOND_MINER = "0x755747467d97619a670e228eBEc8eFE285c37F01";
const GOLD_MINER = "0x340e443C85ecd7eB1E918744D4A35A1e6101bbd4";

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