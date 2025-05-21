const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

const vault_config = {
  'eth': {
    'vaults': [
      '0xf0bb20865277aBd641a307eCe5Ee04E79073416C', // eth liq
      '0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88', // weeths
      '0x7223442cad8e9cA474fC40109ab981608F8c4273', // weethk
      '0x83599937c2C9bEA0E0E8ac096c6f32e86486b410', // beraEth
      '0xca8711dAF13D852ED2121E4bE3894Dae366039E4', // move
    ],
    'accountant': [
      '0x0d05D94a5F1E76C18fbeB7A13d17C8a314088198', // eth liq
      '0xbe16605B22a7faCEf247363312121670DFe5afBE', // weeths
      '0x126af21dc55C300B7D0bBfC4F3898F558aE8156b', // weethk
      '0x04B8136820598A4e50bEe21b8b6a23fE25Df9Bd8', // beraEth
      '0x075e60550C6f77f430B284E76aF699bC31651f75', // move
    ],
    'timestampDeployed': [
      1717457039,
      1718161451,
      1719943535,
      1735549559,
      1737018599,
    ],
    'base': ADDRESSES.ethereum.EETH,
    'decimals': 18
  },
  'btc': {
    'vaults': [
      '0x5f46d540b6eD704C3c8789105F30E075AA900726', // btc liq
      '0xC673ef7791724f0dcca38adB47Fbb3AEF3DB6C80', // beraBtc
    ],
    'accountant': [
      '0xEa23aC6D7D11f6b181d6B98174D334478ADAe6b0', // btc liq
      '0xF44BD12956a0a87c2C20113DdFe1537A442526B5', // beraBtc
    ],
    'timestampDeployed': [
      1731626531,
      1735548563,
    ],
    'base': [
      "0x657e8c867d8b37dcc18fa4caead9c45eb088c642", // EBTC
      "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"  // WBTC
    ],
    'decimals': 8
  },
  'usd': {
    'vaults': [
      '0x08c6F91e2B681FaF5e17227F2a44C307b3C1364C', // usd liq 
      '0x352180974C71f84a934953Cf49C4E538a6F9c997', // exilir
      '0xeDa663610638E6557c27e2f4e973D3393e844E70', // mev
      '0xbc0f3B23930fff9f4894914bD745ABAbA9588265', // ultra
    ],
    'accountant': [
      '0xc315D6e14DDCDC7407784e2Caf815d131Bc1D3E7', // usd liq
      '0xBae19b38Bf727Be64AF0B578c34985c3D612e2Ba', // exilir
      '0x1D4F0F05e50312d3E7B65659Ef7d06aa74651e0C', // mev 
      '0x95fE19b324bE69250138FE8EE50356e9f6d17Cfe', // ultra
    ],
    'timestampDeployed': [
      1738059803,
      1724977967,
      1724694191,
      1733455907
    ],
    'base': ADDRESSES.ethereum.USDC,
    'decimals': 6
  }
}

async function updateVaultTvl(api, config) {
  const timestamp = api.timestamp
  let { vaults, accountant, base } = config
  const filtered_vaults = []
  const filtered_accountant = []

  // Filter out vaults not deployed yet
  for (let i = 0; i < vaults.length; i++) {
    if (config.timestampDeployed[i] < timestamp) {
      filtered_vaults.push(vaults[i])
      filtered_accountant.push(accountant[i])
    }
  }

  vaults = filtered_vaults
  accountant = filtered_accountant

  const baseDecimals = config.decimals
  const optimism_api = new sdk.ChainApi({ timestamp, chain: 'optimism' })

  const vaultsSupply = await api.multiCall({ calls: vaults, abi: 'uint256:totalSupply' })
  const quotes = await api.multiCall({ calls: accountant, abi: 'uint256:getRate' })
  const decimals = await api.multiCall({ calls: accountant, abi: 'uint256:decimals' })

  let amount = 0
  for (let i = 0; i < vaultsSupply.length; i++) {
    const vaultSupply = vaultsSupply[i]
    const quote = quotes[i]
    const decimal = decimals[i]
    amount += (vaultSupply / 10 ** decimal) * (quote / 10 ** decimal) * 10 ** baseDecimals
  }
  if (JSON.stringify(base).includes(ADDRESSES.ethereum.EBTC)) {
    let wbtc = 0
    if (api.timestamp < 1746507563) {
      wbtc = await api.call({
        target: '0x657e8C867D8B37dCC18fA4Caead9C45EB088C642',
        abi: 'uint256:totalSupply'
      })
    } else {
      wbtc = await optimism_api.call({
        target: '0xAB7590CeE3Ef1A863E9A5877fBB82D9bE11504da',
        abi: 'function categoryTVL(string _category) view returns (uint256)',
        params: ['liquid-vault-wbtc']
      })
    }
    amount -= wbtc
    api.add(ADDRESSES.ethereum.WBTC, wbtc)
  } else if (JSON.stringify(base).includes(ADDRESSES.ethereum.EETH)) {
    let weth = 0
    if (api.timestamp < 1746507563) {
      weth = await optimism_api.call({
        target: '0xAB7590CeE3Ef1A863E9A5877fBB82D9bE11504da',
        abi: 'function categoryTVL(string _category) view returns (uint256)',
        params: ['liquid-weth']
      })
    } else {
      weth = await optimism_api.call({
        target: '0xAB7590CeE3Ef1A863E9A5877fBB82D9bE11504da',
        abi: 'function categoryTVL(string _category) view returns (uint256)',
        params: ['liquid-vault-weth']
      })
    }
    amount -= weth
    api.add(ADDRESSES.ethereum.WETH, weth)
  }

  if (amount < 0) amount = 0

  // upport multiple base tokens
  if (Array.isArray(base)) {
    const share = amount / base.length
    for (const token of base) {
      api.add(token, share)
    }
  } else {
    api.add(base, amount)
  }
}

async function tvl(api) {
  for (const config of Object.values(vault_config)) {
    await updateVaultTvl(api, config)
  }
  console.log(await api.getBalancesV2().getUSDJSONs())
}

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  ethereum: {
    tvl: tvl,
  },
}
