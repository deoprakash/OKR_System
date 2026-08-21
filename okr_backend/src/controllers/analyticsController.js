import Employee from "../models/employee.js";
import Level1OKR from "../models/level1Okr.js";
import Level2OKR from "../models/level2Okr.js";
import Level3OKR from "../models/level3Okr.js";
import Level4OKR from "../models/level4Okr.js";
import Level5OKR from "../models/level5Okr.js";
import Level6OKR from "../models/level6Okr.js";
import Level7OKR from "../models/level7Okr.js";

/*
|--------------------------------------------------------------------------
| Employee Dropdown
|--------------------------------------------------------------------------
*/

export async function getEmployees(req, res) {
  try {
    const employees = await Employee.find(
      {},
      {
        _id: 0,
        userId: 1,
        empName: 1,
        empDesignation: 1,
        empLevel: 1,
        emailId: 1,
      }
    ).sort({ empName: 1 });

    return res.json(employees);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch employees.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| OKR Dropdown
|--------------------------------------------------------------------------
*/

export async function getOKRs(req, res) {
  try {
    const { userId, year } = req.query;

    const employee = await Employee.findOne({ userId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    const modelMap = {
      1: Level1OKR,
      2: Level2OKR,
      3: Level3OKR,
      4: Level4OKR,
      5: Level5OKR,
      6: Level6OKR,
      7: Level7OKR,
    };

    const codeFieldMap = {
      1: "level1OkrCode",
      2: "level2OkrCode",
      3: "level3OkrCode",
      4: "level4OkrCode",
      5: "level5OkrCode",
      6: "level6OkrCode",
      7: "level7OkrCode",
    };

    const OKRModel = modelMap[employee.empLevel];
    const codeField = codeFieldMap[employee.empLevel];

    const years = await OKRModel.distinct("okrYear", {
      userId,
    });
    
    const okrs = await OKRModel.find(
      { userId },
      {
        [codeField]: 1,
        okrDesc: 1,
        okrYear: 1,
      }
    ).sort({ okrYear: -1, okrDesc: 1 });
    
    return res.json({
      years: [...new Set(okrs.map(o => o.okrYear))].sort((a, b) => b - a),
    
      okrs: okrs.map(o => ({
        okrId: o[codeField],
        okrDesc: o.okrDesc,
        okrYear: o.okrYear,
      })),
    });
    
    } catch (error) {
      console.error(error);
    
      return res.status(500).json({
        success: false,
        message: "Unable to load OKRs.",
      });
    }
    }
/*
|--------------------------------------------------------------------------
| Search Analytics
|--------------------------------------------------------------------------
*/

export async function searchAnalytics(req, res) {
  try {
    const {
      userId,
      year,
      selectedOKR,
    } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Employee is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Employee Information
    |--------------------------------------------------------------------------
    */

    const employee = await Employee.findOne(
      { userId },
      {
        _id: 0,
        userId: 1,
        empName: 1,
        empDesignation: 1,
        empLevel: 1,
        emailId: 1,
      }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find OKR according to Employee Level
    |--------------------------------------------------------------------------
    */

    const modelMap = {
      1: Level1OKR,
      2: Level2OKR,
      3: Level3OKR,
      4: Level4OKR,
      5: Level5OKR,
      6: Level6OKR,
      7: Level7OKR,
    };

    const OKRModel = modelMap[employee.empLevel];

    const codeFieldMap = {
      1: "level1OkrCode",
      2: "level2OkrCode",
      3: "level3OkrCode",
      4: "level4OkrCode",
      5: "level5OkrCode",
      6: "level6OkrCode",
      7: "level7OkrCode",
    };
    
    const codeField =
      codeFieldMap[employee.empLevel];

    if (!OKRModel) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee level.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Search Selected Year
    |--------------------------------------------------------------------------
    */

    let query = { userId };

    // Filter by Year only if a specific year is selected
    if (year && year !== "ALL") {
      query.okrYear = Number(year);
    }
    
    // Filter by OKR only if a specific OKR is selected
    if (selectedOKR && selectedOKR !== "ALL") {
      query[codeField] = Number(selectedOKR);
    }
    
    const okrs = await OKRModel.find(query).lean();

    if (!okrs.length) {
      return res.json({
        success: true,
        employee,
        performances: [],
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    const performances = await Promise.all(okrs.map(async (okr) => {
      const q1 = okr.q1_percentage || 0;
      const q2 = okr.q2_percentage || 0;
      const q3 = okr.q3_percentage || 0;
      const q4 = okr.q4_percentage || 0;
      
      let dataToForecast = [];
      let forecastTarget = null;
      
      if (q1 > 0 && q2 === 0 && q3 === 0 && q4 === 0) {
          dataToForecast = [q1];
          forecastTarget = 'Q2';
      } else if (q1 > 0 && q2 > 0 && q3 === 0 && q4 === 0) {
          dataToForecast = [q1, q2];
          forecastTarget = 'Q3';
      } else if (q1 > 0 && q2 > 0 && q3 > 0 && q4 === 0) {
          dataToForecast = [q1, q2, q3];
          forecastTarget = 'Q4';
      } else if (q1 > 0 && q2 > 0 && q3 > 0 && q4 > 0) {
          dataToForecast = [q1, q2, q3, q4];
          forecastTarget = 'Q1_NEXT';
      }

      let forecastValue = null;
      if (forecastTarget) {
          try {
              const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
              const response = await fetch(`${mlUrl}/forecast`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ data: dataToForecast })
              });
              
              if (response.ok) {
                  const result = await response.json();
                  forecastValue = result.forecast;
              } else {
                  console.error("ML service returned status:", response.status);
              }
          } catch (err) {
              console.error("ML service error:", err.message);
          }
      }

      return {
          okrYear: okr.okrYear,
          okrId: okr[codeField],
          okrDesc: okr.okrDesc,
          q1_percentage: q1,
          q2_percentage: q2,
          q3_percentage: q3,
          q4_percentage: q4,
          q1_comment: okr.q1_comment || "",
          q2_comment: okr.q2_comment || "",
          q3_comment: okr.q3_comment || "",
          q4_comment: okr.q4_comment || "",
          forecastTarget,
          forecastValue
      };
    }));

    return res.json({
      success: true,
      employee,
      performances,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to load analytics.",
    });
  }
}