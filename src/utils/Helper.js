class Helper {
    constructor() {
    }

    getStringCount(inputString) {
        const valuesArray = inputString.split(',');
        const numericValues = valuesArray.map(Number);
        return numericValues.reduce((acc, curr) => acc + curr, 0);
    }

    getNextDatesOfWeek = (daysArray) => {
        let currentDate = new Date();
        let nextDays = [];
        for (let i = 0; i < 30; i++) {
            if (nextDays.length >= 7) {
                continue;
            }
            const formattedDate = currentDate.toISOString().split('T')[0];
            const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
            //console.log();
            if (daysArray.includes(dayName)) {
                nextDays.push({ Date: formattedDate, Day: dayName })
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return nextDays;
    }

    formatDate = (dateString) => {
        const dateObject = new Date(dateString);
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayIndex = dateObject.getDay();
        const dayName = daysOfWeek[dayIndex];
        const formattedDate = dateObject.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const year = dateObject.getFullYear();
        const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
        const day = dateObject.getDate().toString().padStart(2, '0');
        const ymdDate = `${year}-${month}-${day}`;

        return { dayName, formattedDate, ymdDate };
    };

    generateRandomPin(limit) {
        const characters = '0123456789';
        let pin = '';
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
            'Sunday': 'sun',
            'Monday': 'mon',
            'Tuesday': 'tue',
            'Wednesday': 'wed',
            'Thursday': 'thu',
            'Friday': 'fri',
            'Saturday': 'sat'
        };
        return dayAbbreviations[fullDayName] || fullDayName.toLowerCase();
    }
}
const helperInstance = new Helper();
export default helperInstance;