## Multifactor Authentication MFA

## Factors

- Something you know (password)
- Something you have (phone)
- Something you are (biometric)

## Lets see about the 2FA (Two Factor Authentication)

## When user login with password

## When user enable 2FA

## The server creates a secret key for the user and send it to the user's phone(which can be google authenticator or any other authenticator app) that stores the secret key too

## For every 30s a new code is generated based on the current unix timestamp with secret key using HMAC (secret,current_timestamp) for every 30s but this job only happens when we need a code or refresh a code

## Now user send the code to the server and the server validates the code with the secret key and current timestamp and verifies if the code is valid or not

## see without any communcation between server and client the code is validated
