import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdDelete } from "react-icons/md";
import { FaArrowDown } from "react-icons/fa";
import { FaArrowUp } from "react-icons/fa";

function EditQuestions() {
  const location = useLocation();
  const navigate= useNavigate();
  const [prompt, setPrompt] = useState('');
  const { projectId, email, name, agent_id, llm_id } = location.state || {};
  console.log(location.state)
  const [questions, setQuestions] = useState([]);


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

  const handleSaveQuestions = async () => {
    // Save the updated questions for the project
    // Use an API call to save the questions in the backend

    // Example:

    const response=await axios.post(`${process.env.REACT_APP_BACKEND_URL}/updatellm`, {
        questions,
        prompt,
        agent_id,
        llm_id
      });
      console.log(response.data.agent_id);
      const agent=response.data.agent_id 
      const handleNavigateToShowLink = (agentId) => {
        navigate('/show-link', { state: { agentId } });
      };
      handleNavigateToShowLink(agent);
    
    console.log('Questions saved:', questions);

    const response1=await fetch(`${process.env.REACT_APP_BACKEND_URL}/user/${email}/projects/${projectId}/questions`, {
      method: 'PUT',
      body: JSON.stringify({ questions, agent }),
      headers: { 'Content-Type': 'application/json' },
    });
  };

  useEffect(()=>{
    const fetchQuestions = async()=>{
    const response= await axios.get(`${process.env.REACT_APP_BACKEND_URL}/user/${email}/projects/${projectId}/questions`)
    
    const formattedQuestions = response.data.questions.map((question) => ({
        questionText: question.questionText
      }));

      setQuestions(formattedQuestions);}

      fetchQuestions();
  },[])

  return (
    <div style={styles.container}>
      <h3 style={styles.title2}>Edit Questions for Project: {name}</h3>

      <ul style={styles.container2}>
        {questions.map((question, index) => (
          <li key={index} style={{display:'flex'}}>
            <textarea style={styles.inputt}
              type="text"
              value={question.questionText}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
              placeholder={`Question ${index + 1}`}
            />
            <button style={styles.button2} onClick={()=>handleDeleteQuestion(index)}><MdDelete size={30} style={{color:'black'}}/></button>
            <button style={styles.button2} onClick={()=>moveUp(index)}><FaArrowUp size={25} style={{color:'black'}}/></button>
           <button style={styles.button2} onClick={()=>moveDown(index)}><FaArrowDown size={25} style={{color:'black'}}/></button>
          </li>
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
         <button onClick={handleSaveQuestions} style={styles.button}>Save Questions</button>
      </ul>

     
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
        fontSize: '32px',
        fontWeight: 'bold',
        color:'white',
        display:'flex',
        margin:'20px 20px auto',
        marginLeft:'20px',  
        padding: '10px 25px',
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
      minWidth: '100vh'
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
      width: '70vh',
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
      'width':'90px',
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
        margin:'auto',
    
      }
  }

export default EditQuestions;
