import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { TestAuth } from '../target/types/test_auth';

describe('test_auth', () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.TestAuth as Program<TestAuth>;

    const createUser = anchor.web3.Keypair.generate();

    const newUser = anchor.web3.Keypair.generate();

    const connection = anchor.getProvider().connection;

    const airdrop = async () => {
        const signature = await connection.requestAirdrop(
            createUser.publicKey,
            anchor.web3.LAMPORTS_PER_SOL
        );

        await connection.confirmTransaction(signature);
    };

    const airdrop2 = async () => {
        const signature = await connection.requestAirdrop(
            newUser.publicKey,
            anchor.web3.LAMPORTS_PER_SOL
        );

        await connection.confirmTransaction(signature);
    };

    const [usersPda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
        [new TextEncoder().encode('USER'), newUser.publicKey.toBuffer()],
        program.programId
    );

    it('Is initialized!', async () => {
      await airdrop()
        // Add your test here.
        const tx = await program.methods
            .initialize(newUser.publicKey)
            .accounts({
                authority: createUser.publicKey,
                userProfile: usersPda,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([createUser])
            .rpc();
        console.log('Your transaction signature', tx);

        const data = await program.account.user.fetch(usersPda)

        console.log(data);
        
    });

    it('User does have the right to change data!', async () => {
      await airdrop2()
        // Add your test here.
        const tx = await program.methods
            .changeData()
            .accounts({
                authority: newUser.publicKey,
                userProfile: usersPda,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([newUser])
            .rpc();
        console.log('Your transaction signature', tx);

        const data = await program.account.user.fetch(usersPda)

        console.log(data);
        
    });


    it('User does NOT have the right to change data!', async () => {
      await airdrop2()
        // Add your test here.
        const tx = await program.methods
            .changeData()
            .accounts({
                authority: newUser.publicKey,
                userProfile: usersPda,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([createUser])
            .rpc();
        console.log('Your transaction signature', tx);

        const data = await program.account.user.fetch(usersPda)

        console.log(data);
        
    });

});
