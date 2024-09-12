const ADDRESSES = require("../helper/coreAssets.json");

const DEUSD_LP_STAKING = "0xC7963974280261736868f962e3959Ee1E1B99712";
const COMMITS = "0x4265f5D6c0cF127d733EeFA16D66d0df4b650D53";
const FOUNDATION = "0x4B4EEC1DDC9420a5cc35a25F5899dC5993f9e586";

const pools = [
  "0xb478Bf40dD622086E0d0889eeBbAdCb63806ADde", // DEUSD/DAI Curve LP
  "0x88DFb9370fE350aA51ADE31C32549d4d3A24fAf2", // DEUSD/FRAX Curve LP
  "0x5F6c431AC417f0f430B84A666a563FAbe681Da94", // DEUSD/USDC Curve LP
  "0x7C4e143B23D72E6938E06291f705B5ae3D5c7c7C", // DEUSD/USDT Curve LP
];

const tvl = async (api) => {
  const calls = pools.map((p) => ({ target: p, params: [DEUSD_LP_STAKING] }));
  const [deusdSupply, lpSupplies] = await Promise.all([
    api.call({ target: ADDRESSES.ethereum.DEUSD, abi: "erc20:totalSupply" }),
    api.multiCall({ abi: "erc20:balanceOf", calls }),
  ]);

  api.add(ADDRESSES.ethereum.DEUSD, deusdSupply);
  api.sumTokens({ owner: COMMITS, tokens: [ADDRESSES.null] });
  api.sumTokens({ owner: FOUNDATION, tokens: [ADDRESSES.ethereum.STETH] });
  lpSupplies.forEach((supply, i) => { api.add(pools[i], supply) })
};

module.exports = {
  ethereum: {
    tvl,
    //     tvl: async (api) => {
    //         // DEUSD
    //         const supply = await api.call({ abi: 'erc20:totalSupply', target: ADDRESSES.ethereum.DEUSD })
    //         api.add(ADDRESSES.ethereum.DEUSD, supply)

    //         // DEUSD/DAI Curve LP
    //         api.add(ADDRESSES.ethereum.DAI, await getLpTvl(api, '0xb478Bf40dD622086E0d0889eeBbAdCb63806ADde', ADDRESSES.ethereum.DAI))
    //         // DEUSD/FRAX Curve LP
    //         api.add(ADDRESSES.ethereum.FRAX, await getLpTvl(api, '0x88DFb9370fE350aA51ADE31C32549d4d3A24fAf2', ADDRESSES.ethereum.FRAX))
    //         // DEUSD/USDC Curve LP
    //         api.add(ADDRESSES.ethereum.USDC, await getLpTvl(api, '0x5F6c431AC417f0f430B84A666a563FAbe681Da94', ADDRESSES.ethereum.USDC))
    //         // DEUSD/USDT Curve LP
    //         api.add(ADDRESSES.ethereum.USDT, await getLpTvl(api, '0x7C4e143B23D72E6938E06291f705B5ae3D5c7c7C', ADDRESSES.ethereum.USDT))

    //         // ETH Commits
    //         await api.sumTokens({ owner: COMMITS, tokens: [ADDRESSES.null] })
    //         // stETH Commits
    //         await api.sumTokens({ owner: FOUNDATION, tokens: [ADDRESSES.ethereum.STETH] })
    //     }
  },
};
