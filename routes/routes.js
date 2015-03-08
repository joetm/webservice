/*global require, console*/

var app = require('../app');

var express = require('express'); //this is loaded 'twice' - we need to remove this
var router = express.Router(); //this is also duplicate code - see app.js
app.use(router);


//--------------------------------------------------------------------------------------------------
// GET request handler

// GET full list of questions
// template: index.html
// validity: HTML and JSON
router.get('/',  function (req, res, next) {
    "use strict";

    var limit = 30, //limit of questions on the homepage
        //sort order options
        sort_by = req.query.sortby || 'date',
        sort_order;

    //validate requested sort order
    switch (sort_by) {
    case 'title':
        //alphabetically by title
        sort_order = "A";
        break;
    case 'date':
        sort_order = "Z";
        break;
    default:
        sort_by = 'date';
        sort_order = "Z";
        break;
    }

    //get the questions
    req.models.question.find({}, [sort_by, sort_order], limit, function (err, questions) {

        if (err) { //do NOT check for empty questions array here, to prevent the site from becoming dysfunctional if no questions are present (in this case, at least the editor to add a new question should be showing)
            err.status = 404; //Not Found
            next(err);
        } else {

            //output
            res.format({

                'text/html': function () {

                    //create the readable date for each question (HTML only)
                    var calcReadableTime = require('../bin/timedifference'),
                        i = 0,
                        s = questions.length;
                    for (i; i < s; i = i + 1) {
                        if (questions[i] !== undefined && questions[i].date !== undefined) {
                            questions[i].time = calcReadableTime(questions[i].date);
                        }
                    }

                    res.render('index', {'questions' : questions});
                },

                'application/json': function () {
                    res.set('Content-Type', 'application/json');
                    res.json(questions);
                },

                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406;
                    return next(response);
                }

            });//res.format

        }//else

    });//req.models.question.find

});//router.get('/'


// GET full list of questions (alias of '/')
// template: (none)
// validity: any (redirect)
router.get('/questions', function (req, res) {
    "use strict";
    //res.status(301);
    res.redirect(301, '/');
});//router.get('/questions'


// GET full list of answers for specific question (icnluding the comments to these answers)
// template: (API call)
// validity: JSON only
router.get('/questions/:qid/answers', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        err;

    //question id is not numeric
    if (isNaN(question_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing question id';
        next(err);
    }

    // get specific record in model by ID
    req.models.question.get(question_id, function (err, question) {

        if (err || !question) {
            err.status = 404; //Not Found
            next(err);
        } else {

            // get corresponding answers associate with the question
            question.getAnswer(function (err, answers) {

                if (err || !answers) {
                    err.status = 404;
                    next(err);
                } else {

                    //output
                    res.format({

                        'text/html': function () {
                            res.redirect(303, '/questions/' + question_id);
                        },

                        'application/json': function () {

                            //remove question from each answer
                            var s = answers.length,
                                i = 0;
                            for (i; i < s; i = i + 1) {
                                delete (answers[i].question);
                            }

                            res.set('Content-Type', 'application/json');
                            res.json(answers);
                        },

                        // format not recognised
                        // respond with 406 error
                        'default': function () {
                            var response = new Error("Not Acceptable");
                            response.status = 406;
                            return next(response);
                        }

                    });//res.format

                }//else

            });//question.getAnswer

        }//else

    });//req.models.question.get(question_id

});//router.get('/questions/:qid/answers'


// GET full list of comments for specific question
// template: (API call)
// validity: JSON only
router.get('/questions/:qid/comments', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        err;

    //question id is not numeric
    if (isNaN(question_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing question id';
        next(err);
    }

    //get the question
    req.models.question.get(question_id, function (err, question) {

        if (err || !question) {
            err.status = 404; //Not Found
            next(err);
        } else {

            //get the comment for the question
            question.getComment(function (err, comments) {

                if (err || !comments) {
                    err.status = 404;
                    next(err);
                } else {

                    //output
                    res.format({

                        'text/html': function () {
                            res.redirect(303, '/questions/' + question_id);
                        },

                        'application/json': function () {

                            //remove question from each comment
                            var s = comments.length,
                                i = 0;
                            for (i; i < s; i = i + 1) {
                                delete (comments[i].question);
                            }

                            res.set('Content-Type', 'application/json');
                            res.json(comments);
                        },

                        // format not recognised
                        // respond with 406 error
                        'default': function () {
                            var response = new Error("Not Acceptable");
                            response.status = 406;
                            return next(response);
                        }

                    });//res.format

                }//else

            });//question.getComment

        }//else

    });//req.models.question.get

});//router.get('/questions/:qid/comments'


// GET full list of comments for specific answer
// template: (API call)
// validity: JSON only
router.get('/questions/:qid/answers/:aid/comments', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        answer_id = req.params.aid,
        err;

    //question id or answer id is not numeric
    if (isNaN(question_id) || isNaN(answer_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing question id or answer id';
        next(err);
    }

    //get the answer
    req.models.answer.get(answer_id, function (err, answer) {

        if (err || !answer) {
            err.status = 404; //Not Found
            next(err);
        } else {

            // get comments for the corresponding answer
            answer.getComment(function (err, comments) {

                if (err || !comments) {
                    err.status = 404; //Not Found
                    next(err);
                } else {

                    //output
                    res.format({

                        'text/html': function () {
                            res.redirect(303, '/questions/' + question_id);
                        },

                        'application/json': function () {

                            //remove question from each comment
                            var s = comments.length,
                                i = 0;
                            for (i; i < s; i = i + 1) {
                                delete (comments[i].answer);
                            }

                            res.set('Content-Type', 'application/json');
                            res.json(comments);
                        },

                        // format not recognised
                        // respond with 406 error
                        'default': function () {
                            var response = new Error("Not Acceptable");
                            response.status = 406;
                            return next(response);
                        }

                    });//res.format

                }//else

            });//answer.getComment

        }//else

    });//req.models.answer.get

});//router.get('/questions/:qid/answers/:aid/comments'


// GET specific question (including all answers and comments for this question)
// template: singlequestion
// validity: HTML and JSON
router.get('/questions/:qid', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        err,
        calcReadableTime = require('../bin/timedifference');

    //question id is not numeric
    if (isNaN(question_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing question id';
        next(err);
    }

    //get the question
    req.models.question.get(question_id, function (err, question) {

        if (err || !question) {
            err.status = 404; //Not Found
            next(err);
        } else {

            question.getAnswer(function (err, answers) {

                if (err) { //no check for empty answers here
                    err.status = 404; //Not Found
                    next(err);
                } else {

                    //output
                    res.format({

                        'text/html': function () {

                            //create the readable date for the question (HTML only)
                            var i = 0, //iterator for question (reused for answers)
                                j = 0, //iterator for comments
                                t = 0, //answers[i].comment.length
                                s = question.comment.length;
                            if (question.date !== undefined) {
                                question.time = calcReadableTime(question.date);
                            }
                            //create the readable date for the comments to the question
                            for (i; i < s; i = i + 1) {
                                if (question.comment[i].date !== undefined) {
                                    question.comment[i].time = calcReadableTime(question.comment[i].date);
                                }
                            }
                            //create the readable date for the answers
                            i = 0;
                            s = answers.length;
                            for (i; i < s; i = i + 1) {
                                //create the readable date for the answer
                                if (answers[i].date !== undefined) {
                                    answers[i].time = calcReadableTime(answers[i].date);
                                }
                                //create the readable date for the comments to this answer
                                if (answers[i].comment) {
                                    t = answers[i].comment.length;
                                    for (j; j < t; j = j + 1) {
                                        if (answers[i].comment[j].date !== undefined) {
                                            answers[i].comment[j].time = calcReadableTime(answers[i].comment[j].date);
                                        }
                                    }
                                }
                            }
                            i = j = t = s = null;

                            res.status(200);
                            res.render('singlequestion', {'question': question, 'answers': answers});
                        },

                        'application/json': function () {
                            res.status(200);
                            res.set('Content-Type', 'application/json');
                            res.json(question);
                        },

                        // format not recognised
                        // respond with 406 error
                        'default': function () {
                            var response = new Error("Not Acceptable");
                            response.status = 406;
                            return next(response);
                        }

                    });//res.format

                }//else

            });//question.getAnswer

        }//else

    });//req.models.question.get

});//router.get('/questions/:qid'


// GET specific answer (including all comments for this answer)
// template: (API call)
// validity: JSON only
router.get('/questions/:qid/answers/:aid', function (req, res, next) {
    "use strict";

    var answer_id = req.params.aid,
        err;

    //answer id is not numeric
    if (isNaN(answer_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing answer id';
        next(err);
    }

    //get the answer
    req.models.answer.get(answer_id, function (err, answer) {

        if (err || !answer) {
            err.status = 404; //Not Found
            next(err);
        } else {

            //output
            res.format({

                //this is only valid for API
                'text/html': function () {
                    var response = new Error("Method Not Allowed");
                    response.status = 405;
                    return next(response);
                },

                'application/json': function () {
                    res.status(200);

                    //remove question from each answer
                    if (answer.question !== undefined) {
                        delete (answer.question);
                    }

                    res.set('Content-Type', 'application/json');
                    res.json(answer);
                },

                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406;
                    return next(response);
                }

            });//res.format

        }//else

    });//req.models.answer.get

});//router.get('/questions/:qid/answers/:aid'


// GET specific comment for a question
// template: (API call)
// validity: JSON only
router.get('/questions/:qid/comments/:cid', function (req, res, next) {
    "use strict";

    var comment_id = req.params.cid,
        err;

    //comment id is not numeric
    if (isNaN(comment_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing comment id or answer id';
        next(err);
    }

    //get the comment for the question
    req.models.question_comment.get(comment_id, function (err, comment) {

        if (err || !comment) {
            err.status = 404;
            next(err);
        } else {

            //output
            res.format({
                //this is only valid for API
                'text/html': function () {
                    var response = new Error("Method Not Allowed");
                    response.status = 405;
                    return next(response);
                },
                'application/json': function () {
                    res.status(200);

                    //remove question from each answer
                    if (comment.question !== undefined) {
                        delete (comment.question);
                    }

                    res.set('Content-Type', 'application/json');
                    res.json(comment);
                },
                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406;
                    return next(response);
                }

            });//res.format

        }//else

    });//req.models.question_comment.get

});//router.get('/questions/:qid/comments/:cid'


// GET specific comment for an answer
// template: (API call)
// validity: JSON only
router.get('/questions/:qid/answers/:aid/comments/:cid', function (req, res, next) {
    "use strict";

    var comment_id = req.params.cid,
        err;

    //comment id is not numeric
    if (isNaN(comment_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing comment id';
        next(err);
    }

    //get the comment for the answer
    req.models.answer_comment.get(comment_id, function (err, comment) {

        if (err || !comment) {
            err.status = 404;
            next(err);
        } else {

            //output
            res.format({
                //this is only valid for API
                'text/html': function () {
                    var response = new Error("Method Not Allowed");
                    response.status = 405;
                    return next(response);
                },
                'application/json': function () {
                    res.status(200);

                    //remove question from each answer
                    if (comment.answer !== undefined) {
                        delete (comment.answer);
                    }

                    res.set('Content-Type', 'application/json');
                    res.json(comment);
                },
                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406;
                    return next(response);
                }

            });//res.format

        }//else

    });//req.models.answer_comment.get

});//router.get('/questions/:qid/answers/:aid/comments/:cid'


/*---------------*/
/* EDITOR ROUTES */
/*---------------*/

// GET editor to edit a specific question
// template: editor.html
// validity: HTML only
router.get('/questions/:qid/edit', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        err;

    //question id is not numeric
    if (isNaN(question_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing question id';
        next(err);
    }

    //get the question
    req.models.question.get(question_id, function (err, question) {

        if (err || !question) {
            err.status = 404; //Not Found
            next(err);
        } else {

            //output
            res.format({

                'text/html': function () {
                    res.status(200);
                    res.render('editor', {'title': "Edit Question", 'content': question, 'url': '/questions/' + question_id });
                },
                //editor cannot be called with json
                'application/json': function () {
                    var response = new Error("Method Not Allowed");
                    response.status = 405;
                    return next(response);
                },
                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406;
                    return next(response);
                }

            });//res.format

        }//else

    });//req.models.question.get

});//router.get('/questions/:qid/edit'


// GET editor to edit a specific answer
// template: editor.html
// validity: HTML only
router.get('/questions/:qid/answers/:aid/edit', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        answer_id = req.params.aid,
        err;

    //question id and answer id must be numeric
    if (isNaN(question_id) || isNaN(answer_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing question id or answer id';
        next(err);
    }

    //get the answer
    req.models.answer.get(answer_id, function (err, answer) {

        if (err || !answer) {
            err.status = 404; //Not Found
            next(err);
        } else {

            //output
            res.format({
                'text/html': function () {
                    res.render('editor', {'title': "Edit Answer", 'content': answer, 'url': '/questions/' + question_id + '/answers/' + answer_id });
                },
                //editor cannot be called with json
                'application/json': function () {
                    var response = new Error("Method Not Allowed");
                    response.status = 405;
                    return next(response);
                },
                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406;
                    return next(response);
                }
            });//res.format

        }//else

    });//req.models.answer.get

});//router.get('/questions/:qid/answers/:aid/edit'


// GET editor to edit a specific comment of a question
// template: editor.html
// validity: HTML only
router.get('/questions/:qid/comments/:cid/edit', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        comment_id = req.params.cid,
        err;

    //question id or comment id is not numeric
    if (isNaN(question_id) || isNaN(comment_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing question id or comment id';
        next(err);
    }

    //get the comment
    req.models.question_comment.get(comment_id, function (err, comment) {

        if (err || !comment) {
            err.status = 404; //Not Found
            next(err);
        } else {

            //output
            res.format({

                'text/html': function () {
                    res.render('editor', {'title': "Edit Comment", 'content': comment, 'url': '/questions/' + question_id + '/comments/' + comment_id });
                },
                //editor cannot be called with json
                'application/json': function () {
                    var response = new Error("Method Not Allowed");
                    response.status = 405;
                    return next(response);
                },
                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406;
                    return next(response);
                }

            });//res.format

        }//else

    });//req.models.question_comment.get

});//router.get('/questions/:qid/comments/:cid/edit'


// GET editor to edit a specific comment of an answer
// template: editor.html
// validity: HTML only
router.get('/questions/:qid/answers/:aid/comments/:cid/edit', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        answer_id = req.params.aid,
        comment_id = req.params.cid,
        err;

    //comment id or answer id or comment id is not numeric
    if (isNaN(question_id) || isNaN(answer_id) || isNaN(comment_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing question id or answer id or comment id';
        next(err);
    }

    //get the answer
    req.models.answer_comment.get(comment_id, function (err, comment) {

        if (err || !comment) {
            err.status = 404; //Not Found
            next(err);
        } else {

            //output
            res.format({

                'text/html': function () {
                    res.render('editor', {'title': "Edit Comment", 'content': comment, 'url': '/questions/' + question_id + '/answers/' + answer_id + '/comments/' + comment_id });
                },
                //editor cannot be called with json
                'application/json': function () {
                    var response = new Error("Method Not Allowed");
                    response.status = 405;
                    return next(response);
                },
                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406;
                    return next(response);
                }

            });//res.format

        }//else

    });//req.models.answer_comment.get

});//router.get('/questions/:qid/answers/:aid/comments/:cid/edit'


//-----------------------------------------------------------------------------
// POST request handler
//-----------------------------------------------------------------------------

// POST to create a new question
// template: (none)
// validity: HTML (redirect) and JSON
router.post('/questions', function (req, res, next) {
    "use strict";

    var username = req.body.username,
        title = req.body.title,
        content = req.body.content,
        timenow = parseInt(new Date().getTime() / 1000, 10),
        err;

    //title, content or username may not be empty
    if (!title || !content || !username) {
        err = new Error("Bad Request");
        if (!content) { err.message = "Question cannot be blank"; }
        if (!title) { err.message = "Title cannot be blank"; }
        if (!username) { err.message = "Username cannot be blank"; }
        err.status = 406;
        return next(err);
    }

    //create the question
    req.models.question.create({
        'title' : title,
        'content' : content,
        'username' : username,
        'solved' : 0,
        'date' : timenow
    }, function (err, question) {

        if (err || !question) {
            err.status = 404; //Not Found
            next(err);
        } else {

            //output
            res.format({

                'text/html': function () {
                    //res.status(201); //we redirect instead
                    res.redirect(303, '/questions/' + question.id);
                },

                'application/json': function () {
                    res.status(201);
                    res.set('Content-Type', 'application/json');
                    res.json(question);
                },
                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406;
                    return next(response);
                }

            });//res.format

        }//else

    });//req.models.question.create

});//router.post('/questions'


// POST to create a new answer for a specific question
// template: (none)
// validity: HTML (redirect) and JSON
router.post('/questions/:qid/answers', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        username = req.body.username,
        content = req.body.content,
        timenow = parseInt(new Date().getTime() / 1000, 10),
        err;

    //question id is not numeric
    if (isNaN(question_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing question id';
        next(err);
    }

    //username and content are required
    if (!username || !content) {
        err = new Error("Bad Request");
        if (!username) { err.message = "Username cannot be blank"; }
        if (!content) { err.message = "Answer cannot be blank"; }
        err.status = 406;
        return next(err);
    }

    req.models.answer.create({
        'content' : content,
        'username' : username,
        'question_id': question_id,
        'date' : timenow
    }, function (err, answer) {

        //answer should not be empty
        if (err || !answer) {
            err.status = 404; //Not Found
            next(err);
        } else {

            //fragment for redirect
            var fragment = answer.id ? '#answer-' + answer.id : '';

            //output
            res.format({

                'text/html': function () {
                    //res.status(201); //we redirect instead
                    res.redirect(303, '/questions/' + question_id + fragment);
                },

                'application/json': function () {
                    res.status(201);
                    res.set('Content-Type', 'application/json');
                    res.json(answer);
                },

                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406;
                    return next(response);
                }

            });//res.format

        }//else

    });//req.models.answer.create

});//router.post('/questions/:qid/answers'


// POST to create a new comment for a specific question
// template: (none)
// validity: HTML (redirect) and JSON
router.post('/questions/:qid/comments', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        username = req.body.username,
        content = req.body.content,
        timenow = parseInt(new Date().getTime() / 1000, 10),
        err;

    //question id is not numeric
    if (isNaN(question_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing question id';
        next(err);
    }

    //content and username are required
    if (!content || !username) {
        err = new Error("Bad Request");
        if (!content) { err.message = "Comment cannot be blank"; }
        if (!username) { err.message = "Username cannot be blank"; }
        err.status = 406;
        return next(err);
    }

    //create the comment
    req.models.question_comment.create({
        'content' : content,
        'username' : username,
        'question_id': question_id,
        'date' : timenow
    }, function (err, comment) {

        if (err || !comment) {
            err.status = 404; // Not Found
            next(err);
        } else {

            //fragment for redirect
            var fragment = comment.id ? '#question-comment-' + comment.id : '',
                calcReadableTime; //readable time function (called later to save resources)

            //output
            res.format({

                'text/html': function () {

                    //create the readable date for each question (HTML only)
                    calcReadableTime = require('../bin/timedifference');
                    if (comment.date !== undefined) {
                        comment.time = calcReadableTime(comment.date);
                    }

                    //res.status(201); //we redirect instead
                    res.redirect(303, '/questions/' + question_id + fragment);
                },

                'application/json': function () {
                    res.status(201);
                    res.set('Content-Type', 'application/json');
                    res.json(comment);
                },

                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406;
                    return next(response);
                }

            });//res.format

        }//else

    });//req.models.question_comment.create

});//router.post('/questions/:qid/comments'


// POST to create a new comment for a specific answer
// template: (none)
// validity: HTML (redirect) and JSON
router.post('/questions/:qid/answers/:aid/comments', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        answer_id = req.params.aid,
        username = req.body.username,
        content = req.body.content,
        timenow = parseInt(new Date().getTime() / 1000, 10),
        err;

    //question id or answer id is not numeric
    if (isNaN(question_id) || isNaN(answer_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing question id or answer id';
        next(err);
    }

    //content and username are required
    if (!content || !username) {
        err = new Error("Bad Request");
        if (!content) { err.message = "Comment cannot be blank"; }
        if (!username) { err.message = "Username cannot be blank"; }
        err.status = 406;
        return next(err);
    }

    //create comment
    req.models.answer_comment.create({
        'content' : content,
        'username' : username,
        'answer_id': answer_id,
        'date' : timenow
    }, function (err, comment) {

        if (err || !comment) {
            err.status = 404; //Not Found
            next(err);
        } else {

            //fragment for redirect
            var fragment = comment.id ? '#answer-comment-' + comment.id : '',
                calcReadableTime; //readable time function (called later to save resources)

            //output
            res.format({

                'text/html': function () {

                    //readable date for the comment (HTML only)
                    calcReadableTime = require('../bin/timedifference');
                    if (comment.date !== undefined) {
                        comment.time = calcReadableTime(comment.date);
                    }

                    //res.status(201); //we redirect instead
                    res.redirect(303, '/questions/' + question_id + fragment);
                },

                'application/json': function () {
                    res.status(201);
                    res.set('Content-Type', 'application/json');
                    res.json(comment);
                },

                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406;
                    return next(response);
                }

            });//res.format

        }//else

    });//req.models.answer_comment.create

});//router.post('/questions/:qid/answers/:aid/comments'


//--------------------------------------------------------------------------------------------------
//PUT request handler
//--------------------------------------------------------------------------------------------------

// PUT to modify an existing question
// template: (none)
// validity: HTML (redirect) and JSON
router.put('/questions/:qid', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        username = req.body.username,
        title = req.body.title,
        content = req.body.content,
        timenow = parseInt(new Date().getTime() / 1000, 10),
        err;

    //question id is not numeric
    if (isNaN(question_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing question id';
        next(err);
    }

    //title, content and username is required
    if (!title || !content || !username) {
        err = new Error("Bad Request");
        if (!content) { err.message = "Question cannot be blank"; }
        if (!title) { err.message = "Title cannot be blank"; }
        if (!username) { err.message = "Username cannot be blank"; }
        err.status = 406;
        return next(err);
    }

    //get the question
    req.models.question.get(question_id, function (err, question) {

        if (err || !question) {
            err.status = 404; //Not Found
            next(err);
        } else {

            //overwrite existing values with the ones that were just received
            question.username = username;
            question.title = title;
            question.content = content;
            question.solved = 0;
            question.date = timenow;

            //save the question
            question.save(function (err) {
                if (err) {
                    console.log(err);
                    next(err);
                }
            });

            //output
            res.format({

                'text/html': function () {
                    //res.status(200); //we redirect instead
                    res.redirect(303, '/questions/' + question_id);
                },

                'application/json': function () {
                    res.status(200);
                    res.set('Content-Type', 'application/json');
                    res.json(question);
                },

                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406;
                    return next(response);
                }

            });//res.format

        }//else

    });//req.models.question.get

});//router.put('/questions/:qid'


// PUT to modify an existing answer
// template: (none)
// validity: HTML (redirect) and JSON
router.put('/questions/:qid/answers/:aid', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        answer_id = req.params.aid,
        username = req.body.username,
        content = req.body.content,
        timenow = parseInt(new Date().getTime() / 1000, 10),
        err;

    //question id or answer id is not numeric
    if (isNaN(question_id) || isNaN(answer_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing question id or answer id';
        next(err);
    }

    //content and username are required
    if (!content || !username) {
        err = new Error("Bad Request");
        if (!content) { err.message = "Answer cannot be blank"; }
        if (!username) { err.message = "Username cannot be blank"; }
        err.status = 406;
        return next(err);
    }

    //get the answer
    req.models.answer.get(answer_id, function (err, answer) {

        if (err || !answer) {
            err.status = 404;
            next(err);
        } else {

            //overwrite existing values with the ones that were just received
            answer.question_id = question_id;
            answer.username = username;
            answer.content = content;
            answer.date = timenow;

            //save the answer
            answer.save(function (err) {
                if (err) {
                    console.log(err);
                    next(err);
                }

            });

            //fragment for redirect
            var fragment = answer.id ? '#answer-' + answer.id : '';

            //output
            res.format({

                'text/html': function () {
                    //res.status(200); //we redirect instead
                    res.redirect(303, '/questions/' + question_id + fragment);
                },

                'application/json': function () {
                    res.status(200);
                    res.set('Content-Type', 'application/json');
                    res.json(answer);
                },

                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406;
                    return next(response);
                }

            });//res.format

        }//else

    });//req.models.answer.get

});//router.put('/questions/:qid/answers/:aid'


// PUT to modify an existing comment for a question
// template: (none)
// validity: HTML (redirect) and JSON
router.put('/questions/:qid/comments/:cid', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        comment_id = req.params.cid,
        username = req.body.username,
        content = req.body.content,
        timenow = parseInt(new Date().getTime() / 1000, 10),
        err;

    //question id or comment id is not numeric
    if (isNaN(question_id) || isNaN(comment_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing question id or comment id';
        next(err);
    }

    //content and username are required
    if (!content || !username) {
        err = new Error("Bad Request");
        if (!content) { err.message = "Comment cannot be blank"; }
        if (!username) { err.message = "Username cannot be blank"; }
        err.status = 406;
        return next(err);
    }

    //get comment
    req.models.question_comment.get(comment_id, function (err, comment) {

        if (err || !comment) {
            err.status = 404; //Not Found
            next(err);
        } else {

            //overwrite existing values with the ones that were just received
            comment.question_id = question_id;
            comment.username = username;
            comment.content = content;
            comment.date = timenow;

            //save the comment
            comment.save(function (err) {
                if (err) {
                    console.log(err);
                    next(err);
                }

            });

            //fragment for redirect
            var fragment = comment.id ? '#question-comment-' + comment.id : '';

            //output
            res.format({

                'text/html': function () {
                    //res.status(200); //we redirect instead
                    res.redirect(303, '/questions/' + question_id + fragment);
                },

                'application/json': function () {
                    res.status(200);
                    res.set('Content-Type', 'application/json');
                    res.json(comment);
                },

                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406;
                    return next(response);
                }

            });//res.format

        }//else

    });//req.models.question_comment.get

});//router.put('/questions/:qid/comments/:cid'


// PUT to modify an existing comment for an answer
// template: (none)
// validity: HTML (redirect) and JSON
router.put('/questions/:qid/answers/:aid/comments/:cid', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        answer_id = req.params.aid,
        comment_id = req.params.cid,
        username = req.body.username,
        content = req.body.content,
        timenow = parseInt(new Date().getTime() / 1000, 10),
        err;

    //question id or answer id or comment id is not numeric
    if (isNaN(question_id) || isNaN(answer_id) || isNaN(comment_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing question id or answer id or comment id';
        next(err);
    }

    //content and username is required
    if (!content || !username) {
        err = new Error("Bad Request");
        if (!content) { err.message = "Answer cannot be blank"; }
        if (!username) { err.message = "Username cannot be blank"; }
        err.status = 406;
        return next(err);
    }

    //get the comment
    req.models.answer_comment.get(comment_id, function (err, comment) {

        if (err || !comment) {
            err.status = 404;
            next(err);
        } else {

            //overwrite existing values with the ones that were just received
            comment.answer_id = answer_id;
            comment.username = username;
            comment.content = content;
            comment.date = timenow;

            //save the comment
            comment.save(function (err) {
                if (err) {
                    console.log(err);
                    next(err);
                }
            });

            //fragment for redirect
            var fragment = comment.id ? '#answer-comment-' + comment.id : '';

            //output
            res.format({

                'text/html': function () {
                    //res.status(200); //we redirect instead
                    res.redirect(303, '/questions/' + question_id + fragment);
                },

                'application/json': function () {
                    res.status(200);
                    res.set('Content-Type', 'application/json');
                    res.json(comment);
                },

                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406;
                    return next(response);
                }

            });//res.format

        }//else

    });//req.models.answer_comment.get

});//router.put('/questions/:qid/answers/:aid/comments/:cid'


//--------------------------------------------------------------------------------------------------
// DELETE request handler
//--------------------------------------------------------------------------------------------------

// DELETE a specific question
// template: (none)
// validity: HTML (redirect) and JSON
router.delete('/questions/:qid', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        err;

    //question id must be numeric
    if (isNaN(question_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing question id';
        next(err);
    }

    //get question
    req.models.question.get(question_id, function (err, question) {

        if (err || !question) {
            err.status = 404; //Not Found
            next(err);
        } else {

            //remove the question
            question.remove(function (err) {
                if (err) {
                    console.log(err);
                } else {

                    //output
                    res.format({

                        'text/html': function () {
                            //res.status(303);
                            res.redirect(303, '/');
                        },

                        'application/json': function () {
                            res.status(204);
                            res.set('Content-Type', 'application/json');
                            res.end();
                            //res.json({ message: 'succesfully deleted' });
                        },

                        // format not recognised
                        // respond with 406 error
                        'default': function () {
                            var response = new Error("Not Acceptable");
                            response.status = 406;
                            return next(response);
                        }

                    });//res.format

                }//else

            });//question.remove

        }//else

    });//req.models.question.get

});//router.delete('/questions/:qid'


// DELETE a specific answer
// template: (none)
// validity: HTML (redirect) and JSON
router.delete('/questions/:qid/answers/:aid', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        answer_id = req.params.aid,
        err;

    //question id and answer id must be numeric
    if (isNaN(question_id) || isNaN(answer_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing question id or answer id';
        next(err);
    }

    //get answer
    req.models.answer.get(answer_id, function (err, answer) {

        if (err || !answer) {
            err.status = 404; //Not Found
            next(err);
        } else {

            //remove the answer
            answer.remove(function (err) {
                if (err) {
                    console.log(err);
                } else {

                    //output
                    res.format({

                        'text/html': function () {
                            //res.status(303);
                            res.redirect(303, '/questions/' + question_id);
                        },

                        'application/json': function () {
                            res.status(204);
                            res.set('Content-Type', 'application/json');
                            res.end();
                            //res.json({ message: 'succesfully deleted' });
                        },

                        // format not recognised
                        // respond with 406 error
                        'default': function () {
                            var response = new Error("Not Acceptable");
                            response.status = 406;
                            return next(response);
                        }

                    });//res.format

                }//else

            });//answer.remove

        }//else

    });//req.models.answer.get

});//router.delete('/questions/:qid/answers/:aid'


// DELETE a specific comment for a question
// template: (none)
// validity: HTML (redirect) and JSON
router.delete('/questions/:qid/comments/:cid', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        comment_id = req.params.cid,
        err;

    //question id and comment id must be numeric
    if (isNaN(question_id) || isNaN(comment_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing question id or comment id';
        next(err);
    }

    //get comment
    req.models.question_comment.get(comment_id, function (err, comment) {

        if (err || !comment) {
            err.status = 404; //Not Found
            next(err);
        } else {

            //remove the comment
            comment.remove(function (err) {
                if (err) {
                    console.log(err);
                } else {

                    //output
                    res.format({

                        'text/html': function () {
                            //res.status(303);
                            res.redirect(303, '/questions/' + question_id);
                        },

                        'application/json': function () {
                            res.status(204);
                            res.set('Content-Type', 'application/json');
                            res.end();
                            //res.json({ message: 'succesfully deleted' });
                        },

                        // format not recognised
                        // respond with 406 error
                        'default': function () {
                            var response = new Error("Not Acceptable");
                            response.status = 406;
                            return next(response);
                        }

                    });//res.format

                }//else

            });//comment.remove

        }//else

    });//req.models.question_comment.get

});//router.delete('/questions/:qid/comments/:cid'


// DELETE a specific comment for an answer
// template: (none)
// validity: HTML (redirect) and JSON
router.delete('/questions/:qid/answers/:aid/comments/:cid', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        comment_id = req.params.cid,
        answer_id = req.params.aid,
        err;

    //question id and answer id and comment id must be numeric
    if (isNaN(question_id) || isNaN(answer_id) || isNaN(comment_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing answer id or comment id';
        next(err);
    }

    //get comment
    req.models.answer_comment.get(comment_id, function (err, comment) {

        if (err || !comment) {
            err.status = 404; //Not Found
            next(err);
        } else {

            //remove the comment
            comment.remove(function (err) {

                if (err) {
                    console.log(err);
                } else {

                    //fragment for redirect
                    var fragment = answer_id ? '#answer-' + answer_id : '';

                    //output
                    res.format({

                        'text/html': function () {
                            //res.status(303);
                            res.redirect(303, '/questions/' + question_id + fragment);
                        },

                        'application/json': function () {
                            res.status(204);
                            res.set('Content-Type', 'application/json');
                            res.end();
                            //res.json({ message: 'succesfully deleted' });
                        },

                        // format not recognised
                        // respond with 406 error
                        'default': function () {
                            var response = new Error("Not Acceptable");
                            response.status = 406;
                            return next(response);
                        }

                    });//res.format

                }//else

            });//comment.remove

        }//else

    });//req.models.answer_comment.get

});//router.delete('/questions/:qid/answers/:aid/comments/:cid'


//--------------------------------------------------------------------------------------------------
//HEAD requests
//--------------------------------------------------------------------------------------------------

// HEAD request on index page
// template: (index)
// validity: HTML and JSON
router.head('/',  function (req, res, next) {
    "use strict";

    req.models.question.find({}, ["date", "Z"], 30, function (err, questions) {

        if (err || !questions) {
            err.status = 404; //Not Found
            next(err);
        } else {

            //output
            res.format({

                'text/html': function () {
                    res.render('index', {'questions' : questions}, function (err, output) {
                        if (err) {
                            err.status = 404; //Not Found
                            next(err);
                        } else {
                            res.status = 200; //OK
                            res.set('Content-Type', 'text/html');
                            res.set('Content-Length', output.length);
                            res.end(); //end without output
                        }
                    });
                },

                'application/json': function () {
                    res.status = 200; //OK
                    res.set('Content-Type', 'application/json');
                    res.set('Content-Length', questions.length);
                    res.end(); //end without output
                },

                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406; //Not Acceptable
                    return next(response);
                }

            });//res.format

        }//else

    });//req.models.question.find

});//router.head('/'


// HEAD request on a full list of questions (alias of home page '/')
// template: (redirect)
// validity: HTML and JSON
router.head('/questions', function (req, res) {
    "use strict";
    //res.redirect('/');
    res.status(301);
    res.end();
});//router.head('/questions'


// HEAD request on a full list of answers of a specific question
// template: ()
// validity: HTML and JSON
router.head('/questions/:qid/answers', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        err;

    if (isNaN(question_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing question id';
        next(err);
    }

    // get specific record in model by ID
    req.models.question.get(question_id, function (err, question) {

        if (err || !question) {
            err.status = 404; //Not Found
            next(err);
        } else {

          // get corresponding answers associate with the question
            question.getAnswer(function (err, answers) {

                if (err) { //no check for empty answers here
                    err.status = 404; //Not Found
                    next(err);
                } else {

                    //output
                    res.format({

                        'text/html': function () {
                            //res.redirect('/questions/' + question_id);
                            res.status = 303;
                            res.set('Content-Type', 'text/html');
                            res.set('Content-Length', 0); //this is a redirect - no content length
                            res.end(); //end without output
                        },

                        'application/json': function () {
                            //res.json(answers);
                            res.status = 200; //OK
                            res.set('Content-Type', 'application/json');
                            res.set('Content-Length', answers.length);
                            res.end(); //end without output
                        },

                        // format not recognised
                        // respond with 406 error
                        'default': function () {
                            var response = new Error("Not Acceptable");
                            response.status = 406; //Not Acceptable
                            return next(response);
                        }

                    });//res.format

                }//else

            });//question.getAnswer

        }//else

    });//req.models.question.get

});//router.head('/questions/:qid/answers'


// HEAD request on a full list of comments of a specific question
// template: ()
// validity: HTML and JSON
router.head('/questions/:qid/comments', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        err;

    if (isNaN(question_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing question id';
        next(err);
    }

    req.models.question.get(question_id, function (err, question) {

        if (err || !question) {
            err.status = 404; //Not Found
            next(err);
        } else {
            question.getComment(function (err, comments) {

                if (err || !comments) {
                    err.status = 404; //Not Found
                    next(err);
                } else {

                    //output
                    res.format({

                        'text/html': function () {
                            //res.redirect('/questions/' + question_id);
                            res.status = 303;
                            res.set('Content-Type', 'text/html');
                            res.set('Content-Length', 0); //this is a redirect - no content length
                            res.end(); //end without output
                        },

                        'application/json': function () {
                            //res.json(comments);
                            res.status = 200; //OK
                            res.set('Content-Type', 'application/json');
                            res.set('Content-Length', comments.length);
                            res.end(); //end without output
                        },

                        // format not recognised
                        // respond with 406 error
                        'default': function () {
                            var response = new Error("Not Acceptable");
                            response.status = 406;
                            return next(response);
                        }

                    });//res.format

                }//else

            });//question.getComment

        }//else

    });//req.models.question.get

});//router.head('/questions/:qid/comments'


// HEAD request on a full list of comments of a specific answer
// template: ()
// validity: HTML and JSON
router.head('/questions/:qid/answers/:aid/comments', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        answer_id = req.params.aid,
        err;

    if (isNaN(question_id) || isNaN(answer_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing question id or answer id';
        next(err);
    }

    req.models.answer.get(answer_id, function (err, answer) {

        if (err || !answer) {
            err.status = 404; //Not Found
            next(err);
        } else {

            // get comments for the corresponding answer
            answer.getComment(function (err, comments) {

                if (err || !comments) {
                    err.status = 404; //Not Found
                    next(err);
                } else {

                    //output
                    res.format({

                        'text/html': function () {
                            //res.redirect('/questions/' + question_id);
                            res.status = 303;
                            res.set('Content-Type', 'text/html');
                            res.set('Content-Length', 0); //this is a redirect - no content length
                            res.end(); //end without output
                        },

                        'application/json': function () {
                            //res.json(comments);
                            res.status = 200; //OK
                            res.set('Content-Type', 'application/json');
                            res.set('Content-Length', comments.length);
                            res.end(); //end without output
                        },

                        // format not recognised
                        // respond with 406 error
                        'default': function () {
                            var response = new Error("Not Acceptable");
                            response.status = 406; //Not Acceptable
                            return next(response);
                        }

                    });//res.format

                }//else

            });//answer.getComment

        }//else

    });//req.models.answer.get

});//router.head('/questions/:qid/answers/:aid/comments'


// HEAD request on a specific question
// template: (sinlequestion.html)
// validity: HTML and JSON
router.head('/questions/:qid', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        err;

    if (isNaN(question_id)) {
        err = new Error("Bad Request");
        err.status = 400;
        err.message = 'Missing question id';
        next(err);
    }

    req.models.question.get(question_id, function (err, question) {

        if (err || !question) {
            err.status = 404; //Not Found
            next(err);
        } else {

            question.getAnswer(function (err, answers) {

                if (err) { //no check for empty answers here
                    err.status = 404; //Not Found
                    next(err);
                } else {

                    res.status(200);

                    //output
                    res.format({

                        'text/html': function () {
                            res.render('singlequestion', { 'question': question, 'answers': answers}, function (err, output) {
                                res.status = 200; //OK
                                res.set('Content-Type', 'text/html');
                                res.set('Content-Length', output.length);
                                res.end(); //end without output
                            });
                        },

                        'application/json': function () {
                            //res.json(question);
                            res.status = 200; //OK
                            res.set('Content-Type', 'application/json');
                            res.set('Content-Length', question.length);
                            res.end(); //end without output
                        },

                        // format not recognised
                        // respond with 406 error
                        'default': function () {
                            var response = new Error("Not Acceptable");
                            response.status = 406; //Not Acceptable
                            return next(response);
                        }

                    });//res.format

                }//else

            });//question.getAnswer

        }//else

    });//req.models.question.get

});//router.head('/questions/:qid'


// HEAD request on a specific answer
// template: ()
// validity: HTML and JSON
router.head('/questions/:qid/answers/:aid', function (req, res, next) {
    "use strict";

    var answer_id = req.params.aid,
        err;

    if (isNaN(answer_id)) {
        err = new Error("Bad Request");
        err.status = 400; //Bad Request
        err.message = 'Missing answer id';
        next(err);
    }

    req.models.answer.get(answer_id, function (err, answer) {

        if (err || !answer) {
            err.status = 404; //Not Found
            next(err);
        } else {

            //output
            res.format({

                //this is only valid for API
                /*
                'text/html': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406; //Not Acceptable
                    return next(response);
                },
                */
                'application/json': function () {
                    //res.json(answer);
                    res.status = 200; //OK
                    res.set('Content-Type', 'application/json');
                    res.set('Content-Length', answer.length);
                    res.end(); //end without output
                },

                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406; //Not Acceptable
                    return next(response);
                }

            });//res.format

        }//else

    });//req.models.answer.get

});//router.head('/questions/:qid/answers/:aid'


// HEAD request on a specific comment for a question
// template: ()
// validity: HTML and JSON
router.head('/questions/:qid/comments/:cid', function (req, res, next) {
    "use strict";

    var comment_id = req.params.cid,
        err;

    if (isNaN(comment_id)) {
        err = new Error("Bad Request");
        err.status = 400; //Bad Request
        err.message = 'Missing comment id or answer id';
        next(err);
    }

    req.models.question_comment.get(comment_id, function (err, comment) {

        if (err || !comment) {
            err.status = 404; //Not Found
            next(err);
        } else {

            //output
            res.format({

                //this is only valid for API
                /*
                'text/html': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406; //Not Acceptable
                    return next(response);
                },
                */
                'application/json': function () {
                    //res.json(comment);
                    res.status = 200; //OK
                    res.set('Content-Type', 'application/json');
                    res.set('Content-Length', comment.length);
                    res.end(); //end without output
                },

                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406; //Not Acceptable
                    return next(response);
                }

            });//res.format

        }//else

    });//req.models.question_comment.get

});//router.head('/questions/:qid/comments/:cid'


// HEAD request on a specific comment for an answer
// template: ()
// validity: HTML and JSON
router.head('/questions/:qid/answers/:aid/comments/:cid', function (req, res, next) {
    "use strict";

    var comment_id = req.params.cid,
        err;

    if (isNaN(comment_id)) {
        err = new Error("Bad Request");
        err.status = 400; //Bad Request
        err.message = 'Missing comment id';
        next(err);
    }

    req.models.answer_comment.get(comment_id, function (err, comment) {

        if (err || !comment) {
            err.status = 404; //Not Found
            next(err);
        } else {

            //output
            res.format({

                //this is only valid for API
                /*
                'text/html': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406; //Not Acceptable
                    return next(response);
                },
                */
                'application/json': function () {
                    //res.json(comment);
                    res.status = 200;// OK
                    res.set('Content-Type', 'application/json');
                    res.set('Content-Length', comment.length);
                    res.end(); //end without output
                },

                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406; //Not Acceptable
                    return next(response);
                }

            });//res.format

        }//else

    });//req.models.answer_comment.get

});//router.head('/questions/:qid/answers/:aid/comments/:cid'


// HEAD request on a editor for a specific question
// template: (editor.html)
// validity: HTML and JSON
router.head('/questions/:qid/edit', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        err;

    if (isNaN(question_id)) {
        err = new Error("Bad Request");
        err.status = 400; //Bad Request
        err.message = 'Missing question id';
        next(err);
    }

    req.models.question.get(question_id, function (err, question) {

        if (err || !question) {
            err.status = 404; //Not Found
            next(err);
        } else {

            //output
            res.format({

                'text/html': function () {
                    res.render('editor', {'title': "Edit Question", 'content': question, 'url': '/questions/' + question_id }, function (err, output) {
                        res.status = 200; //OK
                        res.set('Content-Type', 'text/html');
                        res.set('Content-Length', output.length);
                        res.end(); //end without output
                    });
                },

                'application/json': function () {
                    res.status = 406; //Not Acceptable
                    res.set('Content-Type', 'application/json');
                    res.set('Content-Length', 0);
                    res.end(); //end without output
                },

                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406; //Not Acceptable
                    return next(response);
                }

            });//res.format

        }//else

    });//req.models.question.get

});//router.head('/questions/:qid/edit'


// HEAD request on a editor for a specific answer
// template: (editor.html)
// validity: HTML and JSON
router.head('/questions/:qid/answers/:aid/edit', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        answer_id = req.params.aid,
        err;

    if (isNaN(question_id) || isNaN(answer_id)) {
        err = new Error("Bad Request");
        err.status = 400; //Bad Request
        err.message = 'Missing question id or answer id';
        next(err);
    }

    req.models.answer.get(answer_id, function (err, answer) {

        if (err || !answer) {
            err.status = 404; //Not Found
            next(err);
        } else {

            //output
            res.format({
                'text/html': function () {
                    res.render('editor', {'title': "Edit Answer", 'content': answer, 'url': '/questions/' + question_id + '/answers/' + answer_id }, function (err, output) {
                        res.status = 200;
                        res.set('Content-Type', 'text/html');
                        res.set('Content-Length', output.length);
                        res.end(); //end without output
                    });
                },

                'application/json': function () {
                    res.status = 405; //Method Not Allowed
                    res.set('Content-Type', 'application/json');
                    res.set('Content-Length', 0);
                    res.end(); //end without output
                },

                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406; //Not Acceptable
                    return next(response);
                }

            });//res.format

        }//else

    });//req.models.answer.get

});//router.head('/questions/:qid/answers/:aid/edit'


// HEAD request on a editor for a specific comment of a question
// template: (editor.html)
// validity: HTML and JSON
router.head('/questions/:qid/comments/:cid/edit', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        comment_id = req.params.cid,
        err;

    if (isNaN(question_id) || isNaN(comment_id)) {
        err = new Error("Bad Request");
        err.status = 400; //Bad Request
        err.message = 'Missing question id or comment id';
        next(err);
    }

    req.models.question_comment.get(comment_id, function (err, comment) {

        if (err || !comment) {
            err.status = 404; //Not Found
            next(err);
        } else {

            //output
            res.format({
                'text/html': function () {
                    res.render('editor', {'title': "Edit Comment", 'content': comment, 'url': '/questions/' + question_id + '/comments/' + comment_id}, function (err, output) {
                        res.status = 200; //OK
                        res.set('Content-Type', 'text/html');
                        res.set('Content-Length', output.length);
                        res.end(); //end without output
                    });
                },

                'application/json': function () {
                    res.status = 405; //Method Not Allowed
                    res.set('Content-Type', 'application/json');
                    res.set('Content-Length', 0);
                    res.end(); //end without output
                },

                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406;
                    return next(response);
                }
            });
        }

    });

});

// HEAD request on a editor for a specific comment of an answer
// template: (editor.html)
// validity: HTML and JSON
router.head('/questions/:qid/answers/:aid/comments/:cid/edit', function (req, res, next) {
    "use strict";

    var question_id = req.params.qid,
        answer_id = req.params.aid,
        comment_id = req.params.cid,
        err;

    if (isNaN(question_id) || isNaN(answer_id) || isNaN(comment_id)) {
        err = new Error("Bad Request");
        err.status = 400; //Bad Request
        err.message = 'Missing question id or answer id or comment id';
        next(err);
    }

    req.models.answer_comment.get(comment_id, function (err, comment) {

        if (err || !comment) {
            err.status = 404; //Not Found
            next(err);
        } else {

            //output
            res.format({

                'text/html': function () {
                    res.render('editor', {'title': "Edit Comment", 'content': comment, 'url': '/questions/' + question_id + '/answers/' + answer_id + '/comments/' + comment_id }, function (err, output) {
                        res.status = 200; //OK
                        res.set('Content-Type', 'text/html');
                        res.set('Content-Length', output.length);
                        res.end(); //end without output
                    });
                },

                'application/json': function () {
                    res.status = 405; //Method Not Allowed
                    res.set('Content-Type', 'application/json');
                    res.set('Content-Length', 0);
                    res.end(); //end without output
                },

                // format not recognised
                // respond with 406 error
                'default': function () {
                    var response = new Error("Not Acceptable");
                    response.status = 406; //Not Acceptable
                    return next(response);
                }

            });

        }

    });
});



//------------------------------------------------------------------------------------
// Errors for all other routes and methods
//------------------------------------------------------------------------------------

// validity: HTML and JSON

//get routes
router.get('*', function (req, res, next) {
    "use strict";
    var err = new Error("Not Found");
    err.status = 404; //Not Found
    err.message = "The Page you required is not found on our server";
    next(err);
});
//post routes
router.post('*', function (req, res, next) {
    "use strict";
    var err = new Error("Method Not Allowed");
    err.status = 405; //Method Not Allowed
    err.message = "POST on invalid route";
    next(err);
});
//put routes
router.put('*', function (req, res, next) {
    "use strict";
    var err = new Error("Method Not Allowed");
    err.status = 405; //Method Not Allowed
    err.message = "PUT on invalid route";
    next(err);
});
//delete routes
router.delete('*', function (req, res, next) {
    "use strict";
    var err = new Error("Method Not Allowed");
    err.status = 405; //Method Not Allowed
    err.message = "DELETE on invalid route";
    next(err);
});
//HEAD requests on other routes than the above equivalents of GET routes are not allowed.
router.head('*', function (req, res, next) {
    "use strict";
    var err = new Error("Method Not Allowed");
    err.status = 405; //Method Not Allowed
    err.message = "HEAD on invalid route";
    next(err);
});
