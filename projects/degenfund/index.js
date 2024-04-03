const sdk = require('@defillama/sdk')
const BigNumber = require("bignumber.js");

module.exports = {
  methodology: "Calculates the total value of staked DFund tokens in our staker smart contract.",
};

const abi = {
    totalDfundStaked: "uint256:totalDfundStaked",
    reserves: "uint256,uint256:reserves"
}
const stakeCalls = [
    '0xe11CD52De12a86400311e0D2884aC9B542eEd05e',
  ]
  const reservesCalls = [
    '0x9c0Dd6BA0E2c611585c75F06f024BC8826FdB446',
  ]
const chain = 'degen'

const reservesABIFunction = "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"

async function tvl(_, _b, { [chain]: block}) {
    // Get Staked DFund in Staker contract
    const { output: staked } = await sdk.api.abi.multiCall({
        abi: abi.totalDfundStaked,
        calls: stakeCalls.map(i => ({ target: i})),
        chain, block,
    })
    // Get DFund price from DFund/Degen lp
    const { output: reserves } = await sdk.api.abi.multiCall({
        abi: reservesABIFunction,
        calls: reservesCalls.map(i => ({ target: i})),
        chain, block,
    })

    const reserve0 = BigNumber(reserves[0].output.reserve0)
    const reserve1 = BigNumber(reserves[0].output.reserve1)
    const priceInDegen = reserve1.dividedBy(reserve0);
    const stakedTokens = staked[0].output / 1e18;
    const totalInDegen = stakedTokens * priceInDegen
    const balances = {}

    sdk.util.sumSingleBalance(
        balances,
        "degen-base",
        totalInDegen,
    );
    return balances
}

module.exports = {
    degen: {
      tvl,
    }
  }