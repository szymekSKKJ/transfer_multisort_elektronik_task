import fs from "fs";
import Papa from "papaparse";

export const readCsvFile = async <ExpectedData>(pathToFike: string): Promise<[ExpectedData, null] | [null, Error]> => {
  // In this case we read the file locally but instead we can simulate a SQL query which can looks like this:
  // SELECT id, date, price FROM share_prices
  // "share_prices" is the name of table
  // The currency is not needed

  const response = await new Promise<[ExpectedData, null] | [null, Error]>((resolve) => {
    fs.readFile(pathToFike, "utf8", (error, data) => {
      if (error) {
        resolve([null, error]);
      }

      const result = Papa.parse(data, {
        header: true,
        skipEmptyLines: true,
      }).data as unknown as ExpectedData;

      resolve([result, null]);
    });
  });

  return response;
};
