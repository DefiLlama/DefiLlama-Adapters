const { L1TroveAbi } = require('./abi');
const { multiCall } = require('@defillama/sdk/build/abi');

const TROVE_HIGH_RISK = "0xEF3cf0ede2cA738A8Bd0c38fd5D43DC639B41532";
const TROVE_MEDIUM_RISK = "0x4cdB2fdE85Da92Dbe9b568dda2Cc22d426b0b642";
const TROVE_MANAGER = "0xA39739EF8b0231DbFA0DcdA07d7e29faAbCf4bb2";
const ETH_L2_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

async function tvl(_, _1, _2, { api }) {
  const calls = [{params: [TROVE_HIGH_RISK]}, {params: [TROVE_MEDIUM_RISK]}];
    
    var tvl = 0;
    const multicallResponse = await multiCall({
      abi: L1TroveAbi.getEntireDebtAndColl,
      calls: calls,
      target: TROVE_MANAGER,
      chain: 'ethereum'
    });

    multicallResponse.output.forEach(response => {
      tvl += Number(response.output.coll);
    });
    api.addToken(ETH_L2_ADDRESS, tvl);
}

module.exports = {
    methodology: "The TVL is calculated as a sum of total assets deposited into the Trove contracts.",
    starknet: {
        tvl,
    },
};