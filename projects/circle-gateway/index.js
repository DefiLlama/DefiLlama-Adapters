const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const GATEWAY_WALLET = '0x77777777Dcc4d5A8B6E418Fd04D8997ef11000eE'
const XRESERVE = '0x8888888199b2Df864bf678259607d6D5EBb4e3Ce'
const DOMAINS = Array.from({ length: 30 }, (_, i) => 10001 + i)

async function ethereumTvl(api) {
  const [walletBalance, collateral] = await Promise.all([
    api.call({ abi: 'erc20:balanceOf', target: ADDRESSES.ethereum.USDC, params: [GATEWAY_WALLET] }),
    api.multiCall({
      calls: DOMAINS.map((domain) => ({ target: XRESERVE, params: [ADDRESSES.ethereum.USDC, domain] })),
      abi: 'function balanceOfNativeCollateral(address token, uint32 domain) view returns (uint256)',
      permitFailure: true,
    }),
  ])
  // the gateway wallet also custodies the USDC backing USDCx, which is tracked
  // under circle-xreserve - only count the remainder here
  const xReserveCollateral = collateral.reduce((sum, balance) => sum + (balance ? BigInt(balance) : 0n), 0n)
  const net = BigInt(walletBalance) - xReserveCollateral
  if (net > 0n) api.add(ADDRESSES.ethereum.USDC, net.toString())
}

module.exports = {
  methodology:
    'USDC held by the Circle Gateway wallet, minus the USDCx collateral portion tracked under USDCx (circle-xreserve) to avoid double counting the same custody wallet.',
  ethereum: { tvl: ethereumTvl },
  base: { tvl: sumTokensExport({ owner: GATEWAY_WALLET, tokens: [ADDRESSES.base.USDC] }) },
  avax: { tvl: sumTokensExport({ owner: GATEWAY_WALLET, tokens: [ADDRESSES.avax.USDC] }) },
}
