const { getAccount, getAccountsByCodeHash, cellHash, decodeFields } = require('../helper/chain/venom')

// api.web3.world is gone; pools are read from chain. Addresses come from the web3.world frontend config,
// storage layouts from the contract ABIs (web3.world bundle / broxus flatqube-contracts).
const DEX_ROOT = '0:8befb8324b036876ac5da268570031c10b0baa5c26bc7f69af17b2db20fc09b7'
const ST_VENOM_VAULT = '0:9df94dffc0ca1768647f819c04b2cf00c484b3b756ba6ecde68d5fb62de1dfc7'

const ST_VENOM = '0:74604c7a56419477d67329848d754d205f31870025a7135909e90e1726ad9a54'
// token roots (web3.world token manifest) -> coingecko id + decimals
const tokens = {
  '0:77d36848bb159fa485628bc38dc37eadb74befa514395e09910f601b841f749e': ['venom', 9], // wVENOM
  [ST_VENOM]: ['venom', 9], // stVENOM, scaled by the vault exchange rate
  '0:8a4ed4483500caf2d4bb4b56c84df41009cc3d0ed6a9de05d853e26a30faeced': ['tether', 6], // USDT
  '0:cda5e8d5953e1a09ffeb9f62316f2994019f10abe83c8f1b0aadfbc997bd79e6': ['usd-coin', 6], // USDC
  '0:0447c738d8549c5ea92f1c945628367db4adcc706685f760c93f8b236bf8e7e4': ['dai', 18], // DAI
  '0:4ff3c0f078889cbda817a5f5f2651824dea11a84f3857df27e76fee37d541877': ['wrapped-bitcoin', 8], // WBTC
  '0:60b3ebf994515df7985cb62a9d141467edf2f869272baf507dc83d9ba2e1b199': ['ethereum', 18], // WETH
  '0:0a75b9ad65982b02493491b00454b34dcecb9e63700d560fc001473659297661': ['binancecoin', 18], // BNB
  '0:3558fbc02e33cd62a5c2702f9405e272c41ede875956d2179074fe25bb4d1ce8': ['fantom', 18], // FTM
  '0:e04e68f58e85ea3ce3976356c4aefaa47c983bd9394bcf2a16c2252e7c27a39e': ['polygon-ecosystem-token', 18], // MATIC
  '0:10d6d5c11f7ce319842b9ceb8bc9ee4d64f317cd99f1f4ce17985e7ef50e2d2d': ['avalanche-2', 18], // AVAX
}

const ROOT_FIELDS = [{ name: '_pubkey', type: 'uint256' }, { name: '_timestamp', type: 'uint64' }, { name: '_constructorFlag', type: 'bool' }, { name: 'platform_code', type: 'cell' }, { name: '_nonce', type: 'uint32' }, { name: '_accountCode', type: 'cell' }, { name: '_accountVersion', type: 'uint32' }, { name: '_pairCodes', type: 'map(uint8,cell)' }, { name: '_pairVersions', type: 'map(uint8,uint32)' }, { name: '_poolCodes', type: 'map(uint8,cell)' }]

const PAIR_FIELDS = [{ name: '_pubkey', type: 'uint256' }, { name: '_timestamp', type: 'uint64' }, { name: '_constructorFlag', type: 'bool' }, { name: 'platform_code', type: 'cell' }, { components: [{ name: 'price0To1Cumulative', type: 'uint256' }, { name: 'price1To0Cumulative', type: 'uint256' }], name: '_points', type: 'map(uint32,tuple)' }, { name: '_length', type: 'uint16' }, { components: [{ name: 'minInterval', type: 'uint8' }, { name: 'minRateDeltaNumerator', type: 'uint128' }, { name: 'minRateDeltaDenominator', type: 'uint128' }, { name: 'cardinality', type: 'uint16' }], name: '_options', type: 'tuple' }, { name: '_root', type: 'address' }, { name: '_vault', type: 'address' }, { name: '_active', type: 'bool' }, { name: '_currentVersion', type: 'uint32' }, { components: [{ name: 'denominator', type: 'uint128' }, { name: 'pool_numerator', type: 'uint128' }, { name: 'beneficiary_numerator', type: 'uint128' }, { name: 'referrer_numerator', type: 'uint128' }, { name: 'beneficiary', type: 'address' }, { name: 'threshold', type: 'map(address,uint128)' }, { name: 'referrer_threshold', type: 'map(address,uint128)' }], name: '_fee', type: 'tuple' }, { name: '_typeToRootAddresses', type: 'map(uint8,address[])' }, { name: '_typeToWalletAddresses', type: 'map(uint8,address[])' }, { name: '_typeToReserves', type: 'map(uint8,uint128[])' }]

const POOL_FIELDS = [{ name: '_pubkey', type: 'uint256' }, { name: '_timestamp', type: 'uint64' }, { name: '_constructorFlag', type: 'bool' }, { name: 'platform_code', type: 'cell' }, { name: 'root', type: 'address' }, { name: 'vault', type: 'address' }, { name: 'active', type: 'bool' }, { name: 'current_version', type: 'uint32' }, { name: 'tokenData', type: 'tuple[]', components: [{ name: 'root', type: 'address' }, { name: 'wallet', type: 'address' }, { name: 'balance', type: 'uint128' }, { name: 'decimals', type: 'uint8' }, { name: 'accumulatedFee', type: 'uint128' }, { name: 'rate', type: 'uint256' }, { name: 'precisionMul', type: 'uint256' }, { name: 'decimalsLoaded', type: 'bool' }, { name: 'initialized', type: 'bool' }] }]

const VAULT_FIELDS = [{ name: '_pubkey', type: 'uint256' }, { name: '_timestamp', type: 'uint64' }, { name: '_constructorFlag', type: 'bool' }, { name: 'nonce', type: 'uint128' }, { name: 'governance', type: 'uint256' }, { name: 'platformCode', type: 'cell' }, { name: 'accountCode', type: 'cell' }, { name: 'clusterCode', type: 'cell' }, { name: 'stEverSupply', type: 'uint128' }, { name: 'totalAssets', type: 'uint128' }]

const PAIR_TYPE_TOKENS = 1n // _typeToRootAddresses / _typeToReserves key for the two pool tokens

async function tvl(api) {
  const vault = decodeFields((await getAccount(ST_VENOM_VAULT)).data, VAULT_FIELDS)
  const stVenomRate = Number(vault.totalAssets) / Number(vault.stEverSupply)
  const add = (root, amount, multiplier = 1) => {
    const [cgId, decimals] = tokens[root]
    const rate = root === ST_VENOM ? stVenomRate : 1
    api.addCGToken(cgId, Number(amount) / 10 ** decimals * rate * multiplier)
  }

  const dexRoot = decodeFields((await getAccount(DEX_ROOT)).data, ROOT_FIELDS)
  const codeHashes = (codes) => [...codes.values()].map((code) => cellHash(code).toString('hex'))

  // constant product pairs: count both reserves when both tokens are known, else twice the known side
  for (const codeHash of codeHashes(dexRoot._pairCodes)) {
    for (const pair of await getAccountsByCodeHash(codeHash)) {
      const d = decodeFields((await getAccount(pair)).data, PAIR_FIELDS)
      const roots = d._typeToRootAddresses.get(PAIR_TYPE_TOKENS) ?? []
      const reserves = d._typeToReserves.get(PAIR_TYPE_TOKENS) ?? []
      if (roots.length !== 2 || reserves[0] === undefined || reserves[1] === undefined) continue // not initialized
      const known = roots.map((root) => !!tokens[root])
      if (known[0] && known[1]) { add(roots[0], reserves[0]); add(roots[1], reserves[1]) }
      else if (known[0]) add(roots[0], reserves[0], 2)
      else if (known[1]) add(roots[1], reserves[1], 2)
    }
  }

  // stable pools keep each token's balance in tokenData
  for (const codeHash of codeHashes(dexRoot._poolCodes)) {
    for (const pool of await getAccountsByCodeHash(codeHash)) {
      const d = decodeFields((await getAccount(pool)).data, POOL_FIELDS)
      for (const { root, balance } of d.tokenData) if (tokens[root]) add(root, balance)
    }
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the reserves of all Web3.World constant product pairs and stable pools, decoded from the pool account states found via the DexRoot pair/pool code hashes. Only tokens with a known price are counted; for pairs with one known token, that side is doubled.',
  venom: { tvl },
}
