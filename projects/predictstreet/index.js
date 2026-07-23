const { getLogs2 } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

const VAULT_FACTORY = '0xc16B8b190064451c2FeEb2e77c4B2aC4c7009552'
const CONDITIONAL_TOKENS = '0xD28B8295Cd57F205e4d080Ff4c6d23C06a9EEe3a' // locks collateral backing open positions
const NEG_RISK_ADAPTER = '0x29e58C3916d1fD235f3d1e7fCF640fd1fA8BDb1e'
const FROM_BLOCK = 32200            // VaultFactory deploy
const NEG_RISK_FROM_BLOCK = 32196   // NegRiskAdapter deploy

// One event per vault, used only to enumerate vaults — balances are read live
// (this RPC caps getLogs responses, so dense event scans are unreliable).
const VAULT_CREATED = 'event VaultCreated(uint64 seq, address indexed owner, address indexed vault)'
// Neg-risk markets wrap USDC.e into a per-market WrappedCollateral clone — the raw
// USDC.e sits in that clone, not in the adapter or ConditionalTokens.
const MARKET_PREPARED = 'event MarketPrepared(uint64 seq, bytes32 indexed marketId, uint8 questionCount)'

async function tvl(api) {
  const created = await getLogs2({ api, target: VAULT_FACTORY, eventAbi: VAULT_CREATED, fromBlock: FROM_BLOCK, extraKey: 'VaultCreated' })
  const vaults = [...new Set(created.map(l => l.vault))]

  const marketLogs = await getLogs2({ api, target: NEG_RISK_ADAPTER, eventAbi: MARKET_PREPARED, fromBlock: NEG_RISK_FROM_BLOCK, extraKey: 'MarketPrepared' })
  const wcols = await api.multiCall({ abi: 'function wcolOf(bytes32) view returns (address)', calls: marketLogs.map(l => ({ target: NEG_RISK_ADAPTER, params: [l.marketId] })) })
  const clones = wcols.filter(a => a && a !== ADDRESSES.null)

  const owners = [CONDITIONAL_TOKENS].concat(vaults, clones)
  // sum idle USDC.e in all vaults, ConditionalTokens, and neg-risk WrappedCollateral clones
  await api.sumTokens({ owners, tokens: ['0x9cb8142aEBBcdc60AF7c97Af897A67A8f3CA71C2'] }) // USDC.e
}

module.exports = {
  methodology:
    'TVL is the USDC.e (bridged USDC) collateral held by PredictStreet: the idle balance of every ' +
    'user vault (vaults enumerated via VaultCreated events), plus collateral locked in the ConditionalTokens ' +
    "contract, plus the backing each neg-risk market (held in that market's WrappedCollateral clone).",
  adi: { tvl },
}
