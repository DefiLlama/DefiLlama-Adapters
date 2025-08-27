const ADDRESSES = require('../helper/coreAssets.json')
const abi = {
  "underlying": "address:underlying",
  "underlyingBalance": "uint256:underlyingBalance",
  "totalBorrowed": "uint256:totalBorrowed",
  "totalReserve": "uint256:totalReserve"
}

const poolAddresses = [
  "0x50bE5fE4de4efC3A0adAc6587254836972055423", //palCOMP
  "0x7835d976516F82cA8a3Ed2942C4c6F9C4E44bb74", //palUNI
  "0x7ba283b1dDCdd0ABE9D0d3f36345645754315978", //palAAVE
  "0xCDc3DD86C99b58749de0F697dfc1ABE4bE22216d" //palStkAAVE
]

async function ethTvl(api) {

  let calls = poolAddresses

  let underlyingTokens = await api.multiCall({ calls, abi: abi["underlying"], })
  let underlyingBalances = await api.multiCall({ calls, abi: abi["underlyingBalance"], });
  let totalBorrowed = await api.multiCall({ calls, abi: abi["totalBorrowed"], });
  let totalReserve = await api.multiCall({ calls, abi: abi["totalReserve"], })

  for (let i = 0; i < poolAddresses.length; i++) {
    let token = underlyingTokens[i];

    //If stkAAVE address then change token address to AAVE address
    if (token === "0x4da27a545c0c5B758a6BA100e3a049001de870f5") {
      token = ADDRESSES.ethereum.AAVE;
    }
    const tvl = +underlyingBalances[i] + +totalBorrowed[i] - +totalReserve[i];
    api.add(token, tvl)
  }
}

module.exports = {
  methodology: "TVL = cash + borrowed - reserve",
  ethereum: {
    tvl: ethTvl,
  },
};
