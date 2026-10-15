const { sumTokens2 } = require('../helper/unwrapLPs')

// QuantumPools vaults hold concentrated-liquidity NFTs. One vault = one NonfungiblePositionManager.
// The same address can be a different vault on another chain (CREATE nonce reuse), so key per chain.
const UNI = 'uni', PCS = 'pcs', AERO = 'aero'
const PCS_NPM = '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364'
const UNI_NPM = {
  robinhood: '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3',
  base: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1',
  bsc: '0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613',
  arbitrum: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  ethereum: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
}
const AERO_NPM = { base: '0x827922686190790b37229fd06084350E74485b72' }

const config = {
  robinhood: [
    ['0x5433f385F538Fa11b8A25B82230a306d25dF8EB3', UNI], // V2 Uniswap
    ['0xd3AAb853758c81c09C4510D1b05b9152F71B30F5', UNI], // V2.1 Uniswap
    ['0xeBdfa133432bC0321ed1073Fe776F4701956E0e7', PCS], // V2.1 PancakeSwap
  ],
  base: [
    ['0x9597f68203d1bc85744A5Fc11D890aA7777e386B', UNI], // V2 Uniswap
    ['0x0e8A7c9Fd76e718202B3c3530f3B587ba52FB1A8', UNI], // V2.1 Uniswap
  ],
  bsc: [
    ['0x9597f68203d1bc85744A5Fc11D890aA7777e386B', PCS], // V2.1 PancakeSwap
    ['0x57cB3160D59e967D3ac62620Fc69f7e0898d2690', UNI], // V2.1 Uniswap
  ],
  arbitrum: [
    ['0x1b884346B79185c862Fc573b68bfDC1f4590102C', UNI], // V2.1 Uniswap
    ['0x3a0aeB338159c160Df34Faf2E42b050361660871', PCS], // V2.1 PancakeSwap
  ],
  ethereum: [
    ['0x77B24e193D9c7dA62660CDBe83B16f695fAA4d42', UNI], // V2.1 Uniswap
  ],
}

module.exports = {
  methodology: 'TVL is the value of every Uniswap V3 and PancakeSwap V3 concentrated-liquidity position held by the QuantumPools V2/V2.1 vaults, unwrapped to underlying token amounts at the current pool tick. All live vaults are owned by 48h TimelockControllers (Robinhood 0x41D34F171bBE138F8eA297f95e5B6B6F298a27AC; Base/BNB/Arbitrum 0xE0db1d799dB2FF5aC539B95C3299c8AF060B4088) controlled by Safe 0x00B3DCd95dDb5D1454dcbbfA6805e17f82244Ac1 (2-of-3 on Robinhood, 2-of-2 elsewhere).',
  doublecounted: true,
  start: '2026-09-28',
}

Object.entries(config).forEach(([chain, vaults]) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const v3 = vaults.filter(([, t]) => t !== AERO).map(([v, t]) => [t === PCS ? PCS_NPM : UNI_NPM[chain], v])
      const aero = vaults.filter(([, t]) => t === AERO).map(([v]) => [AERO_NPM[chain], v])
      if (v3.length) await sumTokens2({ api, uniV3nftsAndOwners: v3 })
      if (aero.length) await sumTokens2({ api, resolveSlipstream: true, uniV3nftsAndOwners: aero })
      return api.getBalances()
    },
  }
})
