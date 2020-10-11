const fs = require('fs-extra');
const path = require('path');

const RUNTIME_FOLDER = 'runtime-storage';


const _encodeKey = (keyName) => {
    return path.join(RUNTIME_FOLDER, keyName);
};


exports.hasItem = async (keyName) => {
    return await fs.pathExists(_encodeKey(keyName));
};

exports.getItem = async (keyName) => {
    return await fs.read(_encodeKey(keyName));
};

exports.getJson = async (keyName) => {
    return await fs.readJson(_encodeKey(keyName));
};

exports.setItem = async (keyName, value) => {
    return await fs.outputFile(_encodeKey(keyName), value);
};

exports.setJson = async (keyName, value) => {
    return await fs.outputJson(_encodeKey(keyName), value);
};


exports.removeItem = async (keyName) => {
    return await fs.remove(_encodeKey(keyName));
};


/*

exports.keys = async () => {

};

const _initStorage = (options) => {

};

exports.clear = async () => {

};

const _driverName = 'tempFileStorage';
export const iterate = async (iteratorCallback, successCallback) => {
    // Custom implementation here...
};


export const length = async () => {

};

 */