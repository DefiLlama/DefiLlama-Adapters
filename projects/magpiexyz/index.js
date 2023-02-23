const sdk = require('@defillama/sdk')
const BigNumber = require("bignumber.js");
// const { POOL_LIST } = require("./pool")
const WombatPoolHelperAbi = require("./abis/wombatPoolHelper.json")
const MasterMagpieAbi = require("./abis/masterMagpie.json");
const MasterMagpieAddress = "0xa3B615667CBd33cfc69843Bf11Fbb2A1D926BD46"
const VlMGPAddress = "0x9B69b06272980FA6BAd9D88680a71e3c3BeB32c6"
const MGPAddress = "0xD06716E1Ff2E492Cc5034c2E81805562dd3b45fa"
const WOMAddress = "0xAD6742A35fB341A9Cc6ad674738Dd8da98b94Fb1"
const MWOMAddress = "0x027a9d301FB747cd972CFB29A63f3BDA551DFc5c"
const MgpLpAxlUsdAddress = "0x4e33Ee8675a7ef1bd9B1cd35338AdFb7bdEd74A9"
const { transformBalances } = require('../helper/portedTokens')

async function getPoolList() {
  const poolList = [];

  const poolLength = (
    await sdk.api.abi.call({
      abi: MasterMagpieAbi.poolLength,
      target: MasterMagpieAddress,
      chain: 'bsc',
    })
  ).output

  for (let i = 0, l = poolLength; i < l; i++) {
    let poolToken = (
      await sdk.api.abi.call({
        abi: MasterMagpieAbi.registeredToken,
        target: MasterMagpieAddress,
        chain: 'bsc',
        params: i,
      })
    ).output

    const poolInfo = (
      await sdk.api.abi.call({
        abi: MasterMagpieAbi.tokenToPoolInfo,
        target: MasterMagpieAddress,
        chain: 'bsc',
        params: poolToken,
      })
    ).output

    let poolType
    let depositToken

    if (poolToken == MWOMAddress) {
      poolType = "MAGPIE_WOM_POOL"
      depositToken = MWOMAddress
    } else if (poolToken == VlMGPAddress) {
      poolType = "MAGPIE_VLMGP_POOL"
      poolToken = MGPAddress
      depositToken = VlMGPAddress
    } else {
      poolType = "WOMBAT_POOL"
      depositToken = (
        await sdk.api.abi.call({
          abi: WombatPoolHelperAbi.depositToken,
          target: poolInfo.helper,
          chain: 'bsc',
        })
      ).output
    }

    poolList.push(
      {
        "type": poolType,
        "stakingToken": depositToken,
        "rawStakingToken": poolToken,
        "helper": poolInfo.helper,
      }
    )
  }

  return poolList
}

async function tvl(timestamp, block, chainBlocks) {
  const poolList = await getPoolList(chainBlocks);
  const balances = {};
  const poolLength = poolList.length;

  for (let i = 0, l = poolLength; i < l; i++) {
    const pool = poolList[i];
    console.log(i, pool.stakingToken, pool.type)
    const balTarget = (pool.type == "MAGPIE_VLMGP_POOL") ? VlMGPAddress : MasterMagpieAddress
    const collateralBalance = (await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      chain: 'bsc',
      target: pool.rawStakingToken,
      params: [balTarget],
      block: chainBlocks['bsc'],
    })).output
    if (pool.type == "MAGPIE_WOM_POOL") {
      sdk.util.sumSingleBalance(balances, `bsc:${WOMAddress}`, collateralBalance)
    } else if (pool.type == "MAGPIE_VLMGP_POOL") {
      console.log("MAGPIE_VLMGP_POOL")
      console.log(collateralBalance)
      console.log(pool)
      sdk.util.sumSingleBalance(balances, `bsc:${MGPAddress}`, collateralBalance)
    } else if (pool.rawStakingToken == MgpLpAxlUsdAddress) {
      const shiftedCollateralBalance = BigNumber(collateralBalance).shiftedBy(-1 * 12).toFixed(0)
      sdk.util.sumSingleBalance(balances, `bsc:${pool.stakingToken}`, shiftedCollateralBalance)
    } else {
      sdk.util.sumSingleBalance(balances, `bsc:${pool.stakingToken}`, collateralBalance)
    }
  }
  return transformBalances('bsc', balances);
}

module.exports = {
  methodology: 'counts the number of MINT tokens in the Club Bonding contract.',
  bsc: {
    tvl,
  }
}; 