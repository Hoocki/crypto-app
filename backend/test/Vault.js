const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Testing main logic", function () {
    async function deployVaultFixture() {
        const [owner] = await ethers.getSigners();
        const Vault = await ethers.getContractFactory("Vault");
        const vault = await Vault.deploy();

        return { vault, owner };
    }

    describe("Deposit", function () {
        it("Should set the correct owner", async function () {
            const { vault, owner } = await loadFixture(deployVaultFixture);

            const actualOwner = await vault.owner();
            expect(actualOwner).to.equal(owner.address);
        });

        it("Should allow a user to deposit ETH and mint LP tokens", async function () {
            const { vault, owner } = await loadFixture(deployVaultFixture);

            // Set epoch start time
            await vault.startEpoch();

            // User makes a deposit
            const userDeposit = 1000000000000000000n;
            const initialBalance = await vault.balanceOf(owner.address);

            await expect(() => vault.connect(owner).deposit({ value: userDeposit }))
                .to.changeEtherBalance(owner, -userDeposit);

            // Check user's LP token balance
            const userLPTokenBalance = await vault.balanceOf(owner.address);
            expect(userLPTokenBalance).to.be.gt(initialBalance);

            // Check total LP token supply
            const totalLPTokenSupply = await vault.totalSupply();
            expect(totalLPTokenSupply).to.be.gt(0);
        });

        it("Should revert if deposit is made outside the epoch", async function () {
            const { vault, owner } = await loadFixture(deployVaultFixture);

            // Try to make a deposit before starting the epoch
            const userDeposit = 1000000000000000000n;
            await expect(vault.connect(owner).deposit({ value: userDeposit }))
                .to.be.revertedWith("Epoch not started!");
        });

        it("Should revert if user tries to deposit 0 ETH", async function () {
            const { vault, owner } = await loadFixture(deployVaultFixture);

            // Set epoch start time
            await vault.startEpoch();

            // Try to make a deposit of 0 ETH
            const userDeposit = 0n;
            await expect(vault.connect(owner).deposit({ value: userDeposit }))
                .to.be.revertedWith("Amount must be greater than 0");
        });
    });

    describe("sendToStrategy", function () {
        it("Should transfer the balance to the strategy and callOperate", async function () {
            const { vault, owner } = await loadFixture(deployVaultFixture);

            // Set some balance to the Vault
            const vaultAddress = await vault.getAddress();
            const strategyAddress = await vault.getStrategyAddress();
            const optionalRegistryAddress = await vault.getOptionalRegistryAddress();

            const depositAmount = 1000000000000000000n
            await owner.sendTransaction({ to: vaultAddress, value: depositAmount });
            const initialVaultBalance = await ethers.provider.getBalance(vaultAddress);
            const initialStrategyBalance = await ethers.provider.getBalance(strategyAddress);

            expect(initialVaultBalance).to.equal(1000000000000000000n);
            expect(initialStrategyBalance).to.equal(0);

            await expect(() => vault.connect(owner).sendToStrategy())
                .to.changeEtherBalance(optionalRegistryAddress, initialVaultBalance);

            const finalVaultBalance = await ethers.provider.getBalance(vaultAddress);
            const finalStrategyBalance = await ethers.provider.getBalance(strategyAddress);

            // Check that Vault's balance is now 0
            expect(finalVaultBalance).to.equal(0);

            // Check that Strategy's balance is now 0
            expect(finalStrategyBalance).to.equal(0);

        });
    });
    describe("getFromStrategy", function () {
        it("Should execute getFromStrategy correctly", async function () {
            const { vault, owner } = await loadFixture(deployVaultFixture);

            const vaultAddress = await vault.getAddress();
            const strategyAddress = await vault.getStrategyAddress();
            const optionalRegistryAddress = await vault.getOptionalRegistryAddress();

            // Deposit some funds into the Vault
            const depositAmount = 1000000000000000000n;
            await owner.sendTransaction({ to: vaultAddress, value: depositAmount });

            // Execute sendToStrategy to move funds to the strategy
            await vault.connect(owner).sendToStrategy();

            // Get the initial balance of the strategy before calling getFromStrategy
            const winAmount = 1000000000000000000n;
            await owner.sendTransaction({ to: optionalRegistryAddress, value: winAmount });

            // Execute getFromStrategy
            await vault.connect(owner).getFromStrategy();

            // Get the final balances
            const finalVaultBalance = await ethers.provider.getBalance(vaultAddress);

            // Check that the Vault's balance is now 0
            const value = 1900000000000000000n;
            expect(finalVaultBalance).to.equal(value);
        });
    });

    describe("withdraw", function () {
        it("Should allow a user to withdraw funds", async function () {
            const { vault, owner } = await loadFixture(deployVaultFixture);
            // Deposit some funds into the Vault
            const vaultAddress = await vault.getAddress();

            // Set epoch start time
            await vault.startEpoch();

            const depositAmount = 1000000000000000000n;
            await vault.connect(owner).deposit({ value: depositAmount })
            await owner.sendTransaction({ to: vaultAddress, value: depositAmount });

            // Get initial balances
            const initialVaultBalance = await ethers.provider.getBalance(vaultAddress);
            const initialUserBalance = await ethers.provider.getBalance(owner.address);

            // Execute withdraw
            await vault.withdraw();

            // Get final balances
            const finalVaultBalance = await ethers.provider.getBalance(vaultAddress);
            const finalUserBalance = await ethers.provider.getBalance(owner.address);

            // Check that the user's balance has increased
            expect(finalUserBalance).to.be.gt(initialUserBalance);

            // Check that the Vault's balance has decreased
            expect(finalVaultBalance).to.be.lt(initialVaultBalance);
        });
    });
});
