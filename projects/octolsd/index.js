const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs } = require("../helper/cache/getLogs");
const { staking } = require("../helper/staking");

const POOL_CONTRACT = "0x7f885c6c9f847a764d247056ed4d13dc72cef7d0";
const OCTO_ETH_LP_ADDRESS = "0xFe4cd8B965353de5fac7c0Cb041B75f5e238B413";
const OCTO_ADDRESS = "0x52dec19feef469d7a683963b7380ecd0b1aff9c7";

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: POOL_CONTRACT,
    topics: ["0x18caa0724a26384928efe604ae6ddc99c242548876259770fc88fcb7e719d8fa",],
    eventAbi: "event AddPool (uint256 indexed pid, uint256 rewardToken, address indexed stakingToken, bool isRegular)",
    onlyArgs: true,
    fromBlock: 17209964,
  });

  const lsdAddresses = logs.map((i) => i.stakingToken);
  return sumTokens2({ api, owner:POOL_CONTRACT , tokens: lsdAddresses, blacklistedTokens: [OCTO_ADDRESS, OCTO_ETH_LP_ADDRESS]});

}

module.exports = {
  ethereum: {
    methodology:
      "TVL of Staked ETH & LSD tokens, with pool2 including value of staked OCTO/ETH Uniswap-V2 LP tokens",
    tvl,
    pool2: staking([POOL_CONTRACT], [OCTO_ETH_LP_ADDRESS]),
  },
};
