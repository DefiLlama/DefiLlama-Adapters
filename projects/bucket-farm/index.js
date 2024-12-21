const ADDRESSES = require('../helper/coreAssets.json')
const sui = require("../helper/chain/sui");

const Degen_Pool_IDs = [
  "0x27551889fb011f613614e6e82f02cb4aa8c0563df0f66adb1112983eb6bbf07c",
  "0x3e7f71a129256659d6c18d77d6e5f0dcd7e624e993c97994b4a32e39c1453fdb",
  "0xab90d38384dfaf833c57ce7802d2f87efd286ffa8dddf5474323dc2f2e20f052",
  "0xcec648deeb201a2e9a9943805ae6b6b719ba9ebfd744b2f9c424a7f2fa3780d7",
  "0xdd23fe747d2177e82d1489d05066b8a120d5a421712a0c1198eb5555450826d1",
  "0x25a4b8edb9709d30f3c0078b6e4359fa3f12c766361db8ede6670736611a9ca7",
  "0x28f9d5271674dd24e9128a5c678c648f0dc58a0218cd4cbe3a68380c0c71350b",
  "0x532bf24a80898a3fac521c41d216d56ee068d81939d205cabb4ddfd977dd3489",
  "0x5658fe1d89cb026e6f0cba279a34189547be588c560736b8e9501b5df0ba20f3",
  "0x5baa72165855665ee2931c5ff8715c9a942c869547f53d85cacb591491938220",
  "0x167824936eb94620eb44e0d63c244a4fc17f334bef8dbc73d8a8fafb150ad41f",
  "0x1d07b16d18cc75dcb7fbc15e39a0262bcbbd1e06aa1c8cb62dfe5d8f3c664b60",
  "0x6cab0d3cc431a20d429274a21182544199db6df21593bcf6286b4fda16f4b880",
  "0xf2221e1cae8a7493cafd72a834152a72ee6a90c9eedbd666ee97ab43738be3b7",
  "0xfbb32d268ba51d3afd8c9fcaffc48b0e7c5bec3194da0642c09c4c16e7aaac3f",
  "0xa8997c5fca8cfea92990979650e8c16074baa25db33161fe1828c1f4f0c00882",
  "0xcd9d4d72995d125ce842d2a4a9c1552e39a6ae23cf4f4c4042f68ca9428eb98a",
  "0xdfffbeda682d4d9db915538d4a8580f4c30e9d7eb569403af4331e2819f6d377",
  "0xe2cd0560105ff1e23ed3808d483e63bb842ce0d4d517036693b835c12fa06e51",
  "0xeb20a9e131dff3948556232e49d0080f74dd71990e9cc405659c47ae3d26ba9a",
  "0x02a94dfbf720bcef33b680b65803cd5eabddf40b088eb565e3d81c58061eca40",
  "0x4e791ee7a25bc8621bbb044b6bd681d309b4eb10a80971dc2ad837dfadbda2ac",
  "0x6781c47e118bf07b30d7cb2c9825b99c1335cae72f30e1804f8c42001b81a4a9",
  "0xe07e240fae827025882887218e8690b2850ac59e3773bce334780d3e17de9b38",
  "0xe9f02d4b83e78dff3e47cfc095fca1b18788779d5a96c77e76816ca0eb49390a"
];

async function tvl(api) {
  const degenPools = await sui.getObjects(Degen_Pool_IDs);
  for(let degenPool of degenPools){
    const type = degenPool.type
    let assetType = type.slice(type.indexOf("<"), type.indexOf(">")).split(",")[1].trim()

    if(assetType == "0x922d15d7f55c13fd790f6e54397470ec592caa2b508df292a2e8553f3d3b274f::msui::MSUI" || assetType == "0x41ff228bfd566f0c707173ee6413962a77e3929588d010250e4e76f0d1cc0ad4::ksui::KSUI") assetType = ADDRESSES.sui.SUI

    api.add(assetType, degenPool.fields.balance)
  }
}

module.exports = {
  sui: {
    tvl
  }
}