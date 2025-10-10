import React from 'react';

export default function Hello(props) {
    console.log('Hello component mounted!', props);
    return <div style={{ border: '2px solid red' }}>Hello {props.fullName}</div>;
}
