const NOVAFOX_STAKING_CONTRACT = '0x4803a6f0a93f4adb96318304a03f8dfddb15e423'; // NovaFoxStakeV2
const NFX_TOKEN = '0xe1f864aE527d3646c222fe1b65460dB2D6E62228';

async function staking(api) {
  // Call getTotalStaked() to get total staked NFX
  const totalStaked = await api.call({
    abi: {
      name: "getTotalStaked",
      inputs: [],
      outputs: [{ type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    target: NOVAFOX_STAKING_CONTRACT,
  });

  // Add the NFX token and its balance
  api.add(NFX_TOKEN, totalStaked);
}

module.exports = {
  methodology: 'Staking TVL is calculated as the total NFX tokens staked in the NovaFoxStake contract on Cronos.',
  cronos: {
    tvl: () => ({}), // No base TVL since only staking
    staking,
  },
};
