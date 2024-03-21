const ADDRESSES = require('../helper/coreAssets.json')
const euphrates = '0x7Fe92EC600F15cD25253b421bc151c51b0276b7D';
const ldotAddr = ADDRESSES.acala.LDOT;
const wtdotAddr = '0xe1bD4306A178f86a9214c39ABCD53D021bEDb0f9';

async function tvl(api) {
  const [rate, wdotBal, ldotBal] = await Promise.all([
    api.call({ abi: 'uint256:withdrawRate', target: wtdotAddr }),
    api.call({ abi: 'erc20:balanceOf', target: wtdotAddr, params: euphrates }),
    api.call({ abi: 'erc20:balanceOf', target: ldotAddr, params: euphrates }),
  ])
  api.add('liquid-staking-dot', ldotBal / 1e10, { skipChain: true })
  api.add('polkadot', wdotBal * rate / 1e28, { skipChain: true })
  return api.getBalances()
}

module.exports = {
  misrepresentedTokens: true,
  start: 1695657600,
  methodology: 'total ldot and tdot locked in the euphrates contract',
  acala: {
    tvl,
  }
}