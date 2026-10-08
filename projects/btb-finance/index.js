const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2, unwrapSlipstreamNFT, unwrapUniswapV3NFT } = require('../helper/unwrapLPs')

// BTB Finance auto-rebalance. Every user gets their own smart wallet (BTB Smart Account V6), created by a BTB
// factory; the BTB agent keeps the positions inside it in range. Nothing is pooled: TVL is the sum of what those
// wallets hold, read on chain.
//
// Wallets come from the factories' AccountCreated events. A wallet's positions are the LP NFTs it holds plus those
// staked for it. Held NFTs are enumerated from each position manager. On Base (log indexer) the gauges a wallet
// staked into are the Aerodrome gauges it sent NFTs to, and each returns the wallet's staked ids; on Robinhood Chain
// they are read directly: the Giga farm lists each staker's NFTs, and every UP gauge (listed by the UP voter)
// returns each wallet's staked ids. Loose tokens in the wallets count too.

const TRANSFER = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
const transferAbi = 'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
const createdAbiV1 = 'event AccountCreated(address indexed owner, address indexed account)'
const createdAbi = 'event AccountCreated(address indexed owner, address indexed account, address implementation)'

const config = {
  base: {
    factories: [
      { address: '0xE10280d01F95bC88DA149a224e68debc0721f8E6', fromBlock: 51697142, eventAbi: createdAbiV1 },
      { address: '0xc922eb8dCF5D61CEeFaeCe86265F5f0D6dC0EC77', fromBlock: 51803585, eventAbi: createdAbi },
    ],
    uniV3: ['0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1'], // Uniswap V3
    slipstream: [
      '0x827922686190790b37229fd06084350e74485b72', // Aerodrome Slipstream
      '0xa990C6a764b73BF43cee5Bb40339c3322FB9D55F', // Aerodrome Slipstream (gauge caps)
      '0xe1f8cd9AC4e4A65F54f38a5CdAfCA44f6dD68b53', // Aerodrome Slipstream (newest)
    ],
    algebra: [],
    farms: [],
    gaugeVoter: '0x16613524e02ad97eDfeF371bC883F2F5d6C480A5', // Aerodrome voter, for gauges found from logs
    tokens: [
      '0x4200000000000000000000000000000000000006', // WETH
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
      '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', // cbBTC
      '0x940181a94A35A4569E4529A3CDfB74e38FD98631', // AERO
    ],
  },
  robinhood: {
    factories: [
      { address: '0xE10280d01F95bC88DA149a224e68debc0721f8E6', fromBlock: 71000867, eventAbi: createdAbiV1 },
      { address: '0xc922eb8dCF5D61CEeFaeCe86265F5f0D6dC0EC77', fromBlock: 72794809, eventAbi: createdAbi },
    ],
    uniV3: [
      '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3', // Uniswap V3
      '0xA79F5775b0B49E51202c48DDF03F380FaA96f641', // Giga V3
    ],
    slipstream: ['0x07F44c47743A2f36414A82b9F558ECFCf0EEdCEf'], // UP
    algebra: ['0xe62a5F67516dBDBA2Aa28b1512C8Ff44E42cB5c3'], // Alandale (Algebra Integral)
    farms: [{ chef: '0x60380925A8b1007F70f60A6A42bffE391374B09a', nft: '0xA79F5775b0B49E51202c48DDF03F380FaA96f641' }], // Giga farm
    voters: [{ voter: '0x7F749fDD351C1Ceed82d76d7699CB631Eb8332a7', nft: '0x07F44c47743A2f36414A82b9F558ECFCf0EEdCEf' }], // UP gauges
    tokens: [
      '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73', // WETH
      '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168', // USDG
      '0x5BaaeC1B70864f01dbdb747358FF59F2E2cCF7D5', // GIGA
      '0x57C0E45cB534413D1C20A4240955d6bB250BB4F1', // UP
      '0xD1e861CC5Eee7eA88649206b74504D78CCD7AEeA', // LUTE
      '0x39dbed3a2bd333467115de45665cc57f813c4571', // PONS
    ],
  },
}

// A few blocks behind the head, so a lagging RPC in the pool never sees a range past its own latest block.
async function safeToBlock(api) {
  return (await api.getBlock()) - 20
}

async function wallets(api, { factories }, toBlock) {
  const lists = await Promise.all(factories.map(({ address, fromBlock, eventAbi }) =>
    getLogs({ api, target: address, eventAbi, fromBlock, toBlock, onlyArgs: true })))
  return [...new Set(lists.flat().map(l => l.account.toLowerCase()))]
}

// Base: a wallet only lets an NFT leave to its owner or to a farm that stakes it, so the gauges it staked into are
// the voter's gauges among the contracts it sent NFTs to. Each of those gauges returns the wallet's staked ids.
async function stakedFromLogs(api, nft, voter, owners, fromBlock, toBlock) {
  // One query per wallet: the indexer filters on a single sender topic, not on a list of them.
  const logs = []
  for (const owner of owners) {
    logs.push(...await getLogs({
      api, target: nft, eventAbi: transferAbi, onlyArgs: true, fromBlock, toBlock,
      topics: [TRANSFER, '0x' + owner.slice(2).toLowerCase().padStart(64, '0')],
      extraKey: `btb-sent-${owner.toLowerCase()}`,
    }))
  }
  // Keep only transfers sent by a BTB wallet, in case a log source ignores the sender topic. Without this every
  // staker in the same gauges was counted (Base read $32M instead of about $600).
  const ownerSet = new Set(owners.map(o => o.toLowerCase()))
  const pairs = [...new Set(logs
    .filter(l => ownerSet.has(l.from.toLowerCase()))
    .map(l => `${l.from.toLowerCase()}:${l.to.toLowerCase()}`))].map(p => p.split(':'))
  const recipients = [...new Set(pairs.map(([, to]) => to))]
  if (!recipients.length) return []
  const isGauge = await api.multiCall({ abi: 'function isGauge(address) view returns (bool)', target: voter, calls: recipients })
  const gauges = new Set(recipients.filter((_, i) => isGauge[i]))
  const calls = pairs.filter(([, to]) => gauges.has(to)).map(([owner, target]) => ({ target, params: [owner] }))
  const staked = await api.multiCall({ abi: 'function stakedValues(address) view returns (uint256[])', calls })
  return staked.flat().map(String)
}

// NFT ids an ERC721-enumerable contract lists for each owner (a position manager, or a farm that tracks stakers).
async function enumerated(api, target, owners) {
  const counts = await api.multiCall({ abi: 'erc20:balanceOf', target, calls: owners })
  const calls = []
  owners.forEach((owner, i) => { for (let j = 0; j < Number(counts[i]); j++) calls.push({ params: [owner, j] }) })
  return api.multiCall({ abi: 'function tokenOfOwnerByIndex(address, uint256) view returns (uint256)', target, calls })
}

// Positions staked for the wallets in any gauge a Solidly-style voter lists.
async function stakedInGauges(api, voter, owners) {
  const pools = await api.fetchList({ lengthAbi: 'uint256:length', itemAbi: 'function pools(uint256) view returns (address)', target: voter })
  const gauges = (await api.multiCall({ abi: 'function gauges(address) view returns (address)', target: voter, calls: pools }))
    .filter(g => g && g !== '0x0000000000000000000000000000000000000000')
  const calls = gauges.flatMap(target => owners.map(owner => ({ target, params: [owner] })))
  const staked = await api.multiCall({ abi: 'function stakedValues(address) view returns (uint256[])', calls, permitFailure: true })
  return staked.flat().filter(id => id != null).map(String)
}

async function tvl(api) {
  const cfg = config[api.chain]
  const toBlock = await safeToBlock(api)
  const owners = await wallets(api, cfg, toBlock)
  if (!owners.length) return {}
  const fromBlock = Math.min(...cfg.factories.map(f => f.fromBlock))

  const idsFor = async (nft, { gauges = false } = {}) => {
    const ids = (await enumerated(api, nft, owners)).map(String)
    if (gauges && cfg.gaugeVoter) ids.push(...await stakedFromLogs(api, nft, cfg.gaugeVoter, owners, fromBlock, toBlock))
    const farm = cfg.farms.find(f => f.nft.toLowerCase() === nft.toLowerCase())
    if (farm) ids.push(...(await enumerated(api, farm.chef, owners)).map(String))
    const voter = cfg.voters?.find(v => v.nft.toLowerCase() === nft.toLowerCase())
    if (voter) ids.push(...await stakedInGauges(api, voter.voter, owners))
    return [...new Set(ids)]
  }

  for (const nft of cfg.uniV3) {
    const positionIds = await idsFor(nft)
    if (positionIds.length) await unwrapUniswapV3NFT({ api, nftAddress: nft, uniV3ExtraConfig: { positionIds } })
  }
  for (const nft of cfg.algebra) {
    const positionIds = await idsFor(nft)
    if (positionIds.length) await unwrapUniswapV3NFT({ api, nftAddress: nft, uniV3ExtraConfig: { positionIds }, isAlgebra: true })
  }
  for (const nft of cfg.slipstream) {
    const positionIds = await idsFor(nft, { gauges: true })
    if (positionIds.length) await unwrapSlipstreamNFT({ api, nftAddress: nft, positionIds })
  }
  return sumTokens2({ api, owners, tokens: cfg.tokens })
}

module.exports = {
  doublecounted: true,
  methodology: 'Sums the concentrated liquidity positions (held or staked in a gauge or farm) and tokens held by every BTB Finance auto-rebalance smart wallet. Wallets are found from the BTB factories\' AccountCreated events; each user owns their own wallet and nothing is pooled.',
  start: '2026-09-23',
}

Object.keys(config).forEach(chain => { module.exports[chain] = { tvl } })
