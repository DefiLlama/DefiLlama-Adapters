const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const abiMoonriver = require('./abi-moonriver.json');

const Contracts = {
  moonriver: {
    pools: {
      '1s3p': '0xb578a396e56388CbF398a12Dea9eb6B01b7c777f',
      '1s3pbusd': '0x008db1Cef0958e7f87A107b58F0dede796ce7962',
      '1s3pmim': '0x23A479A83e4FaC12C2096Ab1D79Ea7a788f4489E',
      '1s3pfrax': '0xF223B776C86E1ADa8fD205dBb804D1Fd6C87E05E',
      '1s3pavaxusd': '0x7179F2C31763f395082489588534F4abb3Dd4Be6',
      '1s3pwanusd': '0x02A105939Dc0C47cb6bD04f320dAa77Bd9E3Bb0D',
    },
    ignoredLps: ['0x17da5445f3cd02b3f1cd820e6de55983fe80cf85'] ,
  }
};

const poolTvl = async (chain, poolAddress, block) => {
  const [balances, tokens] = await Promise.all([
    sdk.api.abi.call({
      target: poolAddress,
      abi: abiMoonriver['1Swap'].getTokenBalances,
      chain: chain,
      block,
    }),
    sdk.api.abi.call({
      target: poolAddress,
      abi: abiMoonriver['1Swap'].getTokens,
      chain: chain,
      block,
    }),
  ]);

  const sum = {};

  tokens.output.forEach((token, i) => {
    if (
      Contracts[chain].ignoredLps &&
      Contracts[chain].ignoredLps.includes(token.toLowerCase())
    ) {
      return;
    }
    const [symbol, decimals] = getTokenId(token.toLowerCase());
    sum[symbol] = new BigNumber(balances.output[i]).div(new BigNumber(10).pow(decimals)).toNumber()
  });

  return sum;
};

const moonriverTvl = async (timestamp, ethBlock, chainBlocks) => {
  let block = chainBlocks['moonriver'];
  const tvl = {};

  for (let address of Object.values(Contracts.moonriver.pools)) {
    const balances = await poolTvl(
      'moonriver',
      address,
      block,
    );

    Object.entries(balances).forEach(([token, value]) => {
      sdk.util.sumSingleBalance(tvl, token, value);
    });
  }

  return tvl;
};


function getTokenId(address) {
  switch(address) {
      case '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d':
          return ['usd-coin', 6]
      case '0xb44a9b6905af7c801311e8f4e76932ee959c663c':
          return ['tether', 6]
      case '0x80a16016cc4a2e6a2caca8a4a498b1699ff0f844':
          return ['dai', 18]
      case '0x5d9ab5522c64e1f6ef5e3627eccc093f56167818':
          return ['busd', 18]
      case '0x0cae51e1032e8461f4806e26332c030e34de3adb':
          return ['magic-internet-money', 18]
      case '0x965f84d915a9efa2dd81b653e3ae736555d945f4':
        return ['frax', 18];
      case '0xd8b99eae34afdf1a9bfa5770066404ee4468d0f2': // AVAX bridge
        return ['usd-coin', 6];
      case '0xf97c8556af29089d5d1627096958187b11f1915c': // AVAX bridge
        return ['tether', 6];
      case '0x26dfff76d9123a1c79279abc29b676c48a8bd77e': // AVAX bridge
        return ['dai', 18];
      case '0x748134b5f553f2bcbd78c6826de99a70274bdeb3': // WANCHAIN bridge
        return ['usd-coin', 6];
      case '0xe936caa7f6d9f5c9e907111fcaf7c351c184cda7': // WANCHAIN bridge
        return ['tether', 6];
      default:
          return false;
  };
};



module.exports = {
  moonriver: {
    tvl: moonriverTvl,
  },
  tvl: sdk.util.sumChainTvls([moonriverTvl]),
};
