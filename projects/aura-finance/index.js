const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const BigNumber = require('bignumber.js')
const { unwrapBalancerPool } = require('../helper/unwrapLPs')

const AURA_BOOSTER = "0x7818A1DA7BD1E64c199029E86Ba244a9798eEE10"
const BALANCER_VAULT = "0xBA12222222228d8Ba445958a75a0704d566BF2C8"
const addresses = {
  aura: "0xc0c293ce456ff0ed870add98a0828dd4d2903dbf",
  auraLocker: "0x3Fa73f1E5d8A792C80F426fc8F84FBF7Ce9bBCAC",
  bal: "0xba100000625a3754423978a60c9317c58a424e3d",
  veBal: "0xC128a9954e6c874eA3d62ce62B468bA073093F25",
  auraDelegate: "0xaF52695E1bB01A16D33D7194C28C42b10e0Dbec2",
  bal80eth20: "0x5c6Ee304399DBdB9C8Ef030aB642B10820DB8F56",
};
async function tvl(_, block) {
    const poolLength = (await sdk.api.abi.call({
        target: AURA_BOOSTER,
        abi: abi.poolLength,
        block: block,
      })
    ).output;
    const pools = (await sdk.api.abi.multiCall({
        calls: Array.from({ length: Number(poolLength) }, (_, poolId) => ({
            target: AURA_BOOSTER,
            params: poolId,
          })),
        abi: abi.poolInfo,
        block: block,
    })).output
    const poolIds = (await sdk.api.abi.multiCall({
        calls: pools.map(pool => ({target: pool.output.lptoken})),
        abi: abi.getPoolId,
        block,
    })).output;
    const poolTokensInfo = (await sdk.api.abi.multiCall({
        calls: poolIds.map(poolId => ({target: BALANCER_VAULT, params: poolId.output})),
        abi: abi.getPoolTokens,
        block
    })).output;
    const balancesinStaking = (await sdk.api.abi.multiCall({
        calls: pools.map(pool => ({target: pool.output.token, params:pool.output.crvRewards })),
        abi: 'erc20:balanceOf',
        block
    })).output;
    const totalSupplies = (await sdk.api.abi.multiCall({
        calls: pools.map(pool => ({target: pool.output.lptoken})),
        abi: 'erc20:totalSupply',
        block
    })).output;
    let balances = {}
    const { output: veBalTotalSupply } = await sdk.api.erc20.totalSupply({ target: addresses.veBal, block })
    const { output: veBalance } = await sdk.api.erc20.balanceOf({ target: addresses.veBal, owner: addresses.auraDelegate, block })
    const ratio = veBalance / veBalTotalSupply
    const bal = await unwrapBalancerPool({ block, balancerPool: addresses.bal80eth20, owner: addresses.veBal, })
    Object.entries(bal).forEach(([token, value]) => {
        const newValue = BigNumber(+value * ratio).toFixed(0)
        sdk.util.sumSingleBalance(balances, token, newValue)
    })
    for (let [i,info] of poolTokensInfo.entries()) {
        // unwrapBalancerPool would be better here, but since crvRewards address holds aura-wrapped tokens, it won't work
        const result =  Object.assign.apply({}, info.output.tokens.map( (v, i) => ( {[v]: info.output.balances[i]} ) ) );
        const totalSupply = BigNumber(totalSupplies[i].output);
        const stakedBalance = BigNumber(balancesinStaking[i].output);
        const ratio = stakedBalance.div(totalSupply)
        if (info.input.params[0] == "0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249") {
            // Pool is 80BAL-20ETH/auraBAL, need to unwrap 80BAL-20ETH
            const unwrapped = await unwrapBalancerPool({block, balancerPool: addresses.bal80eth20, owner:BALANCER_VAULT})
            Object.entries(unwrapped).forEach(([token, balance]) => {
                balances[token] = BigNumber(balances[token] || 0).plus(BigNumber(balance).times(ratio))
            })
        }
        Object.entries(result).forEach(([token, balance]) => {
            balances[token] = BigNumber(balances[token] || 0).plus(BigNumber(balance).times(ratio))
        })
    }
    return balances

}
module.exports = {
    timetravel: true,
    methodology: "TVL of Aura Finance consists of the total deposited assets, protocol-controlled value via veBAL and vote-locked AURA (staking)",
    ethereum: {
        tvl,
        staking: staking(addresses.auraLocker, addresses.aura)
    }
}