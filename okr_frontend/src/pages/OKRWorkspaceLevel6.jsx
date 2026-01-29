import BackButton from '../components/BackButton';
import FormRow from '../components/FormRow';
import LabeledInput from '../components/LabeledInput';
import KeyResultInput from '../components/KeyResultInput';
import QuarterInput from '../components/QuarterInput';
import OKRActionButton from '../components/OKRActionButton';
import OKRLevelSection from '../components/OKRLevelSection';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EMPLOYEE_LEVELS = ['new value 1', 'new value 2', 'new value 3'];

const OKRWorkspaceLevel6 = () => {
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
    level5EmployeeCode: '',
    level5EmployeeName: '',
    level5OKRDescription: '',
    level5OKRValue: EMPLOYEE_LEVELS[0],
    level6OKRValue: EMPLOYEE_LEVELS[0],
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 relative">
      <div className="absolute top-8 left-8">
        <BackButton onClick={() => navigate('/')} />
      </div>
      <h1 className="text-4xl font-bold mb-8 mt-4 text-center">OKR Workspace - Level 6</h1>
      <form className="w-full max-w-6xl mx-auto">
        <FormRow>
          <LabeledInput label="Employee Code" value={fields.employeeCode} onChange={e => setFields(f => ({ ...f, employeeCode: e.target.value }))} className="w-32" />
          <LabeledInput label="Employee Name" value={fields.employeeName} onChange={e => setFields(f => ({ ...f, employeeName: e.target.value }))} className="w-64" />
          <LabeledInput label="Employee Level" value={fields.employeeLevel} onChange={e => setFields(f => ({ ...f, employeeLevel: e.target.value }))} className="w-32" />
          <LabeledInput label="OKR Code" value={fields.okrCode} onChange={e => setFields(f => ({ ...f, okrCode: e.target.value }))} className="w-32" />
        </FormRow>
        <OKRLevelSection
          level={5}
          employeeCode={fields.level5EmployeeCode}
          employeeName={fields.level5EmployeeName}
          okrDescription={fields.level5OKRDescription}
          okrValue={fields.level5OKRValue}
          onChange={(field, value) => setFields(f => ({ ...f, [`level5${field.charAt(0).toUpperCase() + field.slice(1)}`]: value }))}
        />
        <div className="border border-black rounded bg-white p-6 mb-8">
          <div className="w-fit mx-auto -mt-6 mb-4">
            <span className="bg-black text-white px-6 py-1 rounded text-lg font-bold shadow">Level - 6</span>
          </div>
          <FormRow>
            <LabeledInput label="OKR Date" value={fields.okrDate} onChange={e => setFields(f => ({ ...f, okrDate: e.target.value }))} className="w-32" />
            <LabeledInput label="OKR Description" value={fields.okrDescription} onChange={e => setFields(f => ({ ...f, okrDescription: e.target.value }))} className="w-full" />
              {/* Dropdown for OKR Description has been removed */}
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

export default OKRWorkspaceLevel6;
