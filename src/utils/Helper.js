import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./S3 Config/S3 config.js";

class Helper {
  constructor() {}

  deleteImageFromS3 = async (bucketName, key) => {
    try {
      const params = {
        Bucket: bucketName,
        Key: key,
      };

      const command = new DeleteObjectCommand(params);
      const response = await s3.send(command);
      console.log("Delete response:", response);
      return response;
    } catch (error) {
      console.error("Error deleting image from S3:", error);
      throw error;
    }
  };

  getStringCount(inputString) {
    const valuesArray = inputString.split(",");
    const numericValues = valuesArray.map(Number);
    return numericValues.reduce((acc, curr) => acc + curr, 0);
  }

  isEqualObjects(obj1, obj2) {
    if (obj1 === obj2) {
      return true;
    }

    if (
      typeof obj1 !== "object" ||
      obj1 === null ||
      typeof obj2 !== "object" ||
      obj2 === null
    ) {
      return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (let key of keys1) {
      if (!keys2.includes(key) || !isEqual(obj1[key], obj2[key])) {
        return false;
      }
    }

    return true;
  }

  formatTime(time) {
    const [hours, minutes, seconds] = time.split(":");
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(seconds);

    const options = { hour: "numeric", minute: "numeric", hour12: true };
    return date.toLocaleTimeString("en-US", options);
  }

  getNextDatesOfWeek = (daysArray) => {
    let currentDate = new Date();
    let nextDays = [];
    for (let i = 0; i < 30; i++) {
      if (nextDays.length >= 7) {
        continue;
      }
      const formattedDate = currentDate.toISOString().split("T")[0];
      const dayName = currentDate.toLocaleDateString("en-US", {
        weekday: "long",
      });
      //console.log();
      if (daysArray.includes(dayName)) {
        nextDays.push({ Date: formattedDate, Day: dayName });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return nextDays;
  };
  getNextDatesOfWeekLimit = (daysArray) => {
    let currentDate = new Date();
    let nextDays = [];
    for (let i = 0; i < 30; i++) {
      if (nextDays.length >= daysArray.length) {
        continue;
      }
      const formattedDate = currentDate.toISOString().split("T")[0];
      const dayName = currentDate.toLocaleDateString("en-US", {
        weekday: "long",
      });
      //console.log();
      if (daysArray.includes(dayName)) {
        nextDays.push({ Date: formattedDate, Day: dayName });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return nextDays;
  };

  formatDate = (dateString) => {
    const dateObject = new Date(dateString);
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayIndex = dateObject.getDay();
    const dayName = daysOfWeek[dayIndex];
    const formattedDate = dateObject.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObject.getDate().toString().padStart(2, "0");
    const ymdDate = `${year}-${month}-${day}`;

    return { dayName, formattedDate, ymdDate };
  };

  getDateMonthDayBetweenTwoDates = (date1, date2) => {
    const startDate = new Date(date1 + "T00:00:00");
    const endDate = new Date(date2 + "T00:00:00");
    const dateArray = [];

    // Ensure startDate is earlier than endDate
    if (startDate > endDate) {
      const temp = startDate;
      startDate = endDate;
      endDate = temp;
    }

    // Loop through dates and populate dateArray
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const day = currentDate
        .toLocaleString("en-us", { weekday: "short" })
        .toLowerCase();
      const date = currentDate.getDate();
      const month = currentDate.toLocaleString("en-us", { month: "long" });

      if (date < 10) {
        const temp = new Date(currentDate);
        // console.log(currentDate, temp);
        // temp.setDate(currentDate.getDate() - 1);
        dateArray.push({
          day,
          date,
          month,
          fullDate: temp,
          dateString: new Date(currentDate).toLocaleDateString(),
        });
      } else {
        dateArray.push({
          day,
          date,
          month,
          fullDate: new Date(currentDate),
          dateString: new Date(currentDate).toLocaleDateString(),
        });
      }

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
  };

  getSmallestDateStringArray = (dateArray) => {
    if (!dateArray.length >= 1) return "N/A";
    const maxDate = new Date(
      Math.max.apply(
        null,
        dateArray.map(function (dateString) {
          return new Date(dateString);
        })
      )
    );
    return maxDate.toISOString().split("T")[0];
  };

  getLargestDateStringArray = (dateArray) => {
    if (!dateArray.length >= 1) return "N/A";
    const minDate = new Date(
      Math.min.apply(
        null,
        dateArray.map(function (dateString) {
          return new Date(dateString);
        })
      )
    );
    return minDate.toISOString().split("T")[0];
  };

  generateRandomPin(limit) {
    const characters = "0123456789";
    let pin = "";
    for (let i = 0; i < limit; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      pin += characters[randomIndex];
    }
    return pin;
  }

  isObjectEmpty(obj) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }

  getAbbreviatedDayName(fullDayName) {
    var dayAbbreviations = {
      Sunday: "sun",
      Monday: "mon",
      Tuesday: "tue",
      Wednesday: "wed",
      Thursday: "thu",
      Friday: "fri",
      Saturday: "sat",
    };
    return dayAbbreviations[fullDayName] || fullDayName.toLowerCase();
  }
  getDateFromString = (inputString) => {
    // Create a new Date object using the input string
    const dateObject = new Date(inputString);

    // Extract the individual components of the date
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(dateObject.getDate()).padStart(2, "0");

    // Assemble the date in the "YYYY-MM-DD" format
    const formattedDate = `${day}-${month}-${year}`;

    return formattedDate;
  };
  sortDatesAndGetIndices = (dateStrings) => {
    // Convert date strings to Date objects
    const dates = dateStrings.map((dateString) => new Date(dateString));

    // Create an array of objects with date and original index
    const indexedDates = dates.map((date, index) => ({ date, index }));

    // Sort the indexedDates array by date
    indexedDates.sort((a, b) => a.date - b.date);

    // Extract the sorted indices
    const sortedIndices = indexedDates.map((indexedDate) => indexedDate.index);

    return sortedIndices;
  };
}
const helperInstance = new Helper();
export default helperInstance;
