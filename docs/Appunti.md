# Appunti

- Tutorial for D1: [Getting Started with Wrangler](https://developers.cloudflare.com/d1/get-started/)
- Another tutorial: [Build a Staff Directory Application](https://developers.cloudflare.com/d1/tutorials/build-a-staff-directory-app/)
- A demo project made in the AS2023-2024: [A beginner guide to build a ReST API with node.js](https://github.com/mlongano/rest-node-showcase)

## [wrangler DB commands](https://developers.cloudflare.com/d1/wrangler-commands/)

```sh
execute
Execute a query on a D1 database.

wrangler d1 execute <DATABASE_NAME> [OPTIONS]

Note

You must provide either --command or --file for this command to run successfully.

DATABASE_NAME  required
The name of the D1 database to execute a query on.
--command  optional
The SQL query you wish to execute.
--file  optional
Path to the SQL file you wish to execute.
```

Esempio con il DB del progetto:

```sh
wrangler d1 execute url-shortener-db --local --command="SELECT * FROM urls"
```

Crea il DB locale dal file `schema.sql`:
```sh
wrangler d1 execute url-shortener-db --local --file schema.sql
```

Crea il DB locale dal file `schema.sql`:
```sh
wrangler d1 execute url-shortener-db --remote --file schema.sql
```

Altre opzioni
```sh
-y, --yes  optional
Answer yes to any prompts.
--local  (default: true) optional
Execute commands/files against a local database for use with wrangler dev.
--remote  (default: false) optional
Execute commands/files against a remote D1 database for use with wrangler dev --remote.
--persist-to  optional
Specify directory to use for local persistence (for use in combination with --local).
--json  optional
Return output as JSON rather than a table.
--preview  optional
Execute commands/files against a preview D1 database (as defined by preview_database_id in the Wrangler configuration file).
--batch-size  optional
Number of queries to send in a single batch.
```
---

## Password hashing in Cloudflare Workers

[Hashing Passwords On Cloudflare Workers](https://lord.technology/2024/02/21/hashing-passwords-on-cloudflare-workers.html)

```ts
export async function hashPassword(
  password: string,
  providedSalt?: Uint8Array
): Promise<string> {
  const encoder = new TextEncoder();
  // Use provided salt if available, otherwise generate a new one
  const salt = providedSalt || crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const exportedKey = (await crypto.subtle.exportKey(
    "raw",
    key
  )) as ArrayBuffer;
  const hashBuffer = new Uint8Array(exportedKey);
  const hashArray = Array.from(hashBuffer);
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(
  storedHash: string,
  passwordAttempt: string
): Promise<boolean> {
  const [saltHex, originalHash] = storedHash.split(":");
  const matchResult = saltHex.match(/.{1,2}/g);
  if (!matchResult) {
    throw new Error("Invalid salt format");
  }
  const salt = new Uint8Array(matchResult.map((byte) => parseInt(byte, 16)));
  const attemptHashWithSalt = await hashPassword(passwordAttempt, salt);
  const [, attemptHash] = attemptHashWithSalt.split(":");
  return attemptHash === originalHash;
}
```
---

## Suggested Project Structure

```sh
project/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── config/
│   │   └── cors.ts              # CORS configuration
│   ├── controllers/
│   │   ├── auth.controller.ts   # Authentication logic
│   │   ├── user.controller.ts   # User-related operations
│   │   └── data.controller.ts   # Data CRUD operations
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT authentication middleware
│   │   └── error.middleware.ts  # Error handling middleware
│   ├── routes/
│   │   ├── auth.routes.ts       # Auth routes
│   │   ├── user.routes.ts       # User routes
│   │   └── data.routes.ts       # Data routes
│   ├── services/
│   │   ├── auth.service.ts      # Auth business logic
│   │   ├── user.service.ts      # User business logic
│   │   └── data.service.ts      # Data business logic
│   ├── lib/
│   │   ├── hashAndCompare.ts    # Password utilities (existing)
│   │   └── jwt.ts               # JWT utilities
│   ├── types/
│   │   ├── env.ts               # Environment type definitions
│   │   ├── auth.types.ts        # Auth-related types
│   │   └── data.types.ts        # Data-related types
│   └── db/
│       └── schema.sql           # Database schema
└── wrangler.toml                # Cloudflare configuration

```

### Benefits of This Structure
- Separation of Concerns: Each part of the application has a clear responsibility.
- `controllers` handle request/response logic
- `routes` define API endpoints
- `middleware` handles cross-cutting concerns
- `services` contain business logic
- Modularity: Easy to add new features or modify existing ones without affecting other parts.
- Maintainability: Code is organized in a way that makes it easier to understand and maintain.
- Scalability: As the application grows, this structure can accommodate new features without becoming unwieldy.
- Testability: Each component can be tested in isolation.

### Benefits of the Service Layer
- Separation of Concerns:
  - Controllers handle HTTP requests/responses
  - Services contain business logic
  - This makes your code more maintainable and testable
- Reusability:
  - Service methods can be reused across different controllers
  - For example, the same user validation logic might be needed in multiple places
- Testability:
  - Services can be tested independently of HTTP concerns
  - Makes unit testing much easier
- Maintainability:
  - When business rules change, you only need to update the service
  - Controllers remain stable as they just pass data between the client and services
- Abstraction:
  - Services abstract away data access and business rules
  - Controllers don't need to know how data is stored or processed

This service layer completes the architecture above, providing a clean separation between HTTP handling code and business logic.
With this structure, the application will be more maintainable and easier to extend as requirements change.

## About CORS configuration for fetching, authtentications and cookies settings

CORS is hard to get right, especially when dealing with cookies and authentication. Here are some tips to help you configure CORS correctly:
- Use the `credentials: 'include'` option when making requests from the client to include cookies in the request.
- Set the `Access-Control-Allow-Origin` header to the client's origin (e.g., `https://example.com`) to allow requests from that domain. You cannot use the wildcard `*` when `credentials` is set to `include`. Otherwise, the browser will block the request.
- Set the `Access-Control-Allow-Credentials` header to `true` to allow cookies to be sent with the request.
- Set the `Access-Control-Allow-Methods` header to the allowed HTTP methods (e.g., `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`) to restrict the methods that can be used in the request.
- Set the `Access-Control-Allow-Headers` header to the allowed headers (e.g., `Content-Type`, `Authorization`) to restrict the headers that can be used in the request.
- Set the `Access-Control-Expose-Headers` header to the headers that the client can access in the response (e.g., `Authorization`, `Content-Type`) to expose additional headers to the client.
- Set the `Access-Control-Max-Age` header to the number of seconds the preflight request can be cached by the client to reduce the number of preflight requests.
- Use the `OPTIONS` method to handle preflight requests and respond with the appropriate CORS headers.
- You cannot use the wildcard `*` not only for `Access-Control-Allow-Origin` but also for `Access-Control-Allow-Headers` and `Access-Control-Allow-Methods` when `credentials` is set to `include`.
