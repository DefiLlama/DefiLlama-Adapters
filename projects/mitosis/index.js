const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

const UNIETH_ADDRESS = {
  ethereum: { 
    asset: "0xf1376bcef0f78459c0ed0ba5ddce976f1ddf51f4", 
    vault: "0x02Ff1F648Ff443B5d88214341F0acE6ECFb94cF3",
  },
  arbitrum: { 
    asset: "0x3d15fd46ce9e551498328b1c83071d9509e2c3a0", 
    vault: "0x7E8cffBe165c6905a8AceC0f37B341c00353e8BA",
  },
  scroll: { 
    asset: "0x15eefe5b297136b8712291b632404b66a8ef4d25", 
    vault: "0xA0EeB418213f8472cba2c842378E1bB64e28bd28",
  },
  linea: { 
    asset: "0x15eefe5b297136b8712291b632404b66a8ef4d25", 
    vault: "0x56ceD49205e5D9b4d8D9B29f4aBfbe7bb8b08768",
  },
};

const uniBTC_ADDRESS = {
  ethereum: { 
    asset: "0x004E9C3EF86bc1ca1f0bB5C7662861Ee93350568", 
    vault: "0xA1eBd23c4364e7491633237A0d9359D82c629182",
  },
  arbitrum: { 
    asset: "0x6B2a01A5f79dEb4c2f3c0eDa7b01DF456FbD726a", 
    vault: "0x73981B0496fC08e9136BAF74b79d32A4d4F2a007",
  },
  optimism: { 
    asset: "0x93919784C523f39CACaa98Ee0a9d96c3F32b593e", 
    vault: "0x5616Fe2762687Cd8a9158c27F62aff84E36821Be",
  },
  bsc: { 
    asset: "0x6B2a01A5f79dEb4c2f3c0eDa7b01DF456FbD726a", 
    vault: "0xaDd58517c5D45c8ed361986f193785F8Ed1ABFc2",
  },
};

const cmETH_ADDRESS = {
  mantle: { 
    asset: "0xE6829d9a7eE3040e1276Fa75293Bde931859e8fA", 
    vault: "0x6FF000453a9c14f7d3bf381925c8cde565DbCe55",
  }
};

const ezETH_ADDRESS = {
  ethereum: { 
    asset: "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110", 
    vault: "0x0109e9f292516dAB3E15EfC61811C5e5a7FA5358",
  },
  arbitrum: { 
    asset: ADDRESSES.optimism.ezETH, 
    vault: "0xbEd575b0FeDa4F84b71144634693DaCc07749471",
  },
  blast: { 
    asset: ADDRESSES.optimism.ezETH, 
    vault: "0x8506fD66FCeD711c11F9E837EcAEC0F87C3F60A0",
  },
  linea: { 
    asset: ADDRESSES.optimism.ezETH, 
    vault: "0x96d6cE4e83dB947fF6bD1Ab0B377F23cd5D9ec2D",
  },
  mode: {
    asset: ADDRESSES.optimism.ezETH,
    vault: "0xbEd575b0FeDa4F84b71144634693DaCc07749471"
  }
};

const WEETH_ADDRESS = {
  ethereum: "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee",
  arbitrum: "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe",
  optimism: "0x346e03f8cce9fe01dcb3d0da3e9d00dc2c0e08f0",
  mode: ADDRESSES.blast.weETH,
  manta: "0x77b6F99970f488cFA8bd41892900b6Ce881C2300",
  blast: ADDRESSES.blast.weETH,
  linea: "0x1bf74c010e6320bab11e2e5a532b5ac15e0b8aa6",
  scroll: "0x01f0a31698c4d065659b9bdc21b3610292a1c506",
};

const VAULT_weETHs = {
  ethereum: "0x917cee801a67f933f2e6b33fc0cd1ed2d5909d88",
};

const CAP_ADDRESS = {
  ethereum: "0x451d791b6e9a9b8c9237bb55e58a7757342b16f9",
  arbitrum: "0xb883ee478d3b7fea8a5357a3c3e27e2d2292b1d2",
  optimism: "0xb883ee478d3b7fea8a5357a3c3e27e2d2292b1d2",
  mode: "0xb883ee478d3b7fea8a5357a3c3e27e2d2292b1d2",
  manta: "0xb883ee478d3b7fea8a5357a3c3e27e2d2292b1d2",
  blast: "0x096430ef0a653c067df32e93ff77090e084169de",
  linea: "0xcd32876b9b483eb75e8ca74935e4b51725f33a91",
  scroll: "0xcd32876b9B483eb75e8ca74935E4b51725F33A91",
};

const vaults = {
  scroll: '0xB9Ca61A6D5fA0c443F3c48Ab1fbf0118964308D6',
  ethereum: '0xE4cf2D4eb9c01784798679F2FED4CF47cc59a3ec'
};

/**
 * @param {
 *  (
 *    {
 *      type: 'cap';
 *      data: {
 *        asset: string;
 *        cap: string;
 *      }
 *    } | {
 *      type: 'vault'; 
 *      data: {
 *        asset: string; 
 *        cap: string;
 *      }
 *    }
 *  )[]} inputs
 */
const chainTVL = (inputs) => async (api) => {
  for (const { type, data } of inputs) {
    if (type === 'cap') {
      const tvl = await api.call({ abi: "uint256:load", target: data.cap });
      api.add(data.asset, tvl);
    } else if (type === 'vault') {
      await sumTokens2({ api, owner: data.vault, tokens: [data.asset] });
    }
  }
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: chainTVL(
      [
        { type: 'cap', data: { asset: WEETH_ADDRESS.ethereum, cap: CAP_ADDRESS.ethereum }},
        { type: 'vault', data: { asset: VAULT_weETHs.ethereum, vault: vaults.ethereum }},
        { type: 'vault', data: UNIETH_ADDRESS.ethereum },
        { type: 'vault', data: uniBTC_ADDRESS.ethereum },
        { type: 'vault', data: ezETH_ADDRESS.ethereum },
      ],
    ),
  },
  scroll: {
    tvl: chainTVL(
      [
        { type: 'cap', data: { asset: WEETH_ADDRESS.scroll, cap: CAP_ADDRESS.scroll }},
        { type: 'vault', data: UNIETH_ADDRESS.scroll },
      ]
    ),
  },
  arbitrum: {
    tvl: chainTVL(
      [
        { type: 'cap', data: { asset: WEETH_ADDRESS.arbitrum, cap: CAP_ADDRESS.arbitrum }},
        { type: 'vault', data: UNIETH_ADDRESS.arbitrum },
        { type: 'vault', data: uniBTC_ADDRESS.arbitrum },
        { type: 'vault', data: ezETH_ADDRESS.arbitrum },
      ]
    ),
  },
  optimism: {
    tvl: chainTVL(
      [
        { type: 'cap', data: { asset: WEETH_ADDRESS.optimism, cap: CAP_ADDRESS.optimism }},
        { type: 'vault', data: uniBTC_ADDRESS.optimism },
      ],
    ),
  },
  mode: {
    tvl: chainTVL(
      [
        { type: 'cap', data: { asset: WEETH_ADDRESS.mode, cap: CAP_ADDRESS.mode }},
        { type: 'vault', data: ezETH_ADDRESS.mode },
      ],
    ),
  },
  manta: {
    tvl: chainTVL(
      [
        { type: 'cap', data: { asset: WEETH_ADDRESS.manta, cap: CAP_ADDRESS.manta }},
      ],
    ),
  },
  blast: {
    tvl: chainTVL(
      [
        { type: 'cap', data: { asset: WEETH_ADDRESS.blast, cap: CAP_ADDRESS.blast }},
        { type: 'vault', data: ezETH_ADDRESS.blast },
      ],
    ),
  },
  linea: {
    tvl: chainTVL(
      [
        { type: 'cap', data: { asset: WEETH_ADDRESS.linea, cap: CAP_ADDRESS.linea }},
        { type: 'vault', data: UNIETH_ADDRESS.linea },
        { type: 'vault', data: ezETH_ADDRESS.linea },
      ],
    ),
  },
  bsc: {
    tvl: chainTVL(
      [
        { type: 'vault', data: uniBTC_ADDRESS.bsc },
      ]
    )
  },
  mantle: {
    tvl: chainTVL(
      [
        { type: 'vault', data: cmETH_ADDRESS.mantle },
      ]
    )
  },
};
