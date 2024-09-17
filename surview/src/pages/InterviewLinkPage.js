import React, { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MdDelete } from "react-icons/md";
import { FaArrowDown } from "react-icons/fa";
import { FaArrowUp } from "react-icons/fa";

function InterviewLinkPage() {
  const location = useLocation();
  const navigate= useNavigate();
  const [prompt, setPrompt] = useState('');
  const formattedQuestions = location.state.questions
  .map((question, index) => {
    // Only map questions at even indexes
    if (index % 1 === 0) {
      return { questionText: question.questionText || question };
    }
    return null; // Return null for odd indexes to filter them out later
  })
  .filter(question => question !== null); // Remove null values
  console.log(formattedQuestions)
  const [questions, setQuestions] = useState(formattedQuestions);
  console.log(questions);


  const moveUp = (index) => {
    if (index === 0) return; // Can't move the first question up
    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
    setQuestions(newQuestions);
  };


   // Function to handle moving a question down
   const moveDown = (index) => {
    if (index === questions.length - 1) return; // Can't move the last question down
    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
    setQuestions(newQuestions);
  };

  // Function to handle input change for each question
  const handleQuestionChange = (index, newValue) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].questionText = newValue;
    setQuestions(updatedQuestions);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: '' }]);
  };

  const handleDeleteQuestion = useCallback((index) => {
    // Create a new array excluding the item at the specified index
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions); // Update state with the new array
    console.log(updatedQuestions); // Optional: for debugging
  }, [questions]); // Dependency array to ensure useCallback is updated with the latest questions

  const createLLM=(async()=>{
    const response=await axios.post(`${process.env.BACKEND_URL}/create-llm`, {
      questions,
      prompt
    });
    console.log(response.data.agent_id);
    console.log(questions)
    const response1= await axios.post(`http://localhost:5000/user/${location.state.email}/projects`,{
      projectName: location.state.projectName,
      agentId: response.data.agent_id,
      questions: questions,
      llm_id:response.data.llm_id

    })
    const agent=response.data.agent_id
    const handleNavigateToShowLink = (agentId) => {
      navigate('/show-link', { state: { agentId} });
    };
    handleNavigateToShowLink(agent);
  
    

  })
  return (
    <div style={styles.container}>
      <div style={styles.title2}><h3>Customize your questions below:</h3></div>
      <div  style={styles.container2}>
      {questions.map((question, index) => (
        <div key={index} >
          <label>Question {index + 1}:</label>
          <div style={{display:'flex'}}>
          <textarea style={styles.inputt}
            type="text"
            value={question.questionText}
            onChange={(e) => handleQuestionChange(index, e.target.value)}
          />
           <button style={styles.button2} onClick={()=>handleDeleteQuestion(index)}><MdDelete size={30} style={{color:'black'}}/></button>
           <button style={styles.button2} onClick={()=>moveUp(index)}><FaArrowUp size={25} style={{color:'black'}}/></button>
           <button style={styles.button2} onClick={()=>moveDown(index)}><FaArrowDown size={25} style={{color:'black'}}/></button>
        </div>
        </div>
      ))}
       <textarea style={{
            width:'100vh',
            padding: '16px 20px',
            display:'block',
            margin: '13px 5px',
            boxSizing: 'border-box',
            borderRadius: '20px'}}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='Any specific prompt you would like for the agent to keep in mind'
          />
       <button onClick={handleAddQuestion} style={styles.button}>Add Question</button>
      <button onClick={createLLM} style={styles.button}>CREATE AGENT</button>
      </div>
     
    </div>
  );
}

const styles ={
  title: {
    height:'250px',
    width:'200px',
    fontWeight: 'bold',
    color:'white',
    display:'flex',
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
    margin:'2px 10px',
    padding: '2px auto',
    backgroundColor:'black',
    borderRadius:'20px',
    border: '4px solid white'
  },
  title2: {
      fontSize: '22px',
      fontWeight: 'bold',
      color:'white',
      display:'flex',
      flexDirection:'column',
      margin:'10px 10px auto',
      marginLeft:'20px',  
      padding: '0px 20px',
      backgroundColor:'black',
      borderRadius:'40px',
      border: '4px solid white'
    },
  container: {
    fontFamily: 'Arial, sans-serif',
    display:'flex',
    flexDirection:'column',
    padding:'0px 20px',
    alignItems:'center',
    background: `url('https://img.freepik.com/free-vector/sound-wave-gray-digital-background-entertainment-technology_53876-119613.jpg') no-repeat center center fixed`, // Background image
    backgroundSize: 'cover', // Ensures the image covers the entire background
    color: 'black', // Text   color to ensure readability over the background
    minHeight: '100vh',
    minWidth:'100vh' // Ensures the container takes up the full viewport height
  },
  container2: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)', /* 50% opacity black background */
    color: 'white', /* Text color remains fully opaque */
    padding: '20px',
    margin:'100px auto',
    fontFamily: 'Arial, sans-serif',
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    border: '4px solid white',
    borderRadius:'40px 2px'

    },
  
  inputt :{
    width: '90vh',
    padding: '16px 20px',
    display:'block',
    margin: '13px auto',
    boxSizing: 'border-box',
    borderRadius: '20px'
  },
  button: {
    'backgroundColor':'black',
    'borderRadius':'10px',
    'height':'40px', 
    'width':'150px',
    'cursor':'pointer',
    color:'white',
    display:'block',
    margin:'4px auto',
    border: '3px solid white',

  },
  button2: {
      background:'none',
      border:'none',
      'cursor':'pointer',
      color:'white',
      display:'block',
      margin:'auto 8px',
  
    }
}

export default InterviewLinkPage;

