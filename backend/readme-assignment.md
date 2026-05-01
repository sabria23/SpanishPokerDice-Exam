[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/1bAuy7_W)
# IDG2100-2026-oblig2

This document contains the description and starter code for oblig2: IDG2100 Spring 2026.

## Goals

- Demonstrate your understanding of REST `APIs` for the Web, including how to design, build, and use them.

- Show that you understand and can apply best practices in `API` design, documenting your process (define business objectives, outline key user stories, select technology architecture, write API specifications).

- Demonstrate that you can design and build a web server using `Node.js` and `Express.js`, which will serve as the backend for your API. This includes proper handling of CRUD operations and incoming data.

- Demonstrate that you can structure and develop a NoSQL database (MongoDB) following best practices, connecting your API endpoints to database operations.

The project is evaluated based on the above goals. Your code must include sufficient comments to demonstrate your understanding of the technologies and best practices.

## Context

This is an individual task, and you are required to build everything from the ground up. While you may utilize snippets of code from tutorials or official documentation, you must clearly acknowledge the sources in the comments of your code. Plagiarism or cheating will be deemed to have taken place if the submitted code shows substantial similarities to other students' assignments or projects found online. In such cases, the matter will be reported to the NTNU appeals committee for further examination. If you have any doubts regarding the use of materials for your project, please reach out to the instructors for clarification.

If the assignment is graded as "not approved" you will have an additional opportunity to re-submit it based on the following conditions:

- The original submission met the deadline.

- The submission included a significant amount of work (not empty).

- The resubmitted project addresses additional features (see Additional Task).

## Brief: Spanish Poker Dice Platform API

You have already implemented the core part for playing Spanish Poker Dice games using native web components (Oblig 1).

Imagine that you are working in a two-person team on a platform to host Spanish Poker Dice games and matches. The other person is responsible for implementing front-end, while you are responsible for back-end. The team has chosen to rely on the MERN stack. You now need to implement a REST API for the app but you must first design the API and document it correctly so the other members of the team can use it without difficulty.

Your task is to develop the backend platform to host games, manage users, track matches, organize tournaments, and display leaderboards.

The API should support the following:

- User registration and profiles
- Creating, inviting someone to join and joining matches
- Saving the results of Poker Dice matches
- Creating, joining, and managing tournaments (random pairing in knockout tournaments)
- Leaderboards with rankings by wins, win percentage, and number of matches

## Interaction Flow

Designing an API often starts with imagining the use cases it is intended to support. Understanding potential user interactions with the frontend - which will rely on your API - helps you identify these use cases and, subsequently, decide on the endpoints to implement. Your API should allow the frontend to provide the following functionality.

### Regular Users

1. **Seeing Platform Activity**. Users arrive on the platform and see leaderboards (in different categories, e.g., best of 3/5/7, straights allowed/not allowed, and 3/5/7 seconds per round), upcoming and past tournaments (date/time, pocker variant, all games and results, participating users, tournament standings, tournament-level comments), and platform activity (e.g., number of ongoing games, number of active users this week, and the last 10 games played on the platform).

2. **Registration and Login**. Users can register and login[^0]. Users can view and update their profiles: username (can't be updated), email, pwd, age (min 18 years old to register), [ELO Rating](https://www.geeksforgeeks.org/dsa/elo-rating-algorithm/) (updates automatically after each game), change in the rating in the last week, 10 most recent games, and won trophies (winning a tournament grants its trophy). <!-- NOTE: might be a bit too much for this Oblig to ask for Email Confirmation -- keeping it for Final Assignment -->

3. **Playing Games**. Users can play games: users choose the variant of Spanish Poker they'd like to play and wait until they are (automatically) matched against a suitable-ELO opponent (the more time passes, the more relaxed ELO requirement becomes[^1]). The game is played[^2] and results recorded (timestamps, players, rolls, holds, final outcome, and comments). Other users can spectate games (you don't need to implement real-time game updates, just opening a page about a specific game). All registered users can leave comments on any game, even after a game is finished.

<!-- Disabling to make it an easier task for the students -->
<!-- 4. **Inviting Friends**. Users can create a game and send a link to their friend (using ways unrelated to this API, e.g., by sending the link via email or Discord). The game does not begin until both users join it. These games are private and only visible to the two players. -->

4. **Joining Tournaments**. Users can join and play games in tournaments: willing users are added in the pool of players; when a tournament begins, they are paired randomly and play a game; the winner proceeds to the next stage (automatically if there isn't a pair player found for them). All registered users can leave comments on the tournament itself (not just games within it). The tournament runs and its results are recorded and are later visible to users on the tournament's page.

5. **Joining Arena Tournames**. [Extra Task for Those Who Resubmit] Users can join and play games in arena tournaments. Such tournaments have a fixed duration (e.g., an hour) during which players are paired continously with those who have a similar number of points to them. A win gives a player a point. The player with the most points by the end of the hour wins.

[^1]: You'd need to implement a player-matching algorithm. One potential way to do that would include putting a player in a virtual queue and waiting until a near-same-ELO player also enter the queue. If a substantil time passes, but there isn't a suitable match, the definition of "near-same-ELO" is relaxed. If more time passes, and there still isn't a match, it is relaxed further and so on.

[^2]: Presume that the actual game and real-time live-game updates are handled by another team. You do not need to support it in your API, for now.

### Anonymous Users

1. **Seeing Platform Activity**. Anonymous users arrive on the platform and can see platform activity, similar to registered users.

2. **Playing Games**. Anonymous users can be matched against other anonymous users. ELO isn't accounted for. Anonymous users cannot leave comments. Game results are saved, but the games are not listed in platform activity. Anonymous users cannot join tournaments.

## Admin Users

1. **Regular Usage**. Admin users can do everything that regular registered users can.

2. **Creating Tournaments**. Admins can create tournaments. Tournaments have a pre-defined format (e.g., the variant of Dice Pocker, lengths of breaks between rounds, and min/max number of rounds), start date/time, title with description, and trophy (title and custom image). The trophy image is later displayed in the winner's profile in a trophy "cabinet".

3. **Managing Platform**. Admins can view and search through the user list, and ban users. Admins can view newly posted and search through all comments and delete some of them if needed.

## Extra Detail

Dice Pocker games can fall in several categories, based on the number of rounds in a game (e.g., best of 3/5/7), game rules (straights allowed/not allowed), and time controls (e.g., 5/10/15 seconds per game round). The combination of the above parameters could result in up to 18 categories (3 number-of-rounds categories \* 2 game-rule categories \* 3 time control categories). Your API allow for having these categories.

Actually playing games - not just loading a page with a game info - is best supported by other technologies than REST APIs, e.g. by Web Socket API. You do **not** need to implement the game playing and game spectating functionality in this version of the Spanish Pocker Dice platform backend. This type of functionality would include passing messages between players' computers and the server on game actions (e.g., a separate, timely-broadcasted message for each die roll, each user action of die "holding", and each user click on "end round").

Your API is to support a Spanish Pocker Dice platform, with the games played on two different, remote machines. This is different from what you implemented in Oblig 1, where you only supported playing a game on the same machine.

There are three types of presumed users: anonymous users, registered users, and admins. You don't need to implement fully-fledged authentication and authorization in this version of your API, but you may want to have rudimentary authentication/authorization Express.js middleware that sets a user type (e.g., based on the headers in the incoming request) for your API to react to.

## Task

- Sketch out an API specification using the templates in `documentation`.

- Build a local webserver with Node.js and Express.js. The data for your API should be stored in a local database (MongoDB).

- Design and implement MongoDB schemas for all the collections you need to fullfil the requirments described above. Consider the attributes that will belong in each collection and whether they will be required upon creation.

- Populate your database with some dummy data. Consider what you need to make the API work well without asking for irrelevant info (TIP: use the package.json file to include a custom script that you can execute to populate the database).

- Implement all API endpoints necessary for the developed app to function. Ensure proper incoming data handling and connect your endpoints to database operations.

- Ensure your code is properly structured (based on the best practices related to the modular app architecture) and has sufficient comments.

- Prepare REST Client query collections to test your APIs.

<!-- I'm disabling this requirement for now - I prefer their code to be more readable if I;m to grade it manually... -->
<!-- - Document your REST API endpoints using `swagger-ui-express` and `swagger-jsdoc`. -->

> [!Important]
> Remember that you do not need to develop any of the front-end aspects of this project, only the back end.

## API Considerations

Besides implementing relevant CRUD operations on users, matches, tournaments and comments, you will want to implement proper filtering, sorting and pagination capabilities for your endpoints: your API should not overwhelm the frontend with too much data at once.

Try to avoid simply trivially forwarding data from your database intact to the frontent. Your application should have business logic, which would transform what is stored in the database into what is appropriate to send to the frontend.

Make sure to follow best practices for REST APIs, which includes practices for endpoint naming, layered app architecture, user data validation, [file upload](https://expressjs.com/en/resources/middleware/multer.html), suitable limits on API usage, suitable error messages, and integrity of data in database.

## Folder Structure

- `documentation/` this folder contains the templates you must use and edit to document your `API`.

- `REST scripts/` this folder must contain your queries showing how all your collections and endpoints work. There has to be a query for every endpoint and verb.

- `project/` this will be the root folder of your project. All your code and `API` must be here.

## Delivery

This assignment must be delivered in two different places: GitHub classroom and Blackboard.

- To deliver the assignment in GitHub Classroom, you only need to make sure all your changes and commits are pushed to your Git repository.
- A Pull request is created automatically when the repository is cloned. Feedback will be included there if needed. Do not remove or close that Pull Request.
- Only the changes in the "main" branch will be considered for giving feedback or grading the assignment.

- It is imperative that you work exclusively with this Git repository to ensure that all modifications are trackable and your code is backed up on a regular basis. Hence, you should commit your progress directly to this repository each time you make advancements.

- Before delivering the assignment in Blackboard, make sure your project has all the files it needs. Delete any file, folder or info that is not needed (this is `.git/` folder, `node_modules`, etc.). Zip the project and upload the file to Blackboard.

- Don't forget to add all the `API` specs in `documentation` and your query collection in the `REST scripts` folder.
