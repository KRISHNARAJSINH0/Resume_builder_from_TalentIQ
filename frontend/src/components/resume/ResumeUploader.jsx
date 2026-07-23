import React, { useState } from 'react';
import { Upload, File, Loader } from 'lucide-react';

export default function ResumeUploader({ onUploadComplete }) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        if (onUploadComplete) onUploadComplete();
      }, 1500);
    }
  };

  return (
    <div style={{
      border: '2px dashed var(--border)',
      borderRadius: '12px',
      padding: '2.5rem 1.5rem',
      textAlign: 'center',
      background: 'rgba(255,255,255,0.01)',
      cursor: 'pointer',
      position: 'relative',
      transition: 'border-color 0.2s ease'
    }}
    onDragOver={(e) => e.preventDefault()}
    >
      <input 
        type="file" 
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'pointer'
        }}
      />
      
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <Loader className="animate-spin" size={32} style={{ color: 'var(--v)' }} />
          <h4 style={{ fontSize: '14px', fontWeight: 600 }}>AI Extracting details...</h4>
          <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Running NLP spaCy skill extractor models</p>
        </div>
      ) : fileName ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <File size={32} style={{ color: 'var(--g)' }} />
          <h4 style={{ fontSize: '14px', fontWeight: 600 }}>{fileName}</h4>
          <p style={{ fontSize: '12px', color: 'var(--g)' }}>Successfully uploaded & parsed!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <Upload size={32} style={{ color: 'var(--muted)' }} />
          <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Drag and Drop Resume</h4>
          <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Supports PDF, DOCX (Max 5MB)</p>
          <span className="btn btn-secondary" style={{ marginTop: '10px', pointerEvents: 'none' }}>Browse Files</span>
        </div>
      )}
    </div>
  );
}
