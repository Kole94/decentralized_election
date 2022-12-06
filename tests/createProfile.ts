import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { CreateProfile } from "../target/types/create_profile";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

describe("createProfile", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const ANCHOR_PROGRAM = anchor.workspace
    .CreateProfile as Program<CreateProfile>;

  function getProgramInteraction(): {
    user: anchor.web3.Keypair;
    program: Program<CreateProfile>;
    provider: anchor.Provider;
  } {
    const user = anchor.web3.Keypair.generate();
    const provider = new anchor.AnchorProvider(
      anchor.AnchorProvider.local().connection,
      new anchor.Wallet(user),
      {}
    );
    const program = new anchor.Program(
      ANCHOR_PROGRAM.idl as anchor.Idl,
      ANCHOR_PROGRAM.programId,
      provider
    ) as Program<CreateProfile>;
    return { user: user, program: program, provider: provider };
  }

  async function addFunds(
    user: anchor.web3.Keypair,
    amount: number,
    provider: anchor.Provider
  ) {
    const airdrop_tx = await provider.connection.requestAirdrop(
      user.publicKey,
      amount
    );
    await provider.connection.confirmTransaction(airdrop_tx);
  }

  const { user, program, provider } = getProgramInteraction();
  const {
    user: user2,
    program: program2,
    provider: provider2,
  } = getProgramInteraction();
  const {
    user: user3,
    program: program3,
    provider: provider3,
  } = getProgramInteraction();
  const {
    user: user4,
    program: program4,
    provider: provider4,
  } = getProgramInteraction();

  const {
    user: user5,
    program: program5,
    provider: provider5,
  } = getProgramInteraction();
  it("Is initialized!", async () => {
    await addFunds(user, LAMPORTS_PER_SOL, provider);
    await addFunds(user2, LAMPORTS_PER_SOL, provider2);
    await addFunds(user3, LAMPORTS_PER_SOL, provider3);
    await addFunds(user4, LAMPORTS_PER_SOL, provider4);
    await addFunds(user5, LAMPORTS_PER_SOL, provider5);
    const [electionPDA, _a] = await PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("election"), user.publicKey.toBytes()],
      program.programId
    );

    const [candidateIdentityPDA, _] = await PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("candidate"), user2.publicKey.toBytes()],
      program2.programId
    );

    const [voterPDA, _v] = await PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("voter"), user3.publicKey.toBytes()],
      program3.programId
    );
    const [candidateIdentityPDAa, _ab] = await PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("candidate"), user4.publicKey.toBytes()],
      program4.programId
    );

    const [voterPDAa, _va] = await PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("voter"), user5.publicKey.toBytes()],
      program5.programId
    );

    await program.methods
      .createElection()
      .accounts({
        electionData: electionPDA,
      })
      .signers([user])
      .rpc();

    await program2.methods
      .createCandidate()
      .accounts({
        candidateData: candidateIdentityPDA,
      })
      .signers([user2])
      .rpc();

    await program3.methods
      .createVoter()
      .accounts({
        voterData: voterPDA,
      })
      .signers([user3])
      .rpc();

    await program3.methods
      .supportCandidate()
      .accounts({
        voterData: voterPDA,
        electionData: electionPDA,
        candidateData: candidateIdentityPDA,
      })
      .signers([user3])
      .rpc();

    await program3.methods
      .vote()
      .accounts({
        voterData: voterPDA,
        candidateData: candidateIdentityPDA,
      })
      .signers([user3])
      .rpc();

    await program4.methods
      .createCandidate()
      .accounts({
        candidateData: candidateIdentityPDAa,
      })
      .signers([user4])
      .rpc();

    await program5.methods
      .createVoter()
      .accounts({
        voterData: voterPDAa,
      })
      .signers([user5])
      .rpc();

    await program5.methods
      .supportCandidate()
      .accounts({
        voterData: voterPDAa,
        electionData: electionPDA,
        candidateData: candidateIdentityPDAa,
      })
      .signers([user5])
      .rpc();

    await program5.methods
      .vote()
      .accounts({
        voterData: voterPDAa,
        candidateData: candidateIdentityPDAa,
      })
      .signers([user5])
      .rpc();

    const st = await program2.account.candidateData.all();
    const el = await program.account.electionData.fetch(electionPDA);
    const vo = await program3.account.voterData.all();
    console.log(st, el, vo);
  });

  it("initializes the election account", async () => {});
});
