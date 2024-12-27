## Database Schema

### Models

- **User**
  - `id`: UUID
  - `email`: String, unique
  - `password`: String (hashed)
  - `role`: Enum (free, premium)
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp

- **APIEndpoint**
  - `id`: UUID
  - `userId`: UUID (foreign key to User)
  - `url`: String
  - `parameters`: JSON
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp

- **Subscription**
  - `id`: UUID
  - `userId`: UUID (foreign key to User)
  - `stripeSubscriptionId`: String
  - `status`: Enum (active, canceled)
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp

### Relationships

- **User** has many **APIEndpoints**.
- **User** has one **Subscription**.

---
