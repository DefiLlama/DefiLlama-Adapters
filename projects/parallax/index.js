async function tvl(time, _ethBlock, _1, { api }) {
  await Promise.all([addMIMStrategy(api)]);
}

async function addMIMStrategy(api) {
  const token = "0x30dF229cefa463e991e29D42DB0bae2e122B2AC7";
  const sorbettiere = "0x839de324a1ab773f76a53900d70ac1b913d2b387";
  // const strategy = "0x7b8eFCd93ee71A0480Ad4dB06849B75573168AF4";
  const strategies = [
    "0x7b8eFCd93ee71A0480Ad4dB06849B75573168AF4",
    "0xbf81Ba9D10F96ce0bb1206DE5F2d5B363f9796A9",
  ];
  for (let iterator = 0; iterator < strategies.length; iterator++) {
    const strategy = strategies[iterator];
    const [bal] = await api.call({
      abi: "function userInfo(uint256, address) view returns (uint256,uint256,uint256)",
      target: sorbettiere,
      params: [0, strategy],
    });

    api.add(token, bal);
  }
}

module.exports = {
  methodology: "TVL comes from the Staking Vaults",
  arbitrum: {
    tvl,
  },
};
