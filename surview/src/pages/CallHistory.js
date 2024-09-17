import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { RiAiGenerate } from "react-icons/ri";

const CallHistory = () => {
  const navigate= useNavigate()
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location= useLocation();
  const {agent_id} = location.state
  console.log(agent_id)
  const handleCallDetails = (call)=>{
    navigate(`/call-details/${call.call_id}`, {state: {call}})


  }

  const handleInsights = (call) =>{
    navigate(`/call-insights`, {state: {call}})

  }
  useEffect(() => {
    // Fetch the call history for the given agentId
    const fetchCallHistory = async () => {
      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/get-call-history`, { agent_id });
        setCalls(response.data); 
        console.log(response.data) // Assuming the response data is an array of calls
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch call history.');
        setLoading(false);
      }
    };

    fetchCallHistory();
  }, [agent_id]); // Dependency on agentId so it refetches if the agentId changes

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.title2}><h2>Call History for Agent: {agent_id}</h2> <button style={styles.button} onClick={() => handleInsights(calls)}>Get Group Insights <RiAiGenerate size={20}/></button></div>
      <ul style={styles.container2}>
        {calls.map((call) => (
          <li key={call.call_id} style={{display:'flex',padding:'10px',margin:'10px', 'background':'white', 'cursor':'pointer',border:'6px solid black',borderRadius:'20px'}} onClick={() => handleCallDetails(call)}>
            <h3 style={{'color':'green'}}>Call ID: {call.call_id}</h3>
            <h3 style={{'color':'red'}}>Call Duration: {((call.end_timestamp - call.start_timestamp) / 1000).toFixed(2)} seconds</h3>
          </li>
        ))}
      </ul>
    </div>
  );
};


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
    backgroundColor: 'rgba(0, 0, 0, 0.7)', /* 50% opacity black background */
    color: 'white', /* Text color remains fully opaque */
    padding: '60px',
    margin:'60px auto',
    fontFamily: 'Arial, sans-serif',
    display:'flex',
    flexDirection:'column',
    width: '80vh',
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
    'cursor':'pointer',
    color:'white',
    display:'block',
    padding:'15px',
    margin:'8px auto',
    border: '3px solid white',

  },
  button2: {
      background:'none',
      border:'none',
      'height':'50px', 
      'width':'50px',
      'cursor':'pointer',
      color:'white',
      display:'block',
      margin:'auto 8px',
  
    }
}

export default CallHistory;
