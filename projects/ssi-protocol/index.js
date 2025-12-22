const sdk = require('@defillama/sdk')

const abi = {
  getBasket: 'function getBasket() view returns ((string chain, string symbol, string addr, uint8 decimals, uint256 amount)[])'
}

const ssiTokens = [
  // MAG7.ssi
  '0x9E6A46f294bB67c20F1D1E7AfB0bBEf614403B55',
  // DEFI.ssi
  '0x164ffdaE2fe3891714bc2968f1875ca4fA1079D0',
  // MEME.ssi
  '0xdd3acDBDc7b358Df453a6CB6bCA56C92aA5743aA'
]

const chainMapping = {
  ETH: {
    chainName: 'ethereum',
    nativeToken: 'ethereum'
  },
  BSC_BNB: {
    chainName: 'bsc',
    nativeToken: 'binancecoin'
  },
  DOGE: {
    chainName: 'doge',
    nativeToken: 'dogecoin'
  },
  SOL: {
    chainName: 'solana',
    nativeToken: 'solana'
  },
  BTC: {
    chainName: 'bitcoin',
    nativeToken: 'bitcoin'
  },
  ADA: {
    chainName: 'cardano',
    nativeToken: 'cardano'
  },
  XRP: {
    chainName: 'ripple',
    nativeToken: 'ripple'
  },
  BASE_ETH: {
    chainName: 'base',
    nativeToken: 'ethereum'
  }
}

async function tvl(api) {
  const baskets = await api.multiCall({
    abi: abi.getBasket,
    calls: ssiTokens.map(token => ({
      target: token
    })),
  })
  const balances = {};
  baskets.forEach(basket => {
    basket.forEach(token => {
      let token_addr;
      let token_amount;
      if (token.addr != '') {
        token_addr = chainMapping[token.chain].chainName + ':' + token.addr;
        token_amount = token.amount;
      } else {
        token_addr = chainMapping[token.chain].nativeToken;
        token_amount = token.amount / 10 ** token.decimals;
      }
      sdk.util.sumSingleBalance(balances, token_addr, token_amount);
    });
  });
  return balances;
}

module.exports = {
  methodology: 'TVL counts the underlying tokens in the baskets of the SSI tokens.',
  base: {
    tvl: tvl
  }
};
