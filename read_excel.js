const xlsx = require("xlsx");
const fs = require("fs");

try {
  const workbook = xlsx.readFile(
    "C:\\Users\\kumae\\Downloads\\AI_Tools_Database.xlsx"
  );
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);
  fs.writeFileSync(
    "D:\\code\\Rateaimodel\\tools_data.json",
    JSON.stringify(data, null, 2)
  );
  console.log(
    "Successfully written to tools_data.json. Extracted " +
      data.length +
      " rows."
  );
} catch (error) {
  console.error("Error reading excel file:", error);
}
