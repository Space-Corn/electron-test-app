import React from 'react';
import { ScheduleRow } from '../types/project';

interface Props {
  data: ScheduleRow[];
}

const DataTable = ({ data }: Props) => {
  if (data.length === 0) return <p>No data imported yet.</p>;

  return (
    <div style={{ width: '100%', borderCollapse: 'collapse' }}>
      <table style={{ width: '100%', textAlign: 'left', fontSize: '14px' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th style={{ padding: '8px' }}>ID</th>
            <th style={{ padding: '8px' }}>Description</th>
            <th style={{ padding: '8px' }}>Early Start</th>
            <th style={{ padding: '8px' }}>Level</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.actId} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px' }}>{row.actId}</td>
              <td style={{ padding: '8px' }}>{row.actDesc}</td>
              <td style={{ padding: '8px' }}>{row.esDate}</td>
              <td style={{ padding: '8px' }}>{row.resLevel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;