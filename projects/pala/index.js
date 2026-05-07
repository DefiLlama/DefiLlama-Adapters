const ABI = {
    "poolInfos": "function poolInfos() view returns (tuple(address pool, address token0, address token1, string name, string symbol, uint8 decimals, uint256 totalSupply, uint112 token0Reserve, uint112 token1Reserve, uint256 token0Balance, uint256 token1Balance)[] poolInfoList)",
    "tokenInfoDetail": "function tokenInfoDetail(address token) view returns (tuple(address token, string name, string symbol, uint8 decimals, uint256 totalSupply) info, uint256 price)",
    "balanceOf": "function balanceOf(address) view returns (uint256)",
    "totalSupply": "uint256:totalSupply",
    "farmInfos": "function farmInfos(address farm) view returns (tuple(address pool, uint256 totalLP, uint256 allocPoint, uint256 lastRewardBlock, uint256 accRewardPerShare)[] farmInfoList, tuple(uint256 attenTotalAllocPoint, uint256 attenFarmStartBlock, uint256 attenFarmEndBlock, uint256 attenPerBlock, uint256 attenBonusMultiplier, uint256 palaTotalAllocPoint, uint256 palaFarmStartBlock, uint256 palaPerBlock, uint256 palaBonusMultiplier) config)"
  };
const sdk = require('@defillama/sdk')
const { PromisePool } = require('@supercharge/promise-pool')
const ADDRESSES = require('../helper/coreAssets.json')

const VIEWER_ADDR = "0x2B16648ddD1559fc86e0c0617213Ab5dd2Ea01B9";
const chain = 'klaytn'

const getPoolsInfo = async (block) => {
	return (await sdk.api.abi.call({ target: VIEWER_ADDR, abi: ABI.poolInfos, block, chain })).output
}

const getTokenInfoDetail = async (block, tokenAddr) => {
	return (await sdk.api.abi.call({ target: VIEWER_ADDR, abi: ABI.tokenInfoDetail, block, chain, params: tokenAddr })).output
}

const calcPoolLiquidityVolume = (pool, tokenMapping) => {
	const t0Detail = tokenMapping[pool.token0] || { decimals: 1, price: 0};
	const t0decimals = t0Detail.decimals;
	const t0Price = t0Detail.price;
	const t1Detail = tokenMapping[pool.token1] || { decimals: 1, price: 0};
	const t1decimals = t1Detail.decimals;
	const t1Price = t1Detail.price;

	return ((t0Price / 1e18) * (pool.token0Reserve / Math.pow(10, t0decimals))) +
		((t1Price / 1e18) * (pool.token1Reserve / Math.pow(10, t1decimals)));
}

const fetchLiquidity = async (ts, _block, chainBlocks) => {
	const block = chainBlocks[chain]
	const tokenMapping = {}
	const poolInfos = await getPoolsInfo(block)
	let tokenSet = new Set()
	poolInfos.forEach((pool) => {
		tokenSet.add(pool.token0)
		tokenSet.add(pool.token1)
	})

	await PromisePool
		.withConcurrency(3)
		.for([...tokenSet])
		.process(async token => {
			const response = await getTokenInfoDetail(block, token)
			tokenMapping[token] = {
				price: response.price,
				decimals: response.info.decimals
			}
		})

	const tvl = poolInfos.reduce((acc, pool) => {
		return acc + calcPoolLiquidityVolume(pool, tokenMapping)
	}, 0)
	return {
		[`klaytn:${ADDRESSES.klaytn.USDT}`]: Number(tvl).toFixed(0) * 1e6
	};
}


module.exports = {
	klaytn: {
		tvl: fetchLiquidity
	},
	methodology:
		"Sum of the total volume of the LPs. Staked is calculated by sum of the total staked PALA tokens"
}