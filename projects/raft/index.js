const ADDRESSES = require("../helper/coreAssets.json");
const { staking } = require("../helper/staking.js");

const RAFT_BPT = "0xe91888a1D08E37598867d213a4ACB5692071BB3a";
const VERAFT = "0x45D117011da1D49bA86aF6CEd94126488084186f";
const RAFT_POSITION_MANAGER = "0x5f59b322eb3e16a0c78846195af1f588b77403fc";
const INTEREST_RATE_POSITION_MANAGER_ADDRESS = '0x9AB6b21cDF116f611110b048987E58894786C244';
const RAFT_PSM = "0xa03342feb2e1d4690b60ef556509ec3b76c97ee7";
const WRAPPED_RETH = "0xb69e35fb4a157028b92f42655090b984609ae598";
const CHAI = "0x06af07097c9eeb7fd685c692751d5c66db49c215";
const SWETH = '0xf951E335afb289353dc249e82926178EaC7DEd78'

async function tvl(api) {
  const rEthBalanceV1 = await api.call({ target: WRAPPED_RETH, abi: "erc20:balanceOf", params: RAFT_POSITION_MANAGER, });
  const chaiBalance = await api.call({ target: CHAI, abi: "erc20:balanceOf", params: RAFT_PSM, });
  const potAddress = await api.call({ target: CHAI, abi: "address:pot", });
  const chaiRate = await api.call({ target: potAddress, abi: "uint256:chi", });
  const daiBalance = chaiBalance * chaiRate / 1e27;

  api.add(ADDRESSES.ethereum.DAI, daiBalance)
  api.add(ADDRESSES.ethereum.RETH, rEthBalanceV1)

  return api.sumTokens({ ownerTokens: [
    [
      [
        ADDRESSES.ethereum.RETH,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.WSTETH,
        ADDRESSES.ethereum.cbETH,
        ADDRESSES.ethereum.WBTC,
        SWETH,
      ],
      INTEREST_RATE_POSITION_MANAGER_ADDRESS,
    ],
    [[ADDRESSES.ethereum.WSTETH], RAFT_POSITION_MANAGER],
  ]})
}

module.exports = {
  ethereum: {
    tvl,
    staking: staking(VERAFT, RAFT_BPT)
  },
};
