const { sumUnknownTokens } = require('../helper/unknownTokens')

const hydtAddress = "0x9810512be701801954449408966c630595d0cd51";
const shydtAddress = "0xab4f1Bb558E564ae294D45a025111277c36C89c0";
const earnAddress = "0x8e48d5b2Ac80d9861d07127F06BbF02F73520Ced";
const controlPairAddress = "0xBB8ae522F812E9E65239A0e5db87a9D738ce957a";

async function tvl(_, _b, _cb, { api, }) {
  const hydtBal = await api.call({ abi: 'erc20:balanceOf', target: shydtAddress, params: earnAddress })
  api.add(hydtAddress, hydtBal)
  return sumUnknownTokens({ api, lps: [controlPairAddress], useDefaultCoreAssets: true, })
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "We get staked amounts from the HYDT staking (earn) contract via contract calls",
  start: 1693763345,
  bsc: {
    tvl: () => ({}),
    staking: tvl,
  },
};
