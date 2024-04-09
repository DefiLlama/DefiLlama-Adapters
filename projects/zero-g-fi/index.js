const { nullAddress } = require("../helper/tokenMapping");

const ZGETH_ADDRESS = "0x17fdeB2fbB8089fea8a7BDb847E49ce67cF863df";
const ORACLE_ADDRESS = "0xAa6Fd6788fCA604AcFD3FE7e160Fbfcf4F0ef95C";
const LOCKBOX_ADDRESS = "0x742B5Cb1a6a10E568a79D70EF77b542663ED3e1a";
const ARBITRUM_ZGETH_ADDRESS = "0xA5E5A6724E99EaBd4CA236633AAb882B7658F287";
const ARBITRUM_ORACLE_ADDRESS = "0xae69f9AC9aC9302E2F97B313CaF1fB45a9bB18A6"
const OPTIMISM_BASE_ZGETH_ADDRESS = "0x4B9D5F4e95f6Fe93B4607BFdB43CB6b32cE47aa0";
const OPTIMISM_BASE_ORACLE_ADDRESS = "0x052c3De4979154C687eAc3865c6A7cC784328EfE";

async function ARBITRUM_TVL(api) {
  const totalSupply = await api.call({
    abi: "erc20:totalSupply",
    target: ARBITRUM_ZGETH_ADDRESS,
  });

  const lastPrice = await api.call({
    abi: "function lastPrice() external view returns (uint256)",
    target: ARBITRUM_ORACLE_ADDRESS,
  });

  api.add(nullAddress, (totalSupply * lastPrice) / 1e18);
}

async function OPTIMISM_TVL(api) {
  const totalSupply = await api.call({
    abi: "erc20:totalSupply",
    target: OPTIMISM_BASE_ZGETH_ADDRESS,
  });

  const lastPrice = await api.call({
    abi: "function lastPrice() external view returns (uint256)",
    target: OPTIMISM_BASE_ORACLE_ADDRESS,
  });

  api.add(nullAddress, (totalSupply * lastPrice) / 1e18);
}

async function BASE_TVL(api) {
  const totalSupply = await api.call({
    abi: "erc20:totalSupply",
    target: OPTIMISM_BASE_ZGETH_ADDRESS,
  });

  const lastPrice = await api.call({
    abi: "function lastPrice() external view returns (uint256)",
    target: OPTIMISM_BASE_ORACLE_ADDRESS,
  });

  api.add(nullAddress, (totalSupply * lastPrice) / 1e18);
}

async function ETHEREUM_TVL(api) {
  const totalSupply = await api.call({
    abi: "erc20:totalSupply",
    target: ZGETH_ADDRESS,
  });

  const lockBoxBalance = await api.call({
    abi: "erc20:totalSupply",
    target: ZGETH_ADDRESS,
    params: [LOCKBOX_ADDRESS],
  });

  const lastPrice = await api.call({
    abi: "function zgETHPrice() external view returns (uint256)",
    target: ORACLE_ADDRESS,
  });

  api.add(nullAddress, ((totalSupply - lockBoxBalance) * lastPrice) / 1e18);
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: ETHEREUM_TVL,
  },
  optimism: {
    tvl: OPTIMISM_TVL,
  },
  arbitrum: {
    tvl: ARBITRUM_TVL,
  },
  base: {
    tvl: BASE_TVL,
  },
}
