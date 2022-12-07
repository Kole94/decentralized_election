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

  const { user: admin, program, provider } = getProgramInteraction();
  const {
    user: candidate,
    program: program2,
    provider: provider2,
  } = getProgramInteraction();
  const {
    user: voter1,
    program: program3,
    provider: provider3,
  } = getProgramInteraction();
  const {
    user: candidate2,
    program: program4,
    provider: provider4,
  } = getProgramInteraction();

  const {
    user: voter2,
    program: program5,
    provider: provider5,
  } = getProgramInteraction();

  const {
    user: admin2,
    program: program6,
    provider: provider6,
  } = getProgramInteraction();

  const {
    user: user7,
    program: program7,
    provider: provider7,
  } = getProgramInteraction();

  it("Is initialized!", async () => {
    await addFunds(admin, LAMPORTS_PER_SOL, provider);
    await addFunds(candidate, LAMPORTS_PER_SOL, provider2);
    await addFunds(voter1, LAMPORTS_PER_SOL, provider3);
    await addFunds(candidate2, LAMPORTS_PER_SOL, provider4);
    await addFunds(voter2, LAMPORTS_PER_SOL, provider5);
    await addFunds(admin2, LAMPORTS_PER_SOL, provider6);
    await addFunds(user7, LAMPORTS_PER_SOL, provider7);

    const [electionPDA, _a] = await PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("election"), admin.publicKey.toBytes()],
      program.programId
    );
    const [electionPDA2, _a2] = await PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("election"), admin2.publicKey.toBytes()],
      program6.programId
    );

    const [candidateIdentityPDA, _] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("candidate"),
        candidate.publicKey.toBytes(),
      ],
      program2.programId
    );

    const [voterPDA, _v] = await PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("voter"), voter1.publicKey.toBytes()],
      program3.programId
    );
    const [candidateIdentityPDAa, _ab] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("candidate"),
        candidate2.publicKey.toBytes(),
      ],
      program4.programId
    );

    const [voterPDAa, _va] = await PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("voter"), voter2.publicKey.toBytes()],
      program5.programId
    );

    await program.methods
      .createElection()
      .accounts({
        electionData: electionPDA,
      })
      .signers([admin])
      .rpc();

    await program6.methods
      .createElection()
      .accounts({
        electionData: electionPDA2,
      })
      .signers([admin2])
      .rpc();

    await program2.methods
      .createCandidate()
      .accounts({
        candidateData: candidateIdentityPDA,
      })
      .signers([candidate])
      .rpc();

    await program3.methods
      .createVoter()
      .accounts({
        voterData: voterPDA,
        electionData: electionPDA,
      })
      .signers([voter1])
      .rpc();

    await program3.methods
      .supportCandidate()
      .accounts({
        voterData: voterPDA,
        candidateData: candidateIdentityPDA,
      })
      .signers([voter1])
      .rpc();

    await program3.methods
      .vote()
      .accounts({
        voterData: voterPDA,
        candidateData: candidateIdentityPDA,
        electionData: electionPDA,
      })
      .signers([voter1])
      .rpc();

    await program4.methods
      .createCandidate()
      .accounts({
        candidateData: candidateIdentityPDAa,
      })
      .signers([candidate2])
      .rpc();

    await program5.methods
      .createVoter()
      .accounts({
        voterData: voterPDAa,
        electionData: electionPDA,
      })
      .signers([voter2])
      .rpc();

    await program5.methods
      .supportCandidate()
      .accounts({
        voterData: voterPDAa,
        candidateData: candidateIdentityPDAa,
      })
      .signers([voter2])
      .rpc();

    await program5.methods
      .vote()
      .accounts({
        voterData: voterPDAa,
        candidateData: candidateIdentityPDAa,
        electionData: electionPDA,
      })
      .signers([voter2])
      .rpc();

    const st = await program2.account.candidateData.all();
    const el = await program.account.electionData.fetch(electionPDA);
    const el2 = await program.account.electionData.fetch(electionPDA2);
    const vo = await program3.account.voterData.all();
    console.log(el, el2);
  });

  it("initializes the election account", async () => {});
});
