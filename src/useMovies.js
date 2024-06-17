import { useEffect, useState } from "react";

const KEY = "8e905f5";

export function useMovies(query, callback1, callback2) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(
    function () {
      //   callback1?.();
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}&page=${page}`,
            { signal: controller.signal }
          );
          if (!res.ok)
            throw new Error("Something went wrong with fetching movie Data");

          const data = await res.json();
          console.log(data);

          if (data.Response === "False") {
            // setMovies([]);
            setPage(1);
            console.log("Maybe you need to check movie title");
            throw new Error(data.Error);
          }
          setMovies(data.Search);
          setIsLoading(false);
          setError("");
        } catch (err) {
          console.error(err.message);
          if (err.name !== "AbortError") setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      if (!query.length) {
        setMovies([]);
        setError("");
        return;
      }

      fetchMovies();
      return () => controller.abort();
    },
    [page, query]
  );
  return { movies, isLoading, error, page, setPage };
}
