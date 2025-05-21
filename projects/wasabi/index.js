const { getLogs } = require('../helper/cache/getLogs');
const idl = require('./wasabi_solana.json');
const { getProvider } = require('../helper/solana');
const { Program } = require("@coral-xyz/anchor");

const config = {
  ethereum: {
    pools: {
      "WASABI_LONG_POOL": "0x8e0edfd6d15f858adbb41677b82ab64797d5afc0",
      "WASABI_SHORT_POOL": "0x0fdc7b5ce282763d5372a44b01db65e14830d8ff"
    }, fromBlock: 18810700,
  },
  blast: {
    pools: {
      "WASABI_LONG_POOL": "0x046299143A880C4d01a318Bc6C9f2C0A5C1Ed355",
      "WASABI_SHORT_POOL": "0x0301079DaBdC9A2c70b856B2C51ACa02bAc10c3a"
    }, fromBlock: 185200,
  },
  base: {
    pools: {
      "WASABI_LONG_POOL": "0xbDaE5dF498A45C5f058E3A09afE9ba4da7b248aa",
      "WASABI_SHORT_POOL": "0xA456c77d358C9c89f4DFB294fA2a47470b7dA37c"
    }, fromBlock: 25309500,
  },
  berachain: {
    pools: {
      "WASABI_LONG_POOL": "0x0da575D3edd4E3ee1D904936F94Ec043c06Bb12B",
      "WASABI_SHORT_POOL": "0x3EE6C6CdAa0073DE6Da00091329dE4390B0DF1EE"
    }, fromBlock: 2249763,
  },
}

const solanaTvl = async (api) => {
  const provider = getProvider()
  const program = new Program(idl, provider)
  const vaults = await program.account.lpVault.all()
  vaults.forEach((data, i) => {
    const lpAsset = data.account.asset.toString()
    api.add(lpAsset, data.account.totalAssets)
  })
}

Object.keys(config).forEach(chain => {
  let { pools, fromBlock, tokens = [], } = config[chain]
  pools = Object.values(pools)
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = (await Promise.all(pools.map(target => getLogs({
        api,
        target,
        eventAbi: "event NewVault(address indexed pool, address indexed asset, address vault)",
        onlyArgs: true,
        fromBlock,
      })))).flat();
      return api.erc4626Sum({ calls: logs.map(log => log.vault), isOG4626: true, });
    }
  }
})

module.exports.solana = {
  tvl: solanaTvl
}
module.exports.hallmarks=[
  [1709181259, "Deployed on Blast"],
  // [1733011200, "Deployed on Solana"], // has no impact on the TVL
  // [1737365147, "Deployed on Base"],
  // [1741758248, "Deployed on Berachain"]
]
module.exports.methodology="Counts the total value deposited in the vaults of the Wasabi protocol, including assets that have been loaned out to open long and short positions."
