const sdk = require("@defillama/sdk");
const { queryV1Beta1 } = require("../helper/terra");
const { getBlock } = require("../helper/getBlock");

const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const riskHarborOzoneAddress = "terra1dlfz2teqt5shxuw87npfecjtv7xlrxvqd4sapt";
const riskHarborOzoneAddress2 = "terra1h6t8gx7jvc2ens9nrxcf9vqylzquey75e2wvzt";

async function terra(timestamp, ethBlock, chainBlocks) {
  // const block = await getBlock(timestamp, "terra", chainBlocks);
  let block
  const balances = { terrausd: 0 };
  let paginationKey;

  do {
    const data = await queryV1Beta1(
      `bank/v1beta1/balances/${riskHarborOzoneAddress}`,
      paginationKey,
      block
    );

    paginationKey = data.pagination.next_key;

    data.balances.forEach(({ denom, amount }) => {
      /**
       * 3/10/2022 - As of now the only supported underwriting token for Risk Harbor Ozone is UST, so
       * balances should always be an array of length 1. Added support for dynamic balances length, denom checking, and pagination for
       * future proofing and safety.
       */
      if (denom === "uusd") {
        balances["terrausd"] += parseInt(amount) / 1e6;
      }
    });
  } while (paginationKey);

  let paginationKey2

  do {
    const data2 = await queryV1Beta1(
      `bank/v1beta1/balances/${riskHarborOzoneAddress2}`,
      paginationKey,
      block
    );

    paginationKey2 = data2.pagination.next_key;

    data2.balances.forEach(({ denom, amount }) => {
      /**
       * 3/10/2022 - As of now the only supported underwriting token for Risk Harbor Ozone is UST, so
       * balances should always be an array of length 1. Added support for dynamic balances length, denom checking, and pagination for
       * future proofing and safety.
       */
      if (denom === "uusd") {
        balances["terrausd"] += parseInt(amount) / 1e6;
      }
    });
  } while (paginationKey2);

  return balances;
};

async function eth(timestamp, block, chainBlocks) {
  return {
    [USDC]: (await sdk.api.abi.multiCall({
      abi: 'erc20:balanceOf',
      calls: [{
        params: '0x8529687adD661120C9E23E366Cc7F545f1A03ADf'
      }, {
        params: '0x0881Ec8e0e743906E1c1dFeE8Ae12BfDc0611b24'
      }],
      target: USDC,
      block,
    })).output.map(b => b.output).reduce((a, b) => a + parseFloat(b), 0)
  };
};

async function arbi(timestamp, block, chainBlocks) {
  return {
    [USDC]: (await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      params: '0x207472891AF32F5636c35d9ca8e17464Df7108bB',
      target: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      chain: "arbitrum",
      block: chainBlocks.arbitrum,
    })).output
  };
};

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "Amount of underwriter capital inside the protocol",
  terra: {
    tvl: terra,
  },
  arbitrum: {
    tvl: arbi
  },
  ethereum: {
    tvl: eth
  }
};
