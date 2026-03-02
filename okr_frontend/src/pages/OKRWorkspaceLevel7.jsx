import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import FormRow from '../components/FormRow';
import LabeledInput from '../components/LabeledInput';
import KeyResultInput from '../components/KeyResultInput';
import QuarterInput from '../components/QuarterInput';
import OKRActionButton from '../components/OKRActionButton';
import OKRLevelSection from '../components/OKRLevelSection';
import SectionTitle from '../components/SectionTitle';
import Box from '../components/Box';
import { listEmployees, listLevel6OKRs, listLevel7OKRs, createLevel7OKR, updateLevel7OKR } from '../lib/api';
import { useToast } from '../components/ToastProvider';

const OKRWorkspaceLevel7 = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const getLocalDateString = (value) => {
    const d = value ? new Date(value) : new Date();
    if (Number.isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
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
    level6OkrCode: '',
  });
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [level6Options, setLevel6Options] = useState([]);
  const [level6OKRDescriptions, setLevel6OKRDescriptions] = useState([]);
  const [level7All, setLevel7All] = useState([]);
  const sumPercents = () => fields.quarters.reduce((s, q) => s + (Number(q.percent) || 0), 0);
  const percentSum = sumPercents();

  useEffect(() => {
    async function load() {
      try {
        const empRes = await listEmployees();
        const emps = empRes.data || [];
        setEmployeeOptions(emps.filter(e => Number(e.empLevel) === 7));

        const l6 = await listLevel6OKRs();
        const l6data = l6.data || [];
        const seen = new Set();
        const unique = [];
        l6data.forEach(item => {
          if (!seen.has(item.empCode)) {
            seen.add(item.empCode);
            unique.push({ empCode: item.empCode, empName: item.empName });
          }
        });
        setLevel6Options(unique);

        const l7 = await listLevel7OKRs();
        setLevel7All(l7.data || []);
      } catch (err) {
        console.error(err);
      }
      setFields(f => ({ ...f, okrDate: getLocalDateString() }));
    }
    load();
  }, []);

  const resetForm = () => {
    setFields({
      employeeCode: '',
      employeeName: '',
      employeeLevel: '',
      okrCode: '',
      okrDate: getLocalDateString(),
      okrDescription: '',
      keyResults: Array(5).fill(''),
      quarters: [ { percent: '', comment: '' }, { percent: '', comment: '' }, { percent: '', comment: '' }, { percent: '', comment: '' } ],
      level6EmployeeCode: '',
      level6EmployeeName: '',
      level6OKRDescription: '',
      level6OkrCode: ''
    });
    setLevel7All([]);
  };
  const firstInputRef = useRef(null);
  const tryFocus = () => {
    try {
      const el = firstInputRef.current;
      if (el) {
        el.focus();
        if (typeof el.select === 'function') el.select();
      }
    } catch {}
  };

  useEffect(() => {
    tryFocus();
    const t1 = setTimeout(tryFocus, 50);
    const t2 = setTimeout(tryFocus, 200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleSelectEmployee = (e) => {
    const code = Number(e.target.value) || '';
    const emp = employeeOptions.find(x => Number(x.empCode) === code);
    setFields(f => ({ ...f, employeeCode: code, employeeName: emp ? emp.empName : '', employeeLevel: emp ? String(emp.empLevel) : '', okrCode: '' }));
  };

  const handleSelectOKRCode = (e) => {
    const val = e.target.value;
    if (val === 'NEW') {
      setFields(f => ({ ...f, okrCode: 'NEW', okrDescription: '', keyResults: Array(5).fill(''), quarters: [ { percent: '', comment: '' }, { percent: '', comment: '' }, { percent: '', comment: '' }, { percent: '', comment: '' } ], okrDate: getLocalDateString() }));
      return;
    }
    const num = Number(val);
    const okr = level7All.find(x => Number(x.level7OkrCode) === num || Number(x._id) === num);
    if (!okr) return;
    setFields(f => ({
      ...f,
      okrCode: okr.level7OkrCode,
      okrDate: okr.okrDate ? getLocalDateString(okr.okrDate) : f.okrDate,
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

  const handleSelectLevel6Employee = (e) => {
    const code = Number(e.target.value) || '';
    const emp = level6Options.find(x => Number(x.empCode) === code);
    setFields(f => ({ ...f, level6EmployeeCode: code, level6EmployeeName: emp ? emp.empName : '', level6OKRDescription: '', level6OkrCode: '' }));
    listLevel6OKRs().then(res => {
      const items = (res.data || []).filter(i => Number(i.empCode) === Number(code)).map(i => ({ level6OkrCode: i.level6OkrCode, okrDesc: i.okrDesc || '' }));
      setLevel6OKRDescriptions(items);
    }).catch(() => setLevel6OKRDescriptions([]));
  };

  const handleUpdateOKR = async () => {
    // if (percentSum > 100) { alert('Sum of percentages cannot exceed 100%'); return; }
    // OKR date must not be in the future
    try {
      const okrDate = new Date(`${fields.okrDate}T00:00:00`);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (okrDate > today) { toast.send('OKR Date must not be in the future', 'error'); return; }
    } catch (e) { toast.send('Invalid OKR Date', 'error'); return; }

    if (!fields.level6OkrCode) { toast.send('Please select a Level-6 OKR to link before saving.', 'error'); return; }

    try {
      const payload = {
        empCode: Number(fields.employeeCode),
        empName: fields.employeeName,
        empLevel: Number(fields.employeeLevel) || 7,
        okrDate: fields.okrDate,
        level6OkrCode: fields.level6OkrCode ? Number(fields.level6OkrCode) : undefined,
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
        const res = await createLevel7OKR(payload);
        const created = res.data;
        toast.send('Created OKR with code: ' + (created.level7OkrCode || created._id), 'success');
        const l7 = await listLevel7OKRs(); setLevel7All(l7.data || []);
        resetForm();
      } else {
        await updateLevel7OKR(fields.okrCode, payload);
        toast.send('OKR updated', 'success');
        const l7 = await listLevel7OKRs(); setLevel7All(l7.data || []);
      }
    } catch (err) { console.error(err); toast.send('Save failed: ' + (err.message || err), 'error'); }
  };

  const handleCancel = () => { if (confirm('Cancel OKR Entry and Exit?')) { resetForm(); navigate('/'); } };

  return (
    <div className="min-h-screen bg-[#0f1724] flex items-center justify-center py-12">
      <div className="absolute top-6 left-6">
        <BackButton onClick={() => navigate('/')} />
      </div>
      <div className="bg-white rounded-lg shadow-2xl w-[95%] max-w-6xl p-8 overflow-hidden">
        <h1 className="text-3xl font-bold mb-6 text-center">OKR Workspace - Level 7</h1>
        <form>
          <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="flex flex-col gap-2 min-w-0">
              <label className="font-semibold">Employee Code</label>
              <select value={fields.employeeCode} onChange={handleSelectEmployee} className="border px-2 py-2 w-full bg-white">
                <option value="">-- Select --</option>
                {employeeOptions.map(emp => (
                  <option key={emp.empCode} value={emp.empCode}>{emp.empCode} - {emp.empName}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              <label className="font-semibold">Employee Name</label>
              <input value={fields.employeeName} readOnly className="border px-2 py-2 w-full bg-gray-100" />
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              <label className="font-semibold">Employee Level</label>
              <input value={fields.employeeLevel} readOnly className="border px-2 py-2 w-full bg-gray-100" />
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              <label className="font-semibold">OKR Code</label>
              <select value={fields.okrCode} onChange={handleSelectOKRCode} className="border px-2 py-2 w-full">
                <option value="">-- Select --</option>
                <option value="NEW">New</option>
                {level7All.filter(o => Number(o.empCode) === Number(fields.employeeCode)).map(o => (
                  <option key={o.level7OkrCode} value={o.level7OkrCode}>{o.level7OkrCode} - {o.okrDesc?.slice(0,50)}</option>
                ))}
              </select>
            </div>
          </div>
          <Box>
            <SectionTitle>Level - 6</SectionTitle>
            <FormRow>
              <div className="w-32">
                <label className="font-semibold block mb-1">Employee Code</label>
                  <select ref={firstInputRef} value={fields.level6EmployeeCode} onChange={handleSelectLevel6Employee} className="border px-2 py-1">
                  <option value="">-- Select --</option>
                  {level6Options.map(opt => (
                    <option key={opt.empCode} value={opt.empCode}>{opt.empCode} - {opt.empName}</option>
                  ))}
                </select>
              </div>
              <div className="w-62">
                <label className="font-semibold block mb-1">Employee Name</label>
                <input value={fields.level6EmployeeName} readOnly className="border px-2 py-1 w-full bg-gray-100" />
              </div>
              <div className="w-full">
                <label className="font-semibold block mb-1">OKR Description</label>
                <select value={fields.level6OKRDescription} onChange={e => setFields(f => ({ ...f, level6OKRDescription: e.target.value, level6OkrCode: e.target.value && (() => { try { const v = JSON.parse(e.target.selectedOptions[0].dataset.payload); return v.level6OkrCode; } catch { return ''; } })() }))} className="border px-2 py-1 w-full">
                  <option value="">-- Select Description --</option>
                  {level6OKRDescriptions.map((d, i) => (
                    <option key={i} value={d.okrDesc} data-payload={JSON.stringify(d)}>{d.okrDesc}</option>
                  ))}
                </select>
              </div>
            </FormRow>
          </Box>
          <Box>
            <SectionTitle>Level - 7</SectionTitle>
            <div className="flex flex-wrap items-start gap-2 mb-6">
              <div className="flex flex-col items-start gap-1 w-36 min-w-0">
                <label className="font-semibold">OKR Date</label>
                <input type="date" value={fields.okrDate} disabled className="border py-1 w-full bg-gray-100 text-center px-2" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="font-semibold">OKR Description</label>
                <textarea value={fields.okrDescription} onChange={e => setFields(f => ({ ...f, okrDescription: e.target.value }))} className="border w-full h-24 p-2 mt-1 min-w-0" maxLength={100} />
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
                  maxLength={100}
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
              {/* {percentSum > 100 && (
                <div className="text-red-600 font-semibold text-center">Sum of Q1–Q4 percentages must not exceed 100% (current: {percentSum}%).</div>
              )} */}
              <div className="flex flex-row gap-8 justify-center mt-8">
                <OKRActionButton onClick={(e) => { e.preventDefault(); handleUpdateOKR(); }}>Update OKR</OKRActionButton>
                <OKRActionButton onClick={(e) => { e.preventDefault(); handleCancel(); }}>Cancel OKR</OKRActionButton>
              </div>
        </form>
      </div>
    </div>
  );
};

export default OKRWorkspaceLevel7;
