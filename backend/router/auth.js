const express = require('express');
const OpenAI = require('openai');
const axios = require('axios');
const User = require('../userSchema'); // Assuming your user schema is in this folder
const Retell = require('retell-sdk');
const mongoose= require('mongoose')

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});
const retellClient = new Retell({
  apiKey: process.env.RETELL_AI_KEY,
});

const promptSchema = new mongoose.Schema({
  retell_ai_prompt: String,
  open_ai_prompt: String,
});



// Use the 'prompt' collection from the 'prompts' database
const Prompt = mongoose.model('Prompt', promptSchema, 'prompt');

router.post('/check-email', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if a user with the given email already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // If the user exists, return their projects and questions
      return res.status(200).json({ user });
    } else {
      // If the user does not exist, create a new user
      user = new User({ email, projects: [] }); // projects will be added later
      await user.save();
      return res.status(201).json({ user });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});



router.post('/generate-questions', async (req, res) => {
  const promptData = await Prompt.findOne();
  
  console.log(req.body)
  const { projectName, projectOffering, feedbackDesired, prompt } = req.body;

  // Validate the incoming request data
  if (!projectName || !projectOffering || !feedbackDesired) {
    return res.status(400).json({
      error: 'Please provide project_name, project_offering, and desired_feedback.',
    });
  }

  try {
    // Create a completion request to OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4', // Using GPT-4 model for best quality
      messages: [
        {
          role: 'system',
          content: `${promptData.open_ai_prompt}`




`
        },
        {
          role: 'user',
          content: `You have to generate a set of questions for project name- ${projectName} on projectOffering- ${projectOffering} and expected desired feedback- ${feedbackDesired}. Strictly consider the following instructions while generating questions- ${prompt}`,
        },
      ],
      max_tokens: 400,  // Set the token limit high enough to generate multiple questions
      temperature: 0.7,  // Slightly creative but controlled
    });

    // Return the generated questions as a JSON response
    res.status(200).json({
      questions: completion.choices[0].message.content.trim().split('\n'),
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({
      error: 'Failed to generate interview questions. Please try again later.',
    });
  }
});




router.post('/create-llm', async (req, res) => {
  const { questions, prompt, projectName } = req.body;
  const promptData = await Prompt.findOne();
  console.log(prompt)
  console.log(questions[0].questionText)
  // Validate questions input
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Please provide an array of questions.' });
  }

  try {
    // Create a new LLM in Retell with the provided questions
    const llmResponse = await retellClient.llm.create({
      general_prompt: `${promptData.retell_ai_prompt} Strictly consider the following user requirement before creating llm- ${prompt}`,
      states: questions.map((question, index) => ({
        name: `question_${index + 1}`,
        state_prompt: question.questionText,
        edges: index < questions.length - 1 ? [
          {
            destination_state_name: `question_${index + 2}`,
            description: "Move to the next question after receiving the user's response."
          }
        ] :  [],
      })),
      starting_state: 'question_1',
      begin_message: "I will start by asking you a series of questions. Please answer each question before we proceed to the next one."
    });

    //Link the newly created LLM to your Retell agent (assuming you have an agent setup)
    const createdAgent = await retellClient.agent.create({
      llm_websocket_url: llmResponse.llm_websocket_url,  // Use the passed WebSocket URL from LLM creation
      voice_id: '11labs-Adrian',  // Define voice ID
      agent_name: projectName,  // Agent name
      interruption_sensitivity: 0.8,
      responsiveness:0.8,
    });

    res.status(200).json({
      message: 'LLM created successfully',
      agent_id: createdAgent.agent_id,
      llm_id: llmResponse.llm_id
      // agent_id: createdAgent.id
      // agent_response: agentResponse.data
    });
  } catch (error) {
    console.error('Error creating LLM:', error);
    res.status(500).json({ error: 'Failed to create LLM. Please try again later.' });
  }
});




 

// // Route to save interview questions to the user schema
// router.get('/user/:email/projects', async (req, res) => {
//   const { email } = req.params;

//   try {
//     const user = await User.findOne({ email }).populate('projects.questions');
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     return res.status(200).json({ projects: user.projects });
//   } catch (error) {
//     return res.status(500).json({ error: 'Server error' });
//   }
// });




router.post('/user/:email/projects', async (req, res) => {
  const { email } = req.params;
  const { projectName, agentId, questions, llm_id } = req.body;
  console.log(questions)

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newProject = {
      projectName,
      agentId:agentId,
      llm_id:llm_id,
      questions: questions,
    };
    
    user.projects.push(newProject);
    await user.save();
    
    return res.status(201).json({ message: 'Project added', project: newProject });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: 'Server error' });
  }
});




router.put('/user/:email/projects/:projectId/questions', async (req, res) => {
  const { email, projectId } = req.params;
  const { questions, agent } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const project = user.projects.id(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.questions = questions;
    await user.save();

    return res.status(200).json({ message: 'Questions updated', questions: project.questions });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: 'Server error' });
  }
});





router.get('/user/:email/projects/:projectId/questions', async (req, res) => {
  const { email, projectId } = req.params;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const project = user.projects.id(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.status(200).json({ questions: project.questions });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});


router.post('/updatellm', async (req, res) => {
  const { questions, prompt, agent_id, llm_id } = req.body;
  console.log(llm_id);
  console.log(questions)
  // Input validation
  if (!agent_id || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Please provide a valid agentId and a list of questions.' });
  }

  try {
    // Step 1: Retrieve agent details to get the LLM ID

    if (!llm_id) {
      return res.status(404).json({ error: 'LLM ID not found for this agent.' });
    }

    // Step 2: Prepare the payload for updating the LLM
    const updatePayload = {
      general_prompt: `You're the world's best UX interviewer. You've read all the research articles and test books on how to conduct a user interview. Conduct the user interview. Consider this specific prompt which your owner has provided to you- "${prompt}" strictly and follow the instructions mentioned in it carefully. Don't create any questions on our own. Just ask the questions which are provided to you `,
      states: questions.map((question, index) => ({
        name: `question_${index + 1}`,
        state_prompt: question.questionText,
        edges: index < questions.length - 1 ? [
          {
            destination_state_name: `question_${index + 2}`,
            description: "Move to the next question after receiving the user's response."
          }
        ] : [],  // No edges for the last question
      })),
      starting_state: 'question_1',
      begin_message: "I will start by asking you a series of questions. Please answer each question before we proceed to the next one."
    };

    // Step 3: Update the LLM using the LLM ID
    const llmResponse = await retellClient.llm.update(llm_id,updatePayload);

    const agent_response = await retellClient.agent.update(
      agent_id, {llm_websocket_url:llmResponse.llm_websocket_url, interruption_sensitivity: 0.8, responsiveness:0.8,}
  )
  console.log(agent_response)
    // Return success response
    return res.status(200).json({
      message: 'LLM updated successfully',
      agent_id: agent_id
    });
  } catch (error) {
    console.error('Error updating LLM:', error);
    return res.status(500).json({ error: 'Failed to update LLM. Please try again later.' });
  }
});





router.post('/get-call-history', async (req, res) => {
  const { agent_id } = req.body;

  try {
    // Fetch the call list by agent ID
    const callListResponse = await retellClient.call.list({
      filter_criteria: {
        agent_id: [agent_id],
      },
    });

    // Return the call history in response
    res.status(200).json(callListResponse);
  } catch (error) {
    console.error('Error fetching call history:', error);
    res.status(500).json({ error: 'Failed to fetch call history.' });
  }
});



const extractQA = (transcripts) => {
  const questions = [];
  const answersMap = {};
  transcripts.forEach((transcript) => {
    if(transcript.transcript_object){
    transcript.transcript_object.forEach((entry, idx) => {
      if (entry.role === 'agent') {
        const question = entry.content.trim();

        if (!answersMap[question]) {
          answersMap[question] = [];
        }

        // Find next user response
        const nextEntry = transcript.transcript_object[idx + 1];
        if (nextEntry && nextEntry.role === 'user') {
          answersMap[question].push(nextEntry.content.trim());
        }
      }
    })};
  });

  Object.keys(answersMap).forEach((question) => {
    questions.push({ question, answers: answersMap[question] });
  });

  return questions;
};

// Format Q&A for OpenAI analysis
const formatForOpenAI = (qaList) => {
  return qaList
    .map(
      (qa, index) => `
    Question ${index + 1}: ${qa.question}
    User Answers: 
    ${qa.answers.join('\n')}
  `
    )
    .join('\n');
};

// Send formatted Q&A to OpenAI for classification
const classifyAnswers = async (qaFormatted) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are an assistant that analyzes user responses to questions. Your job is to:
        1. Identify and group similar questions (questions with similar meanings or intent) together.
        2. Provide one consolidated response per group of similar questions.
        3. For each group of questions, categorize the user responses into simple categories like "Yes", "No", "Positive", "Negative", or "Not Sure".
        4. Provide a percentage breakdown for each response category.
        5. Skip the questions that requires a desriptive answer and cannot of categorized.
        6. Very Strictly skip the questions related to greets, user details,etc. Just focus on the questions related to product or service
        7. Strictly remember that you are free to categorize the answers in your own categories but it should be shorter like good, bad, yes, can be, faster,etc. Choose the best suited categories for a question
        8. Strictly Ensure the final response is formatted in a clear and concise manner, like this:
  
        "Q1: [Shorter intent or summary of ques]
         - Yes (X%)
         - No (Y%)
         - Not Sure (Z%)"

         This is the ONLY format you have to follow. No other content in response should be there
  
        Avoid duplicate or similar responses for the same question group. Make sure that each group receives a single, concise categorization of user answers. Remember that your total number of consolidated question groups should always be between 4-10 `
      },
      {
        role: 'user',
        content: qaFormatted,
      },
    ],
    max_tokens: 300,
  });

  const categorizedData = response.choices[0].message.content;
  return categorizedData
  // // Step 2: Now generate a pie chart for each question-response group
  // const pieChartResponses = [];
  // const categorizedQuestions = parseCategorizedData(categorizedData); // Function to parse the categorized data into an array
  // for (const questionGroup of categorizedQuestions) {
  //   const chartResponse = await generatePieChart('cat');
  //   pieChartResponses.push(chartResponse);
  // }
  // console.log(pieChartResponses)
  // return {
  //   categorizedData,
  //   pieCharts: pieChartResponses,
  // };
};


// const generatePieChart = async (questionGroup) => {
//   try {
//     const chartPrompt = `
//       Create a pie chart representing the following categorized data(one pie chart for each question)-

//       ${questionGroup}

//       Show the categories and their percentage breakdown in a simple pie chart. Use the percentages to visually divide the sections of the pie chart accordingly.
//     `;

//     const chartResponse = await openai.images.generate({
//       model:"dall-e-3",
//       prompt:chartPrompt,
//       size:"1024x1024",
//       quality:"standard",
//       n:1,
//   })
//     console.log(chartResponse)
//     return chartResponse.data[0].url
//   } catch (error) {
//     console.error('Error generating pie chart:', error);
//     throw error;
//   }
// };

// // Helper function to parse the categorized response data into structured question groups
// const parseCategorizedData = (categorizedData) => {
//   const questions = categorizedData.split('Q');
//   const questionGroups = questions.filter(Boolean).map((q) => `Q${q.trim()}`);
//   return questionGroups;
// };

// /get-insights route
router.post('/get-insights', async (req, res) => {
  try {
    const { calls } = req.body;

    // Step 1: Extract questions and answers from the transcripts
    const qaList = extractQA(calls);

    // Step 2: Format Q&A for OpenAI
    const qaFormatted = formatForOpenAI(qaList);

    // Step 3: Send formatted Q&A to OpenAI for classification
    const classification = await classifyAnswers(qaFormatted);
    console.log(classification)
    // Step 4: Return classification results
    res.status(200).json({
      classification,
    });
  } catch (error) {
    console.error('Error processing insights:', error);
    res.status(500).json({ error: 'Failed to get insights' });
  }
});



module.exports = router;
