const idGenerator = () =>
{
	const capitalLetters = 'ABCDEFGHIJKMNLOPQRSTUVWXYZ';
    const smallLetters = 'abcdefghijkmnlopqrstuvwxyz';
    const numbers = '1234567890';
    const symboles = '!@#$%^&*';

	const max = capitalLetters + smallLetters + numbers + symboles;
	let id = "";

	for (let i = 1; i <= 12; i++)
    {
        var char = Math.floor(Math.random() * max.length + 1);    
        id += max.charAt(char);
    };

	if (id.length < 12)
		idGenerator();

	return id;
};

export function generateNumericId () {
    return Math.floor(Math.random() * 10000000);
}

export default idGenerator;