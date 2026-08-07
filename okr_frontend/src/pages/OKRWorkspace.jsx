import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Stepper from '../components/ui/Stepper';
import { useToast } from '../components/ToastProvider';
import { createEmptyOKRFields, YEAR_OPTIONS, QUARTER_OPTIONS } from '../lib/okrDefaults';
import {
  listEmployees,
  listLevel1OKRs, createLevel1OKR, updateLevel1OKR,
  listLevel2OKRs, createLevel2OKR, updateLevel2OKR,
  listLevel3OKRs, createLevel3OKR, updateLevel3OKR,
  listLevel4OKRs, createLevel4OKR, updateLevel4OKR,
  listLevel5OKRs, createLevel5OKR, updateLevel5OKR,
  listLevel6OKRs, createLevel6OKR, updateLevel6OKR,
  listLevel7OKRs, createLevel7OKR, updateLevel7OKR
} from '../lib/api';

const apiMethods = {
  1: { list: listLevel1OKRs, create: createLevel1OKR, update: updateLevel1OKR },
  2: { list: listLevel2OKRs, create: createLevel2OKR, update: updateLevel2OKR },
  3: { list: listLevel3OKRs, create: createLevel3OKR, update: updateLevel3OKR },
  4: { list: listLevel4OKRs, create: createLevel4OKR, update: updateLevel4OKR },
  5: { list: listLevel5OKRs, create: createLevel5OKR, update: updateLevel5OKR },
  6: { list: listLevel6OKRs, create: createLevel6OKR, update: updateLevel6OKR },
  7: { list: listLevel7OKRs, create: createLevel7OKR, update: updateLevel7OKR }
};

// Parent-level list functions for levels 2-7
const parentListMethods = {
  2: listLevel1OKRs,
  3: listLevel2OKRs,
  4: listLevel3OKRs,
  5: listLevel4OKRs,
  6: listLevel5OKRs,
  7: listLevel6OKRs,
};

// The field name on the schema that links to the parent OKR
function parentOkrCodeField(level) {
  return level > 1 ? `level${level - 1}OkrCode` : null;
}

const STEPS = [
  { label: 'Setup', description: 'Employee & period' },
  { label: 'Key Results', description: 'Define outcomes' },
  { label: 'Execution', description: 'Track progress' },
];

const LEVEL_COLORS = ['blue', 'indigo', 'green', 'yellow', 'purple', 'red', 'gray'];

const OKRWorkspace = ({ level }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const today = new Date().toISOString().slice(0, 10);
  const okrCodeField = `level${level}OkrCode`;

  const [currentStep, setCurrentStep] = useState(0);
  const [fields, setFields] = useState(createEmptyOKRFields());
  const [employees, setEmployees] = useState([]);
  const [okrs, setOkrs] = useState([]);
  const [selectedOkrCode, setSelectedOkrCode] = useState('');
  const [saving, setSaving] = useState(false);
  // Parent-level OKRs (only relevant for level 2-7)
  const [parentOkrs, setParentOkrs] = useState([]);
  const [parentEmployees, setParentEmployees] = useState([]);
  const [selectedParentEmpCode, setSelectedParentEmpCode] = useState('');
  const [selectedParentOkrCode, setSelectedParentOkrCode] = useState('');

  const api = useMemo(() => apiMethods[level], [level]);

  useEffect(() => {
    listEmployees()
      .then(resp => {
        const data = resp?.data || [];
        const normalize = e => ({ ...e, userId: e.userId || (e._id ? String(e._id) : '') });
        // Current-level employees
        setEmployees(data.filter(e => String(e.empLevel) === String(level)).map(normalize));
        // Parent-level employees (unique from the DB — no dedup needed)
        if (level > 1) {
          setParentEmployees(data.filter(e => String(e.empLevel) === String(level - 1)).map(normalize));
        }
      })
      .catch(() => { setEmployees([]); setParentEmployees([]); });
  }, [level]);

  // Load parent-level OKRs for level 2–7 so user can link this OKR to a parent
  useEffect(() => {
    if (level <= 1) return;
    const listParent = parentListMethods[level];
    if (!listParent) return;
    listParent()
      .then(resp => setParentOkrs(resp?.data || []))
      .catch(() => setParentOkrs([]));
  }, [level]);

  useEffect(() => {
    if (!fields.employeeCode) { setOkrs([]); setSelectedOkrCode(''); return; }
    api.list()
      .then(resp => {
        const data = resp?.data || [];
        setOkrs(data.filter(o => String(o.empCode) === String(fields.employeeCode)));
      })
      .catch(() => setOkrs([]));
  }, [fields.employeeCode, api]);

  const resetForm = () => {
    setFields(createEmptyOKRFields());
    setSelectedOkrCode('');
    setSelectedParentEmpCode('');
    setSelectedParentOkrCode('');
    setCurrentStep(0);
  };

  const populateFromOkr = (okr) => {
    setSelectedOkrCode(String(okr[okrCodeField]));
    // Pre-select the parent employee + OKR if present
    const parentField = parentOkrCodeField(level);
    if (parentField && okr[parentField]) {
      setSelectedParentOkrCode(String(okr[parentField]));
      // Find which parent employee owns this OKR
      const ownerOkr = parentOkrs.find(p => String(p[parentField]) === String(okr[parentField]));
      if (ownerOkr) setSelectedParentEmpCode(String(ownerOkr.empCode));
    } else {
      setSelectedParentOkrCode('');
      setSelectedParentEmpCode('');
    }
    setFields(prev => ({
      ...prev,
      okrCode: String(okr[okrCodeField]),
      okrDate: okr.okrDate ? new Date(okr.okrDate).toISOString().slice(0, 10) : today,
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

  const handleSave = async () => {
    if (!fields.employeeCode) return toast.send('Please select an employee.', 'error');
    if (level > 1 && !selectedParentOkrCode)
      return toast.send(`Please select a Level ${level - 1} parent OKR.`, 'error');

    const parentField = parentOkrCodeField(level);
    const payload = {
      empLevel: Number(fields.employeeLevel) || level,
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
      q4_comment: fields.quarters[3].comment || '',
      // Attach parent OKR code for levels 2–7
      ...(parentField && selectedParentOkrCode
        ? { [parentField]: Number(selectedParentOkrCode) }
        : {}),
    };

    setSaving(true);
    try {
      if (selectedOkrCode && selectedOkrCode !== 'NEW') {
        await api.update(selectedOkrCode, payload);
        toast.send('OKR updated successfully.', 'success');
      } else {
        await api.create(payload);
        toast.send('OKR created successfully.', 'success');
      }
      resetForm();
    } catch (err) {
      toast.send('Error saving OKR: ' + (err.message || err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const levelBadgeVariant = LEVEL_COLORS[(level - 1) % LEVEL_COLORS.length];

  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      <NavBar />

      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-lg mx-auto">

          {/* Page header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-neutral-200 bg-white text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 shadow-card transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={levelBadgeVariant}>Level {level}</Badge>
                  <span className="text-neutral-300">·</span>
                  <span className="text-sm text-neutral-500">OKR Designer</span>
                </div>
                <h1 className="text-xl font-bold text-neutral-900">
                  {fields.employeeName ? `${fields.employeeName}'s Workspace` : 'Smart OKR Designer'}
                </h1>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              Reset
            </Button>
          </div>

          {/* Stepper */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-card px-6 py-5 mb-6">
            <Stepper steps={STEPS} currentStep={currentStep} />
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 0: Setup */}
              {currentStep === 0 && (
                <div className="grid lg:grid-cols-5 gap-5">
                  <div className="lg:col-span-3 bg-white rounded-2xl border border-neutral-200 shadow-card p-6 space-y-5">
                    <div>
                      <h2 className="text-base font-bold text-neutral-900 mb-1">Employee Selection</h2>
                      <p className="text-sm text-neutral-500 mb-4">Choose the employee for this OKR cycle.</p>
                    </div>

                    <Select
                      label="Employee"
                      value={String(fields.employeeCode)}
                      onChange={(e) => {
                        const emp = employees.find(x => String(x.empCode) === e.target.value);
                        if (emp) setFields(prev => ({
                          ...prev,
                          employeeCode: emp.empCode,
                          employeeName: emp.empName,
                          employeeLevel: emp.empLevel,
                          userId: emp.userId
                        }));
                      }}
                    >
                      <option value="">Select Employee</option>
                      {employees.map(emp => (
                        <option key={emp.empCode} value={String(emp.empCode)}>{emp.empName}</option>
                      ))}
                    </Select>

                    {fields.employeeCode && (
                      <Select
                        label="Existing OKR"
                        value={selectedOkrCode}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === 'NEW') {
                            setSelectedOkrCode('NEW');
                            setFields(prev => ({ ...prev, okrCode: '', okrDescription: '', keyResults: Array(5).fill(''), quarters: Array(4).fill({ percent: '', comment: '' }) }));
                          } else {
                            const found = okrs.find(o => String(o[okrCodeField]) === v);
                            if (found) populateFromOkr(found);
                          }
                        }}
                      >
                        <option value="">Select OKR or create new</option>
                        <option value="NEW">＋ Create New OKR</option>
                        {okrs.map(okr => (
                          <option key={okr[okrCodeField]} value={okr[okrCodeField]}>{okr.okrDesc}</option>
                        ))}
                      </Select>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <Select 
                        label="Year"
                        value={fields.okrYear}
                        onChange={e => setFields(f => ({ ...f, okrYear: Number(e.target.value) }))}
                      >
                        {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                      </Select>
                      <Select
                        label="Quarter"
                        value={fields.okrQuarter}
                        onChange={e => setFields(f => ({ ...f, okrQuarter: e.target.value }))}
                      >
                        {QUARTER_OPTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                      </Select>
                    </div>

                    <Input
                      label="Objective Description"
                      value={fields.okrDescription}
                      onChange={e => setFields(f => ({ ...f, okrDescription: e.target.value }))}
                      placeholder="Describe the main objective for this period..."
                    />

                                        {/* Parent-level selector — two dropdowns: employee then OKR */}
                    {level > 1 && (() => {
                      // OKRs belonging to the selected parent employee
                      const filteredParentOkrs = selectedParentEmpCode
                        ? parentOkrs.filter(okr => String(okr.empCode) === selectedParentEmpCode)
                        : [];
                      return (
                        <>
                          <Select
                            label={`Parent Employee — Level ${level - 1}`}
                            value={selectedParentEmpCode}
                            onChange={(e) => {
                              setSelectedParentEmpCode(e.target.value);
                              setSelectedParentOkrCode('');
                            }}
                          >
                            <option value="">Select Level {level - 1} Employee</option>
                            {parentEmployees.map(emp => (
                              <option key={emp.empCode} value={String(emp.empCode)}>
                                {emp.empName || `Employee #${emp.empCode}`}
                              </option>
                            ))}
                          </Select>

                          {selectedParentEmpCode && (
                            <Select
                              label={`Parent OKR — Level ${level - 1}`}
                              value={selectedParentOkrCode}
                              onChange={(e) => setSelectedParentOkrCode(e.target.value)}
                            >
                              <option value="">Select Level {level - 1} OKR</option>
                              {filteredParentOkrs.map(okr => {
                                const codeField = `level${level - 1}OkrCode`;
                                return (
                                  <option key={okr[codeField]} value={String(okr[codeField])}>
                                    {okr.okrDesc || `OKR #${okr[codeField]}`}
                                  </option>
                                );
                              })}
                            </Select>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Preview panel */}
                  <div className="lg:col-span-2 bg-neutral-50 rounded-2xl border border-neutral-200 p-5">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Preview</p>
                    {fields.employeeName ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white font-bold text-sm">
                            {fields.employeeName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900 text-sm">{fields.employeeName}</p>
                            <p className="text-xs text-neutral-500">Level {fields.employeeLevel}</p>
                          </div>
                        </div>
                        <div className="border-t border-neutral-200 pt-3 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-neutral-400">Period</span>
                            <span className="font-semibold text-neutral-700">{fields.okrYear} · {fields.okrQuarter}</span>
                          </div>
                          {fields.okrDescription && (
                            <div>
                              <span className="text-xs text-neutral-400">Objective</span>
                              <p className="text-xs text-neutral-700 font-medium mt-1 leading-relaxed">{fields.okrDescription}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-full bg-neutral-200 mx-auto mb-3" />
                        <p className="text-xs text-neutral-400">Select an employee to preview</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 1: Key Results */}
              {currentStep === 1 && (
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-6">
                  <div className="mb-6">
                    <h2 className="text-base font-bold text-neutral-900 mb-1">Define Key Results</h2>
                    <p className="text-sm text-neutral-500">Set measurable outcomes that will indicate success for this objective.</p>
                  </div>

                  <div className="space-y-4">
                    {fields.keyResults.map((kr, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-8 h-10 text-sm font-bold text-neutral-400 shrink-0">
                          KR{idx + 1}
                        </div>
                        <div className="flex-1">
                          <Input
                            value={kr}
                            onChange={e => {
                              const newKR = [...fields.keyResults];
                              newKR[idx] = e.target.value;
                              setFields(f => ({ ...f, keyResults: newKR }));
                            }}
                            placeholder={`Key result ${idx + 1} — e.g. Increase retention to 95% by Q4`}
                          />
                        </div>
                        {kr && (
                          <div className="flex items-center h-10 shrink-0">
                            <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-brand-light border border-brand-border">
                    <p className="text-xs font-semibold text-brand-primary mb-1">💡 Pro tip</p>
                    <p className="text-xs text-brand-primary/80">Good key results are specific, measurable, and time-bound. Aim for 3–5 per objective.</p>
                  </div>
                </div>
              )}

              {/* Step 2: Execution */}
              {currentStep === 2 && (
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-6">
                  <div className="mb-6">
                    <h2 className="text-base font-bold text-neutral-900 mb-1">Track Execution</h2>
                    <p className="text-sm text-neutral-500">Record quarterly progress percentages and add reflective notes.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[1, 2, 3, 4].map((qNum, idx) => {
                      const pct = Number(fields.quarters[idx].percent || 0);
                      const barColor = pct >= 75 ? 'bg-success' : pct >= 50 ? 'bg-warning' : pct > 0 ? 'bg-danger' : 'bg-neutral-200';

                      return (
                        <div key={idx} className="border border-neutral-200 rounded-2xl overflow-hidden">
                          <div className="flex items-center justify-between px-5 py-3 bg-neutral-50 border-b border-neutral-100">
                            <h3 className="font-semibold text-neutral-800 text-sm">Quarter {qNum}</h3>
                            {pct > 0 && (
                              <span className={`text-xs font-bold ${pct >= 75 ? 'text-success' : pct >= 50 ? 'text-warning' : 'text-danger'}`}>
                                {pct}%
                              </span>
                            )}
                          </div>

                          {/* Progress bar */}
                          {pct > 0 && (
                            <div className="px-5 pt-3">
                              <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          )}

                          <div className="p-5 space-y-4">
                            <Input
                              label="% Completion"
                              type="number"
                              value={fields.quarters[idx].percent}
                              onChange={e => {
                                const newQ = [...fields.quarters];
                                newQ[idx] = { ...newQ[idx], percent: e.target.value };
                                setFields(f => ({ ...f, quarters: newQ }));
                              }}
                              placeholder="0–100"
                            />
                            <Input
                              label="Notes / Comments"
                              value={fields.quarters[idx].comment}
                              onChange={e => {
                                const newQ = [...fields.quarters];
                                newQ[idx] = { ...newQ[idx], comment: e.target.value };
                                setFields(f => ({ ...f, quarters: newQ }));
                              }}
                              placeholder="What was achieved this quarter?"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation footer */}
          <div className="flex items-center justify-between mt-6 bg-white rounded-2xl border border-neutral-200 shadow-card px-6 py-4">
            <Button
              variant="ghost"
              onClick={() => currentStep > 0 ? setCurrentStep(c => c - 1) : navigate("/")}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              {currentStep > 0 ? 'Previous' : 'Cancel'}
            </Button>

            <div className="flex items-center gap-2">
              {STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-brand-primary' : idx < currentStep ? 'w-3 bg-brand-primary/40' : 'w-3 bg-neutral-200'}`}
                />
              ))}
            </div>

            {currentStep < STEPS.length - 1 ? (
              <Button
                variant="primary"
                onClick={() => setCurrentStep(c => c + 1)}
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            ) : (
              <Button variant="primary" onClick={handleSave} loading={saving}>
                {saving ? 'Saving...' : 'Save OKR'}
                {!saving && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </Button>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OKRWorkspace;
