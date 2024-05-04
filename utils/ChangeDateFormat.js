export function changeDateFormat(date) {
    let newdate = date.split('-');
    return newdate[2] + "." + newdate[1] + "." + newdate[0]
}