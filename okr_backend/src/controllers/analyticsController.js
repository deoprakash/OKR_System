import Employee from "../models/employee.js";

import Level1OKR from "../models/level1Okr.js";
import Level2OKR from "../models/level2Okr.js";
import Level3OKR from "../models/level3Okr.js";
import Level4OKR from "../models/level4Okr.js";
import Level5OKR from "../models/level5Okr.js";
import Level6OKR from "../models/level6Okr.js";
import Level7OKR from "../models/level7Okr.js";

export async function employeeTrend(req, res) {
  try {
    const OKR_MODELS = [
      Level1OKR,
      Level2OKR,
      Level3OKR,
      Level4OKR,
      Level5OKR,
      Level6OKR,
      Level7OKR,
    ];
    const { userId } = req.params;
    const { year } = req.query;

    // Find employee
    const employee = await Employee.findOne({ userId });

    if (!employee) {
      return res.status(404).json({
        error: "Employee not found",
      });
    }

    // Build query
    const query = {
      userId: employee.userId,
    };

    if (year && year !== "ALL") {
      query.okrYear = Number(year);
    }

    // Fetch OKRs
   const allOKRs = [];

   for (const Model of OKR_MODELS) {
     const docs = await Model.find(query);

     allOKRs.push(...docs);
   }

   allOKRs.sort((a, b) => {
     if (a.okrYear !== b.okrYear) {
       return a.okrYear - b.okrYear;
     }

     return a.okrQuarter.localeCompare(b.okrQuarter);
   });

    console.log("Employee:", employee);
    console.log("Query:", query);

    console.log("Found OKRs:", okrs.length);
    console.log(okrs);

    // Calculate average performance
    const analytics = allOKRs.map((doc) => {
      const values = [
        doc.q1_percentage,
        doc.q2_percentage,
        doc.q3_percentage,
        doc.q4_percentage,
      ].filter((v) => typeof v === "number");

      const average =
        values.length > 0
          ? Number(
              (
                values.reduce((sum, value) => sum + value, 0) / values.length
              ).toFixed(2),
            )
          : 0;

      return {
        _id: doc._id,
        level: doc.empLevel,
        okrYear: doc.okrYear,
        okrQuarter: doc.okrQuarter,
        okrDesc: doc.okrDesc,

        q1_percentage: doc.q1_percentage,
        q2_percentage: doc.q2_percentage,
        q3_percentage: doc.q3_percentage,
        q4_percentage: doc.q4_percentage,

        average,
      };
    });

    res.json({
      data: analytics,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Unable to fetch analytics.",
    });
  }
}
