import {
  useEffect,
  useState,
} from "react";

import {
  Bookmark,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import {
  getSavedWritings,
} from "../api/api";

import WritingCard from "../components/WritingCard";


function Saved() {

  const [
    writings,
    setWritings,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  async function loadSavedWritings() {

    setLoading(true);
    setError("");


    try {

      const data =
        await getSavedWritings({
          page: 1,
          perPage: 50,
        });


      const items =
        Array.isArray(
          data?.saved_writings
        )
          ? data.saved_writings
          : [];


      const extractedWritings =
        items
          .map(
            (item) =>
              item?.writing
          )
          .filter(Boolean);


      setWritings(
        extractedWritings
      );


    } catch (error) {

      console.error(
        "LOAD SAVED WRITINGS ERROR:",
        error
      );


      setError(
        error?.message ||
        "Unable to load your saved writings."
      );


    } finally {

      setLoading(false);

    }

  }


  useEffect(
    () => {

      loadSavedWritings();

    },
    []
  );


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <main className="saved-page">

        <div className="saved-page-container">

          <div className="saved-page-status">

            <LoaderCircle
              className="saved-page-spinner"
              size={34}
            />

            <h2>
              Loading saved writings...
            </h2>

          </div>

        </div>

      </main>

    );

  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {

    return (

      <main className="saved-page">

        <div className="saved-page-container">

          <div className="saved-page-status">

            <Bookmark
              size={38}
            />

            <h2>
              Unable to load saved writings
            </h2>

            <p>
              {error}
            </p>

            <button
              type="button"
              className="saved-page-refresh"
              onClick={
                loadSavedWritings
              }
            >

              <RefreshCw
                size={17}
              />

              Try again

            </button>

          </div>

        </div>

      </main>

    );

  }


  return (

    <main className="saved-page">

      <div className="saved-page-container">


        {/* =============================================
            HEADER
        ============================================== */}

        <header className="saved-page-header">

          <div className="saved-page-heading-icon">

            <Bookmark
              size={26}
            />

          </div>


          <div>

            <h1>
              Saved Writings
            </h1>

            <p>
              Writings you have bookmarked for later.
            </p>

          </div>

        </header>


        {/* =============================================
            EMPTY
        ============================================== */}

        {
          writings.length === 0
            ? (

                <section className="saved-page-empty">

                  <Bookmark
                    size={42}
                  />

                  <h2>
                    No saved writings yet
                  </h2>

                  <p>
                    Save poems, stories and articles
                    and they will appear here.
                  </p>

                </section>

              )
            : (

                <>

                  <div className="saved-page-summary">

                    <strong>
                      {writings.length}
                    </strong>

                    <span>
                      saved {
                        writings.length === 1
                          ? "writing"
                          : "writings"
                      }
                    </span>

                  </div>


                  <section className="saved-writings-grid">

                    {
                      writings.map(
                        (writing) => (

                          <WritingCard
                            key={
                              writing.id
                            }
                            writing={
                              writing
                            }
                          />

                        )
                      )
                    }

                  </section>

                </>

              )
        }

      </div>

    </main>

  );

}


export default Saved;