const mapping = {
  btr: {
    bfBTC: '0xCdFb58c8C859Cb3F62ebe9Cf2767F9e036C7fb15',
  },
  bsc: {
    bfBTC: '0x623F2774d9f27B59bc6b954544487532CE79d9DF',
  },
  hemi: {
    bfBTC: '0x623F2774d9f27B59bc6b954544487532CE79d9DF',
  },
  ethereum: {
    bfBTC: '0xCdFb58c8C859Cb3F62ebe9Cf2767F9e036C7fb15',
  },
  base: {
    bfBTC: '0x623F2774d9f27B59bc6b954544487532CE79d9DF',
  },
  core: {
    bfBTC: '0xCdFb58c8C859Cb3F62ebe9Cf2767F9e036C7fb15',
  }
}
const exportObject = {}
Object.keys(mapping).forEach(chain => {
  exportObject[chain] = {
    tvl: async (api) => {
      const supply = await api.call({ abi: 'erc20:totalSupply', target: mapping[chain].bfBTC })
      api.add(mapping[chain].bfBTC, supply)
    }
  }
})
module.exports = exportObject

/* backing wallets are 
Ceffu(BTC)：
1BmKSPG4AcCNkxC29tQVXF6vfK9hvxUtRL
1BNpsNMq96ypaPmH8zuYLAxHPxYQQdXEvU
1BNmwHhD4SAogR1fxpZnNCEWrVqA1Djdjb
1BR8fqjuapewZy6HjBHTHZthTot3pMT55y
1BK4YdJCSmJNa6ptNwGb6M67ioivFuQQTe

Ceffu(BTCB):
0x062900dcd4729af3bdbf3150b98eb9bcfdb822ac

Binance(BTC)：
1J8hRVttPiZya2GnfZbBaQj2zxonbTn2cH
1Mx5gBkvGqy8LPYcJfJ7yjhA5oVzLrNGFg
15EBS4TJs7BfjDn9EeMzBhaDv4bddfWuNT
1PqY7uSCCAMYfTvnJX6TpeZZxKWQjMjjgZ
OKX(BTC)：
bc1qksyye79f03pr4uezx5ddtr5ap65ug3j3vfmds5arkfwtr4fjtt5qnnxnyk
3LEt6F46QjBCrMMMp8getCrpjBmN6brXoG
BYBIT(BTC)：
1DGZtD885npNLuCvNFRwa5uh4m1TR5WpYz
*/