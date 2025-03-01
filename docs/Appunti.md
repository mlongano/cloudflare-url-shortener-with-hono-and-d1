# Appunti

## [wrangler DB commands](https://developers.cloudflare.com/d1/wrangler-commands/)

tutorial for D1: [Getting Started with Wrangler](https://developers.cloudflare.com/d1/get-started/)


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