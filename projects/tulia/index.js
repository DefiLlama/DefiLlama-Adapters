// Currently Testnet Ethereum Holesky, Base Sepolia, Avalanche Fuji, Base Testnet , BSC Testnet, Arbitrum Sepolia, Optimism Sepolia
const TULIA_CONTRACT_ADDRESS = '0x5a27651600F4115FE966b9bb72DB3F28e2bBAb54'; // The main contract address for Tulia
const TULIA_TOKEN_ADDRESS = '0xF401B345175E19b9705fb186B474982C76e7b80f'; // Address of Tulia's token

async function tvl(api) {
  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: TULIA_TOKEN_ADDRESS,
    params: [TULIA_CONTRACT_ADDRESS],
  });

  api.add(TULIA_CONTRACT_ADDRESS, collateralBalance)
}

module.exports = {
    methodology: "Measures the amount of Tulia tokens locked in the contract to represent TVL.",
  start: 1000235,
  ethereum: {
    tvl,
  }
}; 