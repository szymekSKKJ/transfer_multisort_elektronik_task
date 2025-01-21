import { readCsvFile } from "./readCsvFile";

type SharePricesCsv = {
  id: string;
  date: string;
  price: string;
  currency: string;
};

type SharePrices = {
  id: string;
  date: Date;
  price: number;
  currency: string;
};

const getPropertiesOfSharePrices = (sharePrices: SharePrices[], initialStartDate: Date, initialEndDate: Date) => {
  const startDate = initialStartDate.getTime() <= initialEndDate.getTime() ? initialStartDate : initialEndDate;
  const endDate = initialStartDate.getTime() <= initialEndDate.getTime() ? initialEndDate : initialStartDate;

  const sharePricesInRange = sharePrices.filter((data) => {
    if (data.date.getTime() <= endDate.getTime() && data.date.getTime() >= startDate.getTime()) {
      return data;
    }
  });

  if (sharePricesInRange.length >= 2) {
    const biggestDailyDrop: {
      highestPrice: null | SharePrices;
      lowestPrice: null | SharePrices;
    } = {
      highestPrice: null,
      lowestPrice: null,
    };

    const periodsOfFallingPrices: SharePrices[][] = [];
    const periodsWithTheLongestUnchangedPrice: SharePrices[][] = [];

    sharePricesInRange.forEach((data, index, array) => {
      const lastValue = array.at(index - 1);

      if (biggestDailyDrop.highestPrice === null) {
        biggestDailyDrop.highestPrice = data;
      } else {
        if (data.price > biggestDailyDrop.highestPrice.price) {
          biggestDailyDrop.highestPrice = data;
        }
      }

      if (biggestDailyDrop.lowestPrice === null) {
        biggestDailyDrop.lowestPrice = data;
      } else {
        if (data.price < biggestDailyDrop.lowestPrice.price) {
          biggestDailyDrop.lowestPrice = data;
        }
      }

      if (lastValue !== undefined) {
        if (lastValue.price === data.price) {
          if (Array.isArray(periodsWithTheLongestUnchangedPrice.at(-1))) {
            if (periodsWithTheLongestUnchangedPrice.at(-1)!.at(-1)!.id === lastValue.id) {
              periodsWithTheLongestUnchangedPrice.at(-1)!.push(data);
            } else {
              periodsWithTheLongestUnchangedPrice.push([lastValue, data]);
            }
          } else {
            periodsWithTheLongestUnchangedPrice.push([lastValue, data]);
          }
        }

        if (data.price <= lastValue.price) {
          if (data.price < lastValue.price) {
            if (Array.isArray(periodsOfFallingPrices.at(-1)) === false) {
              periodsOfFallingPrices.push([lastValue, data]);
            } else {
              if (periodsOfFallingPrices.at(-1)!.at(-1)!.id === lastValue.id) {
                periodsOfFallingPrices.at(-1)!.push(data);
              } else {
                periodsOfFallingPrices.push([lastValue, data]);
              }
            }
          } else {
            if (Array.isArray(periodsOfFallingPrices.at(-1)) && periodsOfFallingPrices.at(-1)!.at(-1)!.id === lastValue.id) {
              periodsOfFallingPrices.at(-1)!.push(data);
            }
          }
        }
      }
    });

    const periodsOfFallingPricesAdditionalInformation = periodsOfFallingPrices.map((data) => {
      const id = crypto.randomUUID();
      const theHighestPrice = data.at(0)!; // It is always the first value
      const theLowestPrice = data.at(-1)!; // It is always the last value

      return {
        id: id,
        theHighestPrice: theHighestPrice,
        theLowestPrice: theLowestPrice,
        dropPriceDifference: parseFloat(Math.abs(theHighestPrice.price - theLowestPrice.price).toFixed(2)),
        values: data,
      };
    });

    const biggestDropPeriod = periodsOfFallingPricesAdditionalInformation.reduce(
      (a, b) => (a.dropPriceDifference > b.dropPriceDifference ? a : b),
      periodsOfFallingPricesAdditionalInformation.at(0)!
    )!;

    const periodWithTheLongestUnchangedPrice = periodsWithTheLongestUnchangedPrice.reduce(
      (a, b) => (a.length > b.length ? a : b),
      periodsWithTheLongestUnchangedPrice.at(0)!
    );

    return {
      highestPrice: biggestDailyDrop.highestPrice,
      lowestPrice: biggestDailyDrop.lowestPrice,
      biggestDailyDropInValue:
        biggestDailyDrop.highestPrice !== null && biggestDailyDrop.lowestPrice !== null
          ? Math.abs(biggestDailyDrop.highestPrice.price - biggestDailyDrop.lowestPrice.price)
          : null,
      periodsOfFallingPrices: periodsOfFallingPricesAdditionalInformation,
      periodsOfFallingPricesLength: periodsOfFallingPricesAdditionalInformation.length,
      biggestDropPeriod: biggestDropPeriod,
      periodWithTheLongestUnchangedPrice: periodWithTheLongestUnchangedPrice,
    };
  } else {
    throw new Error("Given range does not include at least 2 items. Please change range.");

    return undefined;
  }
};

(async () => {
  const [data, error] = await readCsvFile<SharePricesCsv[]>("./data/ceny_akcji.csv").then((response) => {
    const [data] = response;

    if (data !== null) {
      return [
        data.map(({ id, date, price, currency }) => {
          return {
            id: id,
            date: new Date(date),
            price: parseFloat(parseFloat(price).toFixed(2)),
            currency: currency,
          };
        }),
        null,
      ];
    } else {
      return response;
    }
  });

  if (data !== null) {
    const statistics = getPropertiesOfSharePrices(data, data.at(0)!.date, data.at(-1)!.date);
  }
})();
