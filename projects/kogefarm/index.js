const { sumUnknownTokens } = require('../helper/unknownTokens')
const { getConfig } = require('../helper/cache')

const kogeMasterChefAddr = '0x6275518a63e891b1bC54FEEBBb5333776E32fAbD'

// Pool2
const kogecoinVaultAddr = '0x992Ae1912CE6b608E0c0d2BF66259ab1aE62A657'
const kogecoinMaticVaultAddr = '0xb7D3e1C5cb26D088d619525c6fD5D8DDC1B543d1'
const kogecoinSageVaultAddr = '0x4792b5943a05fc6AF3B20B5F1D1d7dDe33C42980'
const kogecoinIrisVaultAddr = '0x55A2FedB176C09488102596Db21937A753025466'
const kogecoinCollarVaultAddr = '0x64c20BB3D9aCD870f748fe73B6541D500643e490'
const kogecoinShieldVaultAddr = '0x7a9be7CdF26C8311625ed97c174869fcA9b791eC'
const kogecoinBetaVaultAddr = '0xEab5DAC8E6E3da7679b2a01FCD17DBE1Ed519904'
const kogecoinAlphaVaultAddr = '0xD02064bEd4126ACCCe79431A52F206C558479648'
const kogecoinTamagoVaultAddr = '0xA838F1e986b27d7AC5a977c7d0eCbADFFCDC7Bb5'

const _kogePool2 = [
  kogecoinMaticVaultAddr,
  kogecoinSageVaultAddr,
  kogecoinIrisVaultAddr,
  kogecoinCollarVaultAddr,
  kogecoinShieldVaultAddr,
  kogecoinBetaVaultAddr,
  kogecoinAlphaVaultAddr,
  kogecoinTamagoVaultAddr
]

const config = {
  kava: { endpoint: 'https://raw.githubusercontent.com/kogecoin/vault-contracts/main/kava_vault_addresses.json' },
  moonriver: { endpoint: 'https://raw.githubusercontent.com/kogecoin/vault-contracts/main/movr_vault_addresses.json' },
  fantom: { endpoint: 'https://raw.githubusercontent.com/kogecoin/vault-contracts/main/ftm_vault_addresses.json' },
  polygon: { endpoint: 'https://raw.githubusercontent.com/kogecoin/vault-contracts/main/vaultaddresses' },
}

const abi = {
  strategy: "function strategy() view returns (address)",
  balance: "uint256:balance",
  token: "address:token",
  balanceOfPool: "function balanceOf() view returns (uint256)"
}

Object.keys(config).forEach(chain => {
  const { endpoint } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      let info = await getConfig('kogefarm/' + chain, endpoint);
      if (typeof info === 'string') info = JSON.parse(info.replace(/,(\s*[}\]])/g, '$1'));
      
      let vaults = chain === 'polygon' ? info : info.map(v => v.vault);
      if (chain === 'polygon') {
        vaults = vaults.filter(v => !_kogePool2.includes(v));
        const [tokens, bals] = await Promise.all([
          api.multiCall({ abi: abi.token, calls: vaults }),
          api.multiCall({ abi: abi.balance, calls: vaults })
        ]);
        api.addTokens(tokens, bals);

      } else {
        const [tokens, strategies] = await Promise.all([
          api.multiCall({ abi: abi.token, calls: vaults }),
          api.multiCall({ abi: abi.strategy, calls: vaults })
        ]);

        const balanceOfPools = await api.multiCall({ calls: strategies, abi: abi.balanceOfPool });
        api.addTokens(tokens, balanceOfPools);
      }
      return sumUnknownTokens({ api, resolveLP: true });
    }
  };
});



module.exports.polygon.pool2 = async (api) => {
  const [tokens, bals] = await Promise.all([
    api.multiCall({ abi: abi.token, calls: _kogePool2 }),
    api.multiCall({ abi: abi.balance, calls: _kogePool2 })
  ])
  api.addTokens(tokens, bals)
  return sumUnknownTokens({ api, resolveLP: true, tokens: ['0x3885503aef5e929fcb7035fbdca87239651c8154'], owner: kogeMasterChefAddr, })
}

module.exports.polygon.staking = async (api) => {
  return sumUnknownTokens({ api, tokens: ['0x13748d548D95D78a3c83fe3F32604B4796CFfa23'], owner: kogeMasterChefAddr, })
}