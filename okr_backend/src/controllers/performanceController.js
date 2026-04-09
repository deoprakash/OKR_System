import Level1OKR from "../models/level1Okr.js";
import Level2OKR from "../models/level2Okr.js";
import Level3OKR from "../models/level3Okr.js";
import Level4OKR from "../models/level4Okr.js";
import Level5OKR from "../models/level5Okr.js";
import Level6OKR from "../models/level6Okr.js";
import Level7OKR from "../models/level7Okr.js";
import Employee from "../models/employee.js";

// Get all OKRs for an employee (for dropdown list)
export async function getEmployeeOKRs(req, res) {
  const { empCode } = req.params;
  
  try {
    const empCodeNum = Number(empCode);
    const employee = await Employee.findOne({ empCode: empCodeNum });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    if (!req.user?.isAdmin) {
      const canView =
        Number(req.user?.empCode) === empCodeNum ||
        Number(employee.empLevel || 0) >= Number(req.user?.empLevel || 0);
      if (!canView) {
        return res.status(403).json({ error: "You can only view lower level employee OKRs" });
      }
    }
    
    // Fetch all OKRs for this employee based on their level
    const [level1, level2, level3, level4, level5, level6, level7] = await Promise.all([
      Level1OKR.find({ empCode: empCodeNum }).select('level1OkrCode okrDesc empLevel').sort({ createdAt: -1 }),
      Level2OKR.find({ empCode: empCodeNum }).select('level2OkrCode okrDesc empLevel level1OkrCode').sort({ createdAt: -1 }),
      Level3OKR.find({ empCode: empCodeNum }).select('level3OkrCode okrDesc empLevel level2OkrCode').sort({ createdAt: -1 }),
      Level4OKR.find({ empCode: empCodeNum }).select('level4OkrCode okrDesc empLevel level3OkrCode').sort({ createdAt: -1 }),
      Level5OKR.find({ empCode: empCodeNum }).select('level5OkrCode okrDesc empLevel level4OkrCode').sort({ createdAt: -1 }),
      Level6OKR.find({ empCode: empCodeNum }).select('level6OkrCode okrDesc empLevel level5OkrCode').sort({ createdAt: -1 }),
      Level7OKR.find({ empCode: empCodeNum }).select('level7OkrCode okrDesc empLevel level6OkrCode').sort({ createdAt: -1 })
    ]);

    const okrs = [
      ...level1.map(okr => ({ ...okr.toObject(), level: 1 })),
      ...level2.map(okr => ({ ...okr.toObject(), level: 2 })),
      ...level3.map(okr => ({ ...okr.toObject(), level: 3 })),
      ...level4.map(okr => ({ ...okr.toObject(), level: 4 })),
      ...level5.map(okr => ({ ...okr.toObject(), level: 5 })),
      ...level6.map(okr => ({ ...okr.toObject(), level: 6 })),
      ...level7.map(okr => ({ ...okr.toObject(), level: 7 }))
    ];

    res.json({ data: okrs });
  } catch (err) {
    console.error("Error fetching employee OKRs:", err);
    res.status(500).json({ error: "Failed to fetch employee OKRs" });
  }
}

// Get OKR hierarchy for performance view
export async function getOKRHierarchy(req, res) {
  const { level, okrCode } = req.params;
  
  try {
    const levelNum = Number(level);
    const okrCodeNum = Number(okrCode);

    if (!req.user?.isAdmin) {
      if (levelNum < Number(req.user?.empLevel || 0)) {
        return res.status(403).json({ error: "You can only view your level or lower levels" });
      }
    }
    
    let result = {
      level1: null,
      level2: null,
      level3: null,
      level4: null,
      level5: null,
      level6: null,
      level7: null
    };

    // Get the selected OKR based on level
    let currentOKR = null;
    
    switch (levelNum) {
      case 1:
        currentOKR = await Level1OKR.findOne({ level1OkrCode: okrCodeNum });
        result.level1 = currentOKR;
        // Find children
        if (currentOKR) {
          result.level2 = await Level2OKR.findOne({ level1OkrCode: okrCodeNum });
          if (result.level2) {
            result.level3 = await Level3OKR.findOne({ level2OkrCode: result.level2.level2OkrCode });
            if (result.level3) {
              result.level4 = await Level4OKR.findOne({ level3OkrCode: result.level3.level3OkrCode });
              if (result.level4) {
                result.level5 = await Level5OKR.findOne({ level4OkrCode: result.level4.level4OkrCode });
                if (result.level5) {
                  result.level6 = await Level6OKR.findOne({ level5OkrCode: result.level5.level5OkrCode });
                  if (result.level6) {
                    result.level7 = await Level7OKR.findOne({ level6OkrCode: result.level6.level6OkrCode });
                  }
                }
              }
            }
          }
        }
        break;
        
      case 2:
        currentOKR = await Level2OKR.findOne({ level2OkrCode: okrCodeNum });
        result.level2 = currentOKR;
        // Find parent
        if (currentOKR && currentOKR.level1OkrCode) {
          result.level1 = await Level1OKR.findOne({ level1OkrCode: currentOKR.level1OkrCode });
        }
        // Find children
        if (currentOKR) {
          result.level3 = await Level3OKR.findOne({ level2OkrCode: okrCodeNum });
          if (result.level3) {
            result.level4 = await Level4OKR.findOne({ level3OkrCode: result.level3.level3OkrCode });
            if (result.level4) {
              result.level5 = await Level5OKR.findOne({ level4OkrCode: result.level4.level4OkrCode });
              if (result.level5) {
                result.level6 = await Level6OKR.findOne({ level5OkrCode: result.level5.level5OkrCode });
                if (result.level6) {
                  result.level7 = await Level7OKR.findOne({ level6OkrCode: result.level6.level6OkrCode });
                }
              }
            }
          }
        }
        break;
        
      case 3:
        currentOKR = await Level3OKR.findOne({ level3OkrCode: okrCodeNum });
        result.level3 = currentOKR;
        // Find parents
        if (currentOKR && currentOKR.level2OkrCode) {
          result.level2 = await Level2OKR.findOne({ level2OkrCode: currentOKR.level2OkrCode });
          if (result.level2 && result.level2.level1OkrCode) {
            result.level1 = await Level1OKR.findOne({ level1OkrCode: result.level2.level1OkrCode });
          }
        }
        // Find children
        if (currentOKR) {
          result.level4 = await Level4OKR.findOne({ level3OkrCode: okrCodeNum });
          if (result.level4) {
            result.level5 = await Level5OKR.findOne({ level4OkrCode: result.level4.level4OkrCode });
            if (result.level5) {
              result.level6 = await Level6OKR.findOne({ level5OkrCode: result.level5.level5OkrCode });
              if (result.level6) {
                result.level7 = await Level7OKR.findOne({ level6OkrCode: result.level6.level6OkrCode });
              }
            }
          }
        }
        break;
        
      case 4:
        currentOKR = await Level4OKR.findOne({ level4OkrCode: okrCodeNum });
        result.level4 = currentOKR;
        // Find parents
        if (currentOKR && currentOKR.level3OkrCode) {
          result.level3 = await Level3OKR.findOne({ level3OkrCode: currentOKR.level3OkrCode });
          if (result.level3 && result.level3.level2OkrCode) {
            result.level2 = await Level2OKR.findOne({ level2OkrCode: result.level3.level2OkrCode });
            if (result.level2 && result.level2.level1OkrCode) {
              result.level1 = await Level1OKR.findOne({ level1OkrCode: result.level2.level1OkrCode });
            }
          }
        }
        // Find children
        if (currentOKR) {
          result.level5 = await Level5OKR.findOne({ level4OkrCode: okrCodeNum });
          if (result.level5) {
            result.level6 = await Level6OKR.findOne({ level5OkrCode: result.level5.level5OkrCode });
            if (result.level6) {
              result.level7 = await Level7OKR.findOne({ level6OkrCode: result.level6.level6OkrCode });
            }
          }
        }
        break;
        
      case 5:
        currentOKR = await Level5OKR.findOne({ level5OkrCode: okrCodeNum });
        result.level5 = currentOKR;
        // Find parents
        if (currentOKR && currentOKR.level4OkrCode) {
          result.level4 = await Level4OKR.findOne({ level4OkrCode: currentOKR.level4OkrCode });
          if (result.level4 && result.level4.level3OkrCode) {
            result.level3 = await Level3OKR.findOne({ level3OkrCode: result.level4.level3OkrCode });
            if (result.level3 && result.level3.level2OkrCode) {
              result.level2 = await Level2OKR.findOne({ level2OkrCode: result.level3.level2OkrCode });
              if (result.level2 && result.level2.level1OkrCode) {
                result.level1 = await Level1OKR.findOne({ level1OkrCode: result.level2.level1OkrCode });
              }
            }
          }
        }
        // Find children
        if (currentOKR) {
          result.level6 = await Level6OKR.findOne({ level5OkrCode: okrCodeNum });
          if (result.level6) {
            result.level7 = await Level7OKR.findOne({ level6OkrCode: result.level6.level6OkrCode });
          }
        }
        break;
        
      case 6:
        currentOKR = await Level6OKR.findOne({ level6OkrCode: okrCodeNum });
        result.level6 = currentOKR;
        // Find parents
        if (currentOKR && currentOKR.level5OkrCode) {
          result.level5 = await Level5OKR.findOne({ level5OkrCode: currentOKR.level5OkrCode });
          if (result.level5 && result.level5.level4OkrCode) {
            result.level4 = await Level4OKR.findOne({ level4OkrCode: result.level5.level4OkrCode });
            if (result.level4 && result.level4.level3OkrCode) {
              result.level3 = await Level3OKR.findOne({ level3OkrCode: result.level4.level3OkrCode });
              if (result.level3 && result.level3.level2OkrCode) {
                result.level2 = await Level2OKR.findOne({ level2OkrCode: result.level3.level2OkrCode });
                if (result.level2 && result.level2.level1OkrCode) {
                  result.level1 = await Level1OKR.findOne({ level1OkrCode: result.level2.level1OkrCode });
                }
              }
            }
          }
        }
        // Find children
        if (currentOKR) {
          result.level7 = await Level7OKR.findOne({ level6OkrCode: okrCodeNum });
        }
        break;
        
      case 7:
        currentOKR = await Level7OKR.findOne({ level7OkrCode: okrCodeNum });
        result.level7 = currentOKR;
        // Find parents
        if (currentOKR && currentOKR.level6OkrCode) {
          result.level6 = await Level6OKR.findOne({ level6OkrCode: currentOKR.level6OkrCode });
          if (result.level6 && result.level6.level5OkrCode) {
            result.level5 = await Level5OKR.findOne({ level5OkrCode: result.level6.level5OkrCode });
            if (result.level5 && result.level5.level4OkrCode) {
              result.level4 = await Level4OKR.findOne({ level4OkrCode: result.level5.level4OkrCode });
              if (result.level4 && result.level4.level3OkrCode) {
                result.level3 = await Level3OKR.findOne({ level3OkrCode: result.level4.level3OkrCode });
                if (result.level3 && result.level3.level2OkrCode) {
                  result.level2 = await Level2OKR.findOne({ level2OkrCode: result.level3.level2OkrCode });
                  if (result.level2 && result.level2.level1OkrCode) {
                    result.level1 = await Level1OKR.findOne({ level1OkrCode: result.level2.level1OkrCode });
                  }
                }
              }
            }
          }
        }
        break;
    }

    res.json({ data: result });
  } catch (err) {
    console.error("Error fetching OKR hierarchy:", err);
    res.status(500).json({ error: "Failed to fetch OKR hierarchy" });
  }
}
