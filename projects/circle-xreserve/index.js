const ADDRESSES = require('../helper/coreAssets.json')

const XRESERVE = '0x8888888199b2Df864bf678259607d6D5EBb4e3Ce'

// USDCx destination domains live on the reserve today are 10001-10005, probe a
// wider range so newly added domains get picked up without a code change
const DOMAINS = Array.from({ length: 30 }, (_, i) => 10001 + i)

async function tvl(api) {
  const balances = await api.multiCall({
    calls: DOMAINS.map((domain) => ({ target: XRESERVE, params: [ADDRESSES.ethereum.USDC, domain] })),
    abi: 'function balanceOfNativeCollateral(address token, uint32 domain) view returns (uint256)',
    permitFailure: true,
  })
  balances.forEach((balance) => {
    if (balance) api.add(ADDRESSES.ethereum.USDC, balance)
  })
}

module.exports = {
  methodology:
    'USDC collateral backing USDCx, read per destination domain from the xReserve contract via balanceOfNativeCollateral. The collateral is physically custodied in the shared Circle Gateway wallet, which Circle Gateway tracks net of this amount to avoid double counting.',
  ethereum: { tvl },
}
