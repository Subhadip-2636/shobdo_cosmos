import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  PenLine,
  Save,
  Send,
  AlertCircle,
  CheckCircle2,
  FileText,
  Tags,
} from "lucide-react";


function Write({
  token,
  apiUrl,
  onPublished,
}) {
  const navigate = useNavigate();


  // =========================================================
  // FORM STATE
  // =========================================================

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [category, setCategory] =
    useState("কবিতা");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // =========================================================
  // CATEGORY OPTIONS
  // =========================================================

  const categories = [
    "কবিতা",
    "গল্প",
    "অনুভূতি",
    "প্রবন্ধ",
    "অন্যান্য",
  ];


  // =========================================================
  // TITLE CHANGE
  // =========================================================

  function handleTitleChange(event) {
    setTitle(
      event.target.value
    );

    setError("");
    setSuccess("");
  }


  // =========================================================
  // CONTENT CHANGE
  // =========================================================

  function handleContentChange(event) {
    setContent(
      event.target.value
    );

    setError("");
    setSuccess("");
  }


  // =========================================================
  // CATEGORY CHANGE
  // =========================================================

  function handleCategoryChange(event) {
    setCategory(
      event.target.value
    );

    setError("");
    setSuccess("");
  }


  // =========================================================
  // PUBLISH WRITING
  // =========================================================

  async function handlePublish(event) {
    event.preventDefault();

    setError("");
    setSuccess("");


    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!title.trim()) {
      setError(
        "লেখার একটি শিরোনাম দিন।"
      );

      return;
    }


    if (!content.trim()) {
      setError(
        "লেখার মূল অংশ খালি রাখা যাবে না।"
      );

      return;
    }


    if (!token) {
      setError(
        "লেখা প্রকাশ করতে আপনাকে Login করতে হবে।"
      );

      return;
    }


    // -------------------------------------------------------
    // START LOADING
    // -------------------------------------------------------

    setLoading(true);


    try {
      // -----------------------------------------------------
      // API REQUEST
      // -----------------------------------------------------

      const response = await fetch(
        `${apiUrl}/api/writings`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            category,
          }),
        }
      );


      // -----------------------------------------------------
      // RESPONSE
      // -----------------------------------------------------

      const data =
        await response.json();


      // -----------------------------------------------------
      // TOKEN EXPIRED / INVALID
      // -----------------------------------------------------

      if (
        response.status === 401 ||
        response.status === 422
      ) {
        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        setError(
          "আপনার Login session শেষ হয়েছে। আবার Login করুন।"
        );

        return;
      }


      // -----------------------------------------------------
      // PUBLISH FAILED
      // -----------------------------------------------------

      if (!response.ok) {
        setError(
          data.message ||
          "লেখাটি প্রকাশ করা যায়নি।"
        );

        return;
      }


      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      setSuccess(
        "আপনার লেখা সফলভাবে প্রকাশিত হয়েছে।"
      );


      // -----------------------------------------------------
      // UPDATE APP WRITINGS
      // -----------------------------------------------------

      if (
        onPublished &&
        data.writing
      ) {
        onPublished(
          data.writing
        );
      }


      // -----------------------------------------------------
      // CLEAR FORM
      // -----------------------------------------------------

      setTitle("");
      setContent("");
      setCategory("কবিতা");


      // -----------------------------------------------------
      // REDIRECT TO EXPLORE
      // -----------------------------------------------------

      setTimeout(() => {
        navigate(
          "/explore"
        );
      }, 700);

    } catch (err) {
      console.error(
        "PUBLISH ERROR:",
        err
      );

      setError(
        "Backend-এর সাথে সংযোগ করা যায়নি। Flask server চলছে কিনা পরীক্ষা করুন।"
      );

    } finally {
      setLoading(false);
    }
  }


  // =========================================================
  // SAVE DRAFT
  // =========================================================

  function handleSaveDraft() {
    setError("");

    const draft = {
      title,
      content,
      category,
      savedAt:
        new Date().toISOString(),
    };


    localStorage.setItem(
      "shobdo_draft",
      JSON.stringify(draft)
    );


    setSuccess(
      "Draft এই browser-এ সংরক্ষণ করা হয়েছে।"
    );
  }


  // =========================================================
  // WORD COUNT
  // =========================================================

  const wordCount =
    content
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .length;


  // =========================================================
  // CHARACTER COUNT
  // =========================================================

  const characterCount =
    content.length;


  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="write-page">

      <div className="write-container">


        {/* =================================================
           PAGE HEADER
           ================================================= */}

        <section className="write-header">

          <div>

            <span className="section-kicker">
              CREATE
            </span>

            <h1>
              আপনার শব্দ লিখুন
            </h1>

            <p>
              কবিতা, গল্প, অনুভূতি বা চিন্তা —
              আপনার সৃষ্টিকে SHOBDO-তে প্রকাশ করুন।
            </p>

          </div>


          <div className="write-header-icon">

            <PenLine size={28} />

          </div>

        </section>


        {/* =================================================
           WRITE FORM
           ================================================= */}

        <form
          className="write-form"
          onSubmit={
            handlePublish
          }
        >


          {/* ===============================================
             TITLE
             =============================================== */}

          <div className="write-field">

            <label
              htmlFor="writing-title"
            >
              <FileText size={17} />

              শিরোনাম
            </label>


            <input
              id="writing-title"
              type="text"

              value={title}

              onChange={
                handleTitleChange
              }

              placeholder="আপনার লেখার শিরোনাম..."

              maxLength={250}

              disabled={loading}

              className="
                write-title-input
              "
            />


            <div className="field-meta">

              <span>
                সর্বোচ্চ 250 অক্ষর
              </span>

              <span>
                {title.length}/250
              </span>

            </div>

          </div>


          {/* ===============================================
             CATEGORY
             =============================================== */}

          <div className="write-field">

            <label
              htmlFor="writing-category"
            >

              <Tags size={17} />

              বিভাগ

            </label>


            <select
              id="writing-category"

              value={category}

              onChange={
                handleCategoryChange
              }

              disabled={loading}

              className="
                write-category-select
              "
            >

              {
                categories.map(
                  (item) => (

                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>

                  )
                )
              }

            </select>

          </div>


          {/* ===============================================
             CONTENT
             =============================================== */}

          <div className="write-field">

            <label
              htmlFor="writing-content"
            >
              <PenLine size={17} />

              আপনার লেখা
            </label>


            <textarea
              id="writing-content"

              value={content}

              onChange={
                handleContentChange
              }

              placeholder="এখানে আপনার লেখা শুরু করুন..."

              disabled={loading}

              className="
                writing-editor
              "
            />


            <div className="field-meta">

              <span>
                {wordCount} শব্দ
              </span>

              <span>
                {characterCount} অক্ষর
              </span>

            </div>

          </div>


          {/* ===============================================
             ERROR
             =============================================== */}

          {error && (

            <div
              className="
                auth-error
                write-message
              "
              role="alert"
            >

              <AlertCircle
                size={18}
              />

              <span>
                {error}
              </span>

            </div>

          )}


          {/* ===============================================
             SUCCESS
             =============================================== */}

          {success && (

            <div
              className="
                auth-success
                write-message
              "
              role="status"
            >

              <CheckCircle2
                size={18}
              />

              <span>
                {success}
              </span>

            </div>

          )}


          {/* ===============================================
             ACTIONS
             =============================================== */}

          <div className="write-actions">


            {/* SAVE DRAFT */}

            <button
              type="button"

              className="
                write-secondary-button
              "

              onClick={
                handleSaveDraft
              }

              disabled={loading}
            >

              <Save size={18} />

              Draft সংরক্ষণ

            </button>


            {/* PUBLISH */}

            <button
              type="submit"

              className="
                primary-button
                write-publish-button
              "

              disabled={
                loading ||
                !title.trim() ||
                !content.trim()
              }
            >

              {
                loading ? (

                  <>

                    <span
                      className="
                        button-loader
                      "
                    />

                    প্রকাশ হচ্ছে...

                  </>

                ) : (

                  <>

                    <Send
                      size={18}
                    />

                    প্রকাশ করুন

                  </>

                )
              }

            </button>

          </div>

        </form>

      </div>

    </main>
  );
}


export default Write;