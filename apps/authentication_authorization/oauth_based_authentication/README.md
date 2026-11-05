## JWT based Authentication

# Authentication - Verifies who are you

# Authorization - Verifies what you can do

# password must stored in the db in hashing - Hash is a one way encryption - while hashing we can use salt to get the different hashes for same input

## Once user authenticated we need to make them persist for some time since HTTP is stateless so there is differnt types of persistance logic

## we create a sepecial type of value called token which is json web token and that is signed with cryptographic algorithm and have the needed data

## user login with credential

## server generates two token -> accesstoken and refreshtoken

## accesstoken usually for the users to access the resources and refreshtoken is used to get new accesstoken when the old one expires

## why two tokens? if the token hijaced they can able to micic as you but this tokens prevent by timelimit

## because we are reducing the changes by seperating the two tokens
