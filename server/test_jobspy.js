const payload = {
  site_name: ["linkedin"],
  search_term: "Mulesoft Developer",
  location: "India",
  results_wanted: 1,
  description_format: "markdown",
  linkedin_fetch_description: true,
  is_remote: true,
  country_indeed: "India"
};

fetch('https://job-spy-3fe8fe2a175c.herokuapp.com/api/v1/search_jobs', {
  method: 'POST',
  headers: {
    'accept': 'application/json',
    'x-api-key': '5ec5c66997b7e54c99191a700d20280e',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
})
.then(r => r.json())
.then(data => {
    if (data.jobs && data.jobs.length > 0) {
        console.log("Description:", JSON.stringify(data.jobs[0].description).substring(0, 500));
    }
})
.catch(e => console.error(e));
