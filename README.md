----------------------------
Web Architecture (COMP6218)
Assignment

Group 8

Niko Tsakalakis (nt4g14)
Georgi Tsonev (gt2g11)
Menghong Huo (mh11g11)
Jonas Oppenlaender (jo2e14)
----------------------------


Stackunderflow Website & API
=============


![Screenshot](projects/webservice/screenshots)
![Screenshot](projects/webservice/screenshots)



---
Installation
---

Extract the zip file into a folder.
Start node with this command: node app.js

The starting point for the web application is:
http://localhost:3000/

The sqlite database file is located in database/stackunderflow.db.
This file needs to be writable by the server.

Curl script: curl.sh


---
List of all valid routes
---

:qid, :aid, :cid => absolute numeric ids of question, answer, comment


/*
 * homepage
 * valid methods: GET, HEAD
 * template: views/index.html
 * validity: text/html, application/json
 */
http://localhost:3000/

/*
 * questions (alias of homepage)
 * valid methods: GET, HEAD, POST
 */
http://localhost:3000/questions

/*
 * answers of question
 * valid methods: GET, HEAD, POST
 */
http://localhost:3000/questions/:qid/answers

/*
 * comments of a specific question
 * valid methods: GET, HEAD, POST
 */
http://localhost:3000/questions/:qid/comments

/*
 * all comments of a specific answer
 * valid methods: GET, HEAD, POST
 */
http://localhost:3000/questions/:qid/answers/:aid/comments

/*
 * single question
 * valid methods: GET, HEAD, PUT, DELETE
 * template: views/singlequestion.html
 * validity: text/html, application/json
 */
http://localhost:3000/questions/:qid

/*
 * single answer
 * valid methods: GET, HEAD, PUT, DELETE
 */
http://localhost:3000/questions/:qid/answers/:aid

/*
 * single comment to question
 * valid methods: GET, HEAD, PUT, DELETE
 */
http://localhost:3000/questions/:qid/comments/:cid

/*
 * single comment to answer
 * valid methods: GET, HEAD, PUT, DELETE
 */
http://localhost:3000/questions/:qid/answers/:aid/comments/:cid

/*
 * question editor (to edit existing question)
 * valid methods: GET, HEAD
 * template: views/editor.html
 * validity: text/html
 */
http://localhost:3000/questions/:qid/edit

/*
 * answer editor (to edit existing answer)
 * valid methods: GET, HEAD
 * template: views/editor.html
 * validity: text/html
 */
http://localhost:3000/questions/:qid/answers/:aid/edit

/*
 * comment editor (for a comment to a question) (to edit existing comment)
 * valid methods: GET, HEAD
 * template: views/editor.html
 * validity: text/html
 */
http://localhost:3000/questions/:qid/comments/:cid/edit

/*
 * comment editor (for a comment to an answer) (to edit existing comment)
 * valid methods: GET, HEAD
 * template: views/editor.html
 * validity: text/html
 */
http://localhost:3000/questions/:qid/answers/:aid/comments/:cid/edit


Note: The editors for new questions/answers/comments are embedded in the frontend
and have no separate routes.


---
API-only routes
---

The following routes are only available in the API (JSON), not the frontend (HTML).

Justification: the results are embedded on the question page of the frontend.

Requesting the ...
- full list of answers of a specific question (Route: '/questions/:qid/answers')
- full list of comments of a specific question (Route: '/questions/:qid/comments')
- full list of comments for a specific answer (Route: '/questions/:qid/answers/:aid/comments')
- specific answer (Route: '/questions/:qid/answers/:aid')
- specific comment for a question (Route: '/questions/:qid/comments/:cid')
- specific comment for an answer to a question (Route: '/questions/:qid/answers/:aid/comments/:cid')


---
Frontend-only routes
---

The following routes are only available on the frontend )HTML), not the API (JSON).

Editors:
- edit a specific answer (Route: '/questions/:qid/edit'
- edit a specific answer (Route: '/questions/:qid/answers/:aid/edit')
- edit a specific comment for question (Route: '/questions/:qid/comments/:cid/edit')
- edit a specific comment for answer (Route: '/questions/:qid/answers/:aid/comments/:cid/edit')


----
Redirects
---

The route '/questions' is an alias of the homepage ('/') and redirects with a 301 HTTP status.

The following routes will redirect when the Accept-header is 'text/html':

Requesting...
- all answers of a question (Route '/questions/:qid/answers')
- all comments of a question (Route '/questions/:qid/comments')
- all comments of an answer (Route '/questions/:qid/answers/:aid/comments')
  Justification: We redirect to the page of the specific question, because all answers and comments are embedded on this page.

Creating...
- a new question (POST to '/questions')
- a new answer (POST to '/questions/:qid/answers')
- a new comment for a question (POST to /questions/:qid/comments)
- a new comment for an answer (POST to /questions/:qid/answers/:aid/comments)
  Justification: The correct status code would be 201. However, for the frontend, we issue a redirect to update the url in the browser.

Updating
- a specific question (PUT to /questions/:qid)
- a specific answer (PUT to /questions/:qid/answers/:aid)
- a specific comment for a question (PUT to /questions/:qid/comments/:cid)
- a specific comment for an answer (PUT to /questions/:qid/answers/:aid/comments/:cid)
  Justification: We issue a redirect to update the url of the frontend.

- Deleting a question (DELETE to /questions/:qid) 
  Justification: This redirects to the homepage, which is the list of all questions.

- Deleting an answer (DELETE to /questions/:qid/answers/:aid)
- Deleting a comment of a question (DELETE to /questions/:qid/comments/:cid)
- Deleting a comment of an answer (DELETE to /questions/:qid/answers/:aid/comments/:cid)
  Justification: A status code for deletions could be 204.
  We issue a redirect to the question page, which contains all answers and comments for a given question.

The following routes are not supported by our API (JSON calls) and will issue a "405 - Method Not Allowed" error:
Requesting...
- the editor for a question
- the editor for an answer
- the editor for a comment
  Justification: It does not make sense to reply with JSON when the editor is requested.


---
HTTP response to deletions
---

If JSON is requested, the API will respond with a 204 STATUS code on deletions without outputting a success message.
The frontend will redirect to the appropriate page and page fragment.


---
Date and Times
---

The JSON API will return the date/time formatted as integer unix timestamp (number of seconds elapsed since 00:00:00 Coordinated Universal Time (UTC), Thursday, 1 January 1970).
This allows custom formatting.
The website on the other hand outputs the date in a more readable format (e.g. "x minutes ago").


---
Other Default Behavior
---

If the accept header is missing, the web application will respond with HTML on routes that support HTML.
It will respond with JSON on routes that do not support HTML.


The number of questions shown on the home page is limited to 30 questions.

The application will output debug information to the console.