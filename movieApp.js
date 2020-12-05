const MOVIE_DB_ENDPOINT_BASE = "https://api.themoviedb.org/3";
const API_KEY = "54ca86c53d1d3e2572b5b349f708352e";
const MAX_RATING = 5;

//funcao para criar os cards dos filmes em destaque
function GetNowPlaying(){
    $.ajax({
        url: MOVIE_DB_ENDPOINT_BASE+'/movie/now_playing',
        method: 'GET',
        data: {
            api_key: API_KEY
        }
    }).done(function (data){

        let carousel = $('#carouselNowPlaying');
        let codigoHtml = '';

        // console.log(data.results);

        for (let index = 0; index < data.results.length; index++) {
            const element = data.results[index];

            let movieCard = new Movie(element.original_title,element.original_language,element.popularity,
                element.poster_path,element.release_date);

            let img = `https://image.tmdb.org/t/p/w${300}/${movieCard.poster_path}`;
            
            let imgHtml;

            if (element.video) {
                imgHtml = `                        
                <iframe
                    src="https://www.youtube.com/embed/EIzazUv2gtI?version=3&autoplay=1&controls=0&&showinfo=0&loop=1"
                    frameborder="0" allowfullscreen>
                </iframe>`;
            }else{
                imgHtml = `
                <img src="${img}" alt="${movieCard.original_title}" ">
                `;
            }

            let rating = parseInt((parseInt(element.vote_average)/10)*MAX_RATING);
            
            let ratingHtml ="";

            for (let index = 0; index < MAX_RATING; index++) {
                const element = rating;
                if (index <= rating) {
                    ratingHtml += '<span class="fa fa-star checked"></span>';
                }else{
                    ratingHtml += '<span class="fa fa-star"></span>';
                }
            }

            // console.log(`my rating : ${rating}`);


            $.ajax({
                url: MOVIE_DB_ENDPOINT_BASE+`/movie/${element.id}/credits`,
                method: 'GET',
                data: {
                    api_key: API_KEY
                }
            }).done(function (credit){

                let cast = credit.cast;
                let crew = credit.crew;

                let castString = "";

                let maxCast = Math.min(cast.length,5);

                for (let iCast = 0; iCast < maxCast; iCast++) {
                    const castMemeber = cast[iCast];
                    castString += `${((castString=="")?'':'| ')}${castMemeber.name} `;
                }

                let directorsString = "";
                let screenplayString = "";

                for (let iCrew = 0; iCrew < crew.length; iCrew++) {
                    const crewMember = crew[iCrew];

                    if(crewMember.job == 'Director')
                        directorsString += `${((directorsString=="")?'':'| ')}${crewMember.name} `;

                    if(crewMember.job == 'Screenplay' || crewMember.job == 'Writer' || crewMember.job == 'Storyboard')
                        screenplayString += `${((screenplayString=="")?'':'| ')}${crewMember.name} `;

                }

                // console.log(`${movieCard.original_title}:director: ${directorsString}`)

                // console.log(`Cast: ${JSON.stringify(cast)}`);
                // console.log(`Crew: ${JSON.stringify(crew)}`);

                codigoHtml += `
                <div class="container carousel-item ${(index==0)?"active":""}">
                    <div class="movie row">
                        <div class="video col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6">
                            ${imgHtml}
                        </div>
                        <div class="video_text col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6">
                            <h1>${movieCard.original_title}</h1>
                            <p><span class="categoria">Sinopse:</span> ${element.overview}</p>
                            <p><span class="categoria">Diretor:</span> ${directorsString}</p>
                            <p><span class="categoria">Roteiro:</span> ${(screenplayString == '')?directorsString :screenplayString}</p>
                            <p><span class="categoria"> Estreia:</span> ${movieCard.release_date}</p>
                            <p><span class="categoria"> Elenco:</span> ${castString}</p>
                            <p><span class="categoria"> Avaliacao:</span>
                                ${ratingHtml}
                            </p>
                        </div>
                    </div>
                </div>
            
                `;
                carousel.html(codigoHtml);
            });

        }



    });

}

function GetMovieGenres(){
    $.ajax({
        url: MOVIE_DB_ENDPOINT_BASE+'/genre/movie/list',
        data: {
            api_key: API_KEY

        }
    }).done(function (data){
        console.log(`Success:`);
        let codigoHtml = '';
        let div = $('#movieGenreDrop');

        for (let index = 0; index < data.genres.length; index++) {
            const element = data.genres[index];
            codigoHtml += `<a id="${element.id}" class="dropdown-item" href="#">${element.name}</a>`;
            // console.log(codigoHtml);
        }

        div.html(codigoHtml);

        $('.dropdown-item').click((event) => {
            SelectGenre(event.target.id,event.target.text);
            event.preventDefault();
        });

        SelectGenre(data.genres[0].id,data.genres[0].name)

        return data;
    });

}

function SelectGenre(id,name){
    movieByGenreCount = 6;

    let genre={
        "id": id,
        "name": name
    };

    // console.log(JSON.stringify(genre));

    selectedGenreId = genre.id;

    $('#selectedGenreDisplay').text(`Genre: ${name}`);

    GetMoviesByGenre(genre.id,movieByGenreCount);

}

class Movie {
    constructor(original_title,original_language,popularity,poster_path,release_date){
        this.original_title = original_title;
        this.original_language = original_language;
        this.popularity = popularity;
        this.poster_path = poster_path;
        this.release_date = release_date;
    }
}

function GetSearchMovies(searchText,movieLimit){
    $.ajax({
        url: MOVIE_DB_ENDPOINT_BASE+'/search/movie',
        data: {
            api_key: API_KEY,
            query: searchText

        }
    }).done(function (data){
        console.log(`Success: Search for ${searchText}`);
        let codigoHtml = '';
        let div = $('#SearchMovies');
        let movies = [];

        let maxMovieSize = Math.min(data.results.length,movieLimit);

        for (let index = 0; index < maxMovieSize; index++) {
            const element = data.results[index];

            let movieCard = new Movie(element.original_title,element.original_language,element.popularity,
                element.poster_path,element.release_date);

            movies[index] = movieCard;

            let width = 400;

            let img = `https://image.tmdb.org/t/p/w${width}/${movieCard.poster_path}`;

            codigoHtml += `
            <div class="col-4 flip-card">
                <div class="flip-card-inner">
                    <div class="flip-card-front">
                        <img src="${img}" alt="${movieCard.original_title}" style="width:${width}px;height:${width}px;">
                    </div>
                    <div class="flip-card-back">
                        <h1>${movieCard.original_title}</h1>
                        <p>Lingua Original: ${movieCard.original_language}</p>
                        <p>Popularidade: ${movieCard.original_title}</p>
                        <p>Data de lançamento: ${movieCard.release_date}</p>
                    </div>
                </div>
            </div>`;

        }

        div.html(codigoHtml);

        // console.log(movies);

        // div.html(codigoHtml);

        // $('.dropdown-item').click((event) => {
        //     SelectGenre(event.target.id,event.target.text);
        //     event.preventDefault();
        // });

        // return data;
    });
}

function GetMoviesByGenre(genreId,movieLimit){
    $.ajax({
        url: MOVIE_DB_ENDPOINT_BASE+'/discover/movie',
        data: {
            api_key: API_KEY,
            with_genres: genreId

        }
    }).done(function (data){
        console.log(`Success:}`);
        let codigoHtml = '';
        let div = $('#FeaturedMovies');
        let movies = [];

        let maxMovieSize = Math.min(data.results.length,movieLimit);

        for (let index = 0; index < maxMovieSize; index++) {
            const element = data.results[index];

            let movieCard = new Movie(element.original_title,element.original_language,element.popularity,
                element.poster_path,element.release_date);

            movies[index] = movieCard;

            let width = 400;

            let img = `https://image.tmdb.org/t/p/w${width}/${movieCard.poster_path}`;

            codigoHtml += `
            <div class="col-4 flip-card">
                <div class="flip-card-inner">
                    <div class="flip-card-front">
                        <img src="${img}" alt="${movieCard.original_title}" style="width:${width}px;height:${width}px;">
                    </div>
                    <div class="flip-card-back">
                        <h1>${movieCard.original_title}</h1>
                        <p>Lingua Original: ${movieCard.original_language}</p>
                        <p>Popularidade: ${movieCard.original_title}</p>
                        <p>Data de lançamento: ${movieCard.release_date}</p>
                    </div>
                </div>
            </div>`;

        }

        div.html(codigoHtml);

        // console.log(movies);

        // div.html(codigoHtml);

        // $('.dropdown-item').click((event) => {
        //     SelectGenre(event.target.id,event.target.text);
        //     event.preventDefault();
        // });

        // return data;
    });
}

var selectedGenreId = 0;
var movieByGenreCount = 6;

$(document).ready( () => {
    console.log("Cine Junkies is Ready!");

    console.log("Loading Movie Genres");
    var genres = GetMovieGenres();

    GetNowPlaying();

    $('#moreMoviesByCategory').click(() => {
        movieByGenreCount += 6;
        console.log(`Mostrar ${movieByGenreCount} filmes`);

        GetMoviesByGenre(selectedGenreId,movieByGenreCount);
    });

    $('#btnSearch').click((event) => {
        let searchText = $('#pesquisa').val();
        GetSearchMovies(searchText,3);
        event.preventDefault();
    });

});