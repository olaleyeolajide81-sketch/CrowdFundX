use soroban_sdk::{contract, contractimpl, Address, Env, Symbol, Vec, Map, Uint128};

#[contract]
pub struct CampaignManager;

#[derive(Clone)]
#[contracttype]
pub struct Campaign {
    pub id: Uint128,
    pub creator: Address,
    pub title: Symbol,
    pub description: Symbol,
    pub funding_goal: Uint128,
    pub current_funding: Uint128,
    pub deadline: Uint128,
    pub status: Symbol, // "active", "successful", "failed", "cancelled"
    pub asset: Address, // Stellar asset address
    pub created_at: Uint128,
    pub reward_tiers: Vec<RewardTier>,
}

#[derive(Clone)]
#[contracttype]
pub struct RewardTier {
    pub id: Uint128,
    pub title: Symbol,
    pub description: Symbol,
    pub min_contribution: Uint128,
    pub max_backers: Uint128,
    pub current_backers: Uint128,
}

// Storage keys
const CAMPAIGNS: Symbol = Symbol::short("CAMPAIGNS");
const CAMPAIGN_COUNTER: Symbol = Symbol::short("CAMPCOUNT");
const CREATOR_CAMPAIGNS: Symbol = Symbol::short("CRECAMPS");

#[contractimpl]
impl CampaignManager {
    /// Create a new crowdfunding campaign
    /// 
    /// # Arguments
    /// * `creator` - The address of the campaign creator
    /// * `title` - The campaign title
    /// * `description` - Campaign description
    /// * `funding_goal` - Target amount to raise
    /// * `deadline` - Unix timestamp when campaign ends
    /// * `asset` - Stellar asset address for contributions
    /// * `reward_tiers` - Vector of reward tiers
    /// 
    /// # Returns
    /// The unique ID of the created campaign
    pub fn create_campaign(
        env: Env,
        creator: Address,
        title: Symbol,
        description: Symbol,
        funding_goal: Uint128,
        deadline: Uint128,
        asset: Address,
        reward_tiers: Vec<RewardTier>,
    ) -> Uint128 {
        // TODO: Implement input validation
        creator.require_auth();
        
        // TODO: Validate funding goal is positive
        // TODO: Validate deadline is in future
        // TODO: Validate reward tiers
        
        // Generate campaign ID
        let campaign_id = Self::generate_campaign_id(&env);
        
        // Create campaign
        let campaign = Campaign {
            id: campaign_id,
            creator: creator.clone(),
            title,
            description,
            funding_goal,
            current_funding: Uint128::from(0u64),
            deadline,
            status: Symbol::new(&env, "active"),
            asset,
            created_at: env.ledger().timestamp(),
            reward_tiers,
        };
        
        // Store campaign
        let mut campaigns: Map<Uint128, Campaign> = env
            .storage()
            .persistent()
            .get(&CAMPAIGNS)
            .unwrap_or_else(|| Map::new(&env));
        campaigns.set(campaign_id, campaign);
        env.storage().persistent().set(&CAMPAIGNS, &campaigns);
        
        // Store creator's campaigns
        let creator_key = Symbol::new(&env, &format!("creator_{}", creator));
        let mut creator_campaigns: Vec<Uint128> = env
            .storage()
            .persistent()
            .get(&creator_key)
            .unwrap_or_else(|| Vec::new(&env));
        creator_campaigns.push_back(campaign_id);
        env.storage().persistent().set(&creator_key, &creator_campaigns);
        
        // Emit event
        env.events().publish(
            Symbol::new(&env, "campaign_created"),
            (campaign_id, creator, title, funding_goal),
        );
        
        campaign_id
    }
    
    /// Get campaign details by ID
    /// 
    /// # Arguments
    /// * `campaign_id` - The ID of the campaign to retrieve
    /// 
    /// # Returns
    /// The campaign struct if found
    pub fn get_campaign(env: Env, campaign_id: Uint128) -> Campaign {
        let campaigns: Map<Uint128, Campaign> = env
            .storage()
            .persistent()
            .get(&CAMPAIGNS)
            .expect("Campaigns not initialized");
        
        campaigns
            .get(campaign_id)
            .expect("Campaign not found")
    }
    
    /// Update campaign status
    /// 
    /// # Arguments
    /// * `campaign_id` - The ID of the campaign to update
    /// * `new_status` - New status ("active", "successful", "failed", "cancelled")
    pub fn update_campaign_status(env: Env, campaign_id: Uint128, new_status: Symbol) {
        let mut campaign = Self::get_campaign(env.clone(), campaign_id);
        campaign.creator.require_auth();
        
        // TODO: Validate new status
        campaign.status = new_status;
        
        // Update campaign in storage
        let mut campaigns: Map<Uint128, Campaign> = env
            .storage()
            .persistent()
            .get(&CAMPAIGNS)
            .unwrap();
        campaigns.set(campaign_id, campaign);
        env.storage().persistent().set(&CAMPAIGNS, &campaigns);
        
        // Emit event
        env.events().publish(
            Symbol::new(&env, "campaign_status_updated"),
            (campaign_id, new_status),
        );
    }
    
    /// Check if campaign deadline has passed and update status accordingly
    /// 
    /// # Arguments
    /// * `campaign_id` - The ID of the campaign to check
    pub fn check_campaign_deadline(env: Env, campaign_id: Uint128) {
        let mut campaign = Self::get_campaign(env.clone(), campaign_id);
        
        if env.ledger().timestamp() > campaign.deadline {
            let new_status = if campaign.current_funding >= campaign.funding_goal {
                Symbol::new(&env, "successful")
            } else {
                Symbol::new(&env, "failed")
            };
            
            campaign.status = new_status;
            
            // Update campaign in storage
            let mut campaigns: Map<Uint128, Campaign> = env
                .storage()
                .persistent()
                .get(&CAMPAIGNS)
                .unwrap();
            campaigns.set(campaign_id, campaign);
            env.storage().persistent().set(&CAMPAIGNS, &campaigns);
            
            // Emit event
            env.events().publish(
                Symbol::new(&env, "campaign_expired"),
                (campaign_id, new_status),
            );
        }
    }
    
    /// Get all campaigns for a specific creator
    /// 
    /// # Arguments
    /// * `creator` - The address of the creator
    /// 
    /// # Returns
    /// Vector of campaign IDs
    pub fn get_creator_campaigns(env: Env, creator: Address) -> Vec<Uint128> {
        let creator_key = Symbol::new(&env, &format!("creator_{}", creator));
        env.storage()
            .persistent()
            .get(&creator_key)
            .unwrap_or_else(|| Vec::new(&env))
    }
    
    /// Get all campaigns (for admin/discovery purposes)
    /// 
    /// # Returns
    /// Vector of all campaign IDs
    pub fn get_all_campaigns(env: Env) -> Vec<Uint128> {
        let campaigns: Map<Uint128, Campaign> = env
            .storage()
            .persistent()
            .get(&CAMPAIGNS)
            .unwrap_or_else(|| Map::new(&env));
        
        let mut campaign_ids = Vec::new(&env);
        for (campaign_id, _) in campaigns.iter() {
            campaign_ids.push_back(campaign_id);
        }
        campaign_ids
    }
    
    /// Helper function to generate unique campaign ID
    fn generate_campaign_id(env: &Env) -> Uint128 {
        let mut counter: Uint128 = env
            .storage()
            .persistent()
            .get(&CAMPAIGN_COUNTER)
            .unwrap_or_else(|| Uint128::from(0u64));
        counter += Uint128::from(1u64);
        env.storage().persistent().set(&CAMPAIGN_COUNTER, &counter);
        counter
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{Address, Env};

    #[test]
    fn test_create_campaign() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CampaignManager);
        let client = CampaignManagerClient::new(&env, &contract_id);
        
        // TODO: Implement test cases
        // 1. Test successful campaign creation
        // 2. Test validation (negative funding goal, past deadline)
        // 3. Test reward tier validation
        // 4. Test event emission
    }
    
    #[test]
    fn test_get_campaign() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CampaignManager);
        let client = CampaignManagerClient::new(&env, &contract_id);
        
        // TODO: Implement test cases
        // 1. Test getting existing campaign
        // 2. Test getting non-existent campaign
    }
    
    #[test]
    fn test_update_campaign_status() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CampaignManager);
        let client = CampaignManagerClient::new(&env, &contract_id);
        
        // TODO: Implement test cases
        // 1. Test status update by creator
        // 2. Test status update by non-creator (should fail)
        // 3. Test invalid status
    }
    
    #[test]
    fn test_check_campaign_deadline() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CampaignManager);
        let client = CampaignManagerClient::new(&env, &contract_id);
        
        // TODO: Implement test cases
        // 1. Test successful campaign (funding >= goal)
        // 2. Test failed campaign (funding < goal)
        // 3. Test active campaign (deadline not reached)
    }
}
