const portalsContractAddress = "0x24b7d3034C711497c81ed5f70BEE2280907Ea1Fa";
const timeRiftContractAddress = "0x6df4EF024089ab148078fdD88f5BF0Ee63248D3E";
const hlpToken = "0x4307fbDCD9Ec7AEA5a1c2958deCaa6f316952bAb";
const flashToken = "0xc628534100180582E43271448098cb2c185795BD";

async function tvl(api) {
  const portalsStaked = await api.call({ target: portalsContractAddress, abi: "uint256:totalPrincipalStaked", });
  api.add(hlpToken, portalsStaked)
  return api.sumTokens({ owner: timeRiftContractAddress, tokens: [flashToken] })
}

module.exports = {
  methodology: "TVL is equal to the amount staked in the Portals and TimeRift contracts",
  arbitrum: { tvl },
};