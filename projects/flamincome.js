const { sumTokens2 } = require('./helper/unwrapLPs')

const abis = {
  balance: "erc20:balance",
  token: "address:token",
}

const vaults = {
  // "VaultBaselineUSDT": "0x54bE9254ADf8D5c8867a91E44f44c27f0c88e88A",
  // "VaultBaselinewBTC": "0x1a389c381a8242B7acFf0eB989173Cd5d0EFc3e3",
  // "VaultBaselinewETH": "0x1E9DC5d843731D333544e63B2B2082D21EF78ed3",
  // "VaultBaselineDAI": "0x163D457fA8247f1A9279B9fa8eF513de116e4327",
  // "VaultBaselineUNI-V2[WBTC]": "0x743BC5cc8F52a84fF6e06E47Bc2af5324f5463D6",
  /* "VaultBaselinerenBTC": "0xB0B3442b632175B0b7d9521291c51060722C4e8C",
  "VaultBaselineTUSD": "0xa322AEa77769666453377CC697fbE4C6390b9942",
  "VaultBaselineyCRV": "0x5e7B4de4aC8e319fB2ec4bF9Fa98192346f8C99B",
  "VaultBaselinesBTC": "0x681D3261CC6d2A18b59f8B53219b96F06BcEeB69",
  "VaultBaselineUSDC": "0x3f7E3d82bdDc28d3Eb04F0d0A51e9Fc82db581f0",
  "VaultBaselineyDAI": "0x79A2e8C1120d6B5fBfaBD3f7a39CF8473A635742",
  "VaultBaselinecrvBTC": "0x483A47247d5cBd420A9c5d2838Ec89776ba8B56B",
  "VaultBaselineOKB": "0x272C8dF3E8068952606046c1389fc1e2320FCCfd",
  "VaultBaselinecrvRenWBTC": "0x10d0A001EeDC62b2A483EB9DFA0bb021aC61d55b",
  "VaultBaselinecrvRenWSBTC": "0x483A47247d5cBd420A9c5d2838Ec89776ba8B56B", */
}

async function tvl(api) {
  const contracts =Object.values(vaults)
  const tokens = await api.multiCall({  abi: abis.token, calls: contracts})
  const bals = await api.multiCall({  abi: abis.balance, calls: contracts})
  api.addTokens(tokens, bals)
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
  }
}
