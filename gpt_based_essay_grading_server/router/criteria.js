import express from 'express'
import prompt from '../prompt/gradingPrompt.js'
import { setData } from '../utils/dataStore.js'

const router = express.Router()
router.post('/criteria', (req, res) => {
    res.send({
        code: 200,
        list: prompt.systemSetting.criteriaList,
        temperature: prompt.systemSetting.temperature,
        system: prompt.systemSetting.system
    })
})

router.post('/setPrompt', (req, res) => {
    let { advancedForm, criteriaForm } = req.body

    let criteriaAll = prompt.criteria
    let criteriaText = ''
    let exampleText = ''
    for (let i = 0; i < criteriaAll.length; i++) {
        if (criteriaForm.checkList.includes(criteriaAll[i].title)) {
            criteriaText += criteriaAll[i].title + '\n'
            criteriaText += criteriaAll[i].prompt + '\n'
            exampleText += criteriaAll[i].example + '\n' + '\n'
        }
    }
    const evaluate = `
    1.Expert: LangGPT
    2.Profile:
    - Language: English
    - Description: 
    3.Skills:
    - Expertise in natural language processing and understanding.
    - Proficiency in grading techniques.
    ${advancedForm.system}
    4.Criteria
    - The criteria is different and all the criteria will should separately consider
    ${criteriaText}
    5.Constraints
    ${prompt.constraints}
    6.Return type
    - return type of the prompt should be in line with the following markdown format, please notice the line format
    - the example will be given, you should be in line with the example markdown format
    7.Init: 
    - Provide the article text as input.
    8. Example:
    ${exampleText}
    ## Improvement:

    **Improvement Feedback**: what can be improved in the article
    `
    // console.log('初次设置提示词uid',advancedForm.uid);
    setData(`form${advancedForm.uid}`, { advancedForm, criteriaForm, timestamp: Date.now() })
    setData(`prompt${advancedForm.uid}`, { evaluate, timestamp: Date.now() })
    res.send({
        code: 200,
        message: 'OK'
    })

})


export default router