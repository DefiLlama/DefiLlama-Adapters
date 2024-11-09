const STEER_VAULTS = [
  "0x23c17a512d486d6f46db63a8dd5144b352497762",
  "0x4236fc0a5c47857777dd1578b7e825c8ccadca88",
  "0x4c8d1a52ee90b04ff8ee1257ad12290d89d13e6f",
  "0x554310f5d636dfc1122308a10f2b9936681f76de",
  "0x5aa27d5d8aff8cd5e683e23812124ace4aa5af7d",
  "0x83556d8bba69bdd159f50b2127ccc88bebf73e39",
  "0x879f9998c68cdaf28e4808fcc2b4f174c3cc5d97",
  "0x8bc0cd048cea0ebff9e81eeb79842c86c501ea3b",
  "0x908731366f82668ddd3ae3b2498adf52604e892d",
  "0xa212659dd4b71947268ff2037a654ce03730d857",
  "0xac8c89516bc4b60621c5326446e33680357bb3d2",
  "0xacb9a8676fc6ada472611a62354bf47502969287",
  "0xc07df1d13188c081f770944ece48e469b326b2a5",
  "0xc40d4d88afc7b03c65391cbfb6f399f464f6ab03",
  "0xcf4664fd4d0cabfcbbcbd4b6c2ecb71ac120d0c3"
];

async function tvl(api) {
  const token0s = await api.multiCall({ abi: 'address:token0', calls: STEER_VAULTS })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: STEER_VAULTS })
  const bals = await api.multiCall({
    abi: 'function getTotalAmounts() view returns (uint256 bal0, uint256 bal1)',
    calls: STEER_VAULTS
  })
  bals.forEach(({ bal0, bal1 }, i) => {
    api.add(token0s[i], bal0)
    api.add(token1s[i], bal1)
  })
}

module.exports = {
  mode: {
    tvl,
  },
};
