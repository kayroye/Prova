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
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

- **api_endpoints**
  - `id`: UUID
  - `user_id`: UUID (foreign key to User)
  - `name`: String
  - `description`: String
  - `url`: String
  - `parameters`: JSON
  - `headers`: JSON
  - `methods`: String[]
  - `environment`: String
  - `tags`: String[]
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

- **subscriptions**
  - `id`: UUID
  - `userId`: UUID (foreign key to User)
  - `stripeSubscriptionId`: String
  - `status`: Enum (active, canceled)
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

- **user_mfa**
  - `user_id`: UUID (foreign key to User)
  - `secret`: String
  - `backup_codes`: String[]
  - `is_enabled`: Boolean
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

- **oauth_accounts**
  - `id`: UUID
  - `user_id`: UUID (foreign key to User)
  - `provider`: String (google, github)
  - `provider_account_id`: String
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

- **api_logs**
  - `id`: UUID
  - `user_id`: UUID (foreign key to User)
  - `endpoint_id`: UUID (foreign key to APIEndpoint)
  - `status`: Integer
  - `request`: JSON
  - `response`: JSON
  - `error`: JSON
  - `method`: String
  - `created_at`: Timestamp

- **api_usage**
  - `userId`: UUID (foreign key to User)
  - `period`: String (daily, monthly)
  - `count`: Integer
  - `updated_at`: Timestamp

- **chat_sessions**
  - `id`: UUID
  - `user_id`: UUID (foreign key to User)
  - `endpoints`: JSON
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

- **chat_messages**
  - `id`: UUID
  - `chat_session_id`: UUID (foreign key to ChatSession)
  - `sender`: Enum (user, ai)
  - `message`: Text
  - `timestamp`: Timestamp

### Relationships

- **User** has many **APIEndpoints**.
- **User** has one **Subscription**.
- **User** has one **UserProfile**.
- **User** has one **UserMFA**.
- **ChatSession** has many **ChatMessages**.

---
