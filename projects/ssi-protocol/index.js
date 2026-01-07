const sdk = require('@defillama/sdk')
const { getBlock } = require('../helper/http');

const abi = {
  getBasket: 'function getBasket() view returns ((string chain, string symbol, string addr, uint8 decimals, uint256 amount)[])'
}

const ssi_tokens = [
  // MAG7.ssi
  '0x9E6A46f294bB67c20F1D1E7AfB0bBEf614403B55',
  // DEFI.ssi
  '0x164ffdaE2fe3891714bc2968f1875ca4fA1079D0',
  // MEME.ssi
  '0xdd3acDBDc7b358Df453a6CB6bCA56C92aA5743aA'
]

function underlyingExports(chains) {
  const exportObj = {};
  Object.entries(chains).forEach(([chain, [chain_name, native_token]]) => {
    exportObj[chain] = {
      tvl: async (api, ethBlock, chainBlocks) => {
        const balances = {};
        const base_block = await getBlock(api.timestamp, 'base', chainBlocks);
        const baskets = await Promise.all(ssi_tokens.map(async (ssi_token) => {
          const res = await sdk.api.abi.call({
            abi: abi.getBasket,
            target: ssi_token,
            chain: 'base',
            block: base_block,
          });
          return res.output;
        }));
        baskets.forEach(basket => {
          basket.forEach(token => {
            if (token.chain == chain_name) {
              let token_addr;
              let token_amount;
              if (token.addr != '') {
                token_addr = chain + ':' + token.addr;
                token_amount = token.amount;
              } else {
                token_addr = native_token;
                token_amount = token.amount / 10 ** token.decimals;
              }
              sdk.util.sumSingleBalance(balances, token_addr, token_amount);
            }
          });
        });
        return balances;
      }
    }
  });
  return exportObj;
}

module.exports = {
  methodology: 'TVL counts the underlying tokens in the baskets of the SSI tokens.',
  ...underlyingExports({
    ethereum: ['ETH', 'ethereum'],
    bsc: ['BSC_BNB', 'binancecoin'],
    doge: ['DOGE', 'dogecoin'],
    solana: ['SOL', 'solana'],
    bitcoin: ['BTC', 'bitcoin'],
    cardano: ['ADA', 'cardano'],
    ripple: ['XRP', 'ripple'],
  })
};
