const { sumUnknownTokens } = require('../helper/unknownTokens');

const GPC = '0x27397bfbefd58a437f2636f80a8e70cfc363d4ff';

async function tvl(api) {
  const supply = await api.call({ abi: 'erc20:totalSupply', target: GPC })
  api.add(GPC, supply)

  const lps = ['0xCd13CD31fb61345Abe7B7376A4664784622817EE']
  return sumUnknownTokens({ api, lps, useDefaultCoreAssets: true })
}

module.exports = {
  misrepresentedTokens: true,
  klaytn: {
    tvl,
  }
}

