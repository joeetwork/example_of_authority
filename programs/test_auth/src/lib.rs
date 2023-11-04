use anchor_lang::prelude::*;

declare_id!("GDXV7eui1CtkQ83CFmioMQdN1gezR7nmbstkD9Wc4aA2");

#[program]
pub mod test_auth {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, new_user: Pubkey) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;

        //sets who can write to the user_profile account - in this case it will be new_user: pubkey.
        user_profile.authority = new_user;

        user_profile.data = 87;
        Ok(())
    }

    pub fn change_data(ctx: Context<ChangeUser>) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;

        user_profile.data = 90;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(new_user: Pubkey)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        seeds = [b"USER", new_user.as_ref()],
        bump,
        payer = authority,
        space = 8 + std::mem::size_of::<User>(),
    )]
    pub user_profile: Box<Account<'info, User>>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ChangeUser<'info> {
    #[account(mut)]
    //this authority verifies the authority is signed thus can only the owner of the public key can write to the user_profile.
    pub authority: Signer<'info>,

    //has_one = authority checks the user_profile account variable authority is the same as the pubkey used to sign.
    #[account(
        mut,
        seeds = [b"USER", authority.key().as_ref()],
        bump,
        has_one = authority
    )]
    pub user_profile: Box<Account<'info, User>>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(Default)]
pub struct User{
    authority: Pubkey,
    data: u64
}