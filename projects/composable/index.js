const ADDRESSES = require('../helper/coreAssets.json')
const { chainExports } = require('../helper/exports')
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')

const networks = {
    'ethereum': ['0xef4439f0fae7db0b5ce88c155fc6af50f1b38728', [
        ADDRESSES.ethereum.USDC, //usdc
        ADDRESSES.ethereum.WETH, // eth
        '0xca3d75ac011bf5ad07a98d02f18225f9bd9a6bdf', // tricrypto
    ]],
    'arbitrum': ['0xEba8C2Bf0d1C9413543188fc42D7323690AED051', [
        ADDRESSES.arbitrum.USDC, //usdc
        ADDRESSES.arbitrum.WETH //eth
    ]],
    'polygon': ['0xcd8e7322dc2659b1ec447e5d52fdd9c67e8c3c01', [
        ADDRESSES.polygon.USDC, //usdc
        ADDRESSES.polygon.WETH_1 //eth
    ]]
}

const abi = {
    token: "address:token",
    totalToken: "uint256:totalToken",
}

const rugPools = ['0x4a03ea61e543ec7141a3f90128b0c0c9514f8737', '0xf12da8470e2643ccb39a157e8577d9aa586a488f', '0x1941441d31809e9E1828Da0cE6d44175F657E215']

function chainTvl(chain) {
    return async (_time, ethBlock, chainBlocks) => {
        const balances = {}
        const [owner, tokens] = networks[chain]
        await sumTokensAndLPsSharedOwners(balances, tokens.map(t => [t, false]), [owner], chainBlocks[chain], chain, addr => `${chain}:${addr}`)
        if (chain === "ethereum") {
            for (const pool of rugPools) {
                const token = await sdk.api.abi.call({
                    target: pool,
                    abi: abi.token,
                    block: ethBlock
                })
                const bal = await sdk.api.abi.call({
                    target: pool,
                    abi: abi.totalToken,
                    block: ethBlock
                })
                sdk.util.sumSingleBalance(balances, token.output, bal.output)
            }
        }
        return balances
    }
}

module.exports = chainExports(chainTvl, Object.keys(networks))