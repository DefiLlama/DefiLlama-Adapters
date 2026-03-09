const sdk = require('@defillama/sdk');

const abi = {
  getBasket: 'function getBasket() view returns ((string chain, string symbol, string addr, uint8 decimals, uint256 amount)[])'
}

const ssi_tokens = [
  '0x9E6A46f294bB67c20F1D1E7AfB0bBEf614403B55', // MAG7.ssi
  '0x164ffdaE2fe3891714bc2968f1875ca4fA1079D0', // DEFI.ssi
  '0xdd3acDBDc7b358Df453a6CB6bCA56C92aA5743aA', // MEME.ssi
]

function tvl(chainLabel) {
  return async (api) => {
    const baskets = await sdk.api.abi.multiCall({
      abi: abi.getBasket,
      calls: ssi_tokens.map(t => ({ target: t })),
      chain: 'base',
    });

    baskets.output.forEach(({ output: basket }) => {
      basket.forEach(token => {
        if (token.chain !== chainLabel) return;
        if (!token.addr || token.addr === '') return;
        api.add(token.addr, token.amount);
      });
    });
  }
}

module.exports = {
  methodology: 'TVL counts the actual on-chain balances of underlying ERC-20 tokens held by SSI token contracts.',
  ethereum: { tvl: tvl('ETH') },
  bsc: { tvl: tvl('BSC_BNB') },
  solana: { tvl: tvl('SOL') },
};
