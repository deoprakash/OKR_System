import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FormRow from '../components/FormRow';
import LabeledInput from '../components/LabeledInput';
import KeyResultInput from '../components/KeyResultInput';
import QuarterInput from '../components/QuarterInput';
import OKRActionButton from '../components/OKRActionButton';
import BackButton from '../components/BackButton';
import { listEmployees, listLevel1OKRs, createLevel1OKR, updateLevel1OKR } from '../lib/api';
import { useToast } from '../components/ToastProvider';

const OKRWorkspaceLevel1 = () => {
    const navigate = useNavigate();
    const today = new Date().toISOString().slice(0, 10);
    const toast = useToast();

    const [fields, setFields] = useState({
    employeeCode: '',
    employeeName: '',
    employeeLevel: '',
      okrCode: '',
      okrDate: today,
    okrDescription: '',
    keyResults: Array(5).fill(''),
    quarters: [
      { percent: '', comment: '' },
      { percent: '', comment: '' },
      { percent: '', comment: '' },
      { percent: '', comment: '' },
    ],
  });

  const [employees, setEmployees] = useState([]);
  const [okrs, setOkrs] = useState([]);
  const [selectedOkrId, setSelectedOkrId] = useState(null);
  const [selectedOkrCode, setSelectedOkrCode] = useState('');
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    listEmployees().then(resp => {
      const data = resp && resp.data ? resp.data : [];
      const level1 = (data || []).filter(e => String(e.empLevel) === '1' || e.empLevel === 1);
      setEmployees(level1);
      if (fields.employeeCode) {
        const match = level1.find(e => String(e.empCode) === String(fields.employeeCode) || String(e._id) === String(fields.employeeCode));
        if (match) setFields(prev => ({ ...prev, employeeName: match.empName, employeeLevel: match.empLevel }));
      }
    }).catch(() => setEmployees([]));
  }, []);

  // fetch OKRs for selected employee whenever employeeCode changes
  useEffect(() => {
    if (!fields.employeeCode) {
      setOkrs([]);
      setSelectedOkrId(null);
      setSelectedOkrCode('');
      return;
    }
    listLevel1OKRs().then(resp => {
      const data = resp && resp.data ? resp.data : [];
      const list = (data || []).filter(o => String(o.empCode) === String(fields.employeeCode));
      setOkrs(list);
    }).catch(() => setOkrs([]));
  }, [fields.employeeCode]);

  const resetForNew = () => {
    setSelectedOkrId(null);
    setSelectedOkrCode('NEW');
    setCanClose(false);
    setFields(prev => ({
      ...prev,
      okrCode: 'NEW',
      okrDate: today,
      okrDescription: '',
      keyResults: Array(5).fill(''),
      quarters: [
        { percent: '', comment: '' },
        { percent: '', comment: '' },
        { percent: '', comment: '' },
        { percent: '', comment: '' }
      ]
    }));
  };

  const resetForm = () => {
    setSelectedOkrId(null);
    setSelectedOkrCode('');
    setCanClose(false);
    setFields({
      employeeCode: '',
      employeeName: '',
      employeeLevel: '',
      okrCode: '',
      okrDate: today,
      okrDescription: '',
      keyResults: Array(5).fill(''),
      quarters: [
        { percent: '', comment: '' },
        { percent: '', comment: '' },
        { percent: '', comment: '' },
        { percent: '', comment: '' },
      ],
    });
    setOkrs([]);
  };
  const firstInputRef = useRef(null);
  useEffect(() => { try { firstInputRef.current && firstInputRef.current.focus(); } catch {} }, []);

  const populateFromOkr = (okr) => {
    setSelectedOkrId(okr._id);
    setSelectedOkrCode(String(okr.level1OkrCode));
    setFields(prev => ({
      ...prev,
      okrCode: String(okr.level1OkrCode),
      okrDate: okr.okrDate ? new Date(okr.okrDate).toISOString().slice(0,10) : today,
      okrDescription: okr.okrDesc || '',
      keyResults: [okr.kr1||'', okr.kr2||'', okr.kr3||'', okr.kr4||'', okr.kr5||''],
      quarters: [
        { percent: okr.q1_percentage ?? '', comment: okr.q1_comment || '' },
        { percent: okr.q2_percentage ?? '', comment: okr.q2_comment || '' },
        { percent: okr.q3_percentage ?? '', comment: okr.q3_comment || '' },
        { percent: okr.q4_percentage ?? '', comment: okr.q4_comment || '' }
      ]
    }));
  };

  const fetchOkrsForEmployee = async () => {
    if (!fields.employeeCode) return setOkrs([]);
    try {
      const res = await listLevel1OKRs();
      const data = res && res.data ? res.data : [];
      const list = (data || []).filter(o => String(o.empCode) === String(fields.employeeCode));
      setOkrs(list);
    } catch (err) {
      setOkrs([]);
    }
  };

  const sumPercents = () => {
    return fields.quarters.reduce((s, q) => s + (Number(q.percent) || 0), 0);
  };

  const percentSum = sumPercents();

  const handleSave = async () => {
    // Validation
    if (!fields.employeeCode) return toast.send('Please select an employee.', 'error');
    const sum = sumPercents();
    // if (sum > 100) return alert('Sum of quarter percentages must not exceed 100%.');

    const payload = {
      empLevel: Number(fields.employeeLevel) || 1,
      empCode: Number(fields.employeeCode),
      empName: fields.employeeName,
      okrDate: fields.okrDate,
      okrDesc: fields.okrDescription,
      kr1: fields.keyResults[0] || '',
      kr2: fields.keyResults[1] || '',
      kr3: fields.keyResults[2] || '',
      kr4: fields.keyResults[3] || '',
      kr5: fields.keyResults[4] || '',
      q1_percentage: fields.quarters[0].percent ? Number(fields.quarters[0].percent) : undefined,
      q1_comment: fields.quarters[0].comment || '',
      q2_percentage: fields.quarters[1].percent ? Number(fields.quarters[1].percent) : undefined,
      q2_comment: fields.quarters[1].comment || '',
      q3_percentage: fields.quarters[2].percent ? Number(fields.quarters[2].percent) : undefined,
      q3_comment: fields.quarters[2].comment || '',
      q4_percentage: fields.quarters[3].percent ? Number(fields.quarters[3].percent) : undefined,
      q4_comment: fields.quarters[3].comment || ''
    };

    
    try {
      if (selectedOkrCode && selectedOkrCode !== 'NEW') {
        await updateLevel1OKR(selectedOkrCode, payload);
        toast.send('OKR updated successfully.', 'success');
        await fetchOkrsForEmployee();
        setCanClose(true);
      } else {
        const res = await createLevel1OKR(payload);
        const created = res && res.data ? res.data : null;
        toast.send(`OKR created. New OKR Code: ${created ? created.level1OkrCode : 'unknown'}`, 'success');
        await fetchOkrsForEmployee();
        setCanClose(true);
        if (created) {
          // clear form after create
          resetForm();
          setCanClose(true);
        }
      }
    } catch (err) {
      toast.send('Network error while saving OKR', 'error');
    }
  };

  const handleCancel = () => {
    if (canClose) {
      resetForm();
      navigate('/');
      return;
    }
    if (window.confirm('Cancel OKR entry and return to main menu?')) {
      resetForm();
      navigate('/');
    }
  };

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
    <div className="min-h-screen bg-[#0f1724] flex items-center justify-center py-12">
      <div className="absolute top-6 left-6">
        <BackButton onClick={() => navigate('/')} />
      </div>
      <div className="bg-white rounded-lg shadow-2xl w-[95%] max-w-5xl p-8 overflow-hidden">
        <h1 className="text-3xl font-bold mb-6 text-center">OKR Workspace - Level 1</h1>
        <form>
          <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="flex flex-col gap-2 min-w-0">
              <label className="font-semibold">Employee</label>
              <select
                value={String(fields.employeeCode)}
                ref={firstInputRef}
                onChange={e => {
                  const val = e.target.value;
                  const emp = employees.find(x => String(x.empCode) === val || String(x._id) === val);
                  setCanClose(false);
                  if (emp) setFields(prev => ({ ...prev, employeeCode: emp.empCode, employeeName: emp.empName, employeeLevel: emp.empLevel }));
                  else setFields(prev => ({ ...prev, employeeCode: '', employeeName: '', employeeLevel: '' }));
                }}
                className="border px-2 py-2 w-full bg-white"
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp._id || emp.empCode} value={String(emp.empCode)}>{`${emp.empCode} - ${emp.empName}`}</option>
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
              <select value={selectedOkrCode || ''} onChange={e => {
                const v = e.target.value;
                if (v === 'NEW') { resetForNew(); return; }
                const found = okrs.find(o => String(o.level1OkrCode) === String(v));
                if (found) populateFromOkr(found);
              }} className="border px-2 py-2 w-full">
                <option value="">Select OKR</option>
                <option value="NEW">New</option>
                {okrs.map(o => (
                  <option key={o._id} value={String(o.level1OkrCode)}>{String(o.level1OkrCode)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-start gap-4 mb-6">
            <div className="flex flex-col items-start gap-2 w-48 min-w-0">
              <label className="font-semibold">OKR Date</label>
              <input type="date" value={fields.okrDate} readOnly className="border px-2 py-1 w-full bg-gray-100" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="font-semibold">OKR Description</label>
              <textarea maxLength={100} value={fields.okrDescription} onChange={e => handleFieldChange('okrDescription', e.target.value)} className="border w-full h-24 p-2 mt-1 min-w-0" />
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {fields.keyResults.map((kr, idx) => (
              <div key={idx} className="flex items-center gap-4 min-w-0">
                <label className="w-40 font-semibold">Key Results {idx + 1}</label>
                <input maxLength={100} type="text" value={kr} onChange={e => handleKeyResultChange(idx, e.target.value)} className="border px-3 py-2 flex-1 min-w-0" />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-8 mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4 mb-2">
                <label className="w-28">Q1 % Completion</label>
                <input type="number" min={0} max={100} value={fields.quarters[0].percent} onChange={e => handleQuarterChange(0, e.target.value)} className="border px-2 py-1 w-20" />
                <span className="ml-1">%</span>
                <input maxLength={100} placeholder="Comments" value={fields.quarters[0].comment} onChange={e => handleQuarterCommentChange(0, e.target.value)} className="border ml-4 px-2 py-1 flex-1 " />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-28">Q2 % Completion</label>
                <input type="number" min={0} max={100} value={fields.quarters[1].percent} onChange={e => handleQuarterChange(1, e.target.value)} className="border px-2 py-1 w-20" />
                <span className="ml-1">%</span>
                <input maxLength={100} placeholder="Comments" value={fields.quarters[1].comment} onChange={e => handleQuarterCommentChange(1, e.target.value)} className="border ml-4 px-2 py-1 flex-1" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4 mb-2">
                <label className="w-28">Q3 % Completion</label>
                <input type="number" min={0} max={100} value={fields.quarters[2].percent} onChange={e => handleQuarterChange(2, e.target.value)} className="border px-2 py-1 w-20" />
                <span className="ml-1">%</span>
                <input maxLength={100} placeholder="Comments" value={fields.quarters[2].comment} onChange={e => handleQuarterCommentChange(2, e.target.value)} className="border ml-4 px-2 py-1 flex-1 min-w-0" />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-28">Q4 % Completion</label>
                <input type="number" min={0} max={100} value={fields.quarters[3].percent} onChange={e => handleQuarterChange(3, e.target.value)} className="border px-2 py-1 w-20" />
                <span className="ml-1">%</span>
                <input maxLength={100} placeholder="Comments" value={fields.quarters[3].comment} onChange={e => handleQuarterCommentChange(3, e.target.value)} className="border ml-4 px-2 py-1 flex-1 min-w-0" />
              </div>
            </div>
          </div>

          {/* Action buttons */}

          {/* {percentSum > 100 && (
            <div className="text-red-600 font-semibold text-center">Sum of Q1–Q4 percentages must not exceed 100% (current: {percentSum}%).</div>
          )} */}
          <div className="flex justify-center gap-6 mt-6">
            <OKRActionButton type="button" onClick={handleSave}>Update OKR</OKRActionButton>
            <OKRActionButton type="button" onClick={handleCancel}>{canClose ? 'Close' : 'Cancel OKR'}</OKRActionButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OKRWorkspaceLevel1;
