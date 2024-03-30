const ADDRESSES = require('../helper/coreAssets.json')
const abi = require('./abi.json')

const _vaults = {
  avax: [
    '0x37e0f0513ae3d3c4403e7b11c8a15b06c7cb1412', //USDC.e/USDC_C
    '0xb41506675a0977a34e8cec7da8c061d6753b5b03', //USDT/USDC_B
    '0xc4bbd4ba96eaf7ccb3d0f2e0819b1f6e5c900b16', //USDT/USDC_C
    '0x07462883abb2350e5243b94aeb27f4d37e3238e8', //USDT/USDT.e_B
    '0x9f44e67ba256c18411bb041375e572e3dd11fa72', //USDT/USDT.e_C
    '0x3b27aee8df3a3791eb57b59a770a530a93dc0221', //USDC.e/USDC_B
    '0x89547441489262feb5cee346fdacb9037c2574db', //JOE/AVAX_B
    '0x668530302c6ecc4ebe693ec877b79300ac72527c', //AVAX/USDC_B
    '0x9c9cea14731821f4d08889717043977e6dee766a', //WETH.e/AVAX_B
    '0x9cc15d1204d768380cec8d35bc1d8e1945083397', //BTC.b/USDC_B
    '0x536d7e7423e8fb799549caf574cfa12aae95ffcd', //BTC.b/AVAX_B
    '0x9bdda0c0cd56d98a8165fddabdeb7f9aee2d993e', //GMX/AVAX
    // '0xFFE588AC8d94c758AFaC5c50A4b4bF4BC1887fFD', //CAI/AVAX
  ],
  arbitrum: [
    '0x862f459c3c1f8949b3f5b624d39134d61697946e', //GMX/ETH
    '0xec9fba07ca8b3429950b2e01aec4e2b08dbd7897', //ETH/USDC
    '0xfb6421346d7e96f573414be757b502c0bb15cb62', //USDT/USDC_B
    '0xf8d6eb0e55a83e8a27af3c5f48cab883da3c716d', //USDT/USDC_C
    '0x2DBb0b159dc932D86FA4a5378924E7e074F4a5f2', //ARB/WETH
    '0x223d04520d5376D6B465e4270e64746048eed716', //ARB/USDC
    '0x04F9a9D6B7728787520B0ac69b88D81ddB5C10ED', //UNIDX/WETH
    '0x57de2A8df99480fCc5323678bdA61E8Fd612bD54', //JOE/WETH
    '0xe5F984fA55315fb1ee3399D6be3d9aAF74F1eFE4', //MAGIC/WETH
    '0xEb7081e31E6d46058Fe65A68a309B788Aa8B363f', //BFR/WETH
    '0xA0676beC4EC591c33A69877A2d39f08b54d34b84', //BETS/WETH
  ],
}

async function tvl(api) {
  //get the total shares from all vaults
  const vaults = _vaults[api.chain]
  const depositTokens = await api.multiCall({ abi: abi.want, calls: vaults })
  const vaultShares = await api.multiCall({ abi: abi.totalSupply, calls: vaults })

  //get the total underlying assets from all shares
  const calls = []

  for (let i = 0; i < vaults.length; i++)
    calls.push({ target: vaults[i], params: vaultShares[i] })

  const poolInfo = await api.multiCall({ calls, abi: abi.getUnderlyingAssets, })

  for (let i = 0; i < poolInfo.length; i++) {
    for (let t = 0; t < poolInfo[i].length; t++) {
      api.add(depositTokens[i][t], poolInfo[i][t])
    }
  }

  if (api.chain === 'avax') {

    // hJOE tvl
    const HJOE_ADDRESS = '0xe7250b05bd8dee615ecc681eda1196add5156f2b'
    const JOE_ADDRESS = ADDRESSES.avax.JOE

    api.add(JOE_ADDRESS, await api.call({ target: HJOE_ADDRESS, abi: 'erc20:totalSupply' }))

    // engima tvl
    const enigmaFactory_AVAX = `0xD751E0940CfadC35f84e60075d0f940a2545FB8d`;
    const enigmas = await api.fetchList({ lengthAbi: 'enigmaPositionNumber', itemAbi: 'enigmaAtIndex', target: enigmaFactory_AVAX })
    const token0s = await api.multiCall({ abi: 'address:token0', calls: enigmas })
    const token1s = await api.multiCall({ abi: 'address:token1', calls: enigmas })
    const bals = await api.multiCall({ abi: 'function getTotalAmounts() view returns (uint256 bal0, uint256 bal1)', calls: enigmas })
    bals.forEach(({ bal0, bal1 }, i) => {
      api.add(token0s[i], bal0)
      api.add(token1s[i], bal1)
    })

  }
}
async function staking(api) {
  const XSTEAK_ADDRESS = '0x902Aa4cC3b463c84541C9C1DeDF50620C99950B9'
  const STEAK_ADDRESS_AVAX = '0xb279f8dd152b99ec1d84a489d32c35bc0c7f5674'

  api.add(STEAK_ADDRESS_AVAX, await api.call({ target: XSTEAK_ADDRESS, abi: 'erc20:totalSupply' }))
}

module.exports = {
  doublecounted: true,
  methodology: 'Counts the value of LB tokens staked into SteakHut Liquidity.',
  avax: { tvl, staking, },
  arbitrum: { tvl },
}; 
