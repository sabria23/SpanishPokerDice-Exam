# Put here your backend for the Spanish Poker Dice Platform

The backend should largely be a copy from Oblig 2. If something is changed, mention it here.

Leave in this file any comments that you want us to read.

# changes
## CORS
Had to add cors, because it didn't allow requests from the frontend port. Moved CORS middleware before express.json() in server.js to ensure CORS headers are always set, even when multer or other middleware throws an error.
- Changes can be found in server.js at lines 25-29

## Login
Changed loginUser in user.controller.js to take in both/either username or email when logging in
- Changes can be found in user.controller.js, loginUser at lines 110-151

Changed validateLoginUser to take in both/either username or email when logging in
- Changes can be found in user.validator.js, validateLoginUser at lines 84-87

## User
Added controller for uploading and updating an avatar/profile picture.
- Addition can be found in user.controller.js at lines 189 to 226

Added folder for avatar/profile pictures to be stored
- Addition can be found at /uploads/avatars

Changed validateUpdateUser to validate the aboutMe field
- Changes can be found in user.validator.js, validateUpdateUser at lines 119-123

Modified validateUpdateUser to not send the email in if it's not updated.
- Change can be found in user.validator.js validateUpdateUser 102

Changed applyUserUpdates to be able to update user avatar/profile picture
- Changes can be found in user.services.js, applyUserUpdates at lines 22 and 26

Changed the User model to include both avatar and aboutMe fields
- Changes can be found in user.js 80-90

Updated the email uniqueness validator in the User model to allow users to save their profile without changing their email address. Previously the validator would reject the existing email as "already in use".
- Changes can be found in user.js, email validate at lines 56-60

Updated constants.js to include the max amount of characters an about me section can contain
- Changes can be found at constants.js line 9

Updated user.routes.js to include the route for the avatar/profile picture upload/update
- Changes can be found at line 32

## Games
Changed getAllGames to filter games based on userId, so that only the games that the user has played will show up on the users' all games list/table
- Changes can be found in game.controller.js at lines 23-26

Changed getAllGames to enrich player data with ELO and username from User model, so that the frontend can display ELO and username
- Changes can be found in game.controller.js at lines 42-45 and 51

Changed getGame for the same reason i changed getAllGames.
- Changs can be found in game.controller.js at lines 71-75

Made a service for getAllGames and getGame, because the enrichment happens in the same way for the both of them
- Changes can be found in game.services.js at lines 151-172

## File uploads multer
Added file uploads for avatar/profile piture. Split upload middleware into separate instances for trophies and avatars, with separate destination folders.
- Changes can be found in uploads.js at lines 40-61