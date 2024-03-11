import moment from 'moment';

export function getTimeUntilEvent(eventDate: Date): string {
    const now = moment.utc();
    const futureDate = moment(eventDate);
    const duration = moment.duration(futureDate.diff(now));
    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    let str = ''
    if (days>0){
        str = `${days} days, ${hours} hours, ${minutes} minutes`
    } else if (hours>0){
        str = `${hours} hours, ${minutes} minutes`
    } else {
        str = `${minutes} minutes, ${seconds} seconds`
    }
    return str;
}
