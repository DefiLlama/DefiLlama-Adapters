const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { sumTokens } = require('../helper/chain/bitcoin.js')
const bitcoin = require('bitcoinjs-lib')
const { BIP32Factory } = require('bip32')
const ecc = require('tiny-secp256k1')
const { get } = require('../helper/http')

const BITS_VAULTS_ETHEREUM = [
  '0x034bC680082923e40E3Ef4f9e1ac7d5152FA041E', // WBTC vault on Ethereum
]

const BITS_VAULTS_COREDAO = [
  '0x034bC680082923e40E3Ef4f9e1ac7d5152FA041E', // COREBTC vault on CoreDAO
]

const BITS_VAULTS_BASE = [
  '0x59b2af1720C284D3380295D24250CDA3b41B4C89', // BASEBTC vault on Base
]

// Bitcoin multisig descriptor
// wsh(sortedmulti(4,[fingerprint/path]xpub...))
const MULTISIG_DESCRIPTOR = {
  threshold: 4, // 4-of-8 multisig
  xpubs: [
    {
      fingerprint: '0f3f1ef3',
      path: "m/48'/0'/0'/2'",
      xpub: 'xpub6E1E46UbWtGGAY4skNDXBaGiAqN4akKzxJkKePa3yngpn9smjGe47gmHzEPr7VrM83H2TdYKQQpGxspcQpNX1wT3gx34oqueyGBgqJhUq7A'
    },
    {
      fingerprint: 'f0eaba49',
      path: "m/48'/0'/0'/2'",
      xpub: 'xpub6FKZhJxpFmepm47cASngjy27SJAMHJdTVQC2rbMF6KzzWrRt3UepW6pG5wnj9kUwpejpqsQZ23EwTWwQq78uZRJdFU49Kz9ueKUQbjQ1Udg'
    },
    {
      fingerprint: '078926c9',
      path: "m/48'/0'/0'/2'",
      xpub: 'xpub6Edb3TQF6vKEAMS5ZND2yAYgtkGCdWDwDeywH749xFJNSLSgFZSjJD8HHvtoQDdSGKmWnu5YGEYuHArZcoTk7rB9EZFMMZqofk9YXknTXPN'
    },
    {
      fingerprint: 'c30a9127',
      path: "m/48'/0'/0'/2'",
      xpub: 'xpub6EGsPjbxjBb7tWsRa1sW4wzXcWNb3YZ5NKe4yXmZfNNFEXQeuEbA65q1s1BnMf2XA7vmtfuYH3hafyHc3VFadAwrxCjgvsTZLzgMMkDny2F'
    },
    {
      fingerprint: 'c73818a2',
      path: "m/48'/0'/0'/2'",
      xpub: 'xpub6ErJbhAMFRhsknimNvkhGcnN7vidGnDxhDuETRrqp3rWRHh3LTUebCfZwKusyyucWd7n6GRWtdzvih5y8xdBv3ThMZ56SAs4gWa3rJ6eV5m'
    },
    {
      fingerprint: '99907957',
      path: "m/48'/0'/0'/2'",
      xpub: 'xpub6E5rfSeHnZKrLF6a4AuLFHj1SXm8MnTXcn43ueFPg1HXMQ1MgzotvwiURw1fnL8satbJqweUo3sE8KRq863DG5hBi8uz3fE9b5pSC8peqqD'
    },
    {
      fingerprint: '6989c7ca',
      path: "m/48'/0'/0'/2'",
      xpub: 'xpub6EAbpvoaoY9UHF8EmuZAsYjfKcqAg9PbpNitTsBQXe5X4W9vXsz4KrxT6JKn4fsNfigugsVFxcA7W9VDmNpAXmAyi8c5tAyNgYgVCQ1LWu3'
    }
  ]
}

const bip32 = BIP32Factory(ecc)

// Token addresses
const WBTC = ADDRESSES.ethereum.WBTC
const COREBTC = "0x5832f53d147b3d6Cd4578B9CBD62425C7ea9d0Bd"
const BASEBTC = ADDRESSES.base.cbBTC

async function tvl(api) {
  // Get WBTC balances for all Ethereum vaults using multicall
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: BITS_VAULTS_ETHEREUM.map(vault => ({
      target: WBTC,
      params: [vault]
    }))
  })
  // Add all Ethereum balances to the API
  api.add(WBTC, balances)
}

async function tvlCore(api) {
  // Get COREBTC balances for all CoreDAO vaults using multicall
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: BITS_VAULTS_COREDAO.map(vault => ({
      target: COREBTC,
      params: [vault]
    }))
  })
  
  // Add all CoreDAO balances to the API
  api.add(COREBTC, balances)
}

async function tvlBase(api) {
  // Get BASEBTC balances for all Base vaults using multicall
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: BITS_VAULTS_BASE.map(vault => ({
      target: BASEBTC,
      params: [vault]
    }))
  })
  
  // Add all Base balances to the API
  api.add(BASEBTC, balances)
}

// Derive a multisig address from xpubs for a specific index (receive/change, address_index)
function deriveMultisigAddress(receive, addressIndex) {
  const pubkeys = []
  
  // Derive public keys from each xpub
  for (const xpubData of MULTISIG_DESCRIPTOR.xpubs) {
    const node = bip32.fromBase58(xpubData.xpub)
    // Derive child key: m/receive/addressIndex
    const child = node.derive(receive).derive(addressIndex)
    pubkeys.push(child.publicKey)
  }
  
  // Sort pubkeys for sortedmulti
  pubkeys.sort(Buffer.compare)
  
  // Create P2WSH multisig address
  const p2ms = bitcoin.payments.p2ms({
    m: MULTISIG_DESCRIPTOR.threshold,
    pubkeys: pubkeys,
    network: bitcoin.networks.bitcoin
  })
  
  const p2wsh = bitcoin.payments.p2wsh({
    redeem: p2ms,
    network: bitcoin.networks.bitcoin
  })
  
  return p2wsh.address
}

// Check if an address has a balance using blockstream API
async function hasBalance(address) {
  try {
    const url = `https://blockstream.info/api/address/${address}`
    const data = await get(url)
    const balance = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum
    const hasBalance = balance > 0
    console.log(`Address: ${address} | Balance: ${balance} satoshis (${(balance / 1e8).toFixed(8)} BTC) | Has Balance: ${hasBalance}`)
    return hasBalance
  } catch (e) {
    console.error(`Error checking balance for ${address}:`, e.message)
    return false
  }
}

// Get all active Bitcoin addresses from the multisig descriptor
async function getActiveMultisigAddresses() {
  const addresses = []
  
  console.log('🔍 Starting Bitcoin multisig address discovery...')
  console.log(`📋 Multisig config: ${MULTISIG_DESCRIPTOR.threshold}-of-${MULTISIG_DESCRIPTOR.xpubs.length}`)
  
  // Check both receive (0) and change (1) paths
  for (const receive of [0, 1]) {
    const pathType = receive === 0 ? 'RECEIVE' : 'CHANGE'
    console.log(`\n📍 Checking ${pathType} path (m/${receive}/n)...`)
    
    let consecutiveEmpty = 0
    let addressIndex = 0
    let totalChecked = 0
    
    while (consecutiveEmpty < 20) {
      const address = deriveMultisigAddress(receive, addressIndex)
      console.log(`\n🔍 Checking ${pathType} address index ${addressIndex}:`)
      
      const hasbal = await hasBalance(address)
      totalChecked++
      
      if (hasbal) {
        console.log(`✅ Found active address! Adding to tracking list.`)
        addresses.push(address)
        consecutiveEmpty = 0
      } else {
        consecutiveEmpty++
        console.log(`❌ Empty address (${consecutiveEmpty}/20 consecutive empty)`)
      }
      
      addressIndex++
      
      // Safety limit to prevent infinite loops
      if (addressIndex > 10000) {
        console.warn(`⚠️  Safety limit reached for ${pathType} path`)
        break
      }
    }
    
    console.log(`\n📊 ${pathType} path summary:`)
    console.log(`   - Total addresses checked: ${totalChecked}`)
    console.log(`   - Active addresses found: ${addresses.filter(addr => addresses.indexOf(addr) >= addresses.length - totalChecked).length}`)
    console.log(`   - Stopped after ${consecutiveEmpty} consecutive empty addresses`)
  }
  
  console.log(`\n🎯 Final summary:`)
  console.log(`   - Total active addresses: ${addresses.length}`)
  console.log(`   - Addresses to track: ${addresses.join(', ')}`)
  
  return addresses
}

async function tvlBitcoin() {
  console.log('\n🚀 Starting Bitcoin TVL calculation...')
  
  // Get all active addresses from the multisig descriptor
  const addresses = await getActiveMultisigAddresses()
  
  if (addresses.length === 0) {
    console.log('📭 No active Bitcoin addresses found. Returning zero balance.')
    return {}
  }
  
  console.log(`\n💰 Calculating TVL for ${addresses.length} active addresses...`)
  
  // Get Bitcoin balances for all active addresses
  const result = await sumTokens({ owners: addresses })
  
  console.log(`\n✅ Bitcoin TVL calculation complete:`, result)
  
  return result
}

module.exports = {
  methodology: 'Counts the total value of WBTC assets locked in Bits yield product contracts on Ethereum network, COREBTC assets on CoreDAO network, BASEBTC assets on Base network, and Bitcoin assets in multisig addresses.',
  start: 1749621314,
  ethereum: {
    tvl,
  },
  core: {
    tvl: tvlCore,
  },
  base: {
    tvl: tvlBase,
  },
  bitcoin: {
    tvl: tvlBitcoin,
  }
} 