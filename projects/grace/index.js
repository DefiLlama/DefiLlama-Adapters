const CORE_CONTRACT = '0x1522ad0a3250eb0f64e0acfe090ca40949330cc1';

async function getPoolsList(api) {
    const poolCount = await api.call({
        abi: 'function poolCount() external view returns (uint256)',
        target: CORE_CONTRACT
    })

    return await api.multiCall({
        abi: "function poolList(uint256) external view returns (address)",
        calls: Array.from({length: poolCount}).map((v,i) => {
            return {
                target: CORE_CONTRACT,
                params: [i]
            }
        })
    })
}

async function getCollateralsList(api) {
    const collateralCount = await api.call({
        abi: 'function collateralCount() external view returns (uint256)',
        target: CORE_CONTRACT
    })

    return await api.multiCall({
        abi: "function collateralList(uint256) external view returns (address)",
        calls: Array.from({length: collateralCount}).map((v,i) => {
            return {
                target: CORE_CONTRACT,
                params: [i]
            }
        })
    })
}

async function getUnderlyings(api, list) {
    return await api.multiCall({
        abi: "function asset() external view returns (address)",
        calls: list.map(v => {
            return {
                target: v
            }
        })
    })
}

async function tvl(_, _1, _2, { api }) {

    const pools = await getPoolsList(api);
    const collaterals = await getCollateralsList(api);

    const poolUnderlyings = await getUnderlyings(api, pools);

    const collateralUnderlyings = await getUnderlyings(api, collaterals);

    const poolBalances = await api.multiCall({
        calls: pools.map((pool, i) => ({
            target: poolUnderlyings[i],
            params: [pool]
        })),
        abi: 'erc20:balanceOf',
        withMetadata: true,
    });

    api.addTokens(poolUnderlyings, poolBalances.map(v => v.output));

    const collateralBalances = await api.multiCall({
        calls: collaterals.map((collateral, i) => ({
            target: collateralUnderlyings[i],
            params: [collateral]
        })),
        abi: 'erc20:balanceOf',
        withMetadata: true,
    });

    api.addTokens(collateralUnderlyings, collateralBalances.map(v => v.output));
}

async function borrowed(_, _1, _2, { api }) {
    const pools = await getPoolsList(api);
    const poolUnderlyings = await getUnderlyings(api, pools);

    const poolBorrowed = await api.multiCall({
        calls: pools.map(pool => ({
            target: pool
        })),
        abi: 'function totalDebt() external view returns (uint256)',
    });

    api.addTokens(poolUnderlyings, poolBorrowed);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Fetches the list of pools and collaterals from the Core and sums up their balances',
  start: 14684731,
  base: {
    tvl, borrowed
  }
}; 