#!/bin/bash
STR="Press any key to continue"
#-------------------------
clear
echo Testing all GET routes (JSON)
#-------------------------
#GET homepage
curl -i -H "Accept: application/json" -X GET http://localhost:3000/
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#GET alias of homepage
curl -i -H "Accept: application/json" -X GET http://localhost:3000/questions
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#GET question 1
curl -i -H "Accept: application/json" -X GET http://localhost:3000/questions/1
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#GET all answer to question 1 - valid for JSON API only
curl -i -H "Accept: application/json" -X GET http://localhost:3000/questions/1/answers
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#GET all comments to question 1 - valid for JSON API only
curl -i -H "Accept: application/json" -X GET http://localhost:3000/questions/1/comments
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#GET all comments to answer 1 - valid for JSON API only
curl -i -H "Accept: application/json" -X GET http://localhost:3000/questions/1/answers/1/comments
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#GET answer 1
curl -i -H "Accept: application/json" -X GET http://localhost:3000/questions/1/answers/1
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#GET comment for question
curl -i -H "Accept: application/json" -X GET http://localhost:3000/questions/1/comments/1
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#GET comment for answer
curl -i -H "Accept: application/json" -X GET http://localhost:3000/questions/1/answers/1/comments/3
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
clear
echo Testing all GET routes (HTML)
#-------------------------
#GET homepage
curl -i -H "Accept: text/html" -X GET http://localhost:3000/
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#GET alias of homepage
curl -i -H "Accept: text/html" -X GET http://localhost:3000/questions
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#GET question 1
curl -i -H "Accept: text/html" -X GET http://localhost:3000/questions/1
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#GET question answers of question 1 (will redirect to question page)
curl -i -H "Accept: text/html" -X GET http://localhost:3000/questions/1/answers
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#GET comments for question 1 (will redirect to question page)
curl -i -H "Accept: text/html" -X GET http://localhost:3000/questions/1/comments
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#GET comments for answer 1 (will redirect to question page)
curl -i -H "Accept: text/html" -X GET http://localhost:3000/questions/1/answers/2/comments
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#GET answers 1 (will redirect to question page)
curl -i -H "Accept: text/html" -X GET http://localhost:3000/questions/1/answers/2
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#GET comment to question (will redirect to question page)
curl -i -H "Accept: text/html" -X GET http://localhost:3000/questions/1/comments/2
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#GET comment to answer (will redirect to question page)
curl -i -H "Accept: text/html" -X GET http://localhost:3000/questions/1/answers/2/comments/3
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#GET editor for question
curl -i -H "Accept: text/html" -X GET http://localhost:3000/questions/1/edit
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#GET editor for answer
curl -i -H "Accept: text/html" -X GET http://localhost:3000/questions/1/answers/1/edit
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#GET editor for comment
curl -i -H "Accept: text/html" -X GET http://localhost:3000/questions/1/answers/1/comments/3/edit
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#-------------------------
echo Testing all POST routes (JSON)
#-------------------------
#POST new question
curl -i -H "Content-Type: application/json" -X POST -d "title=Curl%20JSON%20Test%20Question&content=this%20is%20a%20test%20question&username=testuser" http://localhost:3000/questions
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#POST new answer for question 4
curl -i -H "Content-Type: application/json" -X POST -d "content=this%20is%20a%20curl%20test%20answer&username=testuser" http://localhost:3000/questions/4/answers
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#POST new comment to question 4
curl -i -H "Content-Type: application/json" -X POST -d "content=this%20is%20a%20test&username=testuser" http://localhost:3000/questions/4/comments
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#POST new comment to the answer
curl -i -H "Content-Type: application/json" -X POST -d "content=this%20is%20a%20test&username=testuser" http://localhost:3000/questions/4/answers/6/comments
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
echo Testing all POST routes (HTML)
#-------------------------
#POST new question (will redirect on success)
curl -i -H "Content-Type: text/html" -X POST -d "title=Curl%20html%20Test%20Question&content=this%20is%20a%20html%20test%20question&username=testuser" http://localhost:3000/questions
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#POST new answer to question 4 (will redirect on success)
curl -i -H "Content-Type: text/html" -X POST -d "content=this%20is%20a%20html%20test&username=testuser" http://localhost:3000/questions/4/answers
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#POST new comment to question 4 (will redirect on success)
curl -i -H "Content-Type: text/html" -X POST -d "content=this%20is%20a%20html%20test&username=testuser" http://localhost:3000/questions/4/comments
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#POST new comment to answer (will redirect on success)
curl -i -H "Content-Type: text/html" -X POST -d "content=this%20is%20a%20html%20test&username=testuser" http://localhost:3000/questions/4/answers/1/comments
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#-------------------------
echo Testing all PUT routes (JSON)
#-------------------------
#PUT (UPDATE) question
curl -i -H "Content-Type: application/json" -X PUT -d "title=Curl%20PUT%20Test&content=updated%20question%20(JSON)&username=testuser" http://localhost:3000/questions/4
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#PUT (UPDATE) answer
curl -i -H "Content-Type: application/json" -X PUT -d "content=this%20is%20a%20JSON%20PUT%20test%20answer&username=testuser" http://localhost:3000/questions/4/answers/6
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#PUT (UPDATE) comment to question
curl -i -H "Content-Type: application/json" -X PUT -d "content=this%20is%20a%20JSON%20PUT%20test%20comment&username=testuser" http://localhost:3000/questions/4/comments/5
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#PUT (UPDATE) comment to answer
curl -i -H "Content-Type: application/json" -X PUT -d "content=this%20is%20a%20JSON%20PUT%20test%20comment&username=testuser" http://localhost:3000/questions/4/answers/6/comments/8
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
echo Testing all PUT routes (HTML)
#-------------------------
#PUT (UPDATE) question
curl -i -H "Content-Type: text/html" -X PUT -d "title=curl%20PUT%20html%20Test&content=this%20is%20a%20CURL%20PUT%20HTML%20test&username=testuser" http://localhost:3000/questions/4
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#PUT (UPDATE) answer
curl -i -H "Content-Type: text/html" -X PUT -d "content=this%20is%20a%20test&username=testuser" http://localhost:3000/questions/4/answers/7
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#PUT (UPDATE) comment to question
curl -i -H "Content-Type: text/html" -X PUT -d "content=this%20is%20a%20test&username=testuser" http://localhost:3000/questions/4/comments/4
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#PUT (UPDATE) comment to answer
curl -i -H "Content-Type: text/html" -X PUT -d "content=this%20is%20a%20test&username=testuser" http://localhost:3000/questions/4/answers/6/comments/4
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#-------------------------
echo Testing all DELETE routes (JSON)
#-------------------------
#DELETE question-comment (with id 6)
curl -i -H "Accept: application/json" -X DELETE http://localhost:3000/questions/4/comments/5
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#DELETE answer-comment (with id 4)
curl -i -H "Accept: application/json" -X DELETE http://localhost:3000/questions/4/answers/6/comments/4
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#DELETE answer (with id 6)
curl -i -H "Accept: application/json" -X DELETE http://localhost:3000/questions/4/answers/6
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#DELETE question (with id 3)
curl -i -H "Accept: application/json" -X DELETE http://localhost:3000/questions/3
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
echo Testing all DELETE routes (HTML)
#-------------------------
#DELETE answer-comment (with id 5)
curl -i -H "Accept: text/html" -X DELETE http://localhost:3000/questions/4/answers/7/comments/5
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#DELETE question-comment (with id 5)
curl -i -H "Accept: text/html" -X DELETE http://localhost:3000/questions/4/comments/5
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#DELETE answer (with id 7)
curl -i -H "Accept: text/html" -X DELETE http://localhost:3000/questions/4/answers/7
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#DELETE question 4
curl -i -H "Accept: text/html" -X DELETE http://localhost:3000/questions/4
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#-------------------------
echo Testing all HEAD routes
#-------------------------
#homepage
curl -I http://localhost:3000/
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#homepage alias
curl  -I http://localhost:3000/questions
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#question
curl -I http://localhost:3000/questions/3
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#all answers for question 3
curl -I http://localhost:3000/questions/3/answers
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#all comments for question 3
curl -I http://localhost:3000/questions/3/comments
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#all comments for answer with id 5
curl -I http://localhost:3000/questions/3/answers/5/comments
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#answer with id 5
curl -I http://localhost:3000/questions/3/answers/5
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#question-comment with id 3
curl -I http://localhost:3000/questions/3/comments/3
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#answer-comment with id 2
curl -I http://localhost:3000/questions/1/answers/1/comments/2
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#editor for question
curl -I http://localhost:3000/questions/1/edit
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#editor for answer
curl -I http://localhost:3000/questions/1/answers/1/edit
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
#editor for comment
curl -I http://localhost:3000/questions/1/answers/1/comments/3/edit
    read -p "$STR" -n1 -s #press key to continue
    clear
#-------------------------
echo "End of Test"