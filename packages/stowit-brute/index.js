#!/usr/bin/env node

const axios = require("axios");
const fileStorage = require("./fileStorage");
const { program } = require("commander");
const BRUTE_TAG = "$brute";
const ENGLISH_LETTERS = "abcdefghijklmnopqrstuvwxyz";
const ARABIC_NUMBERS = "0123456789";

const indexToString = ({ index, charset }) => {
  let accumulator = index;
  const characters = [];
  while (accumulator > 0) {
    characters.unshift(charset[accumulator % charset.length]);
    accumulator =
      (accumulator - (accumulator % charset.length)) / charset.length;
  }
  return characters.length ? characters.join("") : charset[0];
};

const formatFolderName = (text) => text.replace(/[^\w\-]+/g, "_");
const sleep = (seconds = 0.2) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

const brute = async (pattern) => {
  const parts = pattern.split(BRUTE_TAG);
  const characters =
    ENGLISH_LETTERS + ENGLISH_LETTERS.toUpperCase() + ARABIC_NUMBERS;

  let currentIndex = 0;
  const patternFolder = formatFolderName(parts[0]);

  while (currentIndex <= Number.MAX_SAFE_INTEGER) {
    const word = indexToString({ index: currentIndex, charset: characters });

    const url = new URL(parts[0] + word + (parts[1] || ""));
    const fileName = `${formatFolderName(url.href)
      .replace(parts[0], "")
      .replace(parts[1], "")}`;

    const htmlFilepath = `${patternFolder}/html/${fileName}.html`;
    if (await fileStorage.hasItem(htmlFilepath)) {
      currentIndex += 1;
      continue;
    }
    const response = await axios.get(url.href).catch((error) => error.response);
    if (response.status === 429) {
      console.log("TOO MANY REQUEST AT " + url.href);
      await sleep(120);
    }
    if (response.status >= 500) {
      console.log("ERROR WITH " + url.href);
      await sleep(10);
      continue;
    }
    await fileStorage.setItem(htmlFilepath, response.data.toString());
    const statusFilepath = `${patternFolder}/${response.status}/${fileName}.json`;
    await fileStorage.setJson(statusFilepath, {
      href: url.href,
      status: response.status,
      statusTexT: response.statusText,
      headers: response.headers,
    });
    console.log("resolved: ", url.href);
    currentIndex += 1;
  }
};

program
  .arguments("<pattern>")
  .action((pattern) => brute(pattern).catch(console.error));
program.parse(process.argv);
