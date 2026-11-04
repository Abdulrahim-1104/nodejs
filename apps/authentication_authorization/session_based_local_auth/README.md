## Local based Authentication

# Authentication - Verifies who are you

# Authorization - Verifies what you can do

# password must stored in the db in hashing - Hash is a one way encryption - while hashing we can use salt to get the different hashes for same input

## Once user authenticated we need to make them persist for some time since HTTP is stateless so there is differnt types of persistance logic

## Session based persistence -> we create session for each user and store it in our (either in memory-> using express-session or in db/redis)

## We apporached the in memory session storage using express-session

## configure the middleware for session using express-session that automatcially parse the cookie and fetch the session data for the associative user
