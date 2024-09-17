import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register the required components
ChartJS.register(ArcElement, Tooltip, Legend);

const GetInsights = () => {
  const location = useLocation();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch insights using useEffect
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const calls = location.state.call; 
    
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/get-insights`, { calls });
        // Set the classification insights from the response
        setInsights(response.data.classification);
      } catch (err) {
        setError('Failed to fetch insights');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights(); // Fetch insights when component mounts
  }, []);

  // Helper function to parse insights and prepare chart data
  const parseInsights = (insights) => {
    const questions = [];
    const lines = insights.split('\n').filter(line => line.trim() !== '');

    let currentQuestion = null;
    lines.forEach(line => {
        console.log(line)
      if (line.startsWith("Q")) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        const title = line.split(': ')[1];
        currentQuestion = { title, categories: [] };
        console.log(currentQuestion)
      } else{
        if(currentQuestion){
        const [category, percentage] = line.split('(');
        if(category && percentage){
        currentQuestion.categories.push({
          label: category.trim().replace('-', '').trim(),
          value: parseFloat(percentage.replace('%', '').replace(')', ''))
        })};
        console.log(currentQuestion)
      }}
    });

    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    return questions;
  };

  // Render loading, error, or insights
  return (
    <div className="insights-page" style={styles.container}>
      <div style={styles.title}><h1>Get Insights</h1></div>

      {loading && <p>Loading insights...This may take some time</p>}
      {error && <p>{error}</p>}

      {insights && (
        <div className="insights-result" style={styles.container2}>
          {/* Display insights graphically */}
          {parseInsights(insights).map((question, index) => {
            const data = {
              labels: question.categories.map(cat => cat.label),
              datasets: [
                {
                  data: question.categories.map(cat => cat.value),
                  backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                }
              ]
            };

            return (
              <div key={index} style={{ margin: '80px', height:'400px', width:'400px', padding:'50px' }}>
                <h3>{question.title}</h3>
                <Pie data={data} width={150} height={150} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


const styles ={
    title: {
      height:'150px',
      width:'350px',
      fontWeight: 'bold',
      color:'white',
      display:'flex',
      flexDirection:'column',
      justifyContent:'center',
      alignItems:'center',
      margin:'75px 75px',
      padding: '2px auto',
      backgroundColor: 'rgba(0, 0, 0, 0.7)', /* 50% opacity black background */
      color: 'white',
      borderRadius:'30px 2px',
      border: '4px solid white'
    },
    title2: {
        fontSize: '12px',
        fontWeight: 'bold',
        color:'white',
        display:'flex',
        margin:'20px 20px auto',
        marginLeft:'20px',  
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
        border: '5px solid white'
    
      }
  }

export default GetInsights;
