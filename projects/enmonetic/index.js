const { sumERC4626VaultsExport2 } = require('../helper/erc4626')

module.exports = {
  doublecounted: true,
  methodology: 'TVL is the total assets held by the vaults.',
  start: '2026-09-14', // USDC vault deploy
  ethereum: {
    tvl: sumERC4626VaultsExport2({
      vaults: [
        '0x585b8e4160607339ff425baf75b22506c1779fc2', // USDC vault (fUSDC)
        '0x91134a0450628846b3853e93444a7cd20a02f4ba', // USDT vault (fUSDT)
      ],
    }),
  },
}