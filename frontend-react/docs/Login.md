# Login flow

```mermaid
sequenceDiagram
    participant User
    participant LF as LoginForm
    participant LP as LoginPage
    participant RQuery as @tanstack/react-query <br/> (useMutation)
    participant AuthCtx as AuthContext <br/> (useAuth)
    participant AuthService as authService
    participant BE as Backend API <br/> (/api/v1/auth/login)
    participant Browser

    User->>LF: Enters Email & Password
    User->>LF: Clicks Login Button
    LF->>LP: Calls onSubmit(event) prop
    LP->>LP: handleSubmit(event) executes
    LP->>LP: Extracts email, password
    LP->>RQuery: loginMutation.mutate({ email, password })

    activate RQuery
    RQuery->>RQuery: Set state: isPending = true
    Note over RQuery, LP: LoginPage re-renders (isLoading=true)
    RQuery->>AuthService: Calls authService.login({ email, password })

    activate AuthService
    AuthService->>BE: POST /api/v1/auth/login <br/> {email, password} <br/> (credentials: 'include')
    deactivate AuthService

    activate BE
    BE->>BE: Verify Credentials (DB lookup)
    alt Login Success
        BE->>BE: Generate Access & Refresh Tokens
        BE->>BE: Update Refresh Token in DB
        BE-->>Browser: HTTP 200 OK + Set-Cookie (HttpOnly Access Token) <br/> + Set-Cookie (HttpOnly Refresh Token)
        Note over Browser: Browser stores HttpOnly cookies automatically
        BE-->>AuthService: JSON Response { success: true, result: {user info, tokens} }
    else Login Failure
        BE-->>Browser: HTTP 401/400/etc.
        BE-->>AuthService: JSON Response { success: false, message: "Error Details" }
    end
    deactivate BE

    activate AuthService
    AuthService->>AuthService: Receives Response from BE
    alt Login Success Response
        AuthService-->>RQuery: Returns { success: true, result: {...} }
    else Login Failure Response
        AuthService-->>RQuery: Throws Error("Error Details")
    end
    deactivate AuthService

    alt Login Success Mutation
        RQuery->>RQuery: Set state: isPending = false
        RQuery->>LP: Calls onSuccess(data)
        LP->>AuthCtx: auth.login(data.result)
        activate AuthCtx
        AuthCtx->>AuthCtx: Update state (user, isAuthenticated=true)
        deactivate AuthCtx
        LP->>LP: setStatus("Login successful!")
        Note over LP: (Shows success message briefly)
        LP->>LP: setTimeout starts (optional)
        LP->>LP: navigate('/dashboard')
    else Login Error Mutation
        RQuery->>RQuery: Set state: isPending = false
        RQuery->>LP: Calls onError(error)
        LP->>LP: setStatus(error.message)
        Note over LP: (Shows error message)
    end
    deactivate RQuery
```

**Explanation of the Diagram:**

1. **User Interaction:** The flow starts with the user interacting with the `LoginForm`.
2. **Component Interaction:** `LoginForm` calls the `onSubmit` handler provided by `LoginPage`.
3. **Mutation Trigger:** `LoginPage` triggers the `useMutation` hook (`loginMutation.mutate`).
4. **Loading State:** `useMutation` immediately sets its internal state to pending, causing `LoginPage` to re-render with `isLoading = true`.
5. **Service Call:** `useMutation` executes the `authService.login` function.
6. **API Request:** `authService` sends the actual POST request to the backend API endpoint, ensuring `credentials: 'include'` is set so cookies can be received and sent later.
7. **Backend Processing:** The backend verifies credentials, interacts with the database (on success), and generates tokens.
8. **Backend Response:**
    - **Success:** Sends a 2xx status, the user data/tokens in the JSON body, _and_ `Set-Cookie` headers for the HttpOnly tokens.
    - **Failure:** Sends a 4xx/5xx status and an error message in the JSON body.
9. **Browser Cookie Handling:** The browser automatically intercepts the `Set-Cookie` headers and stores the `HttpOnly` tokens securely. The frontend JavaScript _cannot_ access these.
10. **Service Response Handling:** `authService` receives the HTTP response, parses the JSON, and either returns the success data or throws an error based on the response status and the `success` flag in the JSON.
11. **Mutation Outcome:** `useMutation` receives the result (or error) from `authService`.
12. **Callbacks & State Updates:**
    - **Success:** `useMutation` calls the `onSuccess` callback in `LoginPage`. `LoginPage` updates the global `AuthContext` using `auth.login()` and sets its local status message.
    - **Error:** `useMutation` calls the `onError` callback in `LoginPage`. `LoginPage` sets its local error status message.
13. **Navigation:** On successful login, `LoginPage` navigates the user to the dashboard route.
