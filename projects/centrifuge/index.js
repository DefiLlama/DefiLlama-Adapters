const JTRSY = "0x8c213ee79581Ff4984583C6a801e5263418C4b86";

const config = {
  "ethereum": [ { "token": JTRSY, "vault": "0x36036fFd9B1C6966ab23209E073c68Eb9A992f50" } ],
  "base": [ { "token": JTRSY, "vault": "0xF9a6768034280745d7F303D3d8B7f2bF3Cc079eF" } ],
  "arbitrum": [ { "token": JTRSY, "vault": "0x16C796208c6E2d397Ec49D69D207a9cB7d072f04" } ]
}

const contractAbis = {
  totalAssets: "function totalAssets() external view returns (uint256)",
};

module.exports = {
  methodology: "TVL corresponds to the total USD value of tokens minted on Centrifuge across Ethereum, Base, and Arbitrum.",
  ethereum: {
    tvl: async (api) => {
      for (let i = 0; i < config['ethereum'].length; i++) {
        const decimals = await api.call({ abi: 'erc20:decimals', target: config['ethereum'][i]['token'] })
        const value = await api.call({ abi: contractAbis.totalAssets, target: config['ethereum'][i]['vault'] })
        api.addUSDValue(value / 10 ** (decimals));
      }
    },
  },
  base: {
    tvl: async (api) => {
      for (let i = 0; i < config['base'].length; i++) {
        const decimals = await api.call({ abi: 'erc20:decimals', target: config['base'][i]['token'] })
        const value = await api.call({ abi: contractAbis.totalAssets, target: config['base'][i]['vault'] })
        api.addUSDValue(value / 10 ** (decimals));
      }
    },
  },
  arbitrum: {
    tvl: async (api) => {
      for (let i = 0; i < config['arbitrum'].length; i++) {
        const decimals = await api.call({ abi: 'erc20:decimals', target: config['arbitrum'][i]['token'] })
        const value = await api.call({ abi: contractAbis.totalAssets, target: config['arbitrum'][i]['vault'] })
        api.addUSDValue(value / 10 ** (decimals));
      }
    },
  },
};