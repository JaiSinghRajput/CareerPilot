const validCountries = new Set([
  "usa", "uk", "canada", "india", "australia", "new zealand", 
  "south africa", "singapore", "malaysia", "philippines", 
  "ireland", "germany", "france", "spain", "italy", "mexico", 
  "brazil", "argentina", "colombia", "chile", "peru", "uae", 
  "saudi arabia", "qatar", "kuwait", "oman", "bahrain"
]);

let countryIndeed = "india"; // default

const extractValidCountry = (locString: string) => {
  const parts = locString.split(',').map(p => p.trim().toLowerCase());
  const lastPart = parts[parts.length - 1];
  if (lastPart && validCountries.has(lastPart)) {
    return lastPart;
  }
  return null;
};

const overrideLocation = "delhi";
const valid = extractValidCountry(overrideLocation);
if (valid) countryIndeed = valid;

console.log("countryIndeed:", countryIndeed);
