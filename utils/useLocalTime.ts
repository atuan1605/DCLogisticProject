
import dayjs from 'dayjs';

export const useLocalTime = () => {
    const convertToLocalTime = (date: string, format: string = 'DD-MM-YYYY HH:mm:ss') => {
        return dayjs(date).tz(dayjs.tz.guess()).format(format);
    };

    return {
        convertToLocalTime,
    };
};