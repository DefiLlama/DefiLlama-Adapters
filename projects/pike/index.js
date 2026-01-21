const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const PTOKENS = {
  pweETH: '0xAeBCc0Ed30A8478D1A0d4b9773edB30f0211f713',
  pwstETH: '0x8a7944fD5a61698762D7daa0898b5EafCf4936Dc',
  pwETH: '0xa1Aba5518ffC0aA26F3812aC4777081CceFfAFe6',
  pwSPA: '0x6996145AdDddb2ef51119D71f29C61513d30e8B3',
}

async function tvl(api) {
  const tokensAndOwners = [
    [ADDRESSES.base.weETH, PTOKENS.pweETH],
    [ADDRESSES.base.wstETH, PTOKENS.pwstETH],
    [ADDRESSES.base.WETH, PTOKENS.pwETH],
  ]
  await sumTokens2({ api, tokensAndOwners })

  const cashSPA = await api.call({ target: PTOKENS.pwSPA, abi: 'function getCash() view returns (uint256)', params: [] })
  await addTapioSpaLiquidity(api, cashSPA)

  return api.getBalances()
}

async function borrowed(api) {
  const [bWeETH, bWstETH, bWETH, bSPA] = await Promise.all([
    api.call({ target: PTOKENS.pweETH, abi: 'function totalBorrows() view returns (uint256)', params: [] }),
    api.call({ target: PTOKENS.pwstETH, abi: 'function totalBorrows() view returns (uint256)', params: [] }),
    api.call({ target: PTOKENS.pwETH, abi: 'function totalBorrows() view returns (uint256)', params: [] }),
    api.call({ target: PTOKENS.pwSPA, abi: 'function totalBorrows() view returns (uint256)', params: [] }),
  ])

  api.add(ADDRESSES.base.weETH, bWeETH)
  api.add(ADDRESSES.base.wstETH, bWstETH)
  api.add(ADDRESSES.base.WETH, bWETH)

  await addTapioSpaLiquidity(api, bSPA)

  return api.getBalances()
}

async function addTapioSpaLiquidity(api, amount) {
  const SPA = '0xf051deB326EB473eECB221B6D9D16230056089C9'
  const TAPIO_POOL = '0xEE9B4FF3Fa54c7185b7769036938Ad26A6fd0B14'

  const amountBI = BigInt(amount)
  if (amountBI === 0n) return;

  const [tokens, spaAmount, spaTotalSupply] = await Promise.all([
    api.call({ target: TAPIO_POOL, abi: 'function getTokens() view returns (address[])', params: [] }),
    api.call({ target: SPA, abi: 'function getPeggedTokenByShares(uint256) view returns (uint256)', params: [amountBI] }),
    api.call({ target: SPA, abi: 'erc20:totalSupply', params: [] }),
  ])

  const [poolBalance0, poolBalance1] = await Promise.all([
    api.call({ target: TAPIO_POOL, abi: 'function balances(uint256) view returns (uint256)', params: [0] }),
    api.call({ target: TAPIO_POOL, abi: 'function balances(uint256) view returns (uint256)', params: [1] })
  ])

  if (BigInt(spaTotalSupply) === 0n) return;

  const share = BigInt(spaAmount) * BigInt(1e18) / BigInt(spaTotalSupply)

  if (tokens.length >= 2) {
    try {
      api.add(tokens[0], BigInt(poolBalance0) * share / BigInt(1e18)) // tokens[0] = ADDRESSES.base.weETH
      api.add(tokens[1], BigInt(poolBalance1) * share / BigInt(1e18)) // tokens[1] = ADDRESSES.base.wstETH
    } catch {
      return;
    }
  }
}

module.exports = {
  methodology: 'Counts tokens locked in Pike as collateral to borrow (cash) or to earn yield. Borrowed amounts are not counted towards TVL, only tokens actually locked in Pike are counted, to avoid inflating TVL.',
  base: {
    tvl,
    borrowed
  }
}
