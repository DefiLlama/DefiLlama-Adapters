const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  ethereum: [
    // https://docs.reservoir.xyz/products/proof-of-reserves
    '0x0c7e4342534e6e8783311dCF17828a2aa0951CC7',
    '0x9BB2c38F57883E5285b7c296c66B9eEA4769eF80',
    '0x99A95a9E38e927486fC878f41Ff8b118Eb632b10',
    '0xE45321525c85fcc418C88E606B96daD8cBcc047f',
    '0x841DB2cA7E8A8C2fb06128e8c58AA162de0CfCbC',
    '0x99E8903bdEFB9e44cd6A24B7f6F97dDd071549bc',
    '0x2Adf038b67a8a29cDA82f0Eceb1fF0dba704b98d'
    // '0x31Eae643b679A84b37E3d0B4Bd4f5dA90fB04a61', - exluded RUSD because it is project's own token
  ],
  berachain: [],
}

const assets = {
  sUSDe: '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497',
  'PT-USDe': '0xBC6736d346a5eBC0dEbc997397912CD9b8FAe10a',
  'PT-sUSDE': '0x9F56094C450763769BA0EA9Fe2876070c0fD5F77',
  'eUSDC-22': '0xe0a80d35bb6618cba260120b279d357978c42bce'
}

Object.keys(config).forEach(chain => {
  if (chain === 'berachain') {
    // BYUSD-HONEY-LP
    const byusd_honey_lp_vault = '0xbbB228B0D7D83F86e23a5eF3B1007D0100581613';
    const byusd_honey_lp_token = '0xdE04c469Ad658163e2a5E860a03A86B52f6FA8C8';
    const byusd_honey_lp_owner = '0x0db79c0770E1C647b8Bb76D94C22420fAA7Ac181';

    // HONEY in rUSD-HONEY LP
    const rusd_honey_lp_vault = '0x1C5879B75be9E817B1607AFb6f24F632eE6F8820';
    const rusd_honey_lp_token = '0x7fd165B73775884a38AA8f2B384A53A3Ca7400E6';
    const rusd_honey_lp_owner = '0x6811742721DcCe83942739d44E40f140B5BCee37';

    // USDT0 in rUSD-USDT0 LP
    const rusd_usdt0_lp_vault = '0xc6De36eceD67db9c17919708865b3eE94a7D987C';
    const rusd_usdt0_lp_token = '0x1fb6c1aDE4F9083b2EA42ED3fa9342e41788D4b5';
    const rusd_usdt0_lp_owner = '0x8Cc5a546408C6cE3C9eeB99788F9EC3b8FA6b9F3';

    module.exports[chain] = {
      tvl: async (api) => {
        const lpBalance = await api.call({ abi: 'function balanceOf(address) view returns (uint256)', target: byusd_honey_lp_vault, params: byusd_honey_lp_owner })
        api.add(byusd_honey_lp_token, lpBalance);

        const honeyBalance = await api.call({ abi: 'function balanceOf(address) view returns (uint256)', target: rusd_honey_lp_vault, params: rusd_honey_lp_owner })
        api.add(rusd_honey_lp_token, Number(honeyBalance) / 2);

        const usdt0Balance = await api.call({ abi: 'function balanceOf(address) view returns (uint256)', target: rusd_usdt0_lp_vault, params: rusd_usdt0_lp_owner })
        api.add(rusd_usdt0_lp_token, Number(usdt0Balance) / 2);

        return api.getBalances()
      }
    }
  }
  else if (chain === 'ethereum') {
    const funds = config[chain]
    module.exports[chain] = {
      tvl: async (api) => {
        // count assets on tvl adapters
        const tokens = await api.multiCall({ abi: 'address:underlying', calls: funds })
        const bals = await api.multiCall({ abi: 'uint256:totalValue', calls: funds })
        const decimals = await api.multiCall({ abi: 'uint8:decimals', calls: tokens })
        bals.forEach((v, i) => bals[i] = v * 10 ** (decimals[i] - 18))
        api.add(tokens, bals)

        // count USDC locked in 0x4809010926aec940b550D34a46A52739f996D75D
        api.sumTokens({
          owner: '0x4809010926aec940b550D34a46A52739f996D75D', token: ADDRESSES.ethereum.USDC
        })

        let shareBalance = await api.call({ abi: 'function balanceOf(address) view returns (uint256)', target: assets['eUSDC-22'], params: ['0x3063C5907FAa10c01B242181Aa689bEb23D2BD65'] })

        api.add(assets['eUSDC-22'], shareBalance)

        shareBalance = await api.call({ abi: 'function balanceOf(address) view returns (uint256)', target: assets.sUSDe, params: ['0x5563CDA70F7aA8b6C00C52CB3B9f0f45831a22b1'] })

        api.add(assets.sUSDe, shareBalance)

        shareBalance = await api.call({ abi: 'function balanceOf(address) view returns (uint256)', target: assets['PT-sUSDE'], params: ['0x5563CDA70F7aA8b6C00C52CB3B9f0f45831a22b1'] })

        api.add(assets['PT-sUSDE'], shareBalance)

        shareBalance = await api.call({ abi: 'function balanceOf(address) view returns (uint256)', target: assets['PT-USDe'], params: ['0x8d3A354f187065e0D4cEcE0C3a5886ac4eBc4903'] })

        api.add(assets['PT-USDe'], shareBalance)

        return api.getBalances()
      }
    }
  }
})
