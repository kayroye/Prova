## Database Schema

### Models for Each Table

- **users** (Supabase Auth User)
  - `id`: UUID
  - `email`: String, unique
  - `user_metadata`: JSON
    - `full_name`: String
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

- **user_profiles** (Our Custom User Data)
  - `user_id`: UUID (foreign key to Supabase Auth User)
  - `role`: Enum (free, premium)
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp

- **api_endpoints**
  - `id`: UUID
  - `userId`: UUID (foreign key to User)
  - `url`: String
  - `parameters`: JSON
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp

- **subscriptions**
  - `id`: UUID
  - `userId`: UUID (foreign key to User)
  - `stripeSubscriptionId`: String
  - `status`: Enum (active, canceled)
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp

- **user_mfa**
  - `user_id`: UUID (foreign key to User)
  - `secret`: String
  - `backup_codes`: String[]
  - `is_enabled`: Boolean
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp

- **oauth_accounts**
  - `id`: UUID
  - `user_id`: UUID (foreign key to User)
  - `provider`: String (google, github)
  - `provider_account_id`: String
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

- **api_logs**
  - `id`: UUID
  - `userId`: UUID (foreign key to User)
  - `endpointId`: UUID (foreign key to APIEndpoint)
  - `status`: String
  - `request`: JSON
  - `response`: JSON
  - `error`: JSON
  - `createdAt`: Timestamp

- **api_usage**
  - `userId`: UUID (foreign key to User)
  - `period`: String (daily, monthly)
  - `count`: Integer
  - `updatedAt`: Timestamp

- **chat_sessions**
  - `id`: UUID
  - `user_id`: UUID (foreign key to User)
  - `endpoints`: JSON
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

### Relationships

- **User** has many **APIEndpoints**.
- **User** has one **Subscription**.
- **User** has one **UserProfile**.
- **User** has one **UserMFA**.

---
