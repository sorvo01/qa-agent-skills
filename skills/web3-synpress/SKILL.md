---
name: web3-synpress
description: Test Web3 dApps end to end with Synpress (Playwright + MetaMask): wallet setup, connect, sign, send transactions, switch networks, and verify the result on-chain, not only in the UI. Use when a dApp, wallet flow, token transfer, staking, governance vote or smart-contract UI needs tests or a bug needs reproducing.
---

# Web3 dApp testing with Synpress

The rule that matters most in Web3: **the UI is not the source of truth, the chain is.** A dApp can
show "Success" for a transaction that reverted, was replaced, or never left the wallet. Every test
that changes state ends with an on-chain check.

## Setup

Check what the project uses first. These notes are for **Synpress v4** (Playwright based). v3 was
Cypress based and its API is different.

```
npm i -D @synthetixio/synpress @playwright/test viem
```

Use `"type": "module"` in `package.json` and `"moduleResolution": "Bundler"` in `tsconfig.json`
(see `examples/tsconfig.json`); Synpress ships ES modules. Install the `@playwright/test` version
Synpress depends on (`npm ls @playwright/test`), otherwise you get two Playwright copies with
incompatible types.

Run a local chain so tests are fast, free and repeatable. Foundry's Anvil is the usual choice:

```
anvil --chain-id 31337 --block-time 1        # 10 funded accounts from the default test mnemonic
# or fork a real network at a fixed block, so contract state is the same every run:
anvil --fork-url $RPC_URL --fork-block-number 21000000
```

Never use a seed phrase that has ever held real funds. Use the Anvil test mnemonic or a dedicated
throwaway wallet, kept in environment variables, never committed.

## Wallet setup and cache

Synpress builds a browser profile with MetaMask already configured and caches it, so tests do not
re-import the wallet every time. See `examples/wallet-setup/basic.setup.ts`.

```
npx synpress            # builds the cache from every *.setup.ts in the wallet-setup folder
```

Rebuild the cache when the setup file or the MetaMask version changes. In CI the extension needs a
display: run tests under `xvfb-run`.

## What to cover

| Flow | Cases that find real bugs |
|---|---|
| Connect | first connect, reject connect, disconnect and reconnect, wallet locked, wrong account selected |
| Network | dApp on the wrong chain, user switches chain mid-flow, add a network the wallet lacks |
| Sign (SIWE, permits) | confirm, reject, sign with account A then switch to B before submit |
| Transaction | confirm, reject, insufficient balance, gas spike, replaced or sped-up tx, revert from the contract |
| Token approval | approve exact vs unlimited, approve then spend, spend without approval |
| Pending state | reload while pending, close tab and come back, two transactions in a row |
| Display | balances after the tx (UI vs chain), decimals and rounding, very large and dust amounts |

Rejecting in the wallet is as important as confirming. Many dApps hang in "Waiting for
confirmation" forever after a reject.

## Writing a test

Pattern (full file in `examples/transfer.spec.ts`):

1. Read the starting state from the chain with `viem` (`getBalance`, `readContract`).
2. Drive the dApp UI with Playwright locators, and the wallet with the `MetaMask` helper
   (`connectToDapp`, `confirmSignature`, `confirmTransaction`, `rejectTransaction`, `switchNetwork`).
3. Get the transaction hash from the UI, an event, or the network response, then
   `waitForTransactionReceipt`.
4. Assert on the receipt status **and** the new on-chain state. Then assert the UI agrees.

Keep wallet-independent logic (amount validation, formatting, error copy) in faster tests with
Synpress's Ethereum wallet mock or in plain Playwright with a mocked provider. Use the real
MetaMask only for the flows where the extension itself matters.

## Typical bugs to look for

- UI shows success while the receipt status is `reverted`, or before the receipt exists at all.
- Balance in the UI is cached and does not refresh after the transaction.
- Amount precision: 18-decimal tokens shown with float rounding; max button leaves dust or exceeds
  balance by 1 wei.
- After a chain switch the dApp keeps calling the old chain's contract address.
- A rejected signature leaves the button disabled until reload.
- The same action can be submitted twice while the first transaction is pending.
- Governance: vote counted in the UI but the proposal state on-chain is unchanged (wrong proposal
  ID, vote cast after the deadline block).

## Report a Web3 bug with

Network and chain ID, contract address, wallet address (test wallet only), transaction hash and
block number, receipt status, what the UI showed vs what the chain shows, MetaMask version.
A block explorer link (or Anvil trace with `cast run <txhash>`) is the best evidence.
