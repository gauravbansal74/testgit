//-------------------------------------------- SESSION -------------------------------------

/**
 * @api {get} /new_session/ Get a new session
 * @apiName GetSession
 * @apiGroup Session
 */
function getNewSession() { 
	var result=[
		"code": "2000", 
		"message":"successful"
	];
	return result; 
}


/**
 * @api {get} /session_details/ Get the session details 
 * @apiName GetSessionDetails
 * @apiGroup Session
 * @apiSampleRequest /get-session-details/:userid
 */
function getSessionDetails() { 
	return; 
}


