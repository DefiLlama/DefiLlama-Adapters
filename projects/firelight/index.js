const STXRP = "0x4C18Ff3C89632c3Dd62E796c0aFA5c07c4c1B2b3";
const FXRP = "0xad552a648c74d49e10027ab8a618a3ad4901c5be";

async function tvl(api) {
  const totalSupply = await api.call({ abi: "uint256:totalSupply", target: STXRP });
  api.add(FXRP, totalSupply);
}

module.exports = {
  flare: {
    tvl,
  },
  methodology: "Counts total stXRP supply.",
};
