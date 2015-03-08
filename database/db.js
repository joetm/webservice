/*global module, console*/

module.exports = {

    define: function (db, models, next) {
        "use strict";

        //basic model definitions

        models.question = db.define("question", {
            'title' : 'text',
            'content' : 'text',
            'username' : 'text',
            'solved' : 'integer',
            'date' : 'integer'
        }, {
            'cache': false
        });

        models.answer = db.define("answer", {
            'content' : 'text',
            'username' : 'text',
            'date' : 'integer'
        }, {
            'cache': false
        });

        models.question_comment = db.define("question_comment", {
            'content' : 'text',
            'username' : 'text',
            'date' : 'integer'
        }, {
            'cache': false
        });

        models.answer_comment = db.define("answer_comment", {
            'content' : 'text',
            'username' : 'text',
            'date' : 'integer'
        }, {
            'cache': false
        });


        //model relationships

        models.answer.hasOne("question", models.question, {
            reverse : "answer",
            autoFetch : true
        });

        models.answer_comment.hasOne("answer", models.answer, {
            reverse : "comment",
            autoFetch : true
        });
        models.question_comment.hasOne("question", models.question, {
            reverse : "comment",
            autoFetch : true
        });

        //sync models with db

        db.sync(function (err) {
            if (err) {

                //database could not be synced
                console.log("DB Sync Error");
                console.log(err);

                //as discussed in the coursework clinic, this case would require a 500 error
                var error = new Error("Internal Server Error");
                error.status = 500;
                error.message = 'Database could not be synced. Contact the Server Admin.';
                next(error);

                //process.exit(0);

            } else {
                console.log("DB Sync Done");
            }
            next();
        });

    } //define

};//module.exports