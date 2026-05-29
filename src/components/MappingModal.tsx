import React, { useState, useEffect } from 'react';
import { SYSTEM_FIELDS } from '../config/mappingConfig';


interface MappingModalProps {
    scoutData: {
      headers: string[];
      sampleData: string[][];
      filePath: string;
      fileName: string;
    };
    onConfirm: (config: { metadata: any; fieldMap: Record<string, string> }) => void;
    onCancel: () => void;
}

const MappingModal: React.FC<MappingModalProps> = ({ scoutData, onConfirm, onCancel }) => {
  const { headers, sampleData, fileName } = scoutData;
  
  // State for Metadata
  const [metadata, setMetadata] = useState({
    projectName: fileName.replace('.csv', ''),
    projectId: '',
    projectOwner: '',
    statusDate: '',
    targetCompletionDate: '', // 📅 Subtask 1: Added Target Date Key
    updatePeriod: 'Weekly',
    weekEndingDay: 5,         // 📆 Subtask 2: Existing key ready for UI input
  });

  // State for the actual field mapping
  const [fieldMap, setFieldMap] = useState<Record<string, string>>({});

  // Auto-mapping logic on mount
  useEffect(() => {
    const initialMap: Record<string, string> = {};
    
    Object.values(SYSTEM_FIELDS).flat().forEach(field => {
      const match = headers.find(h => 
        h.toLowerCase().replace(/[^a-z0-9]/g, '') === 
        field.label.toLowerCase().replace(/[^a-z0-9]/g, '')
      );
      
      if (match) {
        initialMap[field.key] = match;
      } else {
        // --- TEMPORARY TESTING SHORTCUT ---
        if (field.key === 'actId') initialMap['actId'] = headers[0]; 
        if (field.key === 'actDesc') initialMap['actDesc'] = headers[1];
        if (field.key === 'esDate') initialMap['esDate'] = headers[2];
        if (field.key === 'efDate') initialMap['efDate'] = headers[3];
      }
    });
    
    setFieldMap(initialMap);
  }, [headers]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Import Project: {fileName}</h2>
        
        {/* SECTION 1: PROJECT METADATA */}
        <section className="metadata-section">
          <h3>Project Details</h3>
          <div className="grid-2-col">
            <input placeholder="Project Name" value={metadata.projectName} 
                   onChange={e => setMetadata({...metadata, projectName: e.target.value})} />
            
            <input placeholder="Project ID" value={metadata.projectId}
                   onChange={e => setMetadata({...metadata, projectId: e.target.value})} />
            
            {/* SUBTASK 1: Target Completion Date input field */}
            <div className="input-group">
              <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '2px' }}>Target Completion Date</label>
              <input type="date" value={metadata.targetCompletionDate}
                     onChange={e => setMetadata({...metadata, targetCompletionDate: e.target.value})} />
            </div>

            {/* SUBTASK 2: Week Ending Day drop-down selector */}
            <div className="input-group">
              <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '2px' }}>Reporting Week Ending Day</label>
              <select value={metadata.weekEndingDay}
                      onChange={e => setMetadata({...metadata, weekEndingDay: Number(e.target.value)})}
                      style={{ width: '100%', padding: '6px' }}>
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
              </select>
            </div>
          </div>
        </section>

        {/* SECTION 2: FIELD MAPPING */}
        <section className="mapping-section">
          <h3>Field Mapping</h3>
          <p className="hint">Match your CSV columns (Right) to System fields (Left)</p>
          
          <div className="mapping-container">
            {Object.entries(SYSTEM_FIELDS).map(([category, fields]) => (
              <div key={category} className="mapping-group">
                <h4>{category.toUpperCase()}</h4>
                {fields.map(field => (
                  <div key={field.key} className="mapping-row">
                    <span>{field.label}</span>
                    <select 
                      value={fieldMap[field.key] || ''} 
                      onChange={e => setFieldMap({...fieldMap, [field.key]: e.target.value})}
                    >
                      <option value="">-- Ignore Field --</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: DATA PREVIEW */}
        <section className="preview-section">
          <h3>Data Preview (First 5 Rows)</h3>
          <table>
            <thead>
              <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {sampleData.map((row, i) => (
                <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="modal-actions">
          <button onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={() => onConfirm({ metadata, fieldMap })}>
            Complete Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default MappingModal;