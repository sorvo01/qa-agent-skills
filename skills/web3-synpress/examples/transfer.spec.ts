// Send ETH through the dApp, then prove it on-chain. Selectors are examples; adapt them to your dApp.
// Prereqs: `anvil` running on :8545, the dApp on BASE_URL pointed at chain 31337, `npx synpress` cache built.
import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';
import { createPublicClient, http, parseEther, type Hash } from 'viem';
import { foundry } from 'viem/chains';
import basicSetup from './wallet-setup/basic.setup';

const test = testWithSynpress(metaMaskFixtures(basicSetup));
const { expect } = test;

const chain = createPublicClient({ chain: foundry, transport: http('http://127.0.0.1:8545') });
const RECIPIENT = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'; // Anvil account #1

test.describe('send ETH', () => {
  test('confirmed transfer moves the funds on-chain and the UI agrees', async ({ context, page, metamaskPage, extensionId }) => {
    const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId);
    const before = await chain.getBalance({ address: RECIPIENT });

    await page.goto('/');
    await page.getByRole('button', { name: /connect wallet/i }).click();
    await metamask.connectToDapp();

    await page.getByLabel('Recipient').fill(RECIPIENT);
    await page.getByLabel('Amount').fill('0.5');
    await page.getByRole('button', { name: 'Send' }).click();
    await metamask.confirmTransaction();

    // The hash is the bridge between the UI and the chain.
    const hash = (await page.getByTestId('tx-hash').textContent())?.trim() as Hash;
    const receipt = await chain.waitForTransactionReceipt({ hash });
    expect(receipt.status).toBe('success');

    const after = await chain.getBalance({ address: RECIPIENT });
    expect(after - before).toBe(parseEther('0.5'));

    await expect(page.getByTestId('tx-status')).toHaveText(/confirmed/i);
  });

  test('rejected transaction leaves the form usable and moves nothing', async ({ context, page, metamaskPage, extensionId }) => {
    const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId);
    const before = await chain.getBalance({ address: RECIPIENT });

    await page.goto('/');
    await page.getByRole('button', { name: /connect wallet/i }).click();
    await metamask.connectToDapp();

    await page.getByLabel('Recipient').fill(RECIPIENT);
    await page.getByLabel('Amount').fill('0.5');
    await page.getByRole('button', { name: 'Send' }).click();
    await metamask.rejectTransaction();

    await expect(page.getByText(/rejected|cancelled/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send' })).toBeEnabled(); // common bug: stays disabled
    expect(await chain.getBalance({ address: RECIPIENT })).toBe(before);
  });
});
