const TOKEN_ADDRESS = "0xF75C7a59bCD9bd207C4Ab1BEB0b32EEd3B6392f3";
const STAKING_CONTRACT = '0x463beb323b229d52F530Be23C2E829C78904D8a8'

async function staking(_, _b, _cb, { api, }) {
  const bal = await api.call({  abi: 'uint256:totalValue', target: STAKING_CONTRACT})
  api.add(TOKEN_ADDRESS, bal)
}

module.exports = {
  ethereum: {
    tvl: () => 0,
    staking
  }
};
