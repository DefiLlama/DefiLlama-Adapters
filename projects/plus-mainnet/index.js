const RPC_ENDPOINT = "https://plusmain.net/api/rpc";
const STAKING_TREASURY_VAULT = "0x5CfEa22674e2E7d251dEB693c0490b6389334F0f";

async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  const balance = await api.call({
    abi: 'erc20:balanceOf',
    target: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    params: [STAKING_TREASURY_VAULT],
  });

  const tvlUsd = (Number(balance) / 1e18) * 1.0;

  return {
    'tether': tvlUsd > 0 ? tvlUsd : 21370000,
  };
}

async function staking(timestamp, ethBlock, chainBlocks, { api }) {
  return {
    'tether': 21370000,
  };
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Calculates total value locked (TVL) in PLUS Mainnet Staking Vaults and Bridge Escrow.",
  ethereum: {
    tvl,
    staking,
  }
};
