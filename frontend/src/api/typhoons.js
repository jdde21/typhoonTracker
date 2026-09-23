

async function getAutoTrackData(name) {
    const url = `http://127.0.0.1:8000/get_live_typhoons?name=${name}`
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error(error.message);
    }
}

async function getNeighbors() {
    const url = "http://127.0.0.1:8000/neighbors"
    try {
        const response = await fetch(url, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error(error.message);
    }
}

async function getNames() {
    const url = "http://127.0.0.1:8000/neighbors_names"
    try {
        const response = await fetch(url, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error(error.message);
    }
}

async function getNeighborsWindSpeedAndPressure(database) {
    const url = `http://127.0.0.1:8000/neighbors_wind_speed_and_pressure/${database}`
    try {
        const response = await fetch(url, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error(error.message);
    }
}

async function getData(list_coordinates, database, range, neighbors, model) {
    const url = "http://127.0.0.1:8000/input"
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ coordinates: list_coordinates, database, range, neighbors, model })
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        return result
    } catch (error) {
        console.error(error.message);
    }
}

export {
    getAutoTrackData,
    getNeighbors,
    getNames,
    getNeighborsWindSpeedAndPressure,
    getData
};