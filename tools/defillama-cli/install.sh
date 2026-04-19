#!/bin/bash
# DefiLlama CLI Installer
# Installs the CLI tool as 'defillama-cli' in ~/.local/bin

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INSTALL_DIR="${HOME}/.local/bin"

mkdir -p "$INSTALL_DIR"

# Copy CLI
cp "$SCRIPT_DIR/defillama-cli.py" "$INSTALL_DIR/defillama-cli"
chmod +x "$INSTALL_DIR/defillama-cli"

echo "Installed to $INSTALL_DIR/defillama-cli"
echo "Make sure $INSTALL_DIR is in your PATH:"
echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
echo ""
echo "Usage:"
echo "  defillama-cli chains --top 20 --sort dex"
echo "  defillama-cli chain base --rpcs --dexs"
echo "  defillama-cli --api dexs --chain ethereum"
