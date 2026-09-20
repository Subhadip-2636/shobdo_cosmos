import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Gauge,
  Pause,
  Play,
  RotateCcw,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";

import "./WritingAudioPlayer.css";


// =========================================================
// LANGUAGE CONFIG
// =========================================================

const LANGUAGE_CONFIG = {
  bn: {
    locale: "bn-IN",
    listen: "শুনুন",
    pause: "বিরতি",
    resume: "আবার শুনুন",
    stop: "বন্ধ করুন",
    restart: "আবার শুরু করুন",
    speed: "গতি",
    unsupported:
      "এই ব্রাউজারে Text-to-Speech সমর্থিত নয়।",
    unavailable:
      "এই ভাষার উপযুক্ত কণ্ঠ এই ডিভাইসে পাওয়া যায়নি।",
    error:
      "অডিও চালানো যায়নি।",
    listening:
      "পড়া হচ্ছে",
  },

  hi: {
    locale: "hi-IN",
    listen: "सुनें",
    pause: "रोकें",
    resume: "जारी रखें",
    stop: "बंद करें",
    restart: "फिर से शुरू करें",
    speed: "गति",
    unsupported:
      "यह ब्राउज़र Text-to-Speech का समर्थन नहीं करता।",
    unavailable:
      "इस भाषा के लिए उपयुक्त आवाज़ उपलब्ध नहीं है।",
    error:
      "ऑडियो चलाया नहीं जा सका।",
    listening:
      "पढ़ा जा रहा है",
  },

  en: {
    locale: "en-IN",
    listen: "Listen",
    pause: "Pause",
    resume: "Resume",
    stop: "Stop",
    restart: "Restart",
    speed: "Speed",
    unsupported:
      "Text-to-Speech is not supported by this browser.",
    unavailable:
      "A suitable voice is not available on this device.",
    error:
      "Unable to play this writing.",
    listening:
      "Reading",
  },

  as: {
    locale: "as-IN",
  },

  or: {
    locale: "or-IN",
  },

  od: {
    locale: "or-IN",
  },

  ta: {
    locale: "ta-IN",
  },

  te: {
    locale: "te-IN",
  },

  ml: {
    locale: "ml-IN",
  },

  kn: {
    locale: "kn-IN",
  },

  gu: {
    locale: "gu-IN",
  },

  mr: {
    locale: "mr-IN",
  },

  pa: {
    locale: "pa-IN",
  },

  ur: {
    locale: "ur-IN",
  },
};


const SPEED_OPTIONS = [
  0.75,
  1,
  1.25,
  1.5,
];


// =========================================================
// TEXT HELPERS
// =========================================================

function cleanText(
  value
) {

  return String(
    value || ""
  )
    .replace(
      /<br\s*\/?>/gi,
      "\n"
    )
    .replace(
      /<\/p>/gi,
      "\n"
    )
    .replace(
      /<[^>]*>/g,
      " "
    )
    .replace(
      /&nbsp;/gi,
      " "
    )
    .replace(
      /&amp;/gi,
      "&"
    )
    .replace(
      /&quot;/gi,
      "\""
    )
    .replace(
      /&#39;/gi,
      "'"
    )
    .replace(
      /\r/g,
      ""
    )
    .replace(
      /[ \t]+/g,
      " "
    )
    .replace(
      /\n{3,}/g,
      "\n\n"
    )
    .trim();
}


// =========================================================
// CHUNK LONG WRITINGS
// =========================================================

function splitLongPart(
  text,
  maxLength
) {

  const result = [];

  let remaining =
    String(
      text || ""
    ).trim();


  while (
    remaining.length >
    maxLength
  ) {

    let splitAt =
      remaining.lastIndexOf(
        " ",
        maxLength
      );


    if (
      splitAt <
      Math.floor(
        maxLength * 0.55
      )
    ) {

      splitAt =
        maxLength;
    }


    const part =
      remaining
        .slice(
          0,
          splitAt
        )
        .trim();


    if (
      part
    ) {

      result.push(
        part
      );
    }


    remaining =
      remaining
        .slice(
          splitAt
        )
        .trim();
  }


  if (
    remaining
  ) {

    result.push(
      remaining
    );
  }


  return result;
}


function chunkText(
  value,
  maxLength = 220
) {

  const text =
    cleanText(
      value
    );


  if (
    !text
  ) {

    return [];
  }


  const sentences =
    text
      .split(
        /(?<=[.!?।॥])\s+|\n+/u
      )
      .map(
        (
          sentence
        ) =>
          sentence.trim()
      )
      .filter(Boolean);


  const chunks = [];

  let current =
    "";


  function pushCurrent() {

    if (
      current.trim()
    ) {

      chunks.push(
        current.trim()
      );

      current =
        "";
    }
  }


  sentences.forEach(
    (
      sentence
    ) => {

      if (
        sentence.length >
        maxLength
      ) {

        pushCurrent();


        splitLongPart(
          sentence,
          maxLength
        ).forEach(
          (
            part
          ) => {

            chunks.push(
              part
            );
          }
        );


        return;
      }


      const candidate =
        current
          ? `${current} ${sentence}`
          : sentence;


      if (
        candidate.length <=
        maxLength
      ) {

        current =
          candidate;

      } else {

        pushCurrent();

        current =
          sentence;
      }

    }
  );


  pushCurrent();


  return chunks;
}


// =========================================================
// VOICE SELECTION
// =========================================================

function normalizeLanguage(
  value
) {

  return String(
    value || "en"
  )
    .trim()
    .toLowerCase()
    .replace(
      "_",
      "-"
    );
}


function getBaseLanguage(
  value
) {

  return normalizeLanguage(
    value
  ).split("-")[0];
}


function chooseVoice(
  voices,
  locale
) {

  if (
    !Array.isArray(
      voices
    ) ||
    voices.length === 0
  ) {

    return null;
  }


  const normalizedLocale =
    normalizeLanguage(
      locale
    );


  const baseLanguage =
    getBaseLanguage(
      normalizedLocale
    );


  // Exact locale match first.
  const exact =
    voices.find(
      (
        voice
      ) =>
        normalizeLanguage(
          voice.lang
        ) ===
        normalizedLocale
    );


  if (
    exact
  ) {

    return exact;
  }


  // Then any voice of the same language.
  const sameLanguage =
    voices.find(
      (
        voice
      ) =>
        getBaseLanguage(
          voice.lang
        ) ===
        baseLanguage
    );


  if (
    sameLanguage
  ) {

    return sameLanguage;
  }


  return null;
}


// =========================================================
// COMPONENT
// =========================================================

function WritingAudioPlayer({
  writingId,
  title = "",
  content = "",
  writingLanguage = "bn",
}) {

  const synthesisRef =
    useRef(
      null
    );


  const utteranceRef =
    useRef(
      null
    );


  const chunksRef =
    useRef(
      []
    );


  const chunkIndexRef =
    useRef(
      0
    );


  const runIdRef =
    useRef(
      0
    );


  const mountedRef =
    useRef(
      true
    );


  const ownsSpeechRef =
    useRef(
      false
    );


  const instanceIdRef =
    useRef(
      Symbol(
        `shobdo-audio-${writingId || "writing"}`
      )
    );


  const [
    supported,
    setSupported,
  ] = useState(
    true
  );


  const [
    voices,
    setVoices,
  ] = useState(
    []
  );


  const [
    status,
    setStatus,
  ] = useState(
    "idle"
  );


  const [
    speed,
    setSpeed,
  ] = useState(
    1
  );


  const [
    currentChunk,
    setCurrentChunk,
  ] = useState(
    0
  );


  const [
    totalChunks,
    setTotalChunks,
  ] = useState(
    0
  );


  const [
    errorMessage,
    setErrorMessage,
  ] = useState(
    ""
  );


  // =======================================================
  // LANGUAGE
  // =======================================================

  const languageCode =
    useMemo(
      () =>
        getBaseLanguage(
          writingLanguage
        ),
      [
        writingLanguage,
      ]
    );


  const languageConfig =
    LANGUAGE_CONFIG[
      languageCode
    ] ||
    LANGUAGE_CONFIG.en;


  const englishLabels =
    LANGUAGE_CONFIG.en;


  const labels =
    languageCode === "bn" ||
    languageCode === "hi" ||
    languageCode === "en"
      ? languageConfig
      : {
          ...englishLabels,
          locale:
            languageConfig.locale ||
            writingLanguage ||
            "en-IN",
        };


  const locale =
    languageConfig.locale ||
    writingLanguage ||
    "en-IN";


  // =======================================================
  // FULL SPEECH TEXT
  // =======================================================

  const speechText =
    useMemo(
      () => {

        const safeTitle =
          cleanText(
            title
          );


        const safeContent =
          cleanText(
            content
          );


        if (
          safeTitle &&
          safeContent
        ) {

          return (
            `${safeTitle}. ${safeContent}`
          );
        }


        return (
          safeContent ||
          safeTitle
        );

      },
      [
        title,
        content,
      ]
    );


  // =======================================================
  // CURRENT VOICE
  // =======================================================

  const selectedVoice =
    useMemo(
      () =>
        chooseVoice(
          voices,
          locale
        ),
      [
        voices,
        locale,
      ]
    );


  // =======================================================
  // LOAD SPEECH ENGINE + VOICES
  // =======================================================

  useEffect(
    () => {

      if (
        typeof window ===
          "undefined" ||
        !(
          "speechSynthesis" in
          window
        ) ||
        typeof SpeechSynthesisUtterance ===
          "undefined"
      ) {

        setSupported(
          false
        );

        return undefined;
      }


      const synthesis =
        window.speechSynthesis;


      synthesisRef.current =
        synthesis;


      function loadVoices() {

        const availableVoices =
          synthesis.getVoices();


        setVoices(
          Array.isArray(
            availableVoices
          )
            ? availableVoices
            : []
        );
      }


      loadVoices();


      synthesis.addEventListener?.(
        "voiceschanged",
        loadVoices
      );


      if (
        "onvoiceschanged" in
        synthesis
      ) {

        synthesis.onvoiceschanged =
          loadVoices;
      }


      return () => {

        synthesis.removeEventListener?.(
          "voiceschanged",
          loadVoices
        );


        if (
          synthesis.onvoiceschanged ===
          loadVoices
        ) {

          synthesis.onvoiceschanged =
            null;
        }
      };

    },
    []
  );


  // =======================================================
  // STOP
  // =======================================================

  const stopPlayback =
    useCallback(
      (
        resetPosition = true
      ) => {

        runIdRef.current +=
          1;


        const synthesis =
          synthesisRef.current;


        if (
          synthesis &&
          ownsSpeechRef.current
        ) {

          try {

            synthesis.cancel();

          } catch {

            // Ignore browser cancellation errors.
          }
        }


        ownsSpeechRef.current =
          false;


        utteranceRef.current =
          null;


        if (
          resetPosition
        ) {

          chunkIndexRef.current =
            0;


          setCurrentChunk(
            0
          );
        }


        setStatus(
          "idle"
        );

      },
      []
    );


  // =======================================================
  // GLOBAL SHOBDO AUDIO COORDINATION
  // Only one WritingAudioPlayer speaks at a time.
  // =======================================================

  useEffect(
    () => {

      function handleAnotherPlayerStarted(
        event
      ) {

        if (
          event?.detail?.instanceId ===
          instanceIdRef.current
        ) {

          return;
        }


        if (
          ownsSpeechRef.current
        ) {

          stopPlayback();
        }
      }


      window.addEventListener(
        "shobdo:tts-start",
        handleAnotherPlayerStarted
      );


      return () => {

        window.removeEventListener(
          "shobdo:tts-start",
          handleAnotherPlayerStarted
        );
      };

    },
    [
      stopPlayback,
    ]
  );


  // =======================================================
  // SPEAK ONE CHUNK
  // =======================================================

  const speakChunk =
    useCallback(
      function speakChunkInternal(
        runId,
        index
      ) {

        const synthesis =
          synthesisRef.current;


        const chunks =
          chunksRef.current;


        if (
          !mountedRef.current ||
          !synthesis ||
          runId !==
            runIdRef.current
        ) {

          return;
        }


        if (
          index >=
          chunks.length
        ) {

          ownsSpeechRef.current =
            false;


          utteranceRef.current =
            null;


          chunkIndexRef.current =
            0;


          setCurrentChunk(
            0
          );


          setStatus(
            "idle"
          );


          return;
        }


        const text =
          chunks[index];


        const utterance =
          new SpeechSynthesisUtterance(
            text
          );


        utterance.lang =
          locale;


        utterance.rate =
          speed;


        utterance.pitch =
          1;


        utterance.volume =
          1;


        if (
          selectedVoice
        ) {

          utterance.voice =
            selectedVoice;
        }


        chunkIndexRef.current =
          index;


        utteranceRef.current =
          utterance;


        setCurrentChunk(
          index + 1
        );


        utterance.onstart =
          () => {

            if (
              runId !==
              runIdRef.current
            ) {

              return;
            }


            setStatus(
              "playing"
            );
          };


        utterance.onend =
          () => {

            if (
              runId !==
              runIdRef.current
            ) {

              return;
            }


            speakChunkInternal(
              runId,
              index + 1
            );
          };


        utterance.onerror =
          (
            event
          ) => {

            if (
              runId !==
              runIdRef.current
            ) {

              return;
            }


            const error =
              event?.error;


            if (
              error ===
                "interrupted" ||
              error ===
                "canceled"
            ) {

              return;
            }


            console.error(
              "SHOBDO TTS ERROR:",
              error
            );


            ownsSpeechRef.current =
              false;


            setStatus(
              "error"
            );


            setErrorMessage(
              labels.error
            );
          };


        synthesis.speak(
          utterance
        );

      },
      [
        locale,
        selectedVoice,
        speed,
        labels.error,
      ]
    );


  // =======================================================
  // START
  // =======================================================

  const startPlayback =
    useCallback(
      (
        startIndex = 0
      ) => {

        if (
          !supported ||
          !speechText
        ) {

          return;
        }


        const synthesis =
          synthesisRef.current;


        if (
          !synthesis
        ) {

          return;
        }


        setErrorMessage(
          ""
        );


        const chunks =
          chunkText(
            speechText
          );


        if (
          chunks.length ===
          0
        ) {

          return;
        }


        chunksRef.current =
          chunks;


        setTotalChunks(
          chunks.length
        );


        const safeStartIndex =
          Math.min(
            Math.max(
              0,
              startIndex
            ),
            chunks.length - 1
          );


        runIdRef.current +=
          1;


        const runId =
          runIdRef.current;


        try {

          synthesis.cancel();

        } catch {

          // Ignore.
        }


        ownsSpeechRef.current =
          true;


        window.dispatchEvent(
          new CustomEvent(
            "shobdo:tts-start",
            {
              detail: {
                instanceId:
                  instanceIdRef.current,

                writingId,
              },
            }
          )
        );


        /*
         * A short delay after cancel() is important on Chromium
         * browsers. Calling speak() immediately after cancel()
         * can occasionally result in no speech.
         */
        window.setTimeout(
          () => {

            if (
              runId !==
              runIdRef.current ||
              !mountedRef.current
            ) {

              return;
            }


            speakChunk(
              runId,
              safeStartIndex
            );

          },
          80
        );

      },
      [
        supported,
        speechText,
        writingId,
        speakChunk,
      ]
    );


  // =======================================================
  // PLAY / RESUME
  // =======================================================

  function handlePlay() {

    const synthesis =
      synthesisRef.current;


    if (
      status ===
        "paused" &&
      synthesis
    ) {

      try {

        synthesis.resume();


        ownsSpeechRef.current =
          true;


        setStatus(
          "playing"
        );


        return;

      } catch {

        // If resume fails, restart the current chunk.
      }
    }


    startPlayback(
      chunkIndexRef.current
    );
  }


  // =======================================================
  // PAUSE
  // =======================================================

  function handlePause() {

    const synthesis =
      synthesisRef.current;


    if (
      !synthesis ||
      status !==
        "playing"
    ) {

      return;
    }


    try {

      synthesis.pause();


      setStatus(
        "paused"
      );

    } catch (
      error
    ) {

      console.error(
        "SHOBDO TTS PAUSE ERROR:",
        error
      );
    }
  }


  // =======================================================
  // RESTART
  // =======================================================

  function handleRestart() {

    stopPlayback();

    window.setTimeout(
      () => {

        startPlayback(
          0
        );

      },
      60
    );
  }


  // =======================================================
  // SPEED
  // =======================================================

  function handleSpeedChange(
    event
  ) {

    const nextSpeed =
      Number(
        event.target.value
      );


    if (
      !Number.isFinite(
        nextSpeed
      )
    ) {

      return;
    }


    setSpeed(
      nextSpeed
    );


    /*
     * SpeechSynthesisUtterance.rate cannot reliably be changed
     * after speaking has begun.
     *
     * The new speed therefore applies automatically to the next
     * sentence/chunk. This avoids abruptly restarting the user's
     * narration.
     */
  }


  // =======================================================
  // WRITING CHANGED
  // =======================================================

  useEffect(
    () => {

      stopPlayback();

      setErrorMessage(
        ""
      );

      setTotalChunks(
        0
      );

    },
    [
      writingId,
      speechText,
      writingLanguage,
      stopPlayback,
    ]
  );


  // =======================================================
  // CLEANUP
  // =======================================================

  useEffect(
    () => {

      mountedRef.current =
        true;


      return () => {

        mountedRef.current =
          false;


        if (
          ownsSpeechRef.current
        ) {

          runIdRef.current +=
            1;


          try {

            synthesisRef.current?.cancel();

          } catch {

            // Ignore cleanup errors.
          }


          ownsSpeechRef.current =
            false;
        }
      };

    },
    []
  );


  // =======================================================
  // NOTHING TO READ
  // =======================================================

  if (
    !speechText
  ) {

    return null;
  }


  // =======================================================
  // UNSUPPORTED
  // =======================================================

  if (
    !supported
  ) {

    return (

      <div
        className="writing-audio-player writing-audio-player--unsupported"
        role="status"
      >

        <VolumeX
          size={17}
          aria-hidden="true"
        />

        <span>
          {labels.unsupported}
        </span>

      </div>

    );
  }


  // =======================================================
  // PRESENTATION
  // =======================================================

  const isPlaying =
    status ===
    "playing";


  const isPaused =
    status ===
    "paused";


  const isActive =
    isPlaying ||
    isPaused;


  const progress =
    totalChunks > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (
              currentChunk /
              totalChunks
            ) *
              100
          )
        )
      : 0;


  return (

    <section
      className={[
        "writing-audio-player",

        isActive
          ? "is-active"
          : "",

        status === "error"
          ? "has-error"
          : "",

      ]
        .filter(Boolean)
        .join(" ")
      }
      aria-label={
        labels.listen
      }
    >

      {/* ===============================================
          PRIMARY AUDIO CONTROL
      ================================================ */}

      <button
        type="button"
        className="writing-audio-primary"
        onClick={
          isPlaying
            ? handlePause
            : handlePlay
        }
        aria-label={
          isPlaying
            ? labels.pause
            : isPaused
              ? labels.resume
              : labels.listen
        }
        title={
          isPlaying
            ? labels.pause
            : isPaused
              ? labels.resume
              : labels.listen
        }
      >

        {isPlaying
          ? (
            <Pause
              size={18}
              strokeWidth={2}
              aria-hidden="true"
            />
          )
          : (
            <Play
              size={18}
              strokeWidth={2}
              aria-hidden="true"
            />
          )
        }

      </button>


      {/* ===============================================
          STATUS
      ================================================ */}

      <div
        className="writing-audio-main"
      >

        <div
          className="writing-audio-topline"
        >

          <span
            className="writing-audio-title"
          >

            <Volume2
              size={15}
              strokeWidth={1.9}
              aria-hidden="true"
            />

            <span>
              {
                isActive
                  ? labels.listening
                  : labels.listen
              }
            </span>

          </span>


          {isActive &&
            totalChunks >
              0 && (

            <span
              className="writing-audio-progress-label"
            >
              {currentChunk}
              /
              {totalChunks}
            </span>

          )}

        </div>


        <div
          className="writing-audio-progress"
          aria-hidden="true"
        >

          <span
            style={{
              width:
                `${progress}%`,
            }}
          />

        </div>


        {errorMessage && (

          <span
            className="writing-audio-error"
            role="status"
          >
            {errorMessage}
          </span>

        )}

      </div>


      {/* ===============================================
          SPEED
      ================================================ */}

      <label
        className="writing-audio-speed"
        title={
          labels.speed
        }
      >

        <Gauge
          size={15}
          strokeWidth={1.9}
          aria-hidden="true"
        />

        <select
          value={
            speed
          }
          onChange={
            handleSpeedChange
          }
          aria-label={
            labels.speed
          }
        >

          {SPEED_OPTIONS.map(
            (
              value
            ) => (

              <option
                key={
                  value
                }
                value={
                  value
                }
              >
                {value}×
              </option>

            )
          )}

        </select>

      </label>


      {/* ===============================================
          RESTART
      ================================================ */}

      {isActive && (

        <button
          type="button"
          className="writing-audio-icon-button"
          onClick={
            handleRestart
          }
          aria-label={
            labels.restart
          }
          title={
            labels.restart
          }
        >

          <RotateCcw
            size={16}
            strokeWidth={1.9}
            aria-hidden="true"
          />

        </button>

      )}


      {/* ===============================================
          STOP
      ================================================ */}

      {isActive && (

        <button
          type="button"
          className="writing-audio-icon-button writing-audio-stop"
          onClick={
            () =>
              stopPlayback()
          }
          aria-label={
            labels.stop
          }
          title={
            labels.stop
          }
        >

          <Square
            size={15}
            strokeWidth={1.9}
            aria-hidden="true"
          />

        </button>

      )}

    </section>
  );
}


export default WritingAudioPlayer;