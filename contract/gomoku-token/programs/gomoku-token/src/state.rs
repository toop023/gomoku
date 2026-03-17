use anchor_lang::prelude::*;

#[account]
pub struct GameConfig {
    pub authority: Pubkey,
    pub win_reward: u64,
    pub lose_penalty: u64,
    pub streak_bonus: u64,
}

#[account]
pub struct PlayerStats {
    pub player: Pubkey,
    pub wins: u64,
    pub losses: u64,
    pub current_streak: i64,
    pub games_played: u64,
}
