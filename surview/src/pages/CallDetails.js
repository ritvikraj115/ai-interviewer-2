import React from 'react';
import { useLocation, useParams } from 'react-router-dom';

const CallDetails = () => {
  const location = useLocation();
  const { callId } = useParams(); // Get the callId from the route params
  const { call } = location.state || {}; // Retrieve the call object from state
  const callTranscript= call.transcript
  console.log(callTranscript)
  if (!call) {
    return <div>No call data available.</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.title2}><h2>Call Details for ID: {callId}</h2></div>
      <div style={styles.title}><h2>Call Summary:</h2><p>{call.call_analysis.call_summary || 'No summary available'}</p>
      </div>
      <div style={styles.title3}>
      <h3 style={{margin:'20px'}}>Transcript:</h3>
      <pre style={{margin:'10px', padding:'20px 2px'}}>{callTranscript}</pre>
      </div>
    </div>
  );
};


const styles ={
    title: {
        fontSize: '20px',
        fontWeight: 'bold',
        color:'yellow',
        backgroundColor:'black',
        display:'flex',
        flexWrap:'wrap',
        width:'50%',
        margin:'20px 10px auto',  
        padding: '0px 15px',
        borderRadius:'40px',
        border: '4px solid white',
        letterSpacing: '1.5px',
    },
    title3: {
        fontSize: '20px',
        fontWeight: 'bold',
        color:'yellow',
        backgroundColor:'black',
        display:'flex',
        flexWrap:'wrap',
        width:'100%',
        margin:'20px 10px auto',  
        padding: '20px 15px',
        borderRadius:'40px',
        border: '4px solid white',
        whiteSpace: 'pre-wrap',  // Wrap long text
        wordWrap: 'break-word',  // Prevents long words from overflowing
        maxWidth: '100%',        // Ensures it doesn't go beyond the container's width
        border: '1px solid #ccc', // Optional: for styling
        padding: '10px',
        overflow: 'auto',
    
    },
    title2: {
        fontSize: '12px',
        fontWeight: 'bold',
        color:'white',
        display:'flex',
        margin:'10px 10px auto',  
        padding: '0px 15px',
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
      // Ensures the container takes up the full viewport height
    },
    container2: {
        margin:'20px auto',
        fontFamily: 'Arial, sans-serif',
        display:'flex',
        flexWrap: 'wrap',
        flexDirection:'row',
        padding:'0px 20px',
        alignItems:'center',
        color: 'black', // Text   color to ensure readability over the background
      },
    
    inputt :{
      width: '105%',
      padding: '12px 20px',
      display:'block',
      margin: '13px auto',
      boxSizing: 'border-box'
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
      border: '3px solid white'
  
    },
    button2: {
        'backgroundColor':'black',
        'borderRadius':'30px',
        'height':'40px', 
        'width':'40px',
        'cursor':'pointer',
        color:'white',
        display:'block',
        margin:'4px 4px 0px 8px',
        border: '5px solid white',
        letterSpacing: '1.5px',
    
      }
  }


export default CallDetails;
