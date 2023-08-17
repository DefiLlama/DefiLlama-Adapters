const { staking } = require("../helper/staking");
const { sumTokens2 } = require("../helper/unwrapLPs");

const pools = [
  "0xbe52548488992Cc76fFA1B42f3A58F646864df45",
  "0x66357dcace80431aee0a7507e2e361b7e2402370",
  "0x39dE4e02F76Dbd4352Ec2c926D8d64Db8aBdf5b2",
  "0xB8E567fc23c39C94a1f6359509D7b43D1Fbed824",
  "0x30C30d826be87Cd0A4b90855C2F38f7FcfE4eaA7",
  "0x4658EA7e9960D6158a261104aAA160cC953bb6ba",
  "0xC828D995C686AaBA78A4aC89dfc8eC0Ff4C5be83",
  "0x81E63d0EEBA2D85609A6b206737e98e39B888F4C",
  "0x91BB10D68C72d64a7cE10482b453153eEa03322C",
  "0x27912AE6Ba9a54219d8287C3540A8969FF35500B",
  "0x233Ba46B01d2FbF1A31bDBc500702E286d6de218",
  "0x89E9EFD9614621309aDA948a761D364F0236eDEA",
  "0x8b4a45da5b0705ae4f47ebefc180c099345cf57e",
  "0xDeD29DF6b2193B885F45B5F5027ed405291A96C1",
  "0xb3393f4e609c504da770ebc968540784cc4e016c",
];

const blacklistedTokens = []

async function tvl(timestamp, ethereumBlock, chainBlocks, { api }) {
  if (timestamp > +new Date("2023-02-17") / 1e3) blacklistedTokens.push("0xdaCDe03d7Ab4D81fEDdc3a20fAA89aBAc9072CE2") // USP was hacked
  const tokensArray = await api.multiCall({  abi: "function getTokenAddresses() view returns (address[])", calls: pools})
  const tokens = tokensArray.flat()
  const calls = tokensArray.map((t, i)=> t.map((token) => ({ target: pools[i], params: token }))).flat()
  
  const owners = await api.multiCall({  abi:"function assetOf(address) view returns (address)", calls})
  tokens.push('0xb599c3590f42f8f995ecfa0f85d2980b76862fc1')
  owners.push('0xc7388d98fa86b6639d71a0a6d410d5cdfc63a1d0')
  return sumTokens2({ api, tokensAndOwners2: [tokens, owners], blacklistedTokens });
}

module.exports = {
  avax: {
    tvl,
    staking: staking(
      "0x5857019c749147eee22b1fe63500f237f3c1b692",
      "0x22d4002028f537599be9f666d1c4fa138522f9c8",
    ),
  },
  hallmarks: [
    [Math.floor(new Date('2023-02-17') / 1e3), 'Protocol was hacked for $8.5m'],
  ],
};
