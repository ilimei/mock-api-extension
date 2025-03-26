import React from 'react';

const About: React.FC = () => {
  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.6',
        padding: '20px',
        maxWidth: '750px',
        margin: '0 auto',
        fontSize: '16px',
      }}
    >
      <h1 style={{ color: '#4CAF50', textAlign: 'center' }}>About API Mock Extensions</h1>
      <p>
        Welcome to the <strong>API Mock Extensions</strong> application! This tool is designed to help developers
        streamline their workflow by providing a simple and efficient way to mock API responses.
      </p>
      <p>
        Whether you're building a new feature, testing edge cases, or debugging an issue, our extension
        empowers you to simulate API behavior without relying on a live backend.
      </p>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        <li>💡 Easily create and manage mock responses.</li>
        <li>⚡ Boost your development speed.</li>
        <li>🔒 Ensure consistent testing environments.</li>
      </ul>
      <p style={{ marginTop: '20px', textAlign: 'right' }}>
        <em>Happy coding!</em> 🚀
      </p>
    </div>
  );
};

export default About;