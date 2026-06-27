export const EMPLOYEE_LEVELS = ["new value 1", "new value 2", "new value 3"];

export const YEAR_OPTIONS = Array.from(
  { length: 51 },
  (_, index) => 2000 + index,
);

export const QUARTER_OPTIONS = ["Q1", "Q2", "Q3", "Q4"];

export const getCurrentYear = () => new Date().getFullYear();

export const getLocalDateString = (value) => {
  const d = value ? new Date(value) : new Date();

  if (Number.isNaN(d.getTime())) return "";

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};

export const createEmptyOKRFields = () => ({
  employeeCode: "",
  employeeName: "",
  userId: "",
  employeeLevel: "",

  okrCode: "",
  okrDate: getLocalDateString(),

  okrYear: getCurrentYear(),
  okrQuarter: QUARTER_OPTIONS[0],

  okrDescription: "",

  keyResults: Array(5).fill(""),

  quarters: Array.from({ length: 4 }, () => ({
    percent: "",
    comment: "",
  })),
});
