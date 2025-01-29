const abi = {
  "totalValue": "function totalValue() view returns (uint256 balance)"
};

const token = "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38";
const vault = "0xe5203Be1643465b3c0De28fd2154843497Ef4269";

const sTvl = async (api) => {
  const bal = await api.call({ abi: abi.totalValue, target: vault });
  api.add(token, bal);
  
}

module.exports = {
  sonic: {
    tvl: sTvl
  },
};
