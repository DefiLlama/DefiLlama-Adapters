const ComptrollerAbi = require('./ComptrollerAbi.json');
const BTokenAbi = require('./BTokenAbi.json');

const Comptroller = '0xfFadB0bbA4379dFAbFB20CA6823F6EC439429ec2';

async function tvl(timestamp, block, chainBlocks, { api }) {
  let underlyingTokens = [];
  let underlyingBalances = [];

  const bTokens = await api.call({ target: Comptroller, abi: ComptrollerAbi['getAllMarkets'] });

  await Promise.all(bTokens.map(async bToken => {
    const cashBalance = await api.call({ target: bToken, abi: BTokenAbi['internalCash'] });
    const underlying = await api.call({ target: bToken, abi: BTokenAbi['underlying'] });
    underlyingTokens.push(underlying);
    underlyingBalances.push(cashBalance);
  }));

  api.addTokens(underlyingTokens, underlyingBalances);
}

module.exports = {
  methodology: 'Gets the total value locked in the Blueberry Lending Market',
  ethereum: { tvl, },
};
