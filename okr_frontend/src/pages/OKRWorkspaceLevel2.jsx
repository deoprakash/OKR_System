import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import FormRow from '../components/FormRow';
import LabeledInput from '../components/LabeledInput';
import KeyResultInput from '../components/KeyResultInput';
import QuarterInput from '../components/QuarterInput';
import OKRActionButton from '../components/OKRActionButton';
import SectionTitle from '../components/SectionTitle';
import Box from '../components/Box';

const EMPLOYEE_LEVELS = ['new value 1', 'new value 2', 'new value 3'];

const OKRWorkspaceLevel2 = () => {
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
    level1EmployeeCode: '',
    level1EmployeeName: '',
    level1OKRDescription: '',
    level1OKRValue: EMPLOYEE_LEVELS[0],
    level2OKRValue: EMPLOYEE_LEVELS[0],
  });

  // ...handlers similar to Level 1, plus for new fields...

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 relative">
      <div className="absolute top-8 left-8">
        <BackButton onClick={() => navigate('/')} />
      </div>
      <h1 className="text-4xl font-bold mb-8 mt-4 text-center">OKR Workspace - Level 2</h1>
      <form className="w-full max-w-6xl mx-auto">
        <FormRow>
          <LabeledInput label="Employee Code" value={fields.employeeCode} onChange={e => setFields(f => ({ ...f, employeeCode: e.target.value }))} className="w-32" />
          <LabeledInput label="Employee Name" value={fields.employeeName} onChange={e => setFields(f => ({ ...f, employeeName: e.target.value }))} className="w-64" />
          <LabeledInput label="Employee Level" value={fields.employeeLevel} onChange={e => setFields(f => ({ ...f, employeeLevel: e.target.value }))} className="w-32" />
          <LabeledInput label="OKR Code" value={fields.okrCode} onChange={e => setFields(f => ({ ...f, okrCode: e.target.value }))} className="w-32" />
        </FormRow>
        <Box>
          <SectionTitle>Level - 1</SectionTitle>
          <FormRow>
            <LabeledInput label="Employee Code" value={fields.level1EmployeeCode} onChange={e => setFields(f => ({ ...f, level1EmployeeCode: e.target.value }))} className="w-32" />
            <LabeledInput label="Employee Name" value={fields.level1EmployeeName} onChange={e => setFields(f => ({ ...f, level1EmployeeName: e.target.value }))} className="w-64" />
            <LabeledInput label="OKR Description" value={fields.level1OKRDescription} onChange={e => setFields(f => ({ ...f, level1OKRDescription: e.target.value }))} className="w-full" />
            <select className="w-40 p-2 border border-gray-300 rounded text-lg" value={fields.level1OKRValue} onChange={e => setFields(f => ({ ...f, level1OKRValue: e.target.value }))}>
              {EMPLOYEE_LEVELS.map((opt, idx) => (
                <option key={idx} value={opt}>{opt}</option>
              ))}
            </select>
          </FormRow>
        </Box>
        <Box>
          <SectionTitle>Level - 2</SectionTitle>
          <FormRow>
            <LabeledInput label="OKR Date" value={fields.okrDate} onChange={e => setFields(f => ({ ...f, okrDate: e.target.value }))} className="w-32" />
            <LabeledInput label="OKR Description" value={fields.okrDescription} onChange={e => setFields(f => ({ ...f, okrDescription: e.target.value }))} className="w-full" />
            <select className="w-40 p-2 border border-gray-300 rounded text-lg" value={fields.level2OKRValue} onChange={e => setFields(f => ({ ...f, level2OKRValue: e.target.value }))}>
              {EMPLOYEE_LEVELS.map((opt, idx) => (
                <option key={idx} value={opt}>{opt}</option>
              ))}
            </select>
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
        </Box>
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

export default OKRWorkspaceLevel2;
