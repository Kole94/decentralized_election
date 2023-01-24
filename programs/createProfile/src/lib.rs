use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod create_profile {
    use super::*;
    pub fn create_election(ctx: Context<CreateElection>) -> Result<()> {
        let election = &mut ctx.accounts.election_data;
        election.creator = ctx.accounts.signer.key();
        Ok(())
    }

    pub fn create_candidate(ctx: Context<CreateCandiadte>) -> Result<()> {
        let candidate: &mut Account<CandidateData> = &mut ctx.accounts.candidate_data;
        candidate.candidate = ctx.accounts.signer.key();
        candidate.support = 0;
        candidate.votes = 0;
        Ok(())
    }

    pub fn create_voter(ctx: Context<CreateVoter>) -> Result<()> {
        let voter: &mut Account<VoterData> = &mut ctx.accounts.voter_data;
        voter.voter = ctx.accounts.signer.key();
        let election = &mut ctx.accounts.election_data;
        election.apporved += 1;
        if election.apporved > 10 {
            election.is_happening = true;
        }
        voter.supported = false;
        voter.voted= false;
        Ok(())
    }

    pub fn support_candidate(ctx: Context<SupportCandidate>) -> Result<()> {
        let voter = &mut ctx.accounts.voter_data;
        let candidate = &mut ctx.accounts.candidate_data;

        require!(voter.supported,ElectionError::DoubleSuport);
        require!(candidate.support > 10,ElectionError::CandidateAlreadyElectable);

        candidate.support += 1;
        voter.supported = true;
        candidate.electable = true;
        
        Ok(())
    }
    
    pub fn vote(ctx: Context<Vote>,votes:u8) -> Result<()> {
        let voter: &mut Account<VoterData> = &mut ctx.accounts.voter_data;
        let candidate: &mut Account<CandidateData> = &mut ctx.accounts.candidate_data;        
        let election: &mut Account<ElectionData> = &mut ctx.accounts.election_data;

        require!(election.is_happening,ElectionError::ElectionNotAvailable);
        require!(candidate.electable,ElectionError::CandidateNotElectable);
        require!(!voter.voted,ElectionError::DoubleVoting);

        candidate.votes += 1;
        voter.voted = true;
              
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateElection<'info> {
    #[account(
        init,
        payer=signer,
        space= 32 + 2 + 16 + 8,
        seeds=[
            b"election",
            signer.key().as_ref(),
        ],
        bump
    )]
    pub election_data: Account<'info,ElectionData>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info,System>
}

#[derive(Accounts)]
pub struct CreateCandiadte<'info> {
    #[account(
        init,
        payer=signer,
        space= 32 + 8 + 2 + 16,
        seeds=[
            b"candidate",
            signer.key().as_ref(),
            election_data.key().as_ref()
        ],
        bump
    )]
    pub candidate_data: Account<'info,CandidateData>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info,System>
}

#[derive(Accounts)]
pub struct CreateVoter<'info> {
    #[account(
        init,
        payer=signer,
        seeds=[
            b"voter",
            signer.key().as_ref(),
            election_data.key().as_ref()
 
        ],
        bump,
        space= 32 + 8 + 2
    )]
    pub voter_data: Account<'info,VoterData>,
    #[account(mut)]
    pub election_data: Account<'info,ElectionData>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info,System>
}

#[derive(Accounts)]
pub struct SupportCandidate<'info> {
    #[account(mut)]
    pub voter_data: Account<'info,VoterData>,
    #[account(mut)]
    pub candidate_data: Account<'info,CandidateData>,
    #[account(mut)]
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub candidate_data: Account<'info,CandidateData>,
    #[account(mut)]
    pub voter_data: Account<'info,VoterData>,
    #[account(mut)]
    pub election_data: Account<'info,ElectionData>,
    #[account(mut)]
    pub signer: Signer<'info>,
}

#[account]
pub struct ElectionData {
    pub creator: Pubkey,
    pub is_happening: bool,
    pub date: u16,
    pub apporved: u8,
}

#[account]
pub struct CandidateData {
    pub candidate: Pubkey,
    pub electable: bool,
    pub support: u8,
    pub votes: u16,
}

#[account]
pub struct SupportData {
    pub candidate: Pubkey,
    pub support: u8,
    pub votes: u16,
}

#[account]
pub struct VoterData {
    pub voter: Pubkey,
    pub supported: bool,
    pub voted: bool,
}


#[error_code]
pub enum ElectionError {
    ElectionNotAvailable,
    DoubleVoting,
}
