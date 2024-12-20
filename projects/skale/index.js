const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const depositBoxETH = '0x49F583d263e4Ef938b9E09772D3394c71605Df94';
const depositBoxERC20 = '0x8fB1A35bB6fB9c47Fb5065BE5062cB8dC1687669';

module.exports = {
  start: '2021-07-19', // Mon July 19 06:38:20 PM UTC 2021
  ethereum: {
    tvl,
  }
}

async function tvl(api) {
  const ownerTokens = [[[ADDRESSES.null], depositBoxETH]]
  const chains = ["elated-tan-skat"]
  let tokens = []
  for (const chain of chains) {
    const tokenCount = await api.call({ abi: abi.getSchainToAllERC20Length, target: depositBoxERC20, params: chain })

    for (let i = 0; i < tokenCount; i += 10) {
      let remainingTokens = tokenCount - i;
      const res = await api.call({
        abi: abi.getSchainToAllERC20,
        target: depositBoxERC20,
        params: [chain, i, remainingTokens >= 10 ? i + 10 : i + remainingTokens],
      });

      tokens.push(...res);
    }
  }
  ownerTokens.push([tokens, depositBoxERC20])
  return sumTokens2({ api, ownerTokens })
}

const abi = {
  "getSchainToAllERC20Length": "function getSchainToAllERC20Length(string schainName) view returns (uint256)",
  "getSchainToAllERC20": "function getSchainToAllERC20(string schainName, uint256 from, uint256 to) view returns (address[])"
}