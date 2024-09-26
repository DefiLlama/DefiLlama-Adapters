const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  base: {
    WETH_USDC: {
      Size: '0xC2a429681CAd7C1ce36442fbf7A4a68B11eFF940',
      CollateralToken: ADDRESSES.base.WETH,
      BorrowToken: ADDRESSES.base.USDbC,
      BorrowAToken: '0x4e65fe4dba92790696d040ac24aa414708f5c0ab',
      DebtToken: '0xb0a00c4b3d77c896f46dc6b204695e22de7a185d'
    },
  }
}

async function getBorrowed(api, size, borrowToken) {
  const totalDebt = await api.call({ abi: 'erc20:totalSupply', target: size });
  return api.add(borrowToken, totalDebt)
}


Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport({ tokens: [config[chain].CollateralToken, config[chain].BorrowAToken], owner: config[chain].Size }),
    borrowed: (api) => getBorrowed(api, config[chain].BorrowToken)
  }
})
