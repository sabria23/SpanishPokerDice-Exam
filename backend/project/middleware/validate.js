/* Copied directly from inclass code from IDG2100 Fullstack 2026 */
import { validationResult, matchedData } from "express-validator";

// here we'll have "shared" pieces of middleware relatred to data validation:
// e.g., the one to react to the data being invalid

export default function validate(req, res, next) {
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		// sending some sort of a message to the user to tell them that their data were invalid
		return res.status(400).json({ errors: errors.array()});
	}
	req.validData = matchedData(req);
	next();
}