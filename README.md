# Selfie Quest!
[![Build Status](https://travis-ci.org/asifrc/selfiequest.svg?branch=master)](https://travis-ci.org/asifrc/selfiequest)

- [Dev Environment](#dev-environment)
  - [Requirements](#requirements)
  - [Environment Variables](#environment-variables)
  - [Prepopulate Users](#prepopulate-users)
  - [Start the Application](#start-the-application)
- [How to Use Selfie Quest](#how-to-use-selfie-quest)
  - [Start Selfie Quest](#start-selfie-quest)
  - [Authenticate](#authenticate)
  - [Upload a Selfie](#upload-a-selfie)
- [Missing Documentation](#missing-documentation)


## Dev environment

### Requirements
- Node.js
- MongoDB
- AWS Access Key and ID _(We recommmend using IAM, with permissions to S3)_

### Environment Variables
Place the following into a `.env` file, which is already ignored by git to protect your secrets
```
export AWS_ACCESS_KEY_ID=<YourAWSAccessKeyId>
export AWS_SECRET_ACCESS_KEY=<YourAWSAccessKey>
export AWS_S3_BUCKET=<YourS3BucketName>
export AWS_FOLDER=<FolderInS3BucketToStorePhotos>
export MONGO_DB=mongodb://localhost/selfiequestlocal
export SALT=<randomsalt>
export START_GAME=<true|false>
```

### Prepopulate users
Make sure Mongo is running and then run the following commands to add the sample users from `./tools/guestList.csv`
```
source .env
node ./tools/populateDbFromGuestCsv.js
```
The script will output the `/auth/<usertoken>` for each user, which you can use to authenticate as that user, e.g. `http://localhost:3000/auth/<usertoken>`

### Start the Application
```
source .env
npm install
npm start
```
The application should now be up and running at http://localhost:3000


## How to Use Selfie Quest

### Start Selfie Quest
Set `START_GAME=true` to start the game.

#### Background
Initially, Selfie Quest was set to run only between a specific time range. Rather than write a time-based feature, we decided the quickest implementation would be to use an environment variable that we would use to toggle the game on or off. We may want to change this in the future so it can be done through the application itself. For now, .

### Authenticate
After starting the game, navigating to the home page will error with the message that Authentication is Required. 

#### Token from PopulateDb Output
If you still have the output from `populateDbFromGuestCsv.js`, then you can just use one of the tokens to authenticate via `http://localhost:3000/auth/<usertoken>`.

#### Token from MongoDB
If you don't have the populatedb output handy, you can grab a token from mongodb as follows:
```
mongo
use <dbname>
db.users.find() //or db.users.findOne();
```
and use one of the `token` values to authenticate at `http://localhost:3000/auth/<usertoken>`

#### Background
When exploring registration/authentication models, we had several options but fairly limited time. Some of the options considered that we didn't go with were Okta/SAML integration, basic registration and username/password login.

Since we were being given a csv dump of all attendees, we didn't need a registration process; we just needed a way to upload the users, for which we wrote the scripts in `./tools`.

A key principle in our design for selfie quest was centered around viral adoption and reducing barriers to adopt. Being a mobile web app, we recognized that any login process that required typing anything on their mobile device would raise the barrier to start using selfie quest, so we ended up going with a model where we emailed everyone urls with unique tokens, and simply following the link would log them in.

### Upload a Selfie

## Missing Documentation
- How to upload a selfie
- How to setup S3
- How to setup Cloudfront
- How to delete a user from the admin page
- How to create a user via the admin api endpoint
- How to run tests
