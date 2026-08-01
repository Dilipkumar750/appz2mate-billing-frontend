import React from 'react'

const DataTable = ({ columns, data, caption }) => {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {caption && <div className="border-b border-slate-200 px-6 py-4 text-sm font-semibold text-slate-700">{caption}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {columns.map((label) => (
                <th key={label} className="px-6 py-4 font-medium uppercase tracking-wide">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 align-top">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable
