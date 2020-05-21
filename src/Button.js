import React from 'react';

export default function Button({
  onClick, title, backgroundColor = "#ff00e4", emoji, disabled
}) {
  return (
    <button
      onClick={disabled ? null : onClick}
      style={buttonStyle(backgroundColor, disabled)}
      className="
      transform
      transition-all duration-150 shadow-button hover:scale-105
      "
    >
        <span style={buttonSpanStyle}>{emoji}</span> {title}
    </button>
  )
}

const buttonSpanStyle = {
  marginTop: 3,
  textShadow: 'none',
  marginRight: 5
}

const buttonStyle = (backgroundColor, disabled) => ({
  background: backgroundColor,
  borderRadius: 4,
  width: 220,
  height: 60,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 13,
  color: 'white',
  textShadow: 'rgba(0, 0, 0, 0.25) 0px 0.1rem 0.1rem',
  outline: 'none',
  border: 'none',
  fontWeight: 'bold',
  opacity: disabled ? .5 : 1,
  fontSize: 20
})