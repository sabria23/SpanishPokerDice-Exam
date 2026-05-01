/* Related to user model */
export const MIN_USERNAME_LENGTH = 3; // characters
export const MAX_USERNAME_LENGTH = 20; // characters
export const MIN_PWD_LENGTH = 8; // characters
export const MAX_PWD_LENGTH = 64; // characters
export const MIN_AGE = 18; // years 
export const DEFAULT_ELO = 1000; // default elo score, according to google
export const RECENT_GAMES = 10; // number
export const MAX_LENGTH_ABOUT_ME = 512; // Characters

/* Related to id creation */
export const MIN_ID = 0; // numbers

/* Related to gameVariant model */
export const MIN_ROUNDS = 3; // number
export const MIDRANGE_ROUNDS = 5; // number 
export const MAX_ROUNDS = 7; // number
export const MIN_TIME = 5; // seconds 
export const MIDRANGE_TIME = 7; // seconds
export const MAX_TIME = 10; // seconds
// i see that the task is 3/5/7 seconds per round, but i feel like even 7 seconds is almost too little
// are you not supposed to be able to hold the dice? How will you do that with less than 7 seconds to spare?
// don't call me out, it can easily be changed to 3 5 7


/* Related to comment model */
export const MIN_COMMENT_LENGTH = 2; // characters
export const MAX_COMMENT_LENGTH = 512; // characters

/* Related to tournament model */
export const MIN_TITLE_LENGTH = 2; // characters
export const MAX_TITLE_LENGTH = 128; // characters
export const MIN_DESCRIPTION_LENGTH = 8; // characters
export const MAX_DESCRIPTION_LENGTH = 512; // characters
export const MIN_PLAYERS = 4; // number of players
export const LOW_RANGE_PLAYERS = 8; // number of players
export const HIGH_RANGE_PLAYERS = 16; // numbers of players
export const MAX_PLAYERS = 32; // numbers of players

/* Related to ELO ratings, standard ELO rating constants */
export const ELO_K_FACTOR = 32; // number, how much a single game can change  a player's ELO
export const ELO_INITIAL_RANGE = 100; // number, initial ELO range for matchmaking
export const ELO_RANGE_INCREMENT = 50; // number, how much the range expands per time step
export const MATCHMAKING_INTERVAL_MS = 30000; // milliseconds, 30 seconds between range expansions

/* Related to Pagination */
// It's not like it's a secret, but more because I'll only have to change it 
// in one place instead of every place I have pagination. 
// Nice to have a universal value for consistency
export const PAGE = 1; // number
export const LIMIT = 20; // number