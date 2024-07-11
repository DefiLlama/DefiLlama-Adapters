const PEPE_TOKEN_CONTRACT = '0x6982508145454Ce325dDbE47a25d4ec3d2311933';
const MOG_TOKEN_CONTRACT = '0xaaeE1A9723aaDB7afA2810263653A34bA2C21C7a';
const BITCOIN_TOKEN_CONTRACT = '0x72e4f9f808c49a2a61de9c5896298920dc4eeea9';
const MONEY_MARKETS_CONTRACT = '0x83b7D15588A01aB37C55290fB600A5fC4d7201bf'; //rn its miffy wallet for testing

async function tvl(api) {
  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: PEPE_TOKEN_CONTRACT,
    params: [MONEY_MARKETS_CONTRACT],
  });

  const collateralBalanceMog = await api.call({
    abi: 'erc20:balanceOf',
    target: MOG_TOKEN_CONTRACT,
    params: [MONEY_MARKETS_CONTRACT],
  });

  const collateralBalanceBitcoin = await api.call({
    abi: 'erc20:balanceOf',
    target: BITCOIN_TOKEN_CONTRACT,
    params: [MONEY_MARKETS_CONTRACT],
  });

  

  api.add(PEPE_TOKEN_CONTRACT, collateralBalance);
  api.add(MOG_TOKEN_CONTRACT, collateralBalance);
  api.add(BITCOIN_TOKEN_CONTRACT, collateralBalance);
}

module.exports = {
  methodology: 'Sums the value of deposited memes',
  start: 1000235,
  ethereum: {
    tvl,
  }
}; 