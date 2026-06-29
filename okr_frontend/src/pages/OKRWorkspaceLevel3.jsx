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
import { listEmployees, listLevel2OKRs, listLevel3OKRs, createLevel3OKR, updateLevel3OKR } from '../lib/api';
import { useToast } from '../components/ToastProvider';
import { createEmptyOKRFields, YEAR_OPTIONS, QUARTER_OPTIONS } from "../lib/okrDefaults";

const EMPLOYEE_LEVELS = ['new value 1', 'new value 2', 'new value 3'];

const OKRWorkspaceLevel3 = () => {
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
    // employeeCode: '',
    // employeeName: '',
    // userId: '',
    // employeeLevel: '',
    // okrCode: '',
    // okrDate: '',
    // okrDescription: '',
    // keyResults: Array(5).fill(''),
    // quarters: [
    //   { percent: '', comment: '' },
    //   { percent: '', comment: '' },
    //   { percent: '', comment: '' },
    //   { percent: '', comment: '' },
    // ],
    ...createEmptyOKRFields(),
    level2EmployeeCode: '',
    level2EmployeeName: '',
    level2userId: '',
    level2OKRDescription: '',
    level2OkrCode: '',
    level2OKRValue: EMPLOYEE_LEVELS[0],
  });
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [level2Options, setLevel2Options] = useState([]);
  const [level2OKRDescriptions, setLevel2OKRDescriptions] = useState([]);
  const [level3All, setLevel3All] = useState([]);
  const [canClose, setCanClose] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const pristineRef = useRef(null);
  const _initRef = useRef(false);
  const sumPercents = () => fields.quarters.reduce((s, q) => s + (Number(q.percent) || 0), 0);
  const percentSum = sumPercents();
  
  useEffect(() => {
    async function load() {
      try {
        const empRes = await listEmployees();
        const emps = empRes.data || [];
        const empsLevel3 = emps.filter(e => Number(e.empLevel) === 3).map(e => ({ ...e, userId: e.userId || (e._id ? String(e._id) : '') }));
        setEmployeeOptions(empsLevel3);
        setLevel2Options(emps
          .filter(e => Number(e.empLevel) === 2)
          .map(e => ({ empCode: e.empCode, empName: e.empName, userId: e.userId || (e._id ? String(e._id) : '') })));

        const l3 = await listLevel3OKRs();
        setLevel3All(l3.data || []);
      } catch (err) {
        console.error(err);
      }
      setFields(f => ({ ...f, okrDate: getLocalDateString() }));
    }
    load();
  }, []);

  useEffect(() => {
    if (!employeeOptions || !fields.employeeCode) return;
    const emp = employeeOptions.find(x => Number(x.empCode) === Number(fields.employeeCode));
    if (emp && emp.userId && emp.userId !== fields.userId) {
      setFields(f => ({ ...f, userId: emp.userId }));
    }
  }, [employeeOptions, fields.employeeCode]);

  useEffect(() => {
    if (!level2Options || !fields.level2EmployeeCode) return;
    const emp = level2Options.find(x => Number(x.empCode) === Number(fields.level2EmployeeCode));
    if (emp && emp.userId && emp.userId !== fields.level2userId) {
      setFields(f => ({ ...f, level2userId: emp.userId }));
    }
  }, [level2Options, fields.level2EmployeeCode]);

  const resetForm = () => {
    const newFields = {
      
      ...createEmptyOKRFields(), 

      okrCode: "",
      okrDate: getLocalDateString(),

      employeeCode: "",
      employeeName: "",
      userId: "",
      employeeLevel: "",
     
      level2EmployeeCode: "",
      level2EmployeeName: "",
      level2userId: "",
      level2OKRDescription: "",
      level2OkrCode: "",
      level2OKRValue: EMPLOYEE_LEVELS[0],
    };
    setFields(newFields);
    setIsDirty(false);
    pristineRef.current = JSON.stringify(newFields);
  };
  const firstInputRef = useRef(null);
  useEffect(() => { try { firstInputRef.current && firstInputRef.current.focus(); } catch {} }, []);

  const handleSelectEmployee = (e) => {
    const code = Number(e.target.value) || '';
    const emp = employeeOptions.find(x => Number(x.empCode) === code);
    const newFields = { ...fields, employeeCode: code, employeeName: emp ? emp.empName : '', userId: emp ? emp.userId : '', employeeLevel: emp ? String(emp.empLevel) : '', okrCode: '' };
    setFields(newFields);
    // selecting an employee changes the form; mark dirty if differs from pristine
    setIsDirty(JSON.stringify(newFields) !== pristineRef.current);
  };

  const handleSelectOKRCode = (e) => {
    const val = e.target.value;
    if (val === 'NEW') {
      const newFields = { ...fields, okrCode: 'NEW', okrDescription: '', keyResults: Array(5).fill(''), quarters: [ { percent: '', comment: '' }, { percent: '', comment: '' }, { percent: '', comment: '' }, { percent: '', comment: '' } ], okrDate: getLocalDateString() };
      setFields(newFields);
      setIsDirty(false);
      pristineRef.current = JSON.stringify(newFields);
      return;
    }
    const num = Number(val);
    const okr = level3All.find(x => Number(x.level3OkrCode) === num || Number(x._id) === num);
    if (!okr) return;
    const newFields = { ...fields, 
      okrCode: okr.level3OkrCode, 
      okrDate: okr.okrDate ? getLocalDateString(okr.okrDate) : fields.okrDate, 
      okrYear: okr.okrYear || new Date().getFullYear(),
      okrQuarter: okr.okrQuarter || "Q1",
      
      okrDescription: okr.okrDesc || '', 
      keyResults: [okr.kr1 || '', okr.kr2 || '', okr.kr3 || '', okr.kr4 || '', okr.kr5 || ''], quarters: [ { percent: okr.q1_percentage ?? '', comment: okr.q1_comment || '' }, { percent: okr.q2_percentage ?? '', comment: okr.q2_comment || '' }, { percent: okr.q3_percentage ?? '', comment: okr.q3_comment || '' }, { percent: okr.q4_percentage ?? '', comment: okr.q4_comment || '' } ] };
    setFields(newFields);
    setIsDirty(false);
    pristineRef.current = JSON.stringify(newFields);
  };

  const handleSelectLevel2Employee = (e) => {
    const code = Number(e.target.value) || '';
    const emp = level2Options.find(x => Number(x.empCode) === code);
    setFields(f => ({ ...f, level2EmployeeCode: code, level2EmployeeName: emp ? emp.empName : '', level2userId: emp ? emp.userId : '', level2OKRDescription: '', level2OkrCode: '' }));
    listLevel2OKRs().then(res => {
      const items = (res.data || []).filter(i => Number(i.empCode) === Number(code)).map(i => ({ level2OkrCode: i.level2OkrCode, okrDesc: i.okrDesc || '' }));
      setLevel2OKRDescriptions(items);
    }).catch(() => setLevel2OKRDescriptions([]));
  };

  const handleUpdateOKR = async () => {
    // if (percentSum > 100) { alert('Sum of percentages cannot exceed 100%'); return; }
    if (!fields.level2OkrCode) { toast.send('Please select a Level-2 OKR to link before saving.', 'error'); return; }
    
    try {
      const payload = {
        empCode: Number(fields.employeeCode),
        userId: fields.userId,
        empName: fields.employeeName,
        empLevel: Number(fields.employeeLevel) || 3,
        okrDate: fields.okrDate,
        okrYear: fields.okrYear,
        okrQuarter: fields.okrQuarter,
        level2OkrCode: fields.level2OkrCode ? Number(fields.level2OkrCode) : undefined,
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

      console.log("payload: ", payload);

      setIsUpdating(true);

      if (fields.okrCode === 'NEW' || fields.okrCode === '' || fields.okrCode == null) {
        const res = await createLevel3OKR(payload);
        const created = res.data;
        toast.send('Updated OKR successfully', 'success');
        const l3 = await listLevel3OKRs(); setLevel3All(l3.data || []);
        if (created) {
          resetForm();
          setCanClose(false);
        }
      } else {
        await updateLevel3OKR(fields.okrCode, payload);

        toast.send("OKR updated", "success");

        const l3 = await listLevel3OKRs();
        setLevel3All(l3.data || []);

        resetForm();
        setCanClose(false);
      }
    } catch (err) { console.error(err); toast.send('Save failed: ' + (err.message || err), 'error'); }
    finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
  
    if (canClose || !hasStarted) {
      Window.scrollTo|(0, 0);
      navigate("/");
      return;
    }
  
    resetForm();
  };
  useEffect(() => {
    if (!_initRef.current) {
      pristineRef.current = JSON.stringify(fields);
      _initRef.current = true;
      setIsDirty(false);
      return;
    }
    setIsDirty(JSON.stringify(fields) !== pristineRef.current);
  }, [fields]);

  const hasStarted =
  fields.employeeCode ||
  isDirty;

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="absolute top-6 left-6">
        <BackButton onClick={() => navigate("/")} />
      </div>
      <div className="bg-white rounded-lg shadow-2xl w-[95%] max-w-6xl p-8 overflow-hidden professional-panel">
        <h1 className="text-3xl font-bold mb-6 text-center">
          OKR Workspace - Level 3
        </h1>
        <form>
          <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2 xl:grid-cols-6">
            <div className="flex flex-col gap-2 min-w-0">
              <label className="font-semibold">Employee Code</label>
              <select
                value={fields.employeeCode}
                onChange={handleSelectEmployee}
                className="border px-2 py-2 w-full bg-white"
              >
                <option value="">-- Select --</option>
                {employeeOptions.map((emp) => (
                  <option key={emp.empCode} value={emp.empCode}>
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
                className="border px-2 py-2 w-full bg-gray-100"
              />
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              <label className="font-semibold">Employee Level</label>
              <input
                value={fields.employeeLevel}
                readOnly
                className="border px-2 py-2 w-full bg-gray-100"
              />
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              <label className="font-semibold">Select OKR</label>
              <select
                value={fields.okrCode}
                onChange={handleSelectOKRCode}
                className="border px-2 py-2 w-full"
              >
                <option value="">-- Select --</option>
                <option value="NEW">New</option>
                {level3All
                  .filter(
                    (o) => Number(o.empCode) === Number(fields.employeeCode),
                  )
                  .filter(
                    (v, i, a) =>
                      a.findIndex(
                        (t) =>
                          String(t.level3OkrCode) === String(v.level3OkrCode),
                      ) === i,
                  )
                  .map((o) => (
                    <option key={o.level3OkrCode} value={o.level3OkrCode}>
                      {o.okrDesc?.slice(0, 50) || String(o.level3OkrCode)}
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
          <Box>
            <SectionTitle>Level - 2</SectionTitle>
            <FormRow>
              <div className="w-62">
                <label className="font-semibold block mb-1">
                  Employee Code
                </label>
                <select
                  ref={firstInputRef}
                  value={fields.level2EmployeeCode}
                  onChange={handleSelectLevel2Employee}
                  className="border px-2 py-1 w-full min-w-0"
                >
                  <option value="">-- Select --</option>
                  {level2Options.map((opt) => (
                    <option key={opt.empCode} value={opt.empCode}>
                      {opt.empName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-62">
                <label className="font-semibold block mb-1">
                  Employee Code
                </label>
                <input
                  value={fields.level2userId}
                  readOnly
                  className="border px-2 py-1 w-full bg-gray-100"
                />
              </div>
              <div className="w-full">
                <label className="font-semibold block mb-1">
                  OKR Description
                </label>
                <select
                  value={fields.level2OKRDescription}
                  onChange={(e) =>
                    setFields((f) => ({
                      ...f,
                      level2OKRDescription: e.target.value,
                      level2OkrCode:
                        e.target.value &&
                        (() => {
                          try {
                            const v = JSON.parse(
                              e.target.selectedOptions[0].dataset.payload,
                            );
                            return v.level2OkrCode;
                          } catch {
                            return "";
                          }
                        })(),
                    }))
                  }
                  className="border px-2 py-1 w-full"
                >
                  <option value="">-- Select Description --</option>
                  {level2OKRDescriptions.map((d, i) => (
                    <option
                      key={i}
                      value={d.okrDesc}
                      data-payload={JSON.stringify(d)}
                    >
                      {d.okrDesc}
                    </option>
                  ))}
                </select>
              </div>
            </FormRow>
          </Box>
          <Box>
            <SectionTitle>Level - 3</SectionTitle>
            <div className="flex flex-wrap items-start gap-2 mb-6">
              <div className="flex flex-col items-start gap-1 w-36 min-w-0">
                <label className="font-semibold">OKR Date</label>
                <input
                  type="date"
                  value={fields.okrDate}
                  disabled
                  className="border py-1 w-full bg-gray-100 text-center px-2"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="font-semibold">OKR Description</label>
                <textarea
                  value={fields.okrDescription}
                  onChange={(e) =>
                    setFields((f) => ({ ...f, okrDescription: e.target.value }))
                  }
                  className="border w-full h-24 p-2 mt-1 min-w-0"
                />
              </div>
            </div>
            <div className="mt-8 mb-8">
              {fields.keyResults.map((kr, idx) => (
                <KeyResultInput
                  key={idx}
                  label={`Key Results ${idx + 1}`}
                  value={kr}
                  onChange={(e) =>
                    setFields((f) => {
                      const keyResults = [...f.keyResults];
                      keyResults[idx] = e.target.value;
                      return { ...f, keyResults };
                    })
                  }
                />
              ))}
            </div>
          </Box>
          <div className="flex gap-16 mt-8 mb-8">
            <div className="flex-1">
              <QuarterInput
                label="Q1 % Completion"
                value={fields.quarters[0].percent}
                onChange={(e) =>
                  setFields((f) => {
                    const quarters = [...f.quarters];
                    quarters[0].percent = e.target.value;
                    return { ...f, quarters };
                  })
                }
                comment={fields.quarters[0].comment}
                onCommentChange={(e) =>
                  setFields((f) => {
                    const quarters = [...f.quarters];
                    quarters[0].comment = e.target.value;
                    return { ...f, quarters };
                  })
                }
              />
              <QuarterInput
                label="Q2 % Completion"
                value={fields.quarters[1].percent}
                onChange={(e) =>
                  setFields((f) => {
                    const quarters = [...f.quarters];
                    quarters[1].percent = e.target.value;
                    return { ...f, quarters };
                  })
                }
                comment={fields.quarters[1].comment}
                onCommentChange={(e) =>
                  setFields((f) => {
                    const quarters = [...f.quarters];
                    quarters[1].comment = e.target.value;
                    return { ...f, quarters };
                  })
                }
              />
            </div>
            <div className="flex-1">
              <QuarterInput
                label="Q3 % Completion"
                value={fields.quarters[2].percent}
                onChange={(e) =>
                  setFields((f) => {
                    const quarters = [...f.quarters];
                    quarters[2].percent = e.target.value;
                    return { ...f, quarters };
                  })
                }
                comment={fields.quarters[2].comment}
                onCommentChange={(e) =>
                  setFields((f) => {
                    const quarters = [...f.quarters];
                    quarters[2].comment = e.target.value;
                    return { ...f, quarters };
                  })
                }
              />
              <QuarterInput
                label="Q4 % Completion"
                value={fields.quarters[3].percent}
                onChange={(e) =>
                  setFields((f) => {
                    const quarters = [...f.quarters];
                    quarters[3].percent = e.target.value;
                    return { ...f, quarters };
                  })
                }
                comment={fields.quarters[3].comment}
                onCommentChange={(e) =>
                  setFields((f) => {
                    const quarters = [...f.quarters];
                    quarters[3].comment = e.target.value;
                    return { ...f, quarters };
                  })
                }
              />
            </div>
          </div>
          {/* {percentSum > 100 && (
                <div className="text-red-600 font-semibold text-center">Sum of Q1–Q4 percentages must not exceed 100% (current: {percentSum}%).</div>
              )} */}
          <div className="flex justify-center items-center gap-6 mt-8">

          <div className="w-48">
            <OKRActionButton
              type="button"
              onClick={handleUpdateOKR}
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
}

export default OKRWorkspaceLevel3;
