$(document).ready(function () {

    const RESTCountriesURL = " https://restcountries.eu/rest/v2/all";

    const countryFlagsURL = "https://www.countryflags.io";

    // Get a list of countries
    // Use country code to get their flags
    // Use country name and flag to dynamically create div and insert it in #countries_container
    $.get(RESTCountriesURL, function (countries) {

        // Map over countries and for each country use jquery to create a div with the country flag and name
        countries.map((country, countryIdx) => {
            // Destruct the country object
            // Same as:
            // const countryName = country.name
            // const countryCode = country.alpha2Code
            const {
                name: countryName,
                alpha2Code: countryCode
            } = country;

            // Per https://www.countryflags.io/, to get a country flag image by its country code we just need to use <img src="https://www.countryflags.io/:country_code/:style/:size.png">
            const flagImgSrc = `${countryFlagsURL}/${countryCode}/flat/64.png`;

            // Use jQuery to create the <div class='country_flag_container><img class='country_flag'/></div> for country flag
            const countryFlagContainerDiv = $('<div></div>').addClass('country_flag_container')
            const countryFlagImgElement = $('<img/>').addClass('country_flag').attr('src', flagImgSrc).attr('alt', `Flag of ${countryName}`);
            countryFlagContainerDiv.append(countryFlagImgElement);

            // Use jQuery to create <p class='country_name'></p> for country name
            const countryNameParagraphElement = $('<p></p>').addClass('country_name').text(`${countryName}`);

            // Use jQuery to create <div class='country'></div> with flag image and name text
            const countryDivElement = $('<div></div>').addClass('country').append(countryFlagContainerDiv).append(countryNameParagraphElement);

            // Select the first country
            // After we will be selecting a country when the user clicks on it
            if (countryIdx === 0) {

                // Iniatially set the first country to be selected
                countryDivElement.addClass('selected_country')

                // For selected country, use shinny flags. So set first country flag to be shiny since it's selected by default
                toggleFlatAndShinny(countryDivElement);

                // Initially populate #selected_country_name
                $('#selected_country_name').text(countryName)

                // Initially get top 10 songs for #selected_country_name
                getTo10SongsByCountryName(countryName);
            }

            // Use jQuery to append the country div to #countries_container
            $('#countries_container').append(countryDivElement)
        })

    })

    // Listen to user clicking on a country by delegation
    $('body').on('click', '.country', (event) => {

        // Change which country is selected
        toggleSelectedCountry(event);

        const clickedCountryName = getClickedCountryName(event);
        getTo10SongsByCountryName(clickedCountryName)
    })
})

function toggleFlatAndShinny(selectedCountryDivElemet) {
    let selectedCountryFlagImgSrc = $($(selectedCountryDivElemet).find('.country_flag')[0]).attr('src');

    if (selectedCountryFlagImgSrc.indexOf('flat') !== -1) {
        selectedCountryFlagImgSrc = selectedCountryFlagImgSrc.replace("flat", "shiny")
    } else if (selectedCountryFlagImgSrc.indexOf('shiny') !== -1) {
        selectedCountryFlagImgSrc = selectedCountryFlagImgSrc.replace("shiny", "flat")
    }

    $($(selectedCountryDivElemet).find('.country_flag')[0]).attr('src', selectedCountryFlagImgSrc);
}

function toggleSelectedCountry(event) {
    event.stopPropagation();

    // Remove the .selected_country class from the previously selected country 
    const selectedCountryElement = $('.selected_country')[0];
    $(selectedCountryElement).removeClass('selected_country')

    // Switch flag to flat for the previously selected country
    toggleFlatAndShinny(selectedCountryElement);

    // Add the .selected_country class to the clicked country
    $(event.currentTarget).addClass('selected_country')

    // Set selected country's flag to shinny
    toggleFlatAndShinny(event.currentTarget)

    // Update the #selected_country_name with the country name of the clicked country
    const clickedCountryName = getClickedCountryName(event);

    $('#selected_country_name').text(clickedCountryName);
}

function getClickedCountryName(event) {
    // Use jQuery to get the country name text
    const clickedCountryNameParagraphElement = $(event.currentTarget).children('.country_name')[0];

    const clickedCountryName = $(clickedCountryNameParagraphElement).text();

    return clickedCountryName;
}

function getTo10SongsByCountryName(countryName) {
    // Use Last.fm API to get to 10 songs in selected country
    // For country names with spaces have to have + sign instead of space
    const lastFMGeoTopTrackAPIUrlRoot = "https://ws.audioscrobbler.com/2.0/?method=geo.gettoptracks&api_key=91275a5de31798739413228de2956825&format=json";

    const formattedCountryName = getFormattedCountryName(countryName);

    let top10TrackAPIUrl = `${lastFMGeoTopTrackAPIUrlRoot}&limit=10&country=${formattedCountryName}`;

    $.get(top10TrackAPIUrl, function (data) {
        // When the api has no tracks for this country name it will respond with either
        // data: {error} or 
        // data: {tracks: track:[]} where the track array is empty
        // Check for these 2 cases and let the user know that we Last.fm has no tracks in this country
        if (data.error || data.tracks.track.length === 0) {
            const noSongsHTML = `<div class="no_songs_found">
            <div class="container">
              <h4 class="no_songs_found_text">No found songs in ${countryName}</h4>
              <p class="lead">Last.fm API could not find any songs in ${countryName}</p>
            </div>
          </div>`

            // First empty the content in #top_10_songs_container
            $('#top_10_songs_container').empty();

            $('#top_10_songs_container').html(noSongsHTML)
        } else {
            // Empty #top_10_songs_container first
            $('#top_10_songs_container').empty();

            // We have songs in data.tracks.track array
            const top10Songs = data.tracks.track;

            // Map over the songs and extract
            // song name
            // song url
            // artist name
            // artist url
            // Use jQuery to dynamically create a Bootstrap card for each song and append it in #top_10_songs_container

            const top10SongsContent = $('<div></div>').attr('id', 'top_10_songs_content');

            top10Songs.map((song, idx) => {
                // Destructure name and url out of song object and rename them to songName and songUrl
                // Same as:
                // const songName = song.name;
                // const songUrl = song.url;
                const {
                    name: songName,
                    url: songUrl
                } = song;

                const {
                    name: artistName,
                    url: artistUrl
                } = song.artist;

                // Use jQuery to dynamically create a Bootstrap card for each song
                const songCard = `<div class="card song_card" style="width: 18rem;">
                <div class="card-body" style="background-color:${getRandomColor()};">
                  <h5 class="card-title song">No.${idx + 1}: ${songName} by <span class="song_card_artist_name">${artistName}</span></h5>
                  <div class='song_card_buttons'>
                  <a href=${songUrl} class="btn btn-primary song_card_btn">Play</a>
                  <a href=${artistUrl} class="btn btn-primary song_card_btn">More from ${artistName}</a>
                  </div>
                </div>
              </div>`;



                top10SongsContent.append(songCard)

            })
            $('#top_10_songs_container').append(top10SongsContent)
        }



    })


}

function getFormattedCountryName(countryName) {
    // Gets a country name (from RESTCountries API)
    // Returns a country name formatted to match the expected format for the Last.fm API

    let newFormattedCountryName = countryName.trim();

    // Some countries have paranthesis. Remove them
    newFormattedCountryName = removeCharacters({
        string: newFormattedCountryName,
        charsToBeRemoved: '('
    })

    // Some countries have commas. Remove them
    newFormattedCountryName = removeCharacters({
        string: newFormattedCountryName,
        charsToBeRemoved: ','
    })

    // Some countries have "of". Remove them
    newFormattedCountryName = removeCharacters({
        string: newFormattedCountryName,
        charsToBeRemoved: "of"
    })

    // Replace spaces with + signs
    newFormattedCountryName = newFormattedCountryName.replace(/ /g, '+');

    return newFormattedCountryName;
}

function removeCharacters({
    string,
    charsToBeRemoved
}) {

    // Takes a string and characters to be removed
    // Returns a string without those characters

    let newString = string
    const charsToBeRemovedIdx = newString.indexOf(charsToBeRemoved);

    if (charsToBeRemovedIdx !== -1) {
        newString = newString.substring(0, charsToBeRemovedIdx)
    }

    return newString.trim();
}

// Copied from https://stackoverflow.com/questions/1484506/random-color-generator
function getRandomColor() {
    // Generates a random hex color and returns it

    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}