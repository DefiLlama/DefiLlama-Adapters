const USSI_CONTRACT = '0x3a46ed8FCeb6eF1ADA2E4600A522AE7e24D2Ed18';

async function tvl(api) {
  const balances = await api.call({ abi: 'erc20:totalSupply', target: USSI_CONTRACT});
  api.add(USSI_CONTRACT, balances);
}

// the vaults are here https://github.com/DefiLlama/DefiLlama-Adapters/pull/12893#issuecomment-2577690389

module.exports = {
    methodology: 'TVL counts the USSI tokens minted.',
    start: 23863972,
    base: {
      tvl,
    }
  };