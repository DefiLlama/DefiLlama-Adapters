const stakingContracts = [
  "0xd47477da78F6252b1029f3041aC4FC749439CD3F",
  "0xe3F7194AB9cDa2E91bBf0AC7F450Ac7a60B40901",
  "0x53Bd1b82363d93dc9344FfBB764d2713cd5628cC",
  "0x2e1f9186912142341B2fc40b32b99Ea9fE1b730B",
  "0x237826695a575D9Fd2FA7C184E5f37593aBc1529",
  "0x63C8860e93697dB85716C9ee7F15D09EAC62136C",
  "0x19a0D0b1734bdB167D393e7BB7a57418e3a8cCA8",
  "0x1DBa95577DFe76d8e86af00aEB614479cb7917D2"
];


module.exports = {
  merlin: {
    tvl,
  },
}

async function tvl(api) {
  const tokens = await api.multiCall({  abi: 'address:stakeToken', calls: stakingContracts})
  return api.sumTokens({ tokensAndOwners2: [tokens, stakingContracts]})
  
}
