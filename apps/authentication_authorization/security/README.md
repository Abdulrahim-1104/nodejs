# Web Application Security

## 1. CORS — Cross-Origin Resource Sharing

### What is CORS?

- CORS is a browser security mechanism that controls whether a web page can access resources from a different origin.
- It helps prevent unauthorized websites from reading responses from another origin.
- CORS protects browser-based clients, not the server itself. It is enforced by browsers.

### How does it work?

**Example:** `mybank.com` is the frontend and `api.mybank.com` is the backend.

1. `mybank.com` sends a request to `api.mybank.com`.
2. The API responds with CORS headers specifying which origins are allowed.
3. The browser checks the CORS headers.
4. If the origin is allowed, the browser allows frontend JavaScript to access the response.
5. The frontend displays the response to the user.

### What happens with an attacker?

1. An attacker creates `evil.com`.
2. A victim visits `evil.com`.
3. `evil.com` attempts to send a request to `api.mybank.com`.
4. The API responds without allowing `evil.com` through its CORS policy.
5. The browser blocks `evil.com` from accessing the response.

**Important:** CORS does not necessarily prevent the request from reaching the server. The server might process the request, but the browser prevents unauthorized JavaScript from reading the response.

### Why don't we need CORS for Postman or cURL?

Postman and cURL are independent HTTP clients, not browsers. They do not enforce browser CORS policies.

---

## 2. CSRF — Cross-Site Request Forgery

### What is CSRF?

CSRF is an attack that tricks an authenticated user's browser into sending an unwanted request to a website where the user is already logged in.

### How does it work?

1. You log in to `bank.com`.
2. Your browser stores the authentication cookie.
3. You visit an attacker's website, `evil.com`.
4. `evil.com` creates a malicious request to `bank.com`, such as transferring money.
5. Your browser automatically attaches the matching bank authentication cookie.
6. `bank.com` receives the request and assumes it was initiated by the authenticated user.
7. The server processes the request.
8. You may lose money.

### How to prevent CSRF?

- **CSRF Tokens:** The server generates a unique token that the legitimate frontend must send with state-changing requests. An attacker's website cannot normally read this token because of the browser's same-origin policy.
- **SameSite Cookies:** Restrict when browsers send cookies with cross-site requests.
- **Double Submit Cookie:** Uses a CSRF token in a cookie and requires the client to send the matching value separately.
- **Custom Headers:** Require a custom request header that an attacker cannot normally add through a simple cross-origin HTML form.

### Important considerations

- Cookie-based authentication is particularly vulnerable to CSRF because browsers automatically attach cookies.
- SameSite cookies provide protection, but CSRF tokens and other defenses may still be necessary.
- Bearer-token authentication using an explicitly supplied `Authorization` header is generally less exposed to traditional CSRF because browsers do not automatically attach that header.
- If tokens are stored in cookies, CSRF protection is still relevant.

---

## 3. XSS — Cross-Site Scripting

### What is XSS?

XSS is an attack where an attacker injects malicious JavaScript into a web page, causing it to execute in another user's browser.

### How does it work?

1. A website contains an input field that accepts user-generated content.
2. An attacker submits malicious JavaScript:

   ```html
   <script>
     alert("XSS");
   </script>
   ```

3. The application stores or displays the submitted content without proper handling.
4. Another user visits the affected page.
5. The browser executes the malicious JavaScript.

### Types of XSS

- **Stored XSS:** Malicious code is stored on the server and executed when other users view the affected content. Example: a blog comment section.
- **Reflected XSS:** Malicious input is included in a server-generated response. Example: an unsafe search results page.
- **DOM-based XSS:** Client-side JavaScript processes untrusted data and inserts it into the page unsafely. Example: malicious input in a URL.

---

## 4. SQL Injection

### What is SQL Injection?

SQL injection is an attack where an attacker manipulates SQL queries by injecting malicious SQL through user input.

### Example

An attacker enters:

```text
' OR '1'='1
```

If the application directly concatenates user input into a SQL query, the resulting query might become:

```sql
SELECT *
FROM users
WHERE username = '' OR '1'='1';
```

Since `'1'='1'` is always true, the condition matches every row.

### How to prevent SQL Injection?

- **Parameterized Queries:** Pass user input separately from SQL instructions.
- **Prepared Statements:** Separate query structure from supplied values.
- **ORM Frameworks:** Use safe query APIs that parameterize values.
- **Query Builders:** Build SQL queries using safe parameter binding.
- **Stored Procedures:** Use safely parameterized stored procedures; stored procedures alone do not automatically prevent SQL injection.

---

## 5. Rate Limiting

### What is Rate Limiting?

Rate limiting is a technique that restricts the number of requests a client can make to a server within a specified time period.

### Example

- Maximum allowed requests: 10
- Time window: 1 minute
- If a client exceeds the limit, the server responds with:

  ```http
  HTTP/1.1 429 Too Many Requests
  ```

### Purpose

- Prevent excessive API requests.
- Reduce server resource consumption.
- Help protect endpoints from abuse.
- Reduce automated attacks.

---

## 6. Request Size Limiting

### What is Request Size Limiting?

Request size limiting restricts the amount of data a client can send to the server in a single HTTP request.

### Example

- Maximum request body size: 10 KB.
- A client sends a request containing a 3 GB payload.
- The server rejects the oversized request.

Typical response:

```http
HTTP/1.1 413 Content Too Large
```

### Purpose

- Prevent memory exhaustion.
- Reduce resource abuse.
- Protect against oversized request attacks.
- Keep API requests within expected limits.

**Note:** File upload limits should also be configured separately.

---

## 7. HTTP — Hypertext Transfer Protocol

### What is HTTP?

HTTP is an application-layer protocol that defines how clients and servers structure and exchange requests and responses.

### Example

A client sends:

```http
GET /api/users HTTP/1.1
Host: api.mybank.com
Accept: application/json
```

The server responds:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "name": "Alice"
}
```

HTTP defines the structure and meaning of these messages.

---

## 8. TLS — Transport Layer Security

### What is TLS?

TLS is a cryptographic protocol that provides secure communication between clients and servers.

It provides:

- **Encryption:** Prevents outsiders from easily reading transmitted data.
- **Integrity:** Helps detect whether transmitted data has been modified.
- **Authentication:** Helps verify the server's identity using digital certificates.

### How does TLS work?

1. The client connects to the server.
2. The server provides its TLS certificate.
3. The client verifies the certificate.
4. Both sides establish shared session keys through a secure key exchange.
5. They use symmetric encryption to protect communication.

### What is HTTPS?

HTTPS is HTTP communication protected by TLS.

In simple terms:

```text
HTTP + TLS = HTTPS
```

---

## 9. Path Traversal Attack

### What is Path Traversal?

Path traversal is an attack that allows an attacker to access files or directories outside the directory intended by the application.

### How does it work?

Imagine an application stores uploaded files inside:

```text
/app/uploads/
```

An attacker manipulates a file path using `../`:

```text
../../../etc/passwd
```

The `../` sequence means moving to the parent directory.

The attacker attempts to escape the intended upload directory and access:

```text
/etc/passwd
```

### How to prevent Path Traversal?

- Never trust user-supplied file paths.
- Use server-generated filenames.
- Resolve paths using safe filesystem APIs.
- Verify that the resolved path stays inside the permitted directory.
- Apply appropriate filesystem permissions.
