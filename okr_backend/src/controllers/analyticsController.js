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
| Search Analytics
|--------------------------------------------------------------------------
*/

export async function searchAnalytics(req, res) {
  try {
    const { userId, year } = req.query;

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

    const okr = await OKRModel.findOne({
      userId,
      okrYear: Number(year),
    }).lean();

    if (!okr) {
      return res.json({
        success: true,
        employee,
        performance: null,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.json({
      success: true,

      employee,

      performance: {
        q1_percentage: okr.q1_percentage || 0,
        q2_percentage: okr.q2_percentage || 0,
        q3_percentage: okr.q3_percentage || 0,
        q4_percentage: okr.q4_percentage || 0,

        q1_comment: okr.q1_comment || "",
        q2_comment: okr.q2_comment || "",
        q3_comment: okr.q3_comment || "",
        q4_comment: okr.q4_comment || "",
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to load analytics.",
    });
  }
}