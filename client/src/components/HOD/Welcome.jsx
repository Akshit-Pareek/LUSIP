import React from 'react';

const Welcome = () => {
  return (
    <div style={{minHeight:'80vh',textAlign: 'center',display:'flex',flexDirection:'column',justifyContent:'center',alignItems: 'center' }}>

      <h1>Welcome to the HoD Dashboard</h1>
      <p>
        Use the sidebar to navigate through different academic and administrative sections.
      </p>
    </div>
  );
};

export default Welcome;