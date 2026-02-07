import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import FormRow from '../components/FormRow';
import LabeledInput from '../components/LabeledInput';
import KeyResultInput from '../components/KeyResultInput';
import QuarterInput from '../components/QuarterInput';
import OKRActionButton from '../components/OKRActionButton';
import SectionTitle from '../components/SectionTitle';
import Box from '../components/Box';
import api, { listEmployees, listLevel1OKRs, listLevel2OKRs, createLevel2OKR, updateLevel2OKR } from '../lib/api';

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
    level1OkrCode: '',
    level1OKRValue: EMPLOYEE_LEVELS[0],
    level2OKRValue: EMPLOYEE_LEVELS[0],
  });

  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [level1Options, setLevel1Options] = useState([]);
  const [level1OKRDescriptions, setLevel1OKRDescriptions] = useState([]);
  const [level2OkrsAll, setLevel2OkrsAll] = useState([]);

  const sumPercents = () => fields.quarters.reduce((s, q) => s + (Number(q.percent) || 0), 0);
  const percentSum = sumPercents();

  // ...handlers similar to Level 1, plus for new fields...

  useEffect(() => {
    // fetch employees, level1 okrs and level2 okrs
    async function load() {
      try {
        const empRes = await listEmployees();
        const emps = empRes.data || [];
        setEmployeeOptions(emps.filter(e => Number(e.empLevel) === 2));

        const l1 = await listLevel1OKRs();
        const l1data = l1.data || [];
        // unique level1 employees who have OKRs
        const unique = [];
        const seen = new Set();
        l1data.forEach(item => {
          if (!seen.has(item.empCode)) {
            seen.add(item.empCode);
            unique.push({ empCode: item.empCode, empName: item.empName });
          }
        });
        setLevel1Options(unique);

        const l2 = await listLevel2OKRs();
        setLevel2OkrsAll(l2.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
    // set default okrDate to today
    setFields(f => ({ ...f, okrDate: new Date().toISOString().slice(0, 10) }));
  }, []);

  const resetForm = () => {
    setFields({
      employeeCode: '',
      employeeName: '',
      employeeLevel: '',
      okrCode: '',
      okrDate: new Date().toISOString().slice(0,10),
      okrDescription: '',
      keyResults: Array(5).fill(''),
      quarters: [ { percent: '', comment: '' }, { percent: '', comment: '' }, { percent: '', comment: '' }, { percent: '', comment: '' } ],
      level1EmployeeCode: '',
      level1EmployeeName: '',
      level1OKRDescription: '',
      level1OkrCode: '',
      level1OKRValue: EMPLOYEE_LEVELS[0],
      level2OKRValue: EMPLOYEE_LEVELS[0]
    });
    setLevel2OkrsAll([]);
  };
  const firstInputRef = useRef(null);
  useEffect(() => { try { firstInputRef.current && firstInputRef.current.focus(); window.focus && window.focus(); } catch {} }, []);

  const handleSelectEmployee = (e) => {
    const code = Number(e.target.value) || '';
    const emp = employeeOptions.find(x => Number(x.empCode) === code);
    setFields(f => ({
      ...f,
      employeeCode: code,
      employeeName: emp ? emp.empName : '',
      employeeLevel: emp ? String(emp.empLevel) : '',
      okrCode: '',
    }));
    // filter level2 okrs for this employee
    const filtered = level2OkrsAll.filter(o => Number(o.empCode) === Number(code));
    setLevel2OkrsAll(prev => prev); // keep all, dropdown will compute options
  };

  const handleSelectOKRCode = (e) => {
    const val = e.target.value;
    if (val === 'NEW') {
      // new record, clear OKR-specific fields
      setFields(f => ({
        ...f,
        okrCode: 'NEW',
        okrDescription: '',
        keyResults: Array(5).fill(''),
        quarters: [ { percent: '', comment: '' }, { percent: '', comment: '' }, { percent: '', comment: '' }, { percent: '', comment: '' } ],
        okrDate: new Date().toISOString().slice(0, 10)
      }));
      return;
    }
    // find selected OKR
    const num = Number(val);
    const okr = level2OkrsAll.find(x => Number(x.level2OkrCode) === num || Number(x._id) === num);
    if (!okr) return;
    setFields(f => ({
      ...f,
      okrCode: okr.level2OkrCode,
      okrDate: okr.okrDate ? new Date(okr.okrDate).toISOString().slice(0,10) : f.okrDate,
      okrDescription: okr.okrDesc || '',
      keyResults: [okr.kr1 || '', okr.kr2 || '', okr.kr3 || '', okr.kr4 || '', okr.kr5 || ''],
      quarters: [
        { percent: okr.q1_percentage ?? '', comment: okr.q1_comment || '' },
        { percent: okr.q2_percentage ?? '', comment: okr.q2_comment || '' },
        { percent: okr.q3_percentage ?? '', comment: okr.q3_comment || '' },
        { percent: okr.q4_percentage ?? '', comment: okr.q4_comment || '' },
      ]
    }));
  };

  const handleSelectLevel1Employee = (e) => {
    const code = Number(e.target.value) || '';
    const emp = level1Options.find(x => Number(x.empCode) === code);
    setFields(f => ({ ...f, level1EmployeeCode: code, level1EmployeeName: emp ? emp.empName : '', level1OKRDescription: '' }));
    // populate OKR descriptions for this level1 employee
    const descriptions = [];
    // level1 OKRs list is not stored separately — fetch from API again
    listLevel1OKRs().then(res => {
      const items = (res.data || []).filter(i => Number(i.empCode) === Number(code)).map(i => ({ level1OkrCode: i.level1OkrCode, okrDesc: i.okrDesc || '' }));
      setLevel1OKRDescriptions(items);
    }).catch(() => setLevel1OKRDescriptions([]));
  };

  const handleUpdateOKR = async () => {
    if (percentSum > 100) {
      alert('Sum of percentages cannot exceed 100%');
      return;
    }
    // Require linking to a Level-1 OKR (backend validation requires this)
    if (!fields.level1OkrCode) {
      alert('Please select a Level-1 OKR to link before saving.');
      return;
    }
    try {
      const payload = {
        empCode: Number(fields.employeeCode),
        empName: fields.employeeName,
        empLevel: Number(fields.employeeLevel) || 2,
        okrDate: fields.okrDate,
        level1OkrCode: fields.level1OkrCode ? Number(fields.level1OkrCode) : undefined,
        okrDesc: fields.okrDescription,
        kr1: fields.keyResults[0] || '',
        kr2: fields.keyResults[1] || '',
        kr3: fields.keyResults[2] || '',
        kr4: fields.keyResults[3] || '',
        kr5: fields.keyResults[4] || '',
        q1_percentage: fields.quarters[0].percent === '' ? undefined : Number(fields.quarters[0].percent),
        q1_comment: fields.quarters[0].comment || '',
        q2_percentage: fields.quarters[1].percent === '' ? undefined : Number(fields.quarters[1].percent),
        q2_comment: fields.quarters[1].comment || '',
        q3_percentage: fields.quarters[2].percent === '' ? undefined : Number(fields.quarters[2].percent),
        q3_comment: fields.quarters[2].comment || '',
        q4_percentage: fields.quarters[3].percent === '' ? undefined : Number(fields.quarters[3].percent),
        q4_comment: fields.quarters[3].comment || ''
      };

      if (fields.okrCode === 'NEW' || fields.okrCode === '' || fields.okrCode == null) {
        // create
        const res = await createLevel2OKR(payload);
        const created = res.data;
        alert('Created OKR with code: ' + (created.level2OkrCode || created._id));
        // refresh list
        const l2 = await listLevel2OKRs();
        setLevel2OkrsAll(l2.data || []);
        // clear form after create
        resetForm();
      } else {
        // update by code
        await updateLevel2OKR(fields.okrCode, payload);
        alert('OKR updated');
        const l2 = await listLevel2OKRs();
        setLevel2OkrsAll(l2.data || []);
      }
    } catch (err) {
      console.error(err);
      alert('Save failed: ' + (err.message || err));
    }
  };

  const handleCancel = () => {
    if (confirm('Cancel OKR Entry and Exit?')) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1724] flex items-center justify-center py-12">
      <div className="absolute top-6 left-6">
        <BackButton onClick={() => navigate('/')} />
      </div>
      <div className="bg-white rounded-lg shadow-2xl w-[95%] max-w-6xl p-8 overflow-hidden">
        <h1 className="text-3xl font-bold mb-6 text-center">OKR Workspace - Level 2</h1>
        <form>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <label className="font-semibold">Employee Code</label>
              <select ref={firstInputRef} value={fields.employeeCode} onChange={handleSelectEmployee} className="border px-2 py-1 w-40">
                <option value="">-- Select --</option>
                {employeeOptions.map(emp => (
                  <option key={emp.empCode} value={emp.empCode}>{emp.empCode} - {emp.empName}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex items-center gap-1 min-w-0">
              <label className="font-semibold min-w-25">Employee Name</label>
              <input value={fields.employeeName} readOnly className="border px-2 py-1 w-full bg-gray-100" />
            </div>
            <div className="flex items-center gap-1">
              <label className="font-semibold">Employee Level</label>
              <input value={fields.employeeLevel} readOnly className="border px-2 py-1 w-20 bg-gray-100" />
            </div>
            <div className="flex items-center gap-1 ml-4">
              <label className="font-semibold">OKR Code</label>
              <select value={fields.okrCode} onChange={handleSelectOKRCode} className="border px-2 py-1 w-48">
                <option value="">-- Select --</option>
                {level2OkrsAll.filter(o => Number(o.empCode) === Number(fields.employeeCode)).map(o => (
                  <option key={o.level2OkrCode} value={o.level2OkrCode}>{o.level2OkrCode} - {o.okrDesc?.slice(0,50)}</option>
                ))}
                <option value="NEW">New</option>
              </select>
            </div>
          </div>

          <Box>
            <SectionTitle>Level - 1</SectionTitle>
            <FormRow>
              <div className="w-32">
                <label className="font-semibold block mb-1">Employee Code</label>
                <select value={fields.level1EmployeeCode} onChange={handleSelectLevel1Employee} className="border px-2 py-1">
                  <option value="">-- Select --</option>
                  {level1Options.map(opt => (
                    <option key={opt.empCode} value={opt.empCode}>{opt.empCode} - {opt.empName}</option>
                  ))}
                </select>
              </div>
              <div className="w-62">
                <label className="font-semibold block mb-1">Employee Name</label>
                <input value={fields.level1EmployeeName} readOnly className="border px-2 py-1 w-full bg-gray-100" />
              </div>
              <div className="w-full">
                <label className="font-semibold block mb-1">OKR Description</label>
                <select value={fields.level1OKRDescription} onChange={e => setFields(f => ({ ...f, level1OKRDescription: e.target.value, level1OkrCode: e.target.value && (() => { try { const v = JSON.parse(e.target.selectedOptions[0].dataset.payload); return v.level1OkrCode; } catch { return ''; } })() }))} className="border px-2 py-1 w-full">
                  <option value="">-- Select Description --</option>
                  {level1OKRDescriptions.map((d, i) => (
                    <option key={i} value={d.okrDesc} data-payload={JSON.stringify(d)}>{d.okrDesc}</option>
                  ))}
                </select>
              </div>
            </FormRow>
          </Box>

          <Box>
            <SectionTitle>Level - 2</SectionTitle>
            <div className="flex flex-wrap items-start gap-2 mb-6">
              <div className="flex flex-col items-start gap-1 w-36 min-w-0">
                <label className="font-semibold">OKR Date</label>
                <input type="date" value={fields.okrDate} disabled className="border py-1 w-full bg-gray-100 text-center px-2" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="font-semibold">OKR Description</label>
                <textarea value={fields.okrDescription} onChange={e => setFields(f => ({ ...f, okrDescription: e.target.value }))} className="border w-full h-24 p-2 mt-1 min-w-0" />
              </div>
            </div>
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

          <div className="flex flex-wrap gap-8 mb-6">
            <div className="flex-1 min-w-0">
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

            <div className="flex-1 min-w-0">
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

          {percentSum > 100 && (
            <div className="text-red-600 font-semibold text-center">Sum of Q1–Q4 percentages must not exceed 100% (current: {percentSum}%).</div>
          )}
          <div className="flex flex-row gap-8 justify-center mt-8">
            <OKRActionButton disabled={percentSum > 100} onClick={(e) => { e.preventDefault(); handleUpdateOKR(); }}>Update OKR</OKRActionButton>
            <OKRActionButton onClick={(e) => { e.preventDefault(); handleCancel(); }}>Cancel OKR</OKRActionButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OKRWorkspaceLevel2;
