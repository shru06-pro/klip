/**
 * ==============================================================================
 * FILE: backend/utils/validateUrl.js
 * WHAT IT DOES: Utility regex function verifying whether a string satisfies standard
 *               web URL syntax including protocols, domain structures, IP ranges, and ports.
 * WHERE IT IS CALLED FROM: Utility validation helper (also validated in backend/controllers/url.js).
 * WHOM IT CALLS: RegExp.test(value).
 * WHERE THAT CALL IS GOING: Returns boolean (true if valid URL, false otherwise).
 * ==============================================================================
 */

/**
 * FUNCTION: validateUrlRegex(value)
 * WHAT IT DOES: Evaluates a string against a comprehensive RFC-compliant URL regex.
 * WHERE IT IS CALLED FROM: Inbound link creation validation.
 * WHOM IT CALLS: RegExp.test().
 * WHERE THAT CALL IS GOING: In-memory boolean return.
 */
module.exports = (value) => {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
    value
  )
}