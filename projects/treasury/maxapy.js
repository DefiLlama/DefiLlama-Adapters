const TREASURY = {
  ethereum: "0x5000Ba796Fd84a0f929AF80Cfe27301f0358F268",
  polygon: "0x91044419869d0921D682a50B41156503A4E484F6",
  base: "0x5000Ba796Fd84a0f929AF80Cfe27301f0358F268",
}

const VAULTS = {
  ethereum: {
    maxETH: "0x9847c14FCa377305c8e2D10A760349c667c367d4",
  },
  polygon: {
    maxETH: "0xA02aA8774E8C95F5105E33c2f73bdC87ea45BD29",
    maxUSD: "0xE7FE898A1EC421f991B807288851241F91c7e376",
  },
  base: {
    maxETH: "0x7a63e8fc1d0a5e9be52f05817e8c49d9e2d6efae",
    maxUSD: "0xb272e80042634bca5d3466446b0c48ba278a8ae5",
  },
}

const tvl = async (api) => {
  const vaults = Object.values(VAULTS[api.chain])
  return api.sumTokens({ owner: TREASURY[api.chain], tokens: vaults })
}

module.exports = {
  methodology: "Counts assets held by treasury in ERC4626 vault tokens",
  start: 1729675931,
  ethereum: { tvl },
  polygon: { tvl },
  base: { tvl },
}
