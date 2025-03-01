
# URL Shortener Service

## Requirements:

The requirement are the following:

- user authentication
- subscriptions
- payment tiers
- vanity url for subscribers
- users can access only their own data
- admin role with no restriction
- team urls

the vanity url is only for paying user not for the users on the free tier. The number of vanity urls per users must be limited depending on the payed tier. A team could have their own urls shared between team members.

## Architecture

### SQL Schema

```mermaid
erDiagram
    USERS ||--o{ URLS : creates
    USERS ||--o{ SUBSCRIPTIONS : has
    USERS ||--o{ TEAMS : owns
    USERS }|--o{ TEAM_MEMBERS : belongs_to
    TEAMS ||--o{ TEAM_MEMBERS : has
    TEAMS ||--o{ URLS : owns

    USERS {
        string id PK
        string email UK
        string password
        string role
        datetime created_at
    }

    SUBSCRIPTIONS {
        string id PK
        string user_id FK
        string tier
        boolean active
        datetime expires_at
    }

    URLS {
        string id PK
        string original_url
        string short_url UK
        string user_id FK
        string team_id FK
        boolean is_vanity
        datetime created_at
    }

    TEAMS {
        string id PK
        string name
        string owner_id FK
        datetime created_at
    }

    TEAM_MEMBERS {
        string team_id PK,FK
        string user_id PK,FK
    }
```