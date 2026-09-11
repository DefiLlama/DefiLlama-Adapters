const SATO_HOOK = '0x0000f07d2B5F1Ddf3244b8780F972f306EFd2888'

async function tvl(api) {
  const curveReserveEth = await api.call({
    target: SATO_HOOK,
    abi: 'function curveReserveEth() view returns (uint256)',
  })

  api.addGasToken(curveReserveEth)
}

module.exports = {
  methodology:
    'Counts the ETH reserve returned by curveReserveEth() on the verified SatoHook contract. This excludes feesAccrued and does not include secondary-market liquidity.',
  start: 1777818827,
  ethereum: { tvl },
}
