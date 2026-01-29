import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import FormRow from '../components/FormRow';
import LabeledInput from '../components/LabeledInput';
import KeyResultInput from '../components/KeyResultInput';
import QuarterInput from '../components/QuarterInput';
import OKRActionButton from '../components/OKRActionButton';
import OKRLevelSection from '../components/OKRLevelSection';

const EMPLOYEE_LEVELS = ['new value 1', 'new value 2', 'new value 3'];

const OKRWorkspaceLevel7 = () => {
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
    level6EmployeeCode: '',
    level6EmployeeName: '',
    level6OKRDescription: '',
    level6OKRValue: EMPLOYEE_LEVELS[0],
    level7OKRValue: EMPLOYEE_LEVELS[0],
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 relative">
      <div className="absolute top-8 left-8">
        <BackButton onClick={() => navigate('/')} />
      </div>
      <h1 className="text-4xl font-bold mb-8 mt-4 text-center">OKR Workspace - Level 7</h1>
      <form className="w-full max-w-6xl mx-auto">
        {/* OKR Level 6 Section */}
        <OKRLevelSection
          level={6}
          employeeCode={fields.level6EmployeeCode}
          employeeName={fields.level6EmployeeName}
          okrDescription={fields.level6OKRDescription}
          okrValue={fields.level6OKRValue}
          onChange={(field, value) => setFields(f => ({ ...f, [`level6${field.charAt(0).toUpperCase() + field.slice(1)}`]: value }))}
        />
        <div className="border border-black rounded bg-white p-6 mb-8">
          <div className="w-fit mx-auto -mt-6 mb-4">
            <span className="bg-black text-white px-6 py-1 rounded text-lg font-bold shadow">Level - 7</span>
          </div>
          <FormRow>
            <LabeledInput label="OKR Date" value={fields.okrDate} onChange={e => setFields(f => ({ ...f, okrDate: e.target.value }))} className="w-32" />
            <LabeledInput label="OKR Description" value={fields.okrDescription} onChange={e => setFields(f => ({ ...f, okrDescription: e.target.value }))} className="w-full" />
          </FormRow>
          <div className="mt-8 mb-8">
            {fields.keyResults.map((kr, idx) => (
              <KeyResultInput
                key={idx}
                label={`Key Results ${idx + 1}`}
                value={kr}
                onChange={e => setFields(f => {
                  const keyResults = [...f.keyResults];
                  keyResults[idx] = e.target.value;
                  return { ...f, keyResults };
                })}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-16 mt-8 mb-8">
          <div className="flex-1">
            <div className="font-bold text-lg mb-2">Comments</div>
            <QuarterInput
              label="Q1 % Completion"
              value={fields.quarters[0].percent}
              onChange={e => setFields(f => {
                const quarters = [...f.quarters];
                quarters[0].percent = e.target.value;
                return { ...f, quarters };
              })}
              comment={fields.quarters[0].comment}
              onCommentChange={e => setFields(f => {
                const quarters = [...f.quarters];
                quarters[0].comment = e.target.value;
                return { ...f, quarters };
              })}
            />
            <QuarterInput
              label="Q2 % Completion"
              value={fields.quarters[1].percent}
              onChange={e => setFields(f => {
                const quarters = [...f.quarters];
                quarters[1].percent = e.target.value;
                return { ...f, quarters };
              })}
              comment={fields.quarters[1].comment}
              onCommentChange={e => setFields(f => {
                const quarters = [...f.quarters];
                quarters[1].comment = e.target.value;
                return { ...f, quarters };
              })}
            />
          </div>
          <div className="flex-1">
            <div className="font-bold text-lg mb-2">Comments</div>
            <QuarterInput
              label="Q3 % Completion"
              value={fields.quarters[2].percent}
              onChange={e => setFields(f => {
                const quarters = [...f.quarters];
                quarters[2].percent = e.target.value;
                return { ...f, quarters };
              })}
              comment={fields.quarters[2].comment}
              onCommentChange={e => setFields(f => {
                const quarters = [...f.quarters];
                quarters[2].comment = e.target.value;
                return { ...f, quarters };
              })}
            />
            <QuarterInput
              label="Q4 % Completion"
              value={fields.quarters[3].percent}
              onChange={e => setFields(f => {
                const quarters = [...f.quarters];
                quarters[3].percent = e.target.value;
                return { ...f, quarters };
              })}
              comment={fields.quarters[3].comment}
              onCommentChange={e => setFields(f => {
                const quarters = [...f.quarters];
                quarters[3].comment = e.target.value;
                return { ...f, quarters };
              })}
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

export default OKRWorkspaceLevel7;
