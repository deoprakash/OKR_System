import React from 'react'

export default function Toast({ id, message, type = 'info', onClose }) {
  const color = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-gray-700'
  return (
    <div className={`${color} text-white px-4 py-2 rounded shadow mb-2 flex items-center justify-between`}>
      <div>{message}</div>
      <button className="ml-4 font-bold" onClick={() => onClose(id)}>×</button>
    </div>
  )
}
