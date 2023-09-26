const CONTRACT_ETH_BRIDGE= "0xcee284f754e854890e311e3280b767f80797180d";
const CONTRACT_ETH_FLR= "0x5e5d9aeec4a6b775a175b883dca61e4297c14ecb";
const CONTRACT_ETH_EURS = "0xdb25f211ab05b1c97d595516f45794528a807ad8"; //EURS

const CONTRACT_ARB_BRIDGE= "0x";
const CONTRACT_ARB_FLR= "0x9B6226dd0191a77d032F56A6d383044EE99944C3";
const CONTRACT_ARB_EURS = "0xfa5ed56a203466cbbc2430a43c66b9d8723528e7"; //agEUR 

async function getBorrowed(tokenAddress, bridgeAddress, { api }) {
  const totalSupply = await api.call({ 
    abi: "function totalSupply() external view returns (uint256)",
    target: tokenAddress
  });

  const bridgeBalance = await api.call({ 
    abi: "function balanceOf(address account) view returns (uint256)",
    target: tokenAddress,
    params: [bridgeAddress]
  });

  return (totalSupply - bridgeBalance);
}

async function borrowedETH(_, _1, _2, { api }) {
  const borrowed = await getBorrowed(CONTRACT_ETH_FLR, CONTRACT_ETH_BRIDGE, { api });
  api.add(CONTRACT_ETH_EURS, (borrowed / 1e16));
}

async function borrowedARB(_, _1, _2, { api }) {
  const borrowed = await getBorrowed(CONTRACT_ARB_FLR, CONTRACT_ARB_BRIDGE, { api });
  api.add(CONTRACT_ARB_EURS, (borrowed / 1e16));
}
 
module.exports = {
  methodology: "Data is retrieved on-chain by subtracting the balance of FlorinToken in the BridgeContract from the total supply of FlorinToken. The result is the total amount borrowed.",
  ethereum: { start: 16077400, borrowed: borrowedETH, tvl: () => ({}) },
  //arbitrum: { start: 126183410, borrowed: borrowedARB, tvl: () => ({}) },
}
