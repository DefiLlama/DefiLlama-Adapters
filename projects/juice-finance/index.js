const LENDING_POOL = "0x4A1d9220e11a47d8Ab22Ccd82DA616740CF0920a"
const COLLATERAL_VAULT = "0x6301795aa55B90427CF74C18C8636E0443F2100b"

const USDB = "0x4300000000000000000000000000000000000003"
const WETH = "0x4300000000000000000000000000000000000004"

const LIQUIDITY_SUPPLIED =
  "function getTotalSupply() view returns (uint256)"
const WETH_COLLATERAL_DEPOSITED =
  "function totalAssets() view returns (uint256)"

async function tvl(timestamp, _, _1, { api }) {
    const usdbLiquidity = await api.call({ abi: LIQUIDITY_SUPPLIED, target: LENDING_POOL })
    const wethDeposited = await api.call({ abi: WETH_COLLATERAL_DEPOSITED, target: COLLATERAL_VAULT })

    api.addTokens([USDB, WETH], [usdbLiquidity, wethDeposited])
}

module.exports = {
    misrepresentedTokens: false,
    blast: {
        tvl
    }
}