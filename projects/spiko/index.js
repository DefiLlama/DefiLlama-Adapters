const { multiCall } = require("../helper/chain/starknet");
const { decodeStrKey, SOROBAN_RPC_URL } = require("../helper/chain/stellar");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { post } = require("../helper/http");
const { getUniqueAddresses } = require("../helper/utils");

const rawConfig = {
  ethereum: [
    "0xe4880249745eAc5F1eD9d8F7DF844792D560e750", //USTBL
    "0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80", //EUTBL
    "0xf695Df6c0f3bB45918A7A82e83348FC59517734E", //UKTBL
    "0x4f33aCf823E6eEb697180d553cE0c710124C8D59", //SPKCC
    "0x3868D4e336d14D38031cf680329d31e4712e11cC", //eurSPKCC
    "0xcbade7d9bdee88411cb6cbcbb29952b742036992", //SAFO
    "0x0990b149e915cb08e2143a5c6f669c907eddc8b0", //eurSAFO
    "0xc273986a91e4bfc543610a5cb5860b7cfefb6cc0", //gbpSAFO
    "0x18b5c15e5196a38a162b1787875295b76e4313fb", //chfSAFO
  ],
  polygon: [
    "0xe4880249745eAc5F1eD9d8F7DF844792D560e750", //USTBL
    "0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80", //EUTBL
    "0x970E2aDC2fdF53AEa6B5fa73ca6dc30eAFEDfe3D", //UKTBL
    "0x903d5990119bc799423e9c25c56518ba7dd19474", //SPKCC
    "0x99F70A0e1786402a6796c6B0AA997ef340a5c6da", //eurSPKCC
    "0x6f64f47f95cf656f21b40e14798f6b49f80b3dc5", //SAFO
    "0x272ea767712cc4839f4a27ee35eb73116158c8a2", //eurSAFO
    "0x4fe515c67eeeadb3282780325f09bb7c244fe774", //gbpSAFO
    "0x9de2b2dcdcf43540e47143f28484b6d15118f089", //chfSAFO
  ],
  arbitrum: [
    "0x021289588cd81dC1AC87ea91e91607eEF68303F5", //USTBL
    "0xcbeb19549054cc0a6257a77736fc78c367216ce7", //EUTBL
    "0x903d5990119bC799423e9C25c56518Ba7DD19474", //UKTBL
    "0x99f70a0e1786402a6796c6b0aa997ef340a5c6da", //SPKCC
    "0x0e389C83Bc1d16d86412476F6103027555C03265", //eurSPKCC
    "0x0c709396739b9cfb72bcea6ac691ce0ddf66479c", //SAFO
    "0x1412632f2b89e87bfa20c1318a43ced25f1d7b76", //eurSAFO
    "0xbe023308ac2ef7e1c3799f4e6a3003ee6d342635", //gbpSAFO
    "0x97e7962bcd091e7ecfb583fc96289b1e1553ac6e", //chfSAFO
  ],
  base: [
    "0xe4880249745eAc5F1eD9d8F7DF844792D560e750", //USTBL
    "0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80", //EUTBL
    "0xA8De1f55Aa0E381cb456e1DcC9ff781eA0079068", //UKTBL
    "0xf695df6c0f3bb45918a7a82e83348fc59517734e", //SPKCC
    "0x4f33aCf823E6eEb697180d553cE0c710124C8D59", //eurSPKCC
    "0x0bb754d8940e283d9ff6855ab5dafbc14165c059", //SAFO
    "0xd879846cbe20751bde8a9342a3cca00a3e56ca47", //eurSAFO
    "0x2f6c0e5e06b43512706a9cdf66cd21f723fe0ec3", //gbpSAFO
    "0xd9aa2300e126869182dfb6ecf54984e4c687f36b", //chfSAFO
  ],
  etlk: [
    "0xe4880249745eAc5F1eD9d8F7DF844792D560e750", //USTBL
    "0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80", //EUTBL
    "0x970E2aDC2fdF53AEa6B5fa73ca6dc30eAFEDfe3D", //UKTBL
    "0x4f33aCf823E6eEb697180d553cE0c710124C8D59", //SPKCC
    "0x3868D4e336d14D38031cf680329d31e4712e11cC", //eurSPKCC
    "0x5677a4dc7484762ffccee13cba20b5c979def446", //SAFO
    "0x35dfec1813c43d82e6b87c682f560bbb8ea0c121", //eurSAFO
    "0xfe20ebe3881491b2e158b9d10cb95bcfa652262d", //gbpSAFO
    "0xef53e7d17822b641c6481837238a64a688709301", //chfSAFO
  ],
  starknet: [
    "0x020ff2f6021ada9edbceaf31b96f9f67b746662a6e6b2bc9d30c0d3e290a71f6", //USTBL
    "0x04f5e0de717daa6aa8de63b1bf2e8d7823ec5b21a88461b1519d9dbc956fb7f2", //EUTBL
    "0x0153d6e0462080bb2842109e9b64f589ef5aa06bb32b26bbdb894aca92674395", //UKTBL
    "0x04bade88e79a6120f893d64e51006ac6853eceeefa1a50868d19601b1f0a567d", //SPKCC
    "0x06472cabc51a3805975b9c60c7dec63897c9a287f2db173a1d6c589d18dd1e07", //eurSPKCC
    "0x0128f41ef8017ab56140ffad6439305a3196ed862841ba61ff4d78e380c346a6", //SAFO
    "0x035bdc17f7a7d09c45d31ab476a576d4f7aad916676b2948fe172c3bcb33725a", //eurSAFO
    "0x06e8a99926ff6d56f4cb93c37b63286d736cd1f81740d53f88b4875b4cbe7f49", //gbpSAFO
    "0x06723dcb428eddb160c5adfc2d0a5e5adc184bf6a7298780c3cbf3fa764f709b", //chfSAFO
  ],
};

const config = {
  ethereum: getUniqueAddresses(rawConfig.ethereum),
  polygon: getUniqueAddresses(rawConfig.polygon),
  arbitrum: getUniqueAddresses(rawConfig.arbitrum),
  base: getUniqueAddresses(rawConfig.base),
  etlk: getUniqueAddresses(rawConfig.etlk),
  starknet: getUniqueAddresses(rawConfig.starknet, true),
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
      contract: "CDT3KU6TQZNOHKNOHNAFFDQZDURVC3MSTL4ML7TUTZGNOPBZCLABP4FR",
      target: "0xf695Df6c0f3bB45918A7A82e83348FC59517734E",
    }, // UKTBL
    {
      contract: "CDS2GCAQTNQINSCJUJIVBJXILKBWP5PU7LOBGHMP3X47QCQBFKPMTCNT",
      target: "0x4f33acf823e6eeb697180d553ce0c710124c8d59",
    }, // SPKCC
    {
      contract: "CDWOB6T7SVSMMQN5V3P2OPTBAXOP7DAZHGVW3PYTZIKHVFKN6TBSXR6A",
      target: "0x3868D4e336d14D38031cf680329d31e4712e11cC",
    }, // eurSPKCC
    {
      contract: "CDGSC6BA4TCAOVSFQCUEHDMOIIHYYVNYBT6YEARS4MX3ITAHUINVGQHX",
      target: "0xcbade7d9bdee88411cb6cbcbb29952b742036992",
    }, // SAFO
    {
      contract: "CBOOCGZSVRSZFRE4U2NWR2B4RXYVJWRCBTGOUD2JPI2TDJPWMTJX7FZP",
      target: "0x0990b149e915cb08e2143a5c6f669c907eddc8b0",
    }, // eurSAFO
    {
      contract: "CAGYRRKPFSWKM6SJOE4QAAVYMOSHMDS5WOQ4T5A2E6XNCU7LZZKUNQKP",
      target: "0xc273986a91e4bfc543610a5cb5860b7cfefb6cc0",
    }, // gbpSAFO
    {
      contract: "CAJD2IBSP7VO2VYJQUYJSOGPJINTUYV7MQITINXVPTIH3CCLCUENNMW4",
      target: "0x18b5c15e5196a38a162b1787875295b76e4313fb",
    }, // chfSAFO
  ],
};

const STELLAR_LEDGER_ENTRY_CONTRACT_DATA = 6;
const STELLAR_SC_ADDRESS_TYPE_CONTRACT = 1;
const STELLAR_SCVAL_LEDGER_KEY_CONTRACT_INSTANCE = 20;
const STELLAR_CONTRACT_DATA_PERSISTENT = 1;

function buildContractInstanceKey(contract) {
  const payload = decodeStrKey(contract);
  const buf = Buffer.alloc(48);
  let offset = 0;
  buf.writeUInt32BE(STELLAR_LEDGER_ENTRY_CONTRACT_DATA, offset);
  offset += 4;
  buf.writeUInt32BE(STELLAR_SC_ADDRESS_TYPE_CONTRACT, offset);
  offset += 4;
  payload.copy(buf, offset);
  offset += 32;
  buf.writeUInt32BE(STELLAR_SCVAL_LEDGER_KEY_CONTRACT_INSTANCE, offset);
  offset += 4;
  buf.writeUInt32BE(STELLAR_CONTRACT_DATA_PERSISTENT, offset);
  return buf.toString("base64");
}

function parseTotalSupplyFromEntry(xdr) {
  const buf = Buffer.from(xdr, "base64");
  const marker = Buffer.from("TotalSupply");
  const idx = buf.indexOf(marker);
  if (idx === -1) throw new Error("TotalSupply not found in contract storage");
  const len = buf.readUInt32BE(idx - 4);
  let offset = idx + len;
  offset += (4 - (len % 4)) % 4;
  const type = buf.readUInt32BE(offset);
  if (type !== 10) throw new Error("Unexpected TotalSupply type");
  const hi = buf.readBigInt64BE(offset + 4);
  const lo = buf.readBigUInt64BE(offset + 12);
  let value = (hi << 64n) + lo;
  if (hi < 0n) value = -(((-hi) << 64n) - lo);
  return value.toString();
}

async function fetchStellarSupply(contract) {
  const key = buildContractInstanceKey(contract);
  const data = await post(SOROBAN_RPC_URL, {
    jsonrpc: "2.0",
    id: 1,
    method: "getLedgerEntries",
    params: { keys: [key] },
  });
  const entry = data?.result?.entries?.[0];
  if (!entry?.xdr) throw new Error(`Missing contract data for ${contract}`);
  return parseTotalSupplyFromEntry(entry.xdr);
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
      let supplies;
      if (chain === "starknet")
        supplies = await multiCall({ abi: totalSupplyAbi, calls: assets });
      else
        supplies = await api.multiCall({
          abi: "erc20:totalSupply",
          calls: assets,
        });
      api.add(assets, supplies);
      return sumTokens2({ api });
    },
  };
});
