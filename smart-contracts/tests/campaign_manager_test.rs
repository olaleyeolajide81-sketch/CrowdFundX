use crowd_fund_x::{CampaignManager, Campaign, RewardTier};

#[test]
fn test_create_campaign() {
    let env = soroban_sdk::Env::default();
    let contract_id = env.register_contract(None, CampaignManager);
    let client = CampaignManagerClient::new(&env, &contract_id);

    // Test campaign creation
    let campaign = Campaign {
        id: 1,
        creator: Address::generate(&env),
        title: String::from_str(&env, "Test Campaign"),
        description: String::from_str(&env, "A test campaign"),
        funding_goal: 1000,
        current_funding: 0,
        deadline: env.ledger().timestamp() + 30 * 24 * 60 * 60, // 30 days
        status: String::from_str(&env, "active"),
        created_at: env.ledger().timestamp(),
    };

    client.create_campaign(&campaign);

    // Verify campaign was created
    let retrieved_campaign = client.get_campaign(&1);
    assert_eq!(retrieved_campaign.title, campaign.title);
    assert_eq!(retrieved_campaign.funding_goal, campaign.funding_goal);
}

#[test]
fn test_get_campaign() {
    let env = soroban_sdk::Env::default();
    let contract_id = env.register_contract(None, CampaignManager);
    let client = CampaignManagerClient::new(&env, &contract_id);

    let campaign = Campaign {
        id: 1,
        creator: Address::generate(&env),
        title: String::from_str(&env, "Test Campaign"),
        description: String::from_str(&env, "A test campaign"),
        funding_goal: 1000,
        current_funding: 0,
        deadline: env.ledger().timestamp() + 30 * 24 * 60 * 60,
        status: String::from_str(&env, "active"),
        created_at: env.ledger().timestamp(),
    };

    client.create_campaign(&campaign);

    let retrieved_campaign = client.get_campaign(&1);
    assert!(retrieved_campaign.is_some());
    assert_eq!(retrieved_campaign.unwrap().title, campaign.title);
}

#[test]
fn test_update_campaign_status() {
    let env = soroban_sdk::Env::default();
    let contract_id = env.register_contract(None, CampaignManager);
    let client = CampaignManagerClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let campaign = Campaign {
        id: 1,
        creator: creator.clone(),
        title: String::from_str(&env, "Test Campaign"),
        description: String::from_str(&env, "A test campaign"),
        funding_goal: 1000,
        current_funding: 0,
        deadline: env.ledger().timestamp() + 30 * 24 * 60 * 60,
        status: String::from_str(&env, "active"),
        created_at: env.ledger().timestamp(),
    };

    client.create_campaign(&campaign);

    // Update status as creator
    client.update_campaign_status(&1, &String::from_str(&env, "completed"));

    let retrieved_campaign = client.get_campaign(&1);
    assert_eq!(retrieved_campaign.unwrap().status, String::from_str(&env, "completed"));
}

#[test]
fn test_check_deadline() {
    let env = soroban_sdk::Env::default();
    let contract_id = env.register_contract(None, CampaignManager);
    let client = CampaignManagerClient::new(&env, &contract_id);

    let campaign = Campaign {
        id: 1,
        creator: Address::generate(&env),
        title: String::from_str(&env, "Test Campaign"),
        description: String::from_str(&env, "A test campaign"),
        funding_goal: 1000,
        current_funding: 0,
        deadline: env.ledger().timestamp() + 1, // 1 second from now
        status: String::from_str(&env, "active"),
        created_at: env.ledger().timestamp(),
    };

    client.create_campaign(&campaign);

    // Fast forward time past deadline
    env.ledger().set_timestamp(env.ledger().timestamp() + 2);

    client.check_deadline(&1);

    let retrieved_campaign = client.get_campaign(&1);
    assert_eq!(retrieved_campaign.unwrap().status, String::from_str(&env, "expired"));
}
