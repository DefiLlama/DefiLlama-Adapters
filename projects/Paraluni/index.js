const sdk = require("@defillama/sdk");
const {addFundsInMasterChef} = require("../helper/masterchef");
const t42 = "0x43Feaca246392C23EE5A0Db618fCd81a74b91726";
const usdtAddr = "0x55d398326f99059ff775485246999027b3197955";
const busdAddr = "0xe9e7cea3dedca5984780bafc599bd69add087d56";
const usdtBusd = "0x3fd4fbd7a83062942b6589a2e9e2436dd8e134d4";
const ethAddr = "0x2170ed0880ac9a755fd29b2688956bd959f933f8";
const wBNBAddr = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const paraChef = "0x633Fa755a83B015cCcDc451F82C57EA0Bd32b4B4";
const poolInfo = {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"poolInfo","outputs":[{"internalType":"contract IERC20","name":"lpToken","type":"address"},{"internalType":"uint256","name":"allocPoint","type":"uint256"},{"internalType":"uint256","name":"lastRewardBlock","type":"uint256"},{"internalType":"uint256","name":"accT42PerShare","type":"uint256"},{"internalType":"contract IParaTicket","name":"ticket","type":"address"},{"internalType":"uint256","name":"pooltype","type":"uint256"}],"stateMutability":"view","type":"function"};

async function tvl(timestamp, block, chainBlocks) {
    let balances = {};
	//Some tokens are ignored because we modified the logic that a token can only create a pool. 
	//It will only be added once below to prevent repeated calculations
    await addFundsInMasterChef(balances, paraChef, chainBlocks.bsc, "bsc", addr => `bsc:${addr}`, poolInfo, [usdtAddr,usdtBusd,ethAddr,wBNBAddr], true, true, t42);
    //add usdt pool
	let usdtBalance0 = (await sdk.api.erc20.balanceOf({
        target: usdtAddr,
        owner: paraChef,
        block: chainBlocks.bsc,
        chain: "bsc"
    })).output;
    sdk.util.sumSingleBalance(balances, `bsc:${usdtAddr}`, usdtBalance0);
	//add usdt of usdt-busd
	let usdtBalance1 = (await sdk.api.erc20.balanceOf({
        target: usdtAddr,
        owner: usdtBusd,
        block: chainBlocks.bsc,
        chain: "bsc"
    })).output;
    sdk.util.sumSingleBalance(balances, `bsc:${usdtAddr}`, usdtBalance1);
	//add busd of usdt-busd
	let busdBalance = (await sdk.api.erc20.balanceOf({
        target: busdAddr,
        owner: usdtBusd,
        block: chainBlocks.bsc,
        chain: "bsc"
    })).output;
    sdk.util.sumSingleBalance(balances, `bsc:${busdAddr}`, busdBalance);
	//add eth
	let ethBalance = (await sdk.api.erc20.balanceOf({
        target: ethAddr,
        owner: paraChef,
        block: chainBlocks.bsc,
        chain: "bsc"
    })).output;
    sdk.util.sumSingleBalance(balances, `bsc:${ethAddr}`, ethBalance);
	//add wbnb
	let wbnbBalance = (await sdk.api.erc20.balanceOf({
        target: wBNBAddr,
        owner: paraChef,
        block: chainBlocks.bsc,
        chain: "bsc"
    })).output;
    sdk.util.sumSingleBalance(balances, `bsc:${wBNBAddr}`, wbnbBalance);
	return balances;
}

module.exports = {
    name: "Paraluni",
	token: "T42",
	start: 1639400400,
	tvl,
}
