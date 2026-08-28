const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { sumTokens } = require('../helper/sumTokens');
const { post } = require('../helper/http')

const agentVaults = [
  '0xe56f464c23760d563dd4c73dADA05159aE71FC50', // Au
  '0xA69bF2eC0eF91A29B5da634BD4958AA32BaD9fe3', // Bifrost
  '0x7CeC6EC27F3A0f0a37B1847E5Af3E99A7499A0bC', // Atlas
  '0x0F6AB40fE44aA3AB15B8ff96Df98C6F5865F048E', // NORTSO
  '0x8eA74D78A03F20597cEE115176f7f8b65271c87A', // OD
  '0x09011d2A11A40DB855Cb00B3AA5a0F5F3bd485FD', // WK
]

const agentPools = [
  '0xf45c1a5Ef4fB09F1c33f772175b2fec229D1885B', // Au
  '0x3A06584A47972fF7005301b5A44c7D2214A4d3b4', // Bifrost
  '0x0e647177Df92A75e16D4043EE4bbA9CcCae874A6', // Atlas
  '0xd6af7ef36732A5A71121363bE380AB6C8e9F72e0', // NORTSO
  '0x71eE56f6B793386cECf536CD566ff50FE558f70E', // OD
  '0xa7F4335e5233C50e1022c2607dfE83c3d73d516B', // WK
]

const coreVault = "rfkXSaCZKTg1EZzec2rLDyrWHxRVJdtVXj"
const escrowAccount = "rMLNvZR9dascY5jtCfCv3whAp8HdUSZAQ"

async function XRPLLocked(api) {
  const baseTokens = await sumTokens({ api, owner: coreVault, chain: 'ripple' })

  // escrows
  const response = await post('https://s1.ripple.com:51234', 
    { "method": "account_objects", "params": [{
        "account": coreVault,
        "ledger_index": "validated",
        "type": "escrow"
      }]
    }
  )
  if (response.result.error === 'actNotFound') return baseTokens;
  const escrowed = response.result.account_objects.filter(
    (obj) => obj.LedgerEntryType === 'Escrow' && obj.Destination === escrowAccount
  ).reduce((acc, escrow) => acc + (+escrow.Amount / 1e6), 0)

  return {
    "ripple": baseTokens.ripple + escrowed,
  }
}

async function flareTvl(api) {
  return sumTokens2({
    api,
    tokensAndOwners: [
      ...agentVaults.map(v => [ADDRESSES.monad.USDT, v]), // USDT0 in agent vaults
      ...agentPools.map(p => [ADDRESSES.flare.WFLR, p]), // WFLR in agent pools
    ],
  })
}

module.exports = {
  methodology: "Value of USDT0 and WFLR held in Agent's vaults and pools together with XRP tokens locked on XRPL either in core vault or in the escrows.",
  flare: { tvl: flareTvl },
  ripple: { tvl: XRPLLocked },
}
