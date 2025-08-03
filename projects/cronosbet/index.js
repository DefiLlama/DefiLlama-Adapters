/**
 * CronosBet TVL adapter
 *
 * – Counts native CRO plus every ERC-20 token that can be
 *   deposited in the GamePoolUpgradeable contract, which serves
 *   as the central treasury for all games
 */

const GAME_POOL = '0xdF697B906AE26a5dB263517c3d1CAf52d19bD8Ac'

async function tvl(api) {
    // Get supported ERC-20 tokens from the tokenList array
    const tokens = await api.fetchList({
        lengthAbi: 'getSupportedTokensLength',
        itemAbi: 'function tokenList(uint256) view returns (address)',
        target: GAME_POOL,
    })

    // Get native CRO balance from contract
    const nativeBalance = await api.call({
        target: GAME_POOL,
        abi: 'function getPoolBalance() view returns (uint256)'
    })

    // Add native CRO balance
    api.add('0x0000000000000000000000000000000000000000', nativeBalance)

    // Add supported token balances
    for (const token of tokens) {
        const balance = await api.call({
            target: token,
            abi: 'erc20:balanceOf',
            params: [GAME_POOL]
        })
        if (balance > 0) {
            api.add(token, balance)
        }
    }

    return api.getBalances()
}

module.exports = {
    cronos: {
        tvl,
    },
    methodology:
        'TVL is calculated by summing the balances of native CRO and all supported ERC-20 tokens (tracked in the tokenList array) held by the GamePool contract, which acts as the central treasury for all CronosBet games.',
    start: '2025-06-28',
    timetravel: true,
}
