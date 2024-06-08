import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
	Orao,
	networkStateAccountAddress,
	randomnessAccountAddress,
} from "@orao-network/solana-vrf";

import { BN } from "bn.js";
import { GuessingGame } from "../target/types/guessing_game";

describe("orao-vrf", () => {
	// Configure the client to use the local cluster.
	const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);

	const program = anchor.workspace.GuessingGame as Program<GuessingGame>;

	let force_seed = anchor.web3.Keypair.generate().publicKey.toBuffer();

	const vrf = new Orao(provider);
	const random = randomnessAccountAddress(force_seed);
	const treasury = new anchor.web3.PublicKey(
		"9ZTHWWZDpB36UFe1vszf2KEpt83vwi27jDqtHQ7NSXyR"
	);

	describe("INITIALIZATION", () => {
		it("Inits the Randomness account!", async () => {
			await program.methods
				.initialize(new BN(10), [...force_seed])
				.accounts({
					payer: provider.wallet.publicKey,
					treasury,
					oraoVrf: vrf.programId,
					random,
					networkState: networkStateAccountAddress(),
					systemProgram: anchor.web3.SystemProgram.programId,
				})
				.rpc({ skipPreflight: true });

			await vrf.waitFulfilled(force_seed);
		});
	});

	describe("GUESS", () => {
		it("guesses a random!", async () => {
			let txHash = await program.methods
				.guess(new BN(10), [...force_seed])
				.accounts({
					payer: provider.wallet.publicKey,
					treasury,
					oraoVrf: vrf.programId,
					random,
					networkState: networkStateAccountAddress(),
					systemProgram: anchor.web3.SystemProgram.programId,
				})
				.rpc({ skipPreflight: true });

			console.log(
				`tx: https://explorer.solana.com/tx/${txHash}?cluster=devnet\n`
			);
		});
	});
});