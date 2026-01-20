import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormRow from '../components/FormRow';
import LabeledInput from '../components/LabeledInput';
import KeyResultInput from '../components/KeyResultInput';
import QuarterInput from '../components/QuarterInput';
import OKRActionButton from '../components/OKRActionButton';
import BackButton from '../components/BackButton';

const OKRWorkspaceLevel1 = () => {
    const navigate = useNavigate();
    const [fields, setFields] = useState({
    employeeCode: '',
    employeeName: '',
    employeeLevel: '',
    okrCode: '',
    okrDate: '',
    okrDescription: '',
    keyResults: Array(5).fill(''),
    quarters: [
      { percent: '', comment: '' },
      { percent: '', comment: '' },
      { percent: '', comment: '' },
      { percent: '', comment: '' },
    ],
  });

  const handleFieldChange = (field, value) => {
    setFields(prev => ({ ...prev, [field]: value }));
  };

  const handleKeyResultChange = (idx, value) => {
    setFields(prev => {
      const keyResults = [...prev.keyResults];
      keyResults[idx] = value;
      return { ...prev, keyResults };
    });
  };

  const handleQuarterChange = (idx, value) => {
    setFields(prev => {
      const quarters = [...prev.quarters];
      quarters[idx].percent = value;
      return { ...prev, quarters };
    });
  };

  const handleQuarterCommentChange = (idx, value) => {
    setFields(prev => {
      const quarters = [...prev.quarters];
      quarters[idx].comment = value;
      return { ...prev, quarters };
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <div className="absolute top-8 left-8">
        <BackButton onClick={() => navigate('/')} />
      </div>
      <h1 className="text-4xl font-bold mb-8 mt-4 text-center">OKR Workspace - Level 1</h1>
      <form className="w-full max-w-6xl mx-auto">
        <FormRow>
          <LabeledInput label="Employee Code" value={fields.employeeCode} onChange={e => handleFieldChange('employeeCode', e.target.value)} className="w-32" />
          <LabeledInput label="Employee Name" value={fields.employeeName} onChange={e => handleFieldChange('employeeName', e.target.value)} className="w-64" />
          <LabeledInput label="Employee Level" value={fields.employeeLevel} onChange={e => handleFieldChange('employeeLevel', e.target.value)} className="w-32" />
          <LabeledInput label="OKR Code" value={fields.okrCode} onChange={e => handleFieldChange('okrCode', e.target.value)} className="w-32" />
        </FormRow>
        <FormRow>
          <LabeledInput label="OKR Date" value={fields.okrDate} onChange={e => handleFieldChange('okrDate', e.target.value)} className="w-32" />
          <LabeledInput label="OKR Description" value={fields.okrDescription} onChange={e => handleFieldChange('okrDescription', e.target.value)} className="w-full" />
        </FormRow>
        <div className="mt-8 mb-8">
          {fields.keyResults.map((kr, idx) => (
            <KeyResultInput
              key={idx}
              label={`Key Results ${idx + 1}`}
              value={kr}
              onChange={e => handleKeyResultChange(idx, e.target.value)}
            />
          ))}
        </div>
        <div className="flex gap-16 mt-8 mb-8">
          <div className="flex-1">
            <div className="font-bold text-lg mb-2">Comments</div>
            <QuarterInput
              label="Q1 % Completion"
              value={fields.quarters[0].percent}
              onChange={e => handleQuarterChange(0, e.target.value)}
              comment={fields.quarters[0].comment}
              onCommentChange={e => handleQuarterCommentChange(0, e.target.value)}
            />
            <QuarterInput
              label="Q2 % Completion"
              value={fields.quarters[1].percent}
              onChange={e => handleQuarterChange(1, e.target.value)}
              comment={fields.quarters[1].comment}
              onCommentChange={e => handleQuarterCommentChange(1, e.target.value)}
            />
          </div>
          <div className="flex-1">
            <div className="font-bold text-lg mb-2">Comments</div>
            <QuarterInput
              label="Q3 % Completion"
              value={fields.quarters[2].percent}
              onChange={e => handleQuarterChange(2, e.target.value)}
              comment={fields.quarters[2].comment}
              onCommentChange={e => handleQuarterCommentChange(2, e.target.value)}
            />
            <QuarterInput
              label="Q4 % Completion"
              value={fields.quarters[3].percent}
              onChange={e => handleQuarterChange(3, e.target.value)}
              comment={fields.quarters[3].comment}
              onCommentChange={e => handleQuarterCommentChange(3, e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-row gap-8 justify-center mt-8">
          <OKRActionButton>Update OKR</OKRActionButton>
          <OKRActionButton>Cancel OKR</OKRActionButton>
        </div>
      </form>
    </div>
  );
};

export default OKRWorkspaceLevel1;
