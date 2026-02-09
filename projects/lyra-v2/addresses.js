/**
 * Lyra v2 TVL: vault and token addresses (Vault + NonMintableToken pairs per chain).
 * Keys are chain IDs (string). Each entry is { vault, token }.
 * Used by index.js for static TVL; ported from addresses.ts.
 */
const VAULTS_BY_CHAIN_ID = {
  "1": [
    { vault: "0x25d35c8796c9dcd3857abe90d802fc17b1fb55a5", token: "0x657e8c867d8b37dcc18fa4caead9c45eb088c642" },
    { vault: "0x26cf1dc84694e04277f2fe4c13e43597c6010c2a", token: "0x4c9edd5852cd905f086c759e8383e09bff1e68b3" },
    { vault: "0x30147a4989a0282aab8c9477ae9341da4d09d3b1", token: "0x6c3ea9036406852006290770bedfcaba0e23a0e8" },
    { vault: "0x35d4d9bc79b0a543934b1769304b90d752691cad", token: "0xa1290d69c65a6fe4df752f95823fae25cb99e5a7" },
    { vault: "0x383a4edb30e896b8d2d044be87079d45c0ea7065", token: "0x7a56e1c57c7475ccf742a1832b028f0456652f97" },
    { vault: "0x3eec7c855af33280f1ed38b93059f5aa5862e3ab", token: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599" },
    { vault: "0x412ac6044401cdf1e9833b7056c14c74aa593d37", token: "0x0001a500a6b18995b03f44bb040a5ffc28e45cb0" },
    { vault: "0x4421461239ae746127c13a19177656124433dc60", token: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9" },
    { vault: "0x4bb4c3cdc7562f08e9910a0c7d8bb7e108861eb4", token: "0xfae103dc9cf190ed75350761e95403b7b8afa6c0" },
    { vault: "0x5bf824c739b7d102d489c7a64ec1dbdf7a667a61", token: "0x15700b564ca08d9439c58ca5053166e8317aa138" },
    { vault: "0x5e98a25d8d6ff69a8992d6aa57948dfb77d4ecba", token: "0xdac17f958d2ee523a2206206994597c13d831ec7" },
    { vault: "0x5f18c54e4e10287414a47925a24ea3a8cf4a9f50", token: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf" },
    { vault: "0x613e87be1cd75debc5e6e56a2af2fed84162c142", token: "0x83f20f44975d03b1b09e64809b757c47f942beea" },
    { vault: "0x6d303cee7959f814042d31e0624fb88ec6fbcc1d", token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
    { vault: "0x76624ff43d610f64177bb9c194a2503642e9b803", token: "0x8236a87084f8b84306f72007f36f2618a5634494" },
    { vault: "0x7d7ac8d55a9bd4152b703011f3e61ab3bb0a5592", token: "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f" },
    { vault: "0x7e1d17b580dd4f89037db331430eaee8b8e50c91", token: "0x6b175474e89094c44da98b954eedeac495271d0f" },
    { vault: "0x8180eccc825b692ef65ff099a0a387743788bf78", token: "0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee" },
    { vault: "0xb592512153c22f5ba573b0c3e04cab99d4cd8856", token: "0xd9d920aa40f578ab794426f5c90f6c731d159def" },
    { vault: "0xd4efe33c66b8cde33b8896a2126e41e5db571b7e", token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" },
    { vault: "0xdf9acfd417584b25cde387972d28dbb7f33c1a72", token: "0xdd468a1ddc392dcdbef6db6e34e89aa338f9f186" },
    { vault: "0xe3e96892d30e0ee1a8131baf87c891201f7137bf", token: "0x9d39a5de30e57443bff2a8307a4256c8797a3497" },
    { vault: "0xebb5d642aa8ccdee98373d6ac3ee0602b63824b3", token: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0" },
    { vault: "0xfef430377e7ed9bf5e4cadc41c709bf4bb6235fe", token: "0xd9a442856c234a39a81a089c06451ebaa4306a72" },
  ],
  "10": [
    { vault: "0x0464b37c067a60d391403d4bd1197870fb6af2d0", token: "0x2218a117083f5b482b0bb821d27056ba9c04b1d3" },
    { vault: "0x23f2e0c64ae525948a8b13935d8c180d8590764b", token: "0xfc2e6e6bcbd49ccf3a5f029c79984372dcbfe527" },
    { vault: "0x43b019139946466a010c936a85df14c17c4159c0", token: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1" },
    { vault: "0x44343ae5e9319b61c9dad7876919efdb03241b02", token: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58" },
    { vault: "0x44ed9ce901b367b1ef9ddbd4974c82a514c50dec", token: "0x87eee96d50fb761ad85b1c982d28a042169d61b1" },
    { vault: "0x5324c6d731a3d9d740e880929e2c952ba27408de", token: "0x211cc4dd073734da055fbf44a2b4667d5e5fe5d2" },
    { vault: "0x76e57c252a86e7a9c7e06d2e0c427f878805eab2", token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34" },
    { vault: "0x8574cbc539c26df9ec11ba283218268101ff10e1", token: "0x8700daec35af8ff88c16bdf0418774cb3d7599b4" },
    { vault: "0x8e875cc9022666011d07239fc06db95e7068fcd2", token: "0x76fb31fb4af56892a25e32cfc43de717950c9278" },
    { vault: "0xaa8f9d05599f1a5d5929c40342c06a5da063a4de", token: "0x1f32b1c2345538c0c6f582fcb022739c4a194ebb" },
    { vault: "0xbb9cf28bc1b41c5c7c76ee1b2722c33ebb8fbd8c", token: "0x7f5c764cbc14f9669b88837ca1490cca17c31607" },
    { vault: "0xdd4c717a69763176d8b7a687728e228597eab86d", token: "0x4200000000000000000000000000000000000006" },
    { vault: "0xdef0bfbdf7530c75ab3c73f8d2f64d9eaa7aa98e", token: "0x0b2c639c533813f4aa9d7837caf62653d097ff85" },
    { vault: "0xe5967877065f111a556850d8f05b8dad88edcec9", token: "0x68f180fcce6836688e9084f035309e29bf0a2095" },
    { vault: "0xf912e4a4157b535940f346d35e319554b5625578", token: "0x4200000000000000000000000000000000000042" },
  ],
  "999": [
    { vault: "0x204cdcfe0d03c75a41a0079f187a7870265bc949", token: "0x111111a1a0667d36bd57c0a9f569b98057111111" },
    { vault: "0x2b4facc4b6bdc42074b3eff9ab5943c8855a7860", token: "0x5555555555555555555555555555555555555555" },
    { vault: "0xd464170afe0ee2a4865b2ca6dbcc6dfb8f4bf125", token: "0xfd739d4e423301ce9385c1fb8850539d657c296d" },
  ],
  "8453": [
    { vault: "0x084f3abc5d860eaea7c6c6539dcbeee20d04f344", token: "0x3b86ad95859b6ab773f55f8d94b4b9d443ee931f" },
    { vault: "0x2805b908a0f9ca58a2b3b7900341b4ebd0b994e9", token: "0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452" },
    { vault: "0x3bcb0ff2d4b674784ac1c33bc85a047b5a726e71", token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34" },
    { vault: "0x420446557adb05fa0ecca96619cd9f20e1e044dc", token: "0x63706e401c06ac8513145b7687a14804d17f814b" },
    { vault: "0x4e798659b9846f1da7b6d6b5d09d581270ab6fec", token: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" },
    { vault: "0x6312a07400651e0f324c5772413fc9a7c535684e", token: "0x54330d28ca3357f294334bdc454a032e7f353416" },
    { vault: "0x76624ff43d610f64177bb9c194a2503642e9b803", token: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf" },
    { vault: "0x88c43dea65ede0c56be663550e831be97745bec2", token: "0xc26c9099bd3789107888c35bb41178079b282561" },
    { vault: "0xb29d27df122833aa38da3eb816b0efcee09cdba8", token: "0xecac9c5f704e954931349da37f60e39f515c11c1" },
    { vault: "0xb2ad65aeffd5eeb28ce13d318a83c89461b2b444", token: "0x99ac4484e8a1dbd6a185380b3a811913ac884d87" },
    { vault: "0xb57d0ebc142ee63160d7b68b6e4c72d98053c539", token: "0x50c5725949a6f0c72e6c4a641f24049a917db0cb" },
    { vault: "0xbd282333710b9c7e33e8a37d027885a7c079ae23", token: "0x4200000000000000000000000000000000000006" },
    { vault: "0xc4cb2f82a01dc896a4d423231e60d7b500252e19", token: "0xedfa23602d0ec14714057867a78d01e94176bea0" },
    { vault: "0xf982c812099d03affa0c8062aa1abcb584c23329", token: "0x04c0599ae5a44757c0af6f9ec3b93da8976c150a" },
    { vault: "0xfe00c281729fa7e7aab453690ed184284f51268c", token: "0x211cc4dd073734da055fbf44a2b4667d5e5fe5d2" },
  ],
  "42161": [
    { vault: "0x05dd3bbb786beb8551dfe0d2eca3de47b3996003", token: "0x346c574c56e1a4aaa8dc88cda8f7eb12b39947ab" },
    { vault: "0x2b93891dc80ab9696814615f553fd15a3b98d3a2", token: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1" },
    { vault: "0x3c143ea5ebab50ad6d2b2d14fa719234d1d38f1b", token: "0x211cc4dd073734da055fbf44a2b4667d5e5fe5d2" },
    { vault: "0x3d20c6a2b719129af175e0ff7b1875deb360896f", token: "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f" },
    { vault: "0x3fbfd80ef7591658d1d7ddec067f413efd6f985c", token: "0x35751007a407ca6feffe80b3cb397736d2cf4dbe" },
    { vault: "0x4518308f435f5cf08952d8eb2e1be33a49b6ba08", token: "0x064f8b858c2a603e1b106a2039f5446d32dc81c1" },
    { vault: "0x486936fb1ce805e8c46e71c69256e72f3f550d38", token: "0x4186bfc76e2e237523cbc30fd220fe055156b41f" },
    { vault: "0x5e027ad442e031424b5a2c0ad6f656662be32882", token: "0xaf88d065e77c8cc2239327c5edb3a432268e5831" },
    { vault: "0x5faa613365331a5062f3a00126954b742abeb2ff", token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34" },
    { vault: "0x8574cbc539c26df9ec11ba283218268101ff10e1", token: "0x5979d7b546e38e414f7e9822514be443a4800529" },
    { vault: "0x8a8725e2a6d5fc50605a1ef8d81fa9f214e6d320", token: "0xba5ddd1f9d7f570dc94a51479a000e3bce967196" },
    { vault: "0x8e9f58e6c206cb9c98abb9f235e0f02d65dfc922", token: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" },
    { vault: "0xb2cb9ada6e00118da8e83a6a53df1ec6331a60a6", token: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9" },
    { vault: "0xe3e96892d30e0ee1a8131baf87c891201f7137bf", token: "0x3647c54c4c2c65bc7a2d63c0da2809b399dbbdc0" },
    { vault: "0xfb7b06538d837e4212d72e2a38e6c074f9076e0b", token: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8" },
  ],
};

/** DefiLlama chain name -> chain ID (for VAULTS_BY_CHAIN_ID lookup) */
const CHAIN_TO_CHAIN_ID = {
  ethereum: "1",
  optimism: "10",
  base: "8453",
  arbitrum: "42161",
  hyperliquid: "999",
};

/**
 * Get tokensAndOwners for sumTokens2: [[token, vault], ...] for chains with static addresses.
 * @param {string} chain - DefiLlama chain name (e.g. 'ethereum', 'base')
 * @returns {[string, string][]} - Array of [token, vault] pairs, or [] if no static data
 */
function getStaticTokensAndOwners(chain) {
  const chainId = CHAIN_TO_CHAIN_ID[chain];
  const vaults = chainId ? VAULTS_BY_CHAIN_ID[chainId] || [] : [];
  return vaults.map(({ token, vault }) => [token, vault]);
}

/** Chains that have static vault data in addresses.js */
const STATIC_TVL_CHAINS = ["ethereum", "optimism", "base", "arbitrum", "hyperliquid"];

/** Chains that use URL-fetched contracts only (no static list) */
const URL_TVL_CHAINS = ["mode", "blast"];

module.exports = {
  getStaticTokensAndOwners,
  STATIC_TVL_CHAINS,
  URL_TVL_CHAINS,
};
