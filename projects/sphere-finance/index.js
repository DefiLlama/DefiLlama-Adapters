const { unwrapBalancerPool } = require('../helper/unwrapLPs')
const sdk = require("@defillama/sdk");

const sphereToken = "0x62F594339830b90AE4C084aE7D223fFAFd9658A7"
const wmatic20sphere80 = "0xf3312968c7D768C19107731100Ece7d4780b47B2" //20WMATIC-80SPHERE LP

const GnosisMultisigTreasuries = ["0x20D61737f972EEcB0aF5f0a85ab358Cd083Dd56a", "0x1a2Ce410A034424B784D4b228f167A061B94CFf4", "0x826b8d2d523E7af40888754E3De64348C00B99f4"]
const LPTreasury = "0x1a2Ce410A034424B784D4b228f167A061B94CFf4"

const PEN = "0x9008D70A5282a936552593f410AbcBcE2F891A97"
const DYST = "0x39ab6574c289c3ae4d88500eec792ab5b947a5eb"
const penDYST = "0x5b0522391d0A5a37FD117fE4C43e8876FB4e91E6"
const MaticX = "0xfa68FB4628DFF1028CFEc22b4162FCcd0d45efb6"
const TETU = "0x255707B70BF90aa112006E1b07B9AeA6De021424"
const USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
const USDPlus = "0x236eeC6359fb44CCe8f97E99387aa7F8cd5cdE1f"
const WETH = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"

const spTetu = "0x305303DA35AdfBa0E58d7602b1D125879049d1be" //Sphere veTETU Staker
const TETU_PS = "0x225084D30cc297F3b177d9f93f5C3Ab8fb6a1454" //
const TETU_ST_QI = "0x4Cd44ced63d9a6FEF595f6AD3F7CED13fCEAc768" //tetuQi
const B_MaticX_Stable = "0x1e8a077d43A963504260281E73EfCA6292d48A2f" //Tetu Vault B-MaticX-Stable
const xbb_am_usd = "0xf2fB1979C4bed7E71E6ac829801E0A8a4eFa8513" //Tetu Vault bb-am-usd
const xB_stMATIC_Stable = "0xA8Fab27B7d41fF354f0034addC2d6a53b5E31356" //Tetu Vault B-stMATIC-Stable

const kyberSwapv2NFTPositionsManager = "0x2B1c7b41f6A8F2b2bc45C3233a5d5FB3cD6dC9A8" //KyberSwap v2 NFT Positions Manager ->> WE HAVE TO CHECK THIS ONE, IT HAS $1.2M+ IN IT <<-

/*==================================================
TO BE ADDED:
  TETU:
    DAI+USDC+USDT - ~$2.7M + ~$2.5M
    MATIC+MATICX - ~$200k
    MATIC+stMATIC - ~$3.9M
    QI - ~$43k
    TETU+USDC (Locked Pool) - ~$600k
==================================================*/

async function polygonTVL(timestamp, block, chainBlocks) {
  let balances = {};
  const bal = await unwrapBalancerPool({
    chain: 'polygon',
    block,
    balancerPool: wmatic20sphere80,
    owner: LPTreasury,
  })
  return sdk.util.sumSingleBalance(balances, "0xf3312968c7D768C19107731100Ece7d4780b47B2", bal)
)};

module.exports = {
  misrepresentedTokens: true,
  methodology: "",
  polygon: {
    tvl: polygonTVL,
  },
}