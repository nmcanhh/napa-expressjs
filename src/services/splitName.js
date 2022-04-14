function splitToFirstName(fullName) {
    const firstName = fullName.split(' ').slice(0, -1).join(' ');
    return firstName;
}
function splitToLastName(fullName) {
    const lastName = fullName.split(' ').slice(-1).join(' ');
    return lastName;
}

export default {
    splitToFirstName,
    splitToLastName
};