// Get DOM elements
const btn_start=document.querySelector("#btn-start")
const btn_try_again=document.querySelector("#btn-try-again")
const btn_submit=document.querySelector("#btn-submit")
const intro=document.querySelector("#introduction")
const attempt_quiz=document.querySelector("#attempt-quiz")
const review_quiz=document.querySelector("#review-quiz")
const box_start=document.querySelector("#box-start")
const box_submit=document.querySelector("#box-submit")
const box_result=document.querySelector("#box-result")
// handle event
btn_start.onclick=async function() {
    refreshQuestion()
    await buildAttemptQuiz()
    document.documentElement.scrollIntoView()
    intro.style.display="none"
    box_start.style.display="none"
    attempt_quiz.style.display="block"
    box_submit.style.display="block"
}
btn_submit.onclick=async function() {
    let confirmResult=confirm("Do you want to finish the attempt")
    if(confirmResult){
        getUserAnswers()
        await buildReviewQuiz()
        document.documentElement.scrollIntoView()
        attempt_quiz.style.display="none"
        box_submit.style.display="none"
        review_quiz.style.display="block"
        box_result.style.display="block"
    }
}
btn_try_again.onclick=function() {
    document.documentElement.scrollIntoView()
    review_quiz.style.display="none"
    box_result.style.display="none"
    intro.style.display="block"
    box_start.style.display="block"
}

// fetch api
let urlApi="https://wpr-quiz-api.herokuapp.com/attempts"
let attemptId=""
let userAnswers={}
const getAttemptApi=async function() {
    const response=await fetch(urlApi, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          }
    })
    return await response.json()
}
const getReviewApi=async function () {
    const response=await fetch(urlApi + `/${attemptId}/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({userAnswers})
    })
    return await response.json()
}
const getUserAnswers=function () {
    userAnswers={}
    const inputCheckeds=attempt_quiz.querySelectorAll("input:checked")
    inputCheckeds.forEach(function (inputChecked) {
        userAnswers[inputChecked.getAttribute("questionid")]=inputChecked.getAttribute("index")
    })
}
const buildAttemptQuiz=async function() {
    const data=await getAttemptApi()
    attemptId=data._id
    data.questions.forEach(function (question,index) {
        const questionContainer=document.createElement("div")
        questionContainer.classList.add("question")
        
        const question_index=document.createElement("h3")
        question_index.classList.add("question-index")
        question_index.innerText=`Question ${index + 1} of 10`
        
        const question_text=document.createElement("p")
        question_text.classList.add("question-text")
        question_text.innerText=question.text
        
        questionContainer.append(question_index,question_text)
        
        const option=document.createElement("div")
        option.classList.add("option")
        question.answers.forEach(function (answer,index) {
            const option_item=document.createElement("div")
            option_item.classList.add("option-item")

            const input=document.createElement("input")
            input.name=question._id
            input.id=`${question._id}${index}`
            input.type='radio'
            input.setAttribute("questionid",question._id)
            input.setAttribute("index",index)
            const label=document.createElement("label")
            label.htmlFor=`${question._id}${index}`
            label.innerText=answer

            option_item.append(input,label)
            option.append(option_item)
        })
        questionContainer.append(option)
        attempt_quiz.append(questionContainer)
    })
}
const refreshQuestion = function () {
    const questions=document.querySelectorAll(".question")
    questions.forEach(function (question) {
        question.remove()
    })
}
const updateResultBox=function (score,scoreText) {
    const scoreElement=box_result.querySelector(".score")
    scoreElement.innerText=`${score}/10`
    const percentElement=box_result.querySelector(".percent")
    percentElement.innerText=`${score}%`
    const commentElement=box_result.querySelector(".comment")
    commentElement.innerText=scoreText
}
const buildReviewQuiz=async function() {
    const data=await getReviewApi()
    const correctAnswers=data.correctAnswers
    data.questions.forEach(function (question,index) {
        const questionContainer=document.createElement("div")
        questionContainer.classList.add("question")
        
        const question_index=document.createElement("h3")
        question_index.classList.add("question-index")
        question_index.innerText=`Question ${index + 1} of 10`
        
        const question_text=document.createElement("p")
        question_text.classList.add("question-text")
        question_text.innerText=question.text
        
        questionContainer.append(question_index,question_text)
        
        const option=document.createElement("div")
        option.classList.add("option")
        question.answers.forEach(function (answer,index) {
            const option_item=document.createElement("div")
            option_item.classList.add("option-item")

            const input=document.createElement("input")
            input.name=question._id
            input.id=`${question._id}${index}`
            input.type='radio'
            input.disabled=true
            if(userAnswers[question._id] && Number(userAnswers[question._id]) === index){
                input.checked=true
            }
            const label=document.createElement("label")
            label.htmlFor=`${question._id}${index}`
            label.innerText=answer

            if(Number(userAnswers[question._id]) === correctAnswers[question._id] && Number(userAnswers[question._id])==index) {
                const option_result=document.createElement("span")
                option_result.classList.add("option-result")
                option_result.innerText="Correct answer"
                label.classList.add("correct-answer")
                label.append(option_result)
            }
            else if(Number(userAnswers[question._id]) !== correctAnswers[question._id] && Number(userAnswers[question._id])===index) {
                const option_result=document.createElement("span")
                option_result.classList.add("option-result")
                option_result.innerText="Wrong answer"
                label.classList.add("wrong-answer")
                label.append(option_result)
            }
            else if(Number(userAnswers[question._id]) !== correctAnswers[question._id] && correctAnswers[question._id]===index) {
                const option_result=document.createElement("span")
                option_result.classList.add("option-result")
                option_result.innerText="Correct answer"
                label.classList.add("option-correct")
                label.append(option_result)
            }

            option_item.append(input,label)
            option.append(option_item)
        })
        questionContainer.append(option)
        review_quiz.append(questionContainer)
    })
    updateResultBox(data.score,data.scoreText)
}