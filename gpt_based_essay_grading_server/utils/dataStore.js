// dataStore.js
const store = {};

export const setData = (key, value) => {
    store[key] = value;
};

export const getData = (key) => {
    return store[key];
};


