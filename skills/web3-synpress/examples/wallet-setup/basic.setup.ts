// Builds a cached MetaMask profile with the Anvil test wallet and the local chain added.
// Run `npx synpress` once (and after any change to this file) to create the cache.
import { defineWalletSetup } from '@synthetixio/synpress';
import { MetaMask } from '@synthetixio/synpress/playwright';

// Public Anvil/Hardhat test mnemonic. It has never held real funds; never put a real one here.
const SEED_PHRASE = process.env.TEST_SEED_PHRASE ?? 'test test test test test test test test test test test junk';
const PASSWORD = process.env.TEST_WALLET_PASSWORD ?? 'Tester@1234';

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  const metamask = new MetaMask(context, walletPage, PASSWORD);
  await metamask.importWallet(SEED_PHRASE);
  await metamask.addNetwork({
    name: 'Anvil',
    rpcUrl: 'http://127.0.0.1:8545',
    chainId: 31337,
    symbol: 'ETH',
  });
});
