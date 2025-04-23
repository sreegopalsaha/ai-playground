export const getWeatherDeclaration = {
    name: "getWeather",
    parameters: {
        type: 'object',
        properties: {
            city: {
                type: 'string',
                description: 'The city to get the weather for'
            }
        },
        required: ['city']
    }
};
export const getWeather = async ({ city }) => {
    const response = await fetch(`https://wttr.in/${city}?format=j1`);
    const data = await response.json();
    return data;
};
