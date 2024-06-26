import Helper from "./Helper.js";

export const getOrderCountDates = (start_date, end_date, vendorP) => {
  const CustomerGivenDates = Helper.getDateMonthDayBetweenTwoDates(
    start_date,
    end_date
  );

  // Filtering among the package and getting which days are available for that package. Storing them in PackageAvailableDays Variable
  const PackageAvailableDays = [];
  if (vendorP.mon === 1) {
    PackageAvailableDays.push("mon");
  }
  if (vendorP.tue === 1) {
    PackageAvailableDays.push("tue");
  }
  if (vendorP.wed === 1) {
    PackageAvailableDays.push("wed");
  }
  if (vendorP.thu === 1) {
    PackageAvailableDays.push("thu");
  }
  if (vendorP.fri === 1) {
    PackageAvailableDays.push("fri");
  }
  if (vendorP.sat === 1) {
    PackageAvailableDays.push("sat");
  }
  if (vendorP.sun === 1) {
    PackageAvailableDays.push("sun");
  }

  // Getting the matched days count between the packages available days and customer given days
  let customerOrderCount = [];
  PackageAvailableDays.forEach((d) => {
    CustomerGivenDates.forEach((dateObj) => {
      dateObj.day === d && customerOrderCount.push(dateObj);
    });
  });

  return customerOrderCount;
};
export const filterOrderDatesFromExistingOrder = (
  customerOrderCount,
  existingOrders
) => {
  let orderDates = customerOrderCount;

  existingOrders.length > 0 &&
    existingOrders.forEach((or) => {
      orderDates = orderDates.filter(
        (date) => date.dateString !== or.order_date
      );
    });
  return orderDates;
};
export const sortingDatesInDecendingOrder = (orderDates) => {
  const dateArray = orderDates.map((date) => date.fullDate);
  dateArray.sort((a, b) => b.getTime() - a.getTime());
  return dateArray;
};

export const sortingDatesInDecendingOrderFromDateStrings = (orderDates) => {
  const dateArray = orderDates.map((date) => new Date(date + "T00:00:00"));
  dateArray.sort((a, b) => b.getTime() - a.getTime());
  return dateArray;
};

export const getPackageAvailableDays = (vendorP) => {
  const PackageAvailableDays = [];
  if (vendorP.mon === 1) {
    PackageAvailableDays.push("mon");
  }
  if (vendorP.tue === 1) {
    PackageAvailableDays.push("tue");
  }
  if (vendorP.wed === 1) {
    PackageAvailableDays.push("wed");
  }
  if (vendorP.thu === 1) {
    PackageAvailableDays.push("thu");
  }
  if (vendorP.fri === 1) {
    PackageAvailableDays.push("fri");
  }
  if (vendorP.sat === 1) {
    PackageAvailableDays.push("sat");
  }
  if (vendorP.sun === 1) {
    PackageAvailableDays.push("sun");
  }
  return PackageAvailableDays;
};
