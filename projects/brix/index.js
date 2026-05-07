const ITRY  = '0x996ce957408804fec19237d866799d9c7076e48c';
const WITRY = '0x15b271d9012b5820fc42b1c495b4c1e206547de5';

async function tvl(api) {
  const iTrySupply  = await api.call({ abi: 'erc20:totalSupply', target: ITRY });
  const wiTrySupply = await api.call({ abi: 'erc20:totalSupply', target: WITRY });
  api.add(ITRY,  iTrySupply);
  api.add(WITRY, wiTrySupply);
}

module.exports = {
  megaeth: { tvl },
  methodology: 'Counts total supply of iTRY and wiTRY on MegaETH, backed by Turkish sovereign money market funds.',
}; 

