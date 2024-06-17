import { useRef, useState } from "react";
import { useEffect } from "react";
import "./index.css";
import StarRating from "./starRating.js";
import { useMovies } from "./useMovies.js";
const KEY = "8e905f5";
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // const [watched, setWatched] = useState([]);

  const [watched, setWatched] = useState(() =>
    JSON.parse(localStorage.getItem("watchedList"))
  );
  const { movies, isLoading, error, page, setPage } = useMovies(
    query,
    handleDeSelection
    // handleNewPage
  );
  // const [ifAdded, setIfAdded] = useState(false);
  // const [localItems, setLocalItems] = useState([]);
  function handleSelectedMovie(id) {
    // setSelectedId(id);
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  useEffect(() => {
    document.title = selectedId
      ? `${movies.filter((m) => m.imdbID === selectedId)[0].Title}`
      : "usePopcorn";
  }, [movies, selectedId]);

  function handleDeSelection() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
    console.log(watched);
    setSelectedId(null);
    // localStorage.setItem("watchedList", JSON.stringify([...watched, movie]));
  }

  useEffect(() => {
    localStorage.setItem("watchedList", JSON.stringify(watched));
  }, [watched]);

  // useEffect(() => {
  //   const items = JSON.parse(localStorage.getItem("watched"));
  //   console.log("items", items);
  //   if (items) setWatched(items);
  // }, []);

  useEffect(function () {
    const items = JSON.parse(localStorage.getItem("watchedList"));
    if (items) {
      setWatched(items);
    }
  }, []);

  function handleDeleteFromWatchedList(id) {
    // const index = watched.map((m) => m.imdbID).indexOf(id);
    // setWatched((watched) =>
    //   watched.slice(0, index).concat(watched.slice(index + 1))
    // );

    setWatched((watched) => watched.filter((m) => m.imdbID !== id));
  }

  function handleNewPage() {
    setPage((page) => page + 1);
  }

  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} />
        <p className="num-results">
          Found <strong>{movies?.length}</strong> results
        </p>
      </Navbar>

      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />}</Box> */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <>
              <MovieList
                movies={movies}
                onSelectedMovie={handleSelectedMovie}
              />
              {movies.length > 0 && (
                <button onClick={handleNewPage}>Page: {page}</button>
              )}
            </>
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onhandleDeSelection={handleDeSelection}
              onhandleAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <Summary watched={watched}></Summary>
              <WatchedMovie
                watched={watched}
                onDeleteFromWatchedList={handleDeleteFromWatchedList}
              ></WatchedMovie>
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>❌</span>
      {message}
    </p>
  );
}

function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
      </div>

      {children}
    </nav>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useEffect(() => {
    // inputEl.current.focus({ focusVisible: true });
    function focusQuery(e) {
      // if (document.activeElement === inputEl.current) return;
      e.code === "Enter" && inputEl.current.focus();
      // setQuery("");
    }
    // ["click", "keydown"].forEach((e) => {
    //   document.addEventListener(e, focusQuery);
    // });
    document.addEventListener("keydown", focusQuery);
    // return () => document.removeEventListener("keydown", focusQuery);
  }, []);

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function MovieList({ movies, onSelectedMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          onSelectedMovie={onSelectedMovie}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectedMovie }) {
  return (
    <li onClick={() => onSelectedMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({
  selectedId,
  onhandleDeSelection,
  onhandleAddWatched,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);

  // const countRef = useRef(0);

  useEffect(() => {}, []);
  const inList = watched
    ?.map((watchedMovie) => watchedMovie.imdbID)
    .includes(selectedId);

  // Prettier ignore
  const {
    Title: title,

    imdbRating: rating,
    Plot: plot,
    Poster: poster,
    Released: released,
    Runtime: runtime,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newMovie = {
      imdbID: selectedId,
      poster,
      title,
      imdbRating: Number(rating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };

    console.log("newMovie", newMovie);
    onhandleAddWatched(newMovie);
  }

  useEffect(() => {
    async function getMovieDetails() {
      setIsLoading(true);
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
      );
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    }
    getMovieDetails();
  }, [selectedId]);

  useEffect(() => {
    function handleEscape(e) {
      e.key === "Escape" && onhandleDeSelection();
      console.log("closing");
    }
    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, [onhandleDeSelection]);

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onhandleDeSelection}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${title}`} />
            <div className="details-overview">
              <h2>{title}</h2>

              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {rating}
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!inList ? (
                <>
                  <StarRating maxRating={10} value={userRating}></StarRating>
                  <button
                    value={userRating}
                    className="btn-add"
                    onClick={(e) => {
                      handleAdd(movie);
                      setUserRating(() => e.target.value);
                    }}
                  >
                    + Add to List
                  </button>
                </>
              ) : (
                <span>Added to watched list. 🔥</span>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Actors : {actors}</p>
            <p>Directed by : {director}</p>
          </section>
        </>
      )}
    </div>
  );
}
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

// function WatchedBox({ watched }) {
//   const [isOpen2, setIsOpen2] = useState(true);
//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (
//         <>
//           <Summary watched={watched} />
//           <WatchedMovie watched={watched} />
//         </>
//       )}
//     </div>
//   );
// }

function Summary({ watched }) {
  const avgImdbRating = average(watched?.map((movie) => movie.imdbRating));
  // const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched?.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{Number(avgImdbRating.toFixed(1))}</span>
        </p>
        {/* <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p> */}
        <p>
          <span>⏳</span>
          <span>{+avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovie({ watched, onDeleteFromWatchedList }) {
  return (
    <ul className="list">
      {watched?.map((movie) => (
        <li key={movie.imdbID}>
          <img src={movie.poster} alt={`${movie.title} poster`} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>{movie.title}</h2>
            <button
              className="btn-delete"
              onClick={() => onDeleteFromWatchedList(movie.imdbID)}
            >
              X
            </button>
          </div>
          <div>
            <p>
              <span>⭐️</span>
              <span>{movie.imdbRating}</span>
            </p>
            {/* <p>
              <span>🌟</span>
              <span>{movie.userRating}</span>
            </p> */}
            <p>
              <span>⏳</span>
              <span>{movie.runtime} min</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
