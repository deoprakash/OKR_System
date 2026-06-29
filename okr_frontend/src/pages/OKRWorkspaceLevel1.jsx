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
import {createEmptyOKRFields, YEAR_OPTIONS, QUARTER_OPTIONS } from "../lib/okrDefaults";

const OKRWorkspaceLevel1 = () => {
    const navigate = useNavigate();
    const today = new Date().toISOString().slice(0, 10);
    const toast = useToast();

  //   const [fields, setFields] = useState({
  //     employeeCode: '',
  //     employeeName: '',
  //     userId: '',
  //   employeeLevel: '',
  //     okrCode: '',
  //     okrDate: today,
  //   okrDescription: '',
  //   keyResults: Array(5).fill(''),
  //   quarters: [
  //     { percent: '', comment: '' },
  //     { percent: '', comment: '' },
  //     { percent: '', comment: '' },
  //     { percent: '', comment: '' },
  //   ],
  // });

  const [fields, setFields] = useState(createEmptyOKRFields());

  const [employees, setEmployees] = useState([]);
  const [okrs, setOkrs] = useState([]);
  const [_selectedOkrId, setSelectedOkrId] = useState(null);
  const [selectedOkrCode, setSelectedOkrCode] = useState('');
  const [canClose, setCanClose] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const pristineRef = useRef(null);
  const _initRef = useRef(false);

  useEffect(() => {
    listEmployees().then(resp => {
      const data = resp && resp.data ? resp.data : [];
      const level1 = (data || [])
        .filter(e => String(e.empLevel) === '1' || e.empLevel === 1)
        .map(e => ({ ...e, userId: e.userId || (e._id ? String(e._id) : '') }));
      setEmployees(level1);
      if (fields.employeeCode) {
        const match = level1.find(e => String(e.empCode) === String(fields.employeeCode) || String(e._id) === String(fields.employeeCode));
        if (match) setFields(prev => ({ ...prev, employeeName: match.empName, employeeLevel: match.empLevel, userId: match.userId || '' }));
      }
    }).catch(() => setEmployees([]));
  }, []);

  useEffect(() => {
    if (!employees || !fields.employeeCode) return;
    const match = employees.find(e => String(e.empCode) === String(fields.employeeCode) || String(e._id) === String(fields.employeeCode));
    if (match && match.userId && match.userId !== fields.userId) {
      setFields(f => ({ ...f, userId: match.userId }));
    }
  }, [employees, fields.employeeCode]);

  // fetch OKRs for selected employee whenever employeeCode changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      // defer to next microtask to avoid calling setState synchronously during render
      await Promise.resolve();
      if (!mounted) return;
      if (!fields.employeeCode) {
        setOkrs([]);
        setSelectedOkrId(null);
        setSelectedOkrCode('');
        return;
      }
      try {
        const resp = await listLevel1OKRs();
        const data = resp && resp.data ? resp.data : [];
        const list = (data || []).filter(o => String(o.empCode) === String(fields.employeeCode));
        if (!mounted) return;
        setOkrs(list);
      } catch (err) {
        if (!mounted) return;
        setOkrs([]);
      }
    })();
    return () => { mounted = false; };
  }, [fields.employeeCode]);

  const resetForNew = () => {
    setSelectedOkrId(null);
    setSelectedOkrCode("NEW");
    setCanClose(false);
  
    const newFields = {
      ...fields, // Keep employee information
  
      okrCode: "",
      okrDate: today,
      okrYear: new Date().getFullYear(),
      okrQuarter: "Q1",
  
      okrDescription: "",
  
      keyResults: Array(5).fill(""),
  
      quarters: [
        { percent: "", comment: "" },
        { percent: "", comment: "" },
        { percent: "", comment: "" },
        { percent: "", comment: "" },
      ],
    };
  
    setFields(newFields);
    setIsDirty(false);
    pristineRef.current = JSON.stringify(newFields);
  };

  // const resetForm = () => {
  //   setSelectedOkrId(null);
  //   setSelectedOkrCode('');
  //   setCanClose(false);
  //   const newFields = {
  //     employeeCode: '',
  //     employeeName: '',
  //     employeeLevel: '',
  //     okrCode: '',
  //     okrDate: today,
  //     okrDescription: '',
  //     keyResults: Array(5).fill(''),
  //     quarters: [
  //       { percent: '', comment: '' },
  //       { percent: '', comment: '' },
  //       { percent: '', comment: '' },
  //       { percent: '', comment: '' },
  //     ],
  //   };
  //   setFields(newFields);
  //   setOkrs([]);
  //   setIsDirty(false);
  //   pristineRef.current = JSON.stringify(newFields);
  // };

  const resetForm = () => {
    const newFields = createEmptyOKRFields();
  
    setFields(newFields);
    setSelectedOkrId(null);
    setSelectedOkrCode("");
    setOkrs([]);
    setCanClose(false);
    setIsDirty(false);
  
    pristineRef.current = JSON.stringify(newFields);
  
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  };

  const firstInputRef = useRef(null);
  useEffect(() => { try { firstInputRef.current && firstInputRef.current.focus(); } catch {} }, []);

  const populateFromOkr = (okr) => {
    setSelectedOkrId(okr._id);
    setSelectedOkrCode(String(okr.level1OkrCode));
    const newFields = {
      ...fields,
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
    };
    setFields(newFields);
    // mark populated state as pristine
    pristineRef.current = JSON.stringify(newFields);
    setIsDirty(false);
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
      userId: fields.userId, 
      empName: fields.employeeName,
      okrDate: fields.okrDate,
      okrQuarter: fields.okrQuarter,
      okrYear: fields.okrYear,
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

        toast.send("OKR updated successfully.", "success");

        await fetchOkrsForEmployee();

        resetForNew();
      } else {
        await createLevel1OKR(payload);

        await fetchOkrsForEmployee();
        
        toast.send("OKR created successfully.", "success");
        
        resetForNew();
      }
    } catch (err) {
      toast.send('Network error while saving OKR', 'error');
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
  
    if (canClose) {
      navigate("/");
      return;
    }
  
    resetForm();
  };

  // track dirty state by comparing to a pristine snapshot
  useEffect(() => {
    if (!_initRef.current) {
      pristineRef.current = JSON.stringify(fields);
      _initRef.current = true;
      setIsDirty(false);
      return;
    }
    setIsDirty(JSON.stringify(fields) !== pristineRef.current);
  }, [fields]);

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

  const hasStarted =
  fields.employeeCode ||
  isDirty;

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="absolute top-6 left-6">
        <BackButton onClick={() => navigate("/")} />
      </div>
      <div className="card w-[95%] max-w-5xl p-8 overflow-hidden">
        <h1 className="text-3xl font-bold mb-6 text-center">
          OKR Workspace - Level 1
        </h1>
        <form>
          <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2 xl:grid-cols-6">
            <div className="flex flex-col gap-2 min-w-0">
              <label className="font-semibold">Employee</label>
              <select
                value={String(fields.employeeCode)}
                ref={firstInputRef}
                onChange={(e) => {
                  const val = e.target.value;
                  const emp = employees.find(
                    (x) => String(x.empCode) === val || String(x._id) === val,
                  );
                  setCanClose(false);
                  if (emp)
                    setFields((prev) => ({
                      ...prev,
                      employeeCode: emp.empCode,
                      employeeName: emp.empName,
                      employeeLevel: emp.empLevel,
                      userId: emp.userId || "",
                    }));
                  else
                    setFields((prev) => ({
                      ...prev,
                      employeeCode: "",
                      employeeName: "",
                      employeeLevel: "",
                      userId: "",
                    }));
                }}
                className="border px-2 py-2 w-full"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option
                    key={emp._id || emp.empCode}
                    value={String(emp.empCode)}
                  >
                    {emp.empName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              <label className="font-semibold">Employee Code</label>
              <input
                value={fields.userId}
                readOnly
                className="border px-2 py-2 w-full"
              />
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              <label className="font-semibold">Employee Level</label>
              <input
                value={fields.employeeLevel}
                readOnly
                className="border px-2 py-2 w-full"
              />
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              <label className="font-semibold">Select OKR</label>
              <select
                value={selectedOkrCode || ""}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "NEW") {
                    resetForNew();
                    return;
                  }
                  const found = okrs.find(
                    (o) => String(o.level1OkrCode) === String(v),
                  );
                  if (found) populateFromOkr(found);
                }}
                className="border px-2 py-2 w-full"
              >
                <option value="">Select OKR</option>

                  <option value="NEW">
                    New
                  </option>

                  {okrs
                    .filter(
                      (v, i, a) =>
                        a.findIndex(
                          (t) =>
                            String(t.level1OkrCode) === String(v.level1OkrCode)
                        ) === i
                    )
                    .map((okr) => (
                      <option
                        key={okr.level1OkrCode}
                        value={okr.level1OkrCode}
                      >
                        {okr.okrDesc}
                      </option>
                  ))}
              </select>
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              <label className="font-semibold">Year</label>
              <select
                value={fields.okrYear}
                onChange={(e) =>
                  setFields((prev) => ({
                    ...prev,
                    okrYear: Number(e.target.value),
                  }))
                }
                className="border px-2 py-2 w-full"
              >
                {YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              <label className="font-semibold">Quarter</label>
              <select
                value={fields.okrQuarter}
                onChange={(e) =>
                  setFields((prev) => ({
                    ...prev,
                    okrQuarter: e.target.value,
                  }))
                }
                className="border px-2 py-2 w-full"
              >
                {QUARTER_OPTIONS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-start gap-4 mb-6">
            <div className="flex flex-col items-start gap-2 w-48 min-w-0">
              <label className="font-semibold">OKR Date</label>
              <input
                type="date"
                value={fields.okrDate}
                readOnly
                className="border px-2 py-1 w-full bg-gray-100"
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="font-semibold">OKR Description</label>
              <textarea
                maxLength={100}
                value={fields.okrDescription}
                onChange={(e) =>
                  handleFieldChange("okrDescription", e.target.value)
                }
                className="border w-full h-24 p-2 mt-1 min-w-0"
              />
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {fields.keyResults.map((kr, idx) => (
              <div key={idx} className="flex items-center gap-4 min-w-0">
                <label className="w-40 font-semibold">
                  Key Results {idx + 1}
                </label>
                <input
                  maxLength={100}
                  type="text"
                  value={kr}
                  onChange={(e) => handleKeyResultChange(idx, e.target.value)}
                  className="border px-3 py-2 flex-1 min-w-0"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-8 mb-6">
            <div className="flex-1 min-w-0">
              <QuarterInput
                label="Q1 % Completion"
                value={fields.quarters[0].percent}
                onChange={(e) => handleQuarterChange(0, e.target.value)}
                comment={fields.quarters[0].comment}
                onCommentChange={(e) =>
                  handleQuarterCommentChange(0, e.target.value)
                }
              />

              <QuarterInput
                label="Q2 % Completion"
                value={fields.quarters[1].percent}
                onChange={(e) => handleQuarterChange(1, e.target.value)}
                comment={fields.quarters[1].comment}
                onCommentChange={(e) =>
                  handleQuarterCommentChange(1, e.target.value)
                }
              />
            </div>

            <div className="flex-1 min-w-0">
              <QuarterInput
                label="Q3 % Completion"
                value={fields.quarters[2].percent}
                onChange={(e) => handleQuarterChange(2, e.target.value)}
                comment={fields.quarters[2].comment}
                onCommentChange={(e) =>
                  handleQuarterCommentChange(2, e.target.value)
                }
              />

              <QuarterInput
                label="Q4 % Completion"
                value={fields.quarters[3].percent}
                onChange={(e) => handleQuarterChange(3, e.target.value)}
                comment={fields.quarters[3].comment}
                onCommentChange={(e) =>
                  handleQuarterCommentChange(3, e.target.value)
                }
              />
            </div>
          </div>

          {/* Action buttons */}

          {/* {percentSum > 100 && (
            <div className="text-red-600 font-semibold text-center">Sum of Q1–Q4 percentages must not exceed 100% (current: {percentSum}%).</div>
          )} */}
          <div className="flex justify-center items-center gap-6 mt-8">

            <div className="w-48">
              <OKRActionButton
                type="button"
                onClick={handleSave}
                className="btn btn-primary w-full"
              >
                Update OKR
              </OKRActionButton>
            </div>

            <div className="w-48">
              <OKRActionButton
                type="button"
                onClick={handleCancel}
                className="btn btn-ghost w-full"
              >
                {canClose || !hasStarted ? "Close" : "Reset"}
              </OKRActionButton>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default OKRWorkspaceLevel1;
