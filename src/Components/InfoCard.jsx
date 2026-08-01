import React from 'react'

const InfoCard = ({ title, value, detail, accent }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium text-slate-500">{title}</h2>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-2xl px-3 py-2 text-xs font-semibold ${accent}`}>
          {detail}
        </div>
      </div>
    </div>
  )
}

export default InfoCard
