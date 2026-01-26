const { cexExports } = require("../helper/cex");

const config = {
  bitcoin: {
    owners: [
      "3PUAxZ26mF8Ub1oQrc7TK7NvTe93KaNQZP",
      "bc1q068k89wp2dt3v7wrp8uyscd3llvz6tytz3ve8pd4e2f6z9a5kdjqtqe505",
    ],
  },
  ethereum: {
    owners: [
      "0x7ce3ec6845780e8f69b1a19edf8148d7cbb77a7d",
      "0x556C26A8d2a27e1e50Ee7D72b1938f9D794FaAe7",
      "0x05CdB1526F6e224e02919a4C018D9784Ea25eb3d",
      "0x630910471EFf63C5fbD1fDFf745BE3851d341Cb8",
    ],
  },
  avax: {
    owners: [
      "0x05CdB1526F6e224e02919a4C018D9784Ea25eb3d",
      "0xb1FB90a68E5C04284B2863e3b1dbDa1aeC5E8E48",
      "0xadE4a6383A3339c3Fbde1BDa1829b73CD3374C43",
      "0x92a8e66c04D70290Ad8520A87e1639b6c99A0fF3",
      "0x8D23DC08E5774118A5E3E226c9233E94E48c4d1f",
      "0x0d1098C86b8BA34388b6fF0777F3F7227274F5cE",
      "0xAae5423207e6BD963115Fd1611888eFdC3E63CB1",
      "0xFFe462Bf5a47552073fC5004845cA004809EA8d0",
      "0x803887E0385A90e59198F4c124343dD77d5e3c4B",
      "0x61ed356539542a2795fAF530cd113241FbDf8FA2",
      "0x10C3ab1264DA2e9c8b349785a45742956878456b",
    ],
  },
  solana: {
    owners: [
      "HA9oNhHddEoPFSAEEYtGYZoXDkjky53TQ72jtpAnu81i",
      "5iFZsZsBxw8AyMAHeukgy9RktwyiyBYLDM1GEvQqY37N",
      "x8upN44MffTHxbdWLuR9q1U1B7eDPpHLUncessPWkCx",
      "DyUJQ3JyhN7UB6PEbVoE3769Djf68aS9JWqQpxfXy3AY",
      "6d6sZPUcK1DgVg6uBBYJuPsHTYV3gLvXeYkD5tSXCs2u",
      "E4JTRq3L8JeURjvursNEgc8EupPWZRYitpi6EW5YGzK5",
      "EHKPPJrN737Ea7wqHviwGUbzDyUq2oUUX3B2hUpgftbE",
    ],
  },
  tron: {
    owners: [
      "TMYKWwRwUoLknttqkKbd9PNnspuMwXFBmb",
      "TY2c9FtxUCmigBjxkoG6iGhbMFhXfLSPU8",
    ],
  },
  bsc: {
    owners: [
      "0x05CdB1526F6e224e02919a4C018D9784Ea25eb3d",
      "0x7348332ee364590f2292577AD42d4Fe419d085D3",
    ],
  },
  ripple: {
    owners: [
      "r3EjD8wKrtWbsjZxaSfAoifEDWosh49Twe",
      "rDseVXFK1SkWhFH65cqAxf3HmvHCF6b94t",
      "rfrnxmLBiXHj38a2ZUDNzbks3y6yd3wJnV",
    ],
  },
};

module.exports = cexExports(config);
