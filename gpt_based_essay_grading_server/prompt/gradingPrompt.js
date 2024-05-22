const systemSetting = {
    system: `You are {{Expert}}, specializing in developing an AI system that can automatically grade and evaluate the quality of article.`,
    temperature: 0.8,
    criteriaList: [
        "Background",
        'Aims and Objectives',
        'Implementation',
        'Result',
        'Conclusion',
        'Reference',
        'Writing and Formatting',
    ]
}

const background = {
    title: 'Background',
    prompt: `- conclude the Background and related work of the whole article
    - The Background and related work tends to be appear in the beginning or the first third paragraph
    - The related work of the article tends to be the past related literature research
    - If there is no Background and related work, the grade should be 0 and the evaluate 
    - If there exists  Background and related work, the grade of the Background and related work should from 1 to 10 
    `,
    example: `## Background:

    **Grade**: 7
    
    **Background Conclusion**: The background of the article is ....
    
    **Related work**: The author refer the literature about ...
    
    **Evaluate**: The quality of this section ....`
}

const aim = {
    title: 'Aims and Objectives',
    prompt: `- conclude the aims and objectives of the whole article
    - The aims and objectives tends to be appear in the beginning or the first third paragraph
    - If there is no aims or objectives, the grade should be 0
    - If there exists  aims and objectives, the grade of the aims and objectives should from 1 to 10 `,
    example: `## Aims and Objectives:

    **Grade**: 7
    
    **Aims Conclusion**: The aims of the article `
}

const implementation = {
    title: 'Implementation',
    prompt: `- conclude the research methodlogy, which tends to be appear in the middle of the article
    - conclude the experiment analysis
    - conclude what the implementation design of the project with detailed and professional language
    - grade the quality of the design from 1 to 10
    - grade the  analysis quality of the design from 1 to 10`,
    example: `## Implementation:

    **Design Grade**:8
    
    **Analysis Grade**:5
    
    **Methodology**: The project used the method...
    
    **Design**: The author design a model to ...
    
    **Experiment analysis**: {{the concrete analysis of the experiment}}`
}

const result = {
    title: 'Result',
    prompt: `-conclude the experiment result in the article,which tends to be appear in the middle of the article
    - conclude the statistical data from the result
    - grade the quality of the experiment from 1 to 10 `,
    example: `## Result:

    **Grade**: 7
    
    **Result Conclusion**: The experiment result  is ....
    
    **Evaluate**: The quality of the result is ... `

}

const conclusion = {
    title: 'Conclusion',
    prompt: `- conclude the conclusion of the article, and say it within 3 sentences
    - If there is no Conclusion at the end of the article, the grade should be 0
    - If there exists Conclusion, the grade should from 1 to 10, which should be evaluated by the quality of the conclusion
    - A good conclusion should include the content like things learned from the project, future work(what is worthwhile to research in the future according to the current result in the article), Critical reflection
    - The conclusion tends to appear in the end of the main article, but before the reference list
    - If there is no future work or critical reflection, you are allowed return the result without theses sections`,
    example: `## Conclusion:

    **Grade**: 7
    
    **Conclusion**: The conclusion of the article is ....
    
    **Learning point**: The author learned what from the project
    
    **Future work**: The author said what can be researched in the future
    
    **Evaluate**: The quality of the conclusion ....`
}

const reference = {
    title: 'Reference',
    prompt: `- If the article do not have reference list gives it 0
    - If the article have reference list but the format is messy and might be wrong, gives it 1 to 5
    - If the article have reference list and the format is good and quality is good, gives it 6 to 10
    - The reference list tends to follow the IEEE or ACM format`,
    example: `## Reference:
    
    **Grade**: 8,
    
    **Evaluate**: {{The evaluate of reference}}  like(the article have reference list and the format is good and quality is good)`
}

const generalFormat = {
    title: 'Writing and Formatting',
    prompt: `- Grade the fluency from 1 to 10
    - Grade the grammar from 1 to 10, to judge whether there are grammar errors
    - Grade the structure of the article from 1 to 10, to judge whether the structure is clear or not`, example: `## Writing and Formatting:
    **Fluency Grade**: 8
    
    **Grammar Grade**: 8
    
    **Structure Grade**: 8`
}

const criteria = [
    background, aim, implementation, result, conclusion, reference, generalFormat
]
//#region constraints
const constraints = `Constraints
- The Background and related work tends to be appear in the beginning or the first third paragraph
- The related work of the article tends to be the past related literature research
- The reference typically appear at the end of the article and always in the format of IEEE or ACM
- - Every section title (like the Background, Reference) should use the second level title in markdown format and with a \n on the end, like ## Background:**\n
- Every paragraph of the subsection should use strong format in markdown with a \n at the end of the text ,such as **Grade**: 8\n
- The words like Background, Reference are the section title, and the grade or evaluate is the grading content of every section 
- There should be a empty line between different subsections and sections, such as between Background and Implementation, there should have an empty line. Also between the grade and other item, there should be a empty line
- The most important thing is the markdown format must be followed`
//#endregion



export default  {
    constraints,
    systemSetting,
    criteria
}