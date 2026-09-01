const { sumTokensExport } = require('../helper/unwrapLPs')

// ---- BSC (56) — 18-dec stables ----
const BSC_USDC = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
const BSC_USDT = '0x55d398326f99059fF775485246999027B3197955'
const BSC_OWNERS = [
  '0x6A52ba4C84b348FaEAe13dDC7A97b4F6af23913C', '0xCE02f987D8b8AF694E13C8a843Db9c77caBF544c', // escrow
  '0x0Bd066f5113e6B8336b06F8Aa3EF90D37F7e65FC', '0x1DcafFB7275fa2650d480a4F939A0C0D5874750B', // staking
  '0x5BaE7834B32a4b357F65dd20248068993466D294', '0x16261F2BCbE8Ee47065C5ecB4be32c1571289809', // campaign vault
]

// ---- Base (8453) — 6-dec stables ----
const BASE_USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
const BASE_USDT = '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'
const BASE_OWNERS = [
  '0xc3d963E0856A2c2d6F75C83C1355f680fd8F9f10', '0xFf3f7038c4919A420B30D7B3533cb386D5898189', // escrow
  '0x8320448539DcafdE9C26B4F538504BB180DE55B3', '0xeEf5672208EcE3Ba6B32f1FEC3c3802A6D2DBA8a', // staking
  '0x97d14D248d956148a34E4fe636CDdBa8BB80E551', '0x911d5c2a20dDA9bE9daE53fE3AD9183e5b583D7f', // campaign vault
]

module.exports = {
  methodology:
    'TVL is USDC and USDT held across the escrow (funded jobs not yet settled), staking (provider stakes) and campaign-vault contracts on BSC and Base.',
  start: '2026-07-02',
  bsc:  { tvl: sumTokensExport({ owners: BSC_OWNERS,  tokens: [BSC_USDC, BSC_USDT] }) },
  base: { tvl: sumTokensExport({ owners: BASE_OWNERS, tokens: [BASE_USDC, BASE_USDT] }) },
}
