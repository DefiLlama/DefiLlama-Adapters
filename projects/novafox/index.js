const NOVAFOX_STAKING_CONTRACT = '0xE85400a27878bCe5379f6136110646f97B293c47'; // NovaFoxStakeV1
const NFX_TOKEN = '0xe1f864aE527d3646c222fe1b65460dB2D6E62228';

async function tvl(api) {
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

  // Add the NFX token and its balance to TVL
  api.add(NFX_TOKEN, totalStaked);
}

module.exports = {
  methodology: 'TVL is calculated as the total NFX tokens staked in the NovaFoxStake contract on Cronos.',
  cronos: {
    tvl,
  },
};
