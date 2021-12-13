const sdk = require("@defillama/sdk")
const abi = require("./abi.json")

const chain = "ethereum"

// addresses pools
const CapitalPool = ""
const ReinsurancePool = "0x0140b5cca6954167a0d7f4d6d0b0a5ed5a982d6b"
const BMIStaking = "0xdfb820b95eee42a858f50befbf834d2d24621153"
const ClaimVoting = "0xA71ef8B0F85A7F7Df1cf00A4bF129C61C42aA81f"
const BMICoverStaking = "0x6771fd8968488eb590dff1730fe099c0efa415bf"
// addresses tokens
const usdt = "0xdac17f958d2ee523a2206206994597c13d831ec7"
const bmi = "0x725c263e32c72ddc3a19bea12c5a0479a81ee688"
const stkBmi = "0x2887cfab266e5cf992fbef331f7ae1d019e8a29f"
const vbmi = "0xceaf1bf80b117aedb2a2c68ad5ebcfca4479646d"
// addresses getters
const PolicyBookRegistry = "0x1c5bb877d8f135db77fd8afb9103b43b4bf65c33"
const ShieldMining = ""

// =================== GET LIST OF POLICY BOOKS =================== //
async function getPolicyBookList(timestamp, block) {
  const countPolicyBooks = (
    await sdk.api.abi.call({
      target: PolicyBookRegistry,
      abi: abi["count"],
      chain: chain,
      block: block,
    })
  ).output
  const listPolicyBooks = (
    await sdk.api.abi.call({
      target: PolicyBookRegistry,
      params: [0, countPolicyBooks],
      abi: abi["list"],
      chain: chain,
      block: block,
    })
  ).output
  return listPolicyBooks
}

async function tvl(timestamp, block) {
  let balances = {}
  const listPolicyBooks = await getPolicyBookList(timestamp, block)

  // =================== GET USDT BALANCES =================== //
  const usdtPools = [
    //CapitalPool,
    ReinsurancePool,
    ...listPolicyBooks,
  ]
  const usdtBalances = await sdk.api.abi.multiCall({
    target: usdt,
    calls: usdtPools.map((usdtPool) => ({
      params: usdtPool,
    })),
    abi: abi["balanceOf"],
    chain: chain,
    block: block,
  })
  sdk.util.sumMultiBalanceOf(balances, usdtBalances)

  // =================== GET TOKENX BALANCES =================== // MISSIN SHIELDMINING CONTRACT AND ABI TO GET ASSOCIATED TOKENX
  /* for (PolicyBook of listPolicyBooks) {
    const tokenX = await sdk.api.abi.call({
      target: ShieldMining,
      params: PolicyBook,
      abi: abi["getTokenXContractFromPolicyBook"],
      chain: chain,
      block: block,
    })
    const tokenXBalance = await sdk.api.abi.call({
      target: tokenX,
      params: PolicyBook,
      abi: abi["balanceOf"],
      chain: chain,
      block: block,
    })
    sdk.util.sumSingleBalance(balances, tokenX, tokenXBalance.output)
  }*/
  // ============================================================ //
  return balances
}

async function staking(timestamp, block) {
  let balances = {}

  //const listPolicyBooks = await getPolicyBookList(timestamp, block)

  // =================== GET BMI BALANCES =================== //
  const bmiPools = [BMIStaking, ClaimVoting]

  const bmiBalances = await sdk.api.abi.multiCall({
    target: bmi,
    calls: bmiPools.map((bmiPool) => ({
      params: bmiPool,
    })),
    abi: abi["balanceOf"],
    chain: chain,
    block: block,
  })
  sdk.util.sumMultiBalanceOf(balances, bmiBalances)

  /*
  // =================== GET BMIXCOVER BALANCES =================== //
  for (PolicyBook of listPolicyBooks) {
    const bmixCoverBalance = await sdk.api.abi.call({
      target: PolicyBook,
      params: BMICoverStaking,
      abi: abi["balanceOf"],
      chain: chain,
      block: block,
    })
    sdk.util.sumSingleBalance(balances, PolicyBook, bmixCoverBalance.output)
  }

  // =================== GET stkBMI BALANCES =================== //
  const stkBmiBalance = await sdk.api.abi.call({
    target: stkBmi,
    params: vbmi,
    abi: abi["balanceOf"],
    chain: chain,
    block: block,
  })
  balances[stkBmi] = stkBmiBalance.output
  */
  // ============================================================ //
  return balances
}

module.exports = {
  ethereum: {
    tvl: tvl,
    staking: staking,
  },
}
