const PHALA_TOKEN_CONTRACT = '0x6c5bA91642F10282b576d91922Ae6448C9d52f4E';
const SYGMA_ERC20_HANDLER = '0xC832588193cd5ED2185daDA4A531e0B26eC5B830';

async function tvl(_, _1, _2, { api }) {
  console.log("Calling the PHALA token contract for balance...");
  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: PHALA_TOKEN_CONTRACT,
    params: [SYGMA_ERC20_HANDLER],
  });

  console.log(`Collateral Balance: ${collateralBalance}`);

  api.add(PHALA_TOKEN_CONTRACT, collateralBalance)
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Counts the number of PHALA tokens held by the Sygma ERC-20 Handler.',
  start: 1000235,
  ethereum: {
    tvl,
  }
};

console.log("SDK Adapter for Sygma Protocol initiated.");
