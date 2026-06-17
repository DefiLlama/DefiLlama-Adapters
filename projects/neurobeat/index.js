// NeuroBeat — on-chain game TVL adapter
// Chain: Cronos (EVM, chain ID 25)
// Contract: NeuroBeatIsland.sol — collects CRO entry fees from players,
//           pools them and distributes weekly prizes on-chain.
// TVL = native CRO balance held in the contract at any given block.

const NEUROBEAT_CONTRACT = '0xDeb77dAf2A427fee514CE53143e407276BBf1F45';

async function tvl(api) {
  const balance = await api.provider.getBalance(NEUROBEAT_CONTRACT);
  api.addCGToken('crypto-com-chain', Number(balance) / 1e18);
}

module.exports = {
  methodology:
    'TVL counts the native CRO held inside the NeuroBeat game contract ' +
    '(0xDeb77dAf2A427fee514CE53143e407276BBf1F45). ' +
    'Players pay a CRO entry fee; funds accumulate in the contract and are ' +
    'distributed as weekly prizes via on-chain setPrizes() calls.',
  cronos: {
    tvl,
  },
};
