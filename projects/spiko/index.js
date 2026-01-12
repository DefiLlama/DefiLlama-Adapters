const { multiCall } = require("../helper/chain/starknet");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { rpc, xdr, scValToNative } = require("@stellar/stellar-sdk");

const config = {
  polygon: [
    "0xe4880249745eAc5F1eD9d8F7DF844792D560e750", //USTBL
    "0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80", //EUTBL
    "0x903d5990119bc799423e9c25c56518ba7dd19474", //SPKCC
    "0x99F70A0e1786402a6796c6B0AA997ef340a5c6da", //eurSPKCC
    "0x970E2aDC2fdF53AEa6B5fa73ca6dc30eAFEDfe3D", //UKTBL
  ],
  ethereum: [
    "0xe4880249745eAc5F1eD9d8F7DF844792D560e750", //USTBL
    "0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80", //EUTBL
    "0x4f33acf823e6eeb697180d553ce0c710124c8d59", //SPKCC
    "0x3868D4e336d14D38031cf680329d31e4712e11cC", //eurSPKCC
    "0xf695Df6c0f3bB45918A7A82e83348FC59517734E", //UKTBL
  ],
  arbitrum: [
    "0x021289588cd81dC1AC87ea91e91607eEF68303F5", //USTBL
    "0xcbeb19549054cc0a6257a77736fc78c367216ce7", //EUTBL
    "0x99f70a0e1786402a6796c6b0aa997ef340a5c6da", //SPKCC
    "0x0e389C83Bc1d16d86412476F6103027555C03265", //eurSPKCC
    "0x903d5990119bC799423e9C25c56518Ba7DD19474", //UKTBL
  ],
  base: [
    "0xe4880249745eAc5F1eD9d8F7DF844792D560e750", //USTBL
    "0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80", //EUTBL
    "0xf695df6c0f3bb45918a7a82e83348fc59517734e", //SPKCC
    "0x4f33aCf823E6eEb697180d553cE0c710124C8D59", //eurSPKCC
    "0xA8De1f55Aa0E381cb456e1DcC9ff781eA0079068", //UKTBL
  ],
  starknet: [
    {
      contract:
        "0x020ff2f6021ada9edbceaf31b96f9f67b746662a6e6b2bc9d30c0d3e290a71f6",
      target: "0xe4880249745eAc5F1eD9d8F7DF844792D560e750",
    }, // USTBL
    {
      contract:
        "0x04f5e0de717daa6aa8de63b1bf2e8d7823ec5b21a88461b1519d9dbc956fb7f2",
      target: "0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80",
    }, // EUTBL
    {
      contract:
        "0x04bade88e79a6120f893d64e51006ac6853eceeefa1a50868d19601b1f0a567d",
      target: "0x4f33acf823e6eeb697180d553ce0c710124c8d59",
    }, // SPKCC
    {
      contract:
        "0x06472cabc51a3805975b9c60c7dec63897c9a287f2db173a1d6c589d18dd1e07",
      target: "0x3868D4e336d14D38031cf680329d31e4712e11cC",
    }, // eurSPKCC
    {
      contract:
        "0x0153d6e0462080bb2842109e9b64f589ef5aa06bb32b26bbdb894aca92674395",
      target: "0xf695Df6c0f3bB45918A7A82e83348FC59517734E",
    }, // UKTBL
  ],
  etlk: [
    "0xe4880249745eAc5F1eD9d8F7DF844792D560e750", //USTBL
    "0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80", //EUTBL
    "0x4f33aCf823E6eEb697180d553cE0c710124C8D59", //SPKCC
    "0x3868D4e336d14D38031cf680329d31e4712e11cC", //eurSPKCC
    "0x970E2aDC2fdF53AEa6B5fa73ca6dc30eAFEDfe3D", //UKTBL
  ],
  stellar: [
    {
      contract: "CARUUX2FZNPH6DGJOEUFSIUQWYHNL5AVDV7PMVSHWL7OBYIBFC76F4TO",
      target: "0xe4880249745eAc5F1eD9d8F7DF844792D560e750",
    }, // USTBL
    {
      contract: "CBGV2QFQBBGEQRUKUMCPO3SZOHDDYO6SCP5CH6TW7EALKVHCXTMWDDOF",
      target: "0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80",
    }, // EUTBL
    {
      contract: "CDWOB6T7SVSMMQN5V3P2OPTBAXOP7DAZHGVW3PYTZIKHVFKN6TBSXR6A",
      target: "0x3868D4e336d14D38031cf680329d31e4712e11cC",
    }, // eurSPKCC
    {
      contract: "CDS2GCAQTNQINSCJUJIVBJXILKBWP5PU7LOBGHMP3X47QCQBFKPMTCNT",
      target: "0x4f33acf823e6eeb697180d553ce0c710124c8d59",
    }, // SPKCC
    {
      contract: "CDT3KU6TQZNOHKNOHNAFFDQZDURVC3MSTL4ML7TUTZGNOPBZCLABP4FR",
      target: "0xf695Df6c0f3bB45918A7A82e83348FC59517734",
    }, // UKTBL
  ],
};

const STELLAR_RPC_URL = "https://soroban-rpc.creit.tech/";
const stellarRpc = new rpc.Server(STELLAR_RPC_URL);

async function fetchStellarSupply(contract) {
  // SACs store TotalSupply in the contract instance storage.
  const response = await stellarRpc.getContractData(
    contract,
    xdr.ScVal.scvLedgerKeyContractInstance(),
    rpc.Durability.Persistent
  );
  const instance = scValToNative(response.val.value().val());
  const storage = instance?._attributes?.storage || [];
  for (const entry of storage) {
    const key = scValToNative(entry._attributes.key);
    if (key === "TotalSupply" || (Array.isArray(key) && key[0] === "TotalSupply")) {
      const supply = scValToNative(entry._attributes.val);
      if (typeof supply === "bigint") return supply.toString();
      return supply;
    }
  }
  throw new Error(`TotalSupply not found for ${contract}`);
}

const totalSupplyAbi = {
  name: "totalSupply",
  type: "function",
  inputs: [],
  outputs: [
    {
      name: "totalSupply",
      type: "uint256",
    },
  ],
  stateMutability: "view",
};

Object.keys(config).forEach((chain) => {
  const assets = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      if (chain === "stellar") {
        const supplies = await Promise.all(
          assets.map(({ contract }) => fetchStellarSupply(contract))
        );
        supplies.forEach((supply, i) => {
          const { target } = assets[i];
          api.add(`ethereum:${target}`, supply, { skipChain: true });
        });
        return api.getBalances();
      }
      if (chain === "starknet") {
        const supplies = await multiCall({
          abi: totalSupplyAbi,
          calls: assets.map(({ contract }) => contract),
        });
        supplies.forEach((supply, i) => {
          const { target } = assets[i];
          api.add(`ethereum:${target}`, supply, { skipChain: true });
        });
        return api.getBalances();
      }
      let supplies;
      supplies = await api.multiCall({
        abi: "erc20:totalSupply",
        calls: assets,
      });
      api.add(assets, supplies);
      return sumTokens2({ api });
    },
  };
});
