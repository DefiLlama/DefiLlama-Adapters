const sdk = require("@defillama/sdk");

const config = {
  ethereum: {
    userManager: "0x49c910Ba694789B58F53BFF80633f90B8631c195",
    underlying: "0x6b175474e89094c44da98b954eedeac495271d0f",
    uToken: "0x954F20DF58347b71bbC10c94827bE9EbC8706887",
  },
  arbitrum: {
    userManager: "0xb71F3D4342AaE0b8D531E14D2CF2F45d6e458A5F",
    underlying: "0x6b175474e89094c44da98b954eedeac495271d0f",
    uToken: "0x954F20DF58347b71bbC10c94827bE9EbC8706887",
  },
  optimism: {
    userManager: "0x8E195D65b9932185Fcc76dB5144534e0f3597628",
    underlying: "0x6b175474e89094c44da98b954eedeac495271d0f",
    uToken: "0xE478b5e7A423d7CDb224692d0a816CA146A744b2",
  },
  base: {
    userManager: "0xfd745A1e2A220C6aC327EC55d2Cb404CD939f56b",
    underlying: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    uToken: "0xc2447f36FfdA08E278D25D08Ea91D942f0C2d6ea",
  },
};

const abi = {
  totalStaked: {
    inputs: [],
    name: "totalStaked",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  totalRedeemable: {
    inputs: [],
    name: "totalRedeemable",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  totalReserves: {
    inputs: [],
    name: "totalReserves",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  totalBorrows: {
    inputs: [],
    name: "totalBorrows",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
};

function tvl(chain) {
  return async function (_, __, chainBlocks) {
    const chainBlock = chainBlocks[chain];

    const { userManager, uToken } = config[chain];

    const totalStaked = (
      await sdk.api.abi.call({
        abi: abi.totalStaked,
        target: userManager,
        params: [],
        chain,
        block: chainBlock,
      })
    ).output;

    const totalRedeemable = (
      await sdk.api.abi.call({
        abi: abi.totalRedeemable,
        target: uToken,
        params: [],
        chain,
        block: chainBlock,
      })
    ).output;

    const totalReserves = (
      await sdk.api.abi.call({
        abi: abi.totalReserves,
        target: uToken,
        params: [],
        chain,
        block: chainBlock,
      })
    ).output;

    const total = [totalStaked, totalRedeemable, totalReserves].reduce(
      (acc, n) => Number(n) + Number(acc),
      0
    );

    return {
      [config[chain].underlying]: total,
    };
  };
}

function borrowing(chain) {
  return async function (_, __, chainBlocks) {
    const chainBlock = chainBlocks[chain];

    const { uToken } = config[chain];

    const totalBorrows = (
      await sdk.api.abi.call({
        abi: abi.totalBorrows,
        target: uToken,
        params: [],
        chain,
        block: chainBlock,
      })
    ).output;

    return {
      [config[chain].underlying]: totalBorrows,
    };
  };
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "Counts the tokens locked in the contracts to be used to underwrite or to borrow. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted.",
  ethereum: {
    tvl: tvl("ethereum"),
    borrowed: borrowing("ethereum"),
  },
  arbitrum: {
    tvl: tvl("arbitrum"),
    borrowed: borrowing("arbitrum"),
  },
  optimism: {
    tvl: tvl("optimism"),
    borrowed: borrowing("optimism"),
  },
  base: {
    tvl: tvl("base"),
    borrowed: borrowing("base"),
  },
};
