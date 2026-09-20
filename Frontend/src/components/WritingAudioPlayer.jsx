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
// SHOBDO TTS CONFIGURATION
// =========================================================

const LANGUAGE_CONFIG = {

  bn: {
    locale: "bn-IN",

    listen:
      "শুনুন",

    pause:
      "বিরতি",

    resume:
      "আবার শুনুন",

    stop:
      "বন্ধ করুন",

    restart:
      "আবার শুরু করুন",

    speed:
      "গতি",

    listening:
      "পড়া হচ্ছে",

    unsupported:
      "এই ব্রাউজারে Text-to-Speech সমর্থিত নয়।",

    error:
      "এই লেখাটি পড়া যায়নি।",

    noVoice:
      "বাংলা কণ্ঠ পাওয়া যায়নি। ডিভাইসের ডিফল্ট কণ্ঠ ব্যবহার করা হবে।",
  },


  hi: {
    locale: "hi-IN",

    listen:
      "सुनें",

    pause:
      "रोकें",

    resume:
      "जारी रखें",

    stop:
      "बंद करें",

    restart:
      "फिर से शुरू करें",

    speed:
      "गति",

    listening:
      "पढ़ा जा रहा है",

    unsupported:
      "यह ब्राउज़र Text-to-Speech का समर्थन नहीं करता।",

    error:
      "इस रचना को पढ़ा नहीं जा सका।",

    noVoice:
      "हिंदी आवाज़ उपलब्ध नहीं है। डिवाइस की डिफ़ॉल्ट आवाज़ का उपयोग किया जाएगा।",
  },


  en: {
    locale: "en-IN",

    listen:
      "Listen",

    pause:
      "Pause",

    resume:
      "Resume",

    stop:
      "Stop",

    restart:
      "Restart",

    speed:
      "Speed",

    listening:
      "Reading",

    unsupported:
      "Text-to-Speech is not supported by this browser.",

    error:
      "Unable to read this writing.",

    noVoice:
      "A matching voice is unavailable. Your device default voice will be used.",
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
// PREFERRED VOICE KEYWORDS
// =========================================================

const PREMIUM_VOICE_KEYWORDS = [

  {
    keyword:
      "natural",

    score:
      180,
  },

  {
    keyword:
      "neural",

    score:
      170,
  },

  {
    keyword:
      "online",

    score:
      150,
  },

  {
    keyword:
      "enhanced",

    score:
      130,
  },

  {
    keyword:
      "premium",

    score:
      130,
  },

  {
    keyword:
      "google",

    score:
      110,
  },

  {
    keyword:
      "microsoft",

    score:
      110,
  },

  {
    keyword:
      "azure",

    score:
      100,
  },

];


const LOW_QUALITY_VOICE_KEYWORDS = [

  {
    keyword:
      "espeak",

    penalty:
      250,
  },

  {
    keyword:
      "festival",

    penalty:
      200,
  },

  {
    keyword:
      "compact",

    penalty:
      80,
  },

];


// =========================================================
// LANGUAGE HELPERS
// =========================================================

function normalizeLanguage(
  value
) {

  return String(
    value || ""
  )
    .trim()
    .toLowerCase()
    .replace(
      /_/g,
      "-"
    );
}


function getBaseLanguage(
  value
) {

  const normalized =
    normalizeLanguage(
      value
    );


  return (
    normalized.split("-")[0] ||
    "en"
  );
}


// =========================================================
// HTML / TEXT CLEANING
// =========================================================

function decodeBasicEntities(
  value
) {

  return String(
    value || ""
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
      /&lt;/gi,
      "<"
    )
    .replace(
      /&gt;/gi,
      ">"
    );
}


function cleanText(
  value
) {

  return decodeBasicEntities(
    String(
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
        /<\/div>/gi,
        "\n"
      )
      .replace(
        /<\/li>/gi,
        "\n"
      )
      .replace(
        /<[^>]*>/g,
        " "
      )
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
      / *\n */g,
      "\n"
    )
    .replace(
      /\n{3,}/g,
      "\n\n"
    )
    .trim();
}


// =========================================================
// LONG TEXT SPLITTER
// =========================================================

function splitLongPart(
  text,
  maxLength
) {

  const parts = [];

  let remaining =
    String(
      text || ""
    ).trim();


  while (
    remaining.length >
    maxLength
  ) {

    let splitIndex =
      -1;


    const punctuationCandidates = [
      "।",
      "॥",
      ".",
      "!",
      "?",
      ",",
      ";",
      ":",
    ];


    punctuationCandidates.forEach(
      (
        symbol
      ) => {

        const index =
          remaining.lastIndexOf(
            symbol,
            maxLength
          );


        if (
          index >
          splitIndex
        ) {

          splitIndex =
            index + 1;
        }

      }
    );


    if (
      splitIndex <
      Math.floor(
        maxLength * 0.5
      )
    ) {

      splitIndex =
        remaining.lastIndexOf(
          " ",
          maxLength
        );
    }


    if (
      splitIndex <
      Math.floor(
        maxLength * 0.5
      )
    ) {

      splitIndex =
        maxLength;
    }


    const chunk =
      remaining
        .slice(
          0,
          splitIndex
        )
        .trim();


    if (
      chunk
    ) {

      parts.push(
        chunk
      );
    }


    remaining =
      remaining
        .slice(
          splitIndex
        )
        .trim();
  }


  if (
    remaining
  ) {

    parts.push(
      remaining
    );
  }


  return parts;
}


// =========================================================
// SPEECH CHUNKING
// =========================================================

function chunkText(
  value,
  maxLength = 240
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

  let currentChunk =
    "";


  function pushCurrentChunk() {

    const textToPush =
      currentChunk.trim();


    if (
      textToPush
    ) {

      chunks.push(
        textToPush
      );
    }


    currentChunk =
      "";
  }


  sentences.forEach(
    (
      sentence
    ) => {

      if (
        sentence.length >
        maxLength
      ) {

        pushCurrentChunk();


        splitLongPart(
          sentence,
          maxLength
        ).forEach(
          (
            part
          ) => {

            if (
              part
            ) {

              chunks.push(
                part
              );
            }

          }
        );


        return;
      }


      const combined =
        currentChunk
          ? `${currentChunk} ${sentence}`
          : sentence;


      if (
        combined.length <=
        maxLength
      ) {

        currentChunk =
          combined;

      } else {

        pushCurrentChunk();

        currentChunk =
          sentence;
      }

    }
  );


  pushCurrentChunk();


  return chunks;
}


// =========================================================
// VOICE SCORE
// =========================================================

function scoreVoice(
  voice,
  targetLocale
) {

  if (
    !voice
  ) {

    return (
      Number.NEGATIVE_INFINITY
    );
  }


  const voiceLanguage =
    normalizeLanguage(
      voice.lang
    );


  const targetLanguage =
    normalizeLanguage(
      targetLocale
    );


  const voiceBaseLanguage =
    getBaseLanguage(
      voiceLanguage
    );


  const targetBaseLanguage =
    getBaseLanguage(
      targetLanguage
    );


  if (
    voiceBaseLanguage !==
    targetBaseLanguage
  ) {

    return (
      Number.NEGATIVE_INFINITY
    );
  }


  let score =
    0;


  // Exact locale is strongly preferred.
  if (
    voiceLanguage ===
    targetLanguage
  ) {

    score +=
      1000;

  } else {

    score +=
      600;
  }


  // Prefer Indian regional locale when SHOBDO asks for India.
  if (
    targetLanguage.endsWith(
      "-in"
    ) &&
    voiceLanguage.endsWith(
      "-in"
    )
  ) {

    score +=
      180;
  }


  const voiceName =
    String(
      voice.name || ""
    ).toLowerCase();


  PREMIUM_VOICE_KEYWORDS.forEach(
    (
      preference
    ) => {

      if (
        voiceName.includes(
          preference.keyword
        )
      ) {

        score +=
          preference.score;
      }

    }
  );


  LOW_QUALITY_VOICE_KEYWORDS.forEach(
    (
      preference
    ) => {

      if (
        voiceName.includes(
          preference.keyword
        )
      ) {

        score -=
          preference.penalty;
      }

    }
  );


  // Browser-defined default voice gets a small bonus.
  if (
    voice.default
  ) {

    score +=
      20;
  }


  /*
   * Online voices on Windows / Edge / Chrome frequently
   * provide the highest-quality Microsoft Natural voices.
   *
   * Therefore localService=false is not penalised.
   */

  return score;
}


// =========================================================
// BEST VOICE FINDER
// =========================================================

function chooseBestVoice(
  voices,
  targetLocale
) {

  if (
    !Array.isArray(
      voices
    ) ||
    voices.length ===
      0
  ) {

    return null;
  }


  const candidates =
    voices
      .map(
        (
          voice
        ) => ({

          voice,

          score:
            scoreVoice(
              voice,
              targetLocale
            ),

        })
      )
      .filter(
        (
          candidate
        ) =>
          Number.isFinite(
            candidate.score
          )
      )
      .sort(
        (
          first,
          second
        ) =>
          second.score -
          first.score
      );


  if (
    candidates.length ===
    0
  ) {

    return null;
  }


  return (
    candidates[0].voice
  );
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


  // =======================================================
  // REFS
  // =======================================================

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


  const startTimerRef =
    useRef(
      null
    );


  const instanceIdRef =
    useRef(
      Symbol(
        `shobdo-tts-${writingId || "writing"}`
      )
    );


  // =======================================================
  // STATE
  // =======================================================

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
    voicesLoaded,
    setVoicesLoaded,
  ] = useState(
    false
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

  const normalizedWritingLanguage =
    useMemo(
      () => {

        const base =
          getBaseLanguage(
            writingLanguage
          );


        if (
          base === "od"
        ) {

          return "or";
        }


        return base;

      },
      [
        writingLanguage,
      ]
    );


  const languageConfig =
    LANGUAGE_CONFIG[
      normalizedWritingLanguage
    ] ||
    LANGUAGE_CONFIG.en;


  const labels =
    useMemo(
      () => {

        const english =
          LANGUAGE_CONFIG.en;


        if (
          normalizedWritingLanguage ===
            "bn" ||
          normalizedWritingLanguage ===
            "hi" ||
          normalizedWritingLanguage ===
            "en"
        ) {

          return {
            ...english,
            ...languageConfig,
          };
        }


        return {

          ...english,

          locale:
            languageConfig.locale ||
            writingLanguage ||
            "en-IN",

        };

      },
      [
        languageConfig,
        normalizedWritingLanguage,
        writingLanguage,
      ]
    );


  const locale =
    languageConfig.locale ||
    writingLanguage ||
    "en-IN";


  // =======================================================
  // TEXT TO READ
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
  // SELECT BEST AVAILABLE VOICE
  // =======================================================

  const selectedVoice =
    useMemo(
      () => {

        return chooseBestVoice(
          voices,
          locale
        );

      },
      [
        voices,
        locale,
      ]
    );


  // =======================================================
  // LOAD BROWSER VOICES
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
        typeof window.SpeechSynthesisUtterance ===
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


        if (
          availableVoices.length >
          0
        ) {

          setVoices(
            Array.from(
              availableVoices
            )
          );


          setVoicesLoaded(
            true
          );
        }

      }


      loadVoices();


      synthesis.addEventListener?.(
        "voiceschanged",
        loadVoices
      );


      /*
       * Some Chromium browsers expose voices asynchronously.
       * These fallback checks improve first-load reliability.
       */

      const timer1 =
        window.setTimeout(
          loadVoices,
          250
        );


      const timer2 =
        window.setTimeout(
          loadVoices,
          1000
        );


      const timer3 =
        window.setTimeout(
          () => {

            loadVoices();

            setVoicesLoaded(
              true
            );

          },
          2000
        );


      return () => {

        synthesis.removeEventListener?.(
          "voiceschanged",
          loadVoices
        );


        window.clearTimeout(
          timer1
        );


        window.clearTimeout(
          timer2
        );


        window.clearTimeout(
          timer3
        );
      };

    },
    []
  );


  // =======================================================
  // CLEAR START TIMER
  // =======================================================

  const clearStartTimer =
    useCallback(
      () => {

        if (
          startTimerRef.current
        ) {

          window.clearTimeout(
            startTimerRef.current
          );


          startTimerRef.current =
            null;
        }

      },
      []
    );


  // =======================================================
  // STOP PLAYBACK
  // =======================================================

  const stopPlayback =
    useCallback(
      (
        resetPosition = true
      ) => {

        runIdRef.current +=
          1;


        clearStartTimer();


        const synthesis =
          synthesisRef.current;


        if (
          synthesis &&
          ownsSpeechRef.current
        ) {

          try {

            synthesis.cancel();

          } catch (
            error
          ) {

            console.debug(
              "SHOBDO TTS cancel:",
              error
            );
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
      [
        clearStartTimer,
      ]
    );


  // =======================================================
  // ONLY ONE SHOBDO POST SPEAKS AT ONCE
  // =======================================================

  useEffect(
    () => {

      function handleOtherPlayer(
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

          stopPlayback(
            true
          );
        }

      }


      window.addEventListener(
        "shobdo:tts-start",
        handleOtherPlayer
      );


      return () => {

        window.removeEventListener(
          "shobdo:tts-start",
          handleOtherPlayer
        );
      };

    },
    [
      stopPlayback,
    ]
  );


  // =======================================================
  // SPEAK CHUNK
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


        // Finished complete writing.
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


        if (
          !text
        ) {

          speakChunkInternal(
            runId,
            index + 1
          );


          return;
        }


        const utterance =
          new window.SpeechSynthesisUtterance(
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


          /*
           * Use the voice's actual locale where available.
           * This helps Chromium choose the correct speech engine.
           */

          if (
            selectedVoice.lang
          ) {

            utterance.lang =
              selectedVoice.lang;
          }

        }


        utteranceRef.current =
          utterance;


        chunkIndexRef.current =
          index;


        setCurrentChunk(
          index + 1
        );


        // ---------------------------------------------------
        // START
        // ---------------------------------------------------

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


            setErrorMessage(
              ""
            );
          };


        // ---------------------------------------------------
        // END
        // ---------------------------------------------------

        utterance.onend =
          () => {

            if (
              runId !==
              runIdRef.current
            ) {

              return;
            }


            utteranceRef.current =
              null;


            speakChunkInternal(
              runId,
              index + 1
            );
          };


        // ---------------------------------------------------
        // ERROR
        // ---------------------------------------------------

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


            const errorType =
              event?.error ||
              "";


            if (
              errorType ===
                "interrupted" ||
              errorType ===
                "canceled"
            ) {

              return;
            }


            console.error(
              "SHOBDO TTS ERROR:",
              errorType
            );


            ownsSpeechRef.current =
              false;


            utteranceRef.current =
              null;


            setStatus(
              "error"
            );


            setErrorMessage(
              labels.error
            );
          };


        try {

          synthesis.speak(
            utterance
          );

        } catch (
          error
        ) {

          console.error(
            "SHOBDO TTS SPEAK ERROR:",
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
        }

      },
      [
        locale,
        selectedVoice,
        speed,
        labels.error,
      ]
    );


  // =======================================================
  // START PLAYBACK
  // =======================================================

  const startPlayback =
    useCallback(
      (
        requestedIndex = 0
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


        clearStartTimer();


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


        const safeIndex =
          Math.min(
            Math.max(
              0,
              Number(
                requestedIndex
              ) ||
              0
            ),
            chunks.length - 1
          );


        // New playback session.
        runIdRef.current +=
          1;


        const runId =
          runIdRef.current;


        /*
         * speechSynthesis is global for the browser tab.
         * Cancel anything previously queued.
         */

        try {

          synthesis.cancel();

        } catch (
          error
        ) {

          console.debug(
            "SHOBDO TTS reset:",
            error
          );
        }


        ownsSpeechRef.current =
          true;


        // Tell every other WritingAudioPlayer to stop.
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
         * Chromium can ignore speak() when called immediately
         * after cancel(). A small delay makes playback reliable.
         */

        startTimerRef.current =
          window.setTimeout(
            () => {

              startTimerRef.current =
                null;


              if (
                !mountedRef.current ||
                runId !==
                  runIdRef.current
              ) {

                return;
              }


              speakChunk(
                runId,
                safeIndex
              );

            },
            100
          );

      },
      [
        supported,
        speechText,
        writingId,
        clearStartTimer,
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

      } catch (
        error
      ) {

        console.debug(
          "SHOBDO TTS resume failed:",
          error
        );
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

    stopPlayback(
      true
    );


    startTimerRef.current =
      window.setTimeout(
        () => {

          startTimerRef.current =
            null;


          startPlayback(
            0
          );

        },
        80
      );
  }


  // =======================================================
  // SPEED CHANGE
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
     * Browser speech rate cannot reliably change in the
     * middle of the currently spoken utterance.
     *
     * Therefore the new speed is applied from the next chunk.
     */
  }


  // =======================================================
  // RESET WHEN WRITING CHANGES
  // =======================================================

  useEffect(
    () => {

      stopPlayback(
        true
      );


      setErrorMessage(
        ""
      );


      setTotalChunks(
        0
      );


      setCurrentChunk(
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
  // CLEANUP ON UNMOUNT
  // =======================================================

  useEffect(
    () => {

      mountedRef.current =
        true;


      return () => {

        mountedRef.current =
          false;


        clearStartTimer();


        runIdRef.current +=
          1;


        if (
          ownsSpeechRef.current
        ) {

          try {

            synthesisRef.current?.cancel();

          } catch (
            error
          ) {

            console.debug(
              "SHOBDO TTS cleanup:",
              error
            );
          }

        }


        ownsSpeechRef.current =
          false;


        utteranceRef.current =
          null;
      };

    },
    [
      clearStartTimer,
    ]
  );


  // =======================================================
  // DEBUG VOICE INFO
  // =======================================================

  useEffect(
    () => {

      if (
        !voicesLoaded
      ) {

        return;
      }


      if (
        selectedVoice
      ) {

        console.debug(
          "[SHOBDO TTS]",
          {
            writingId,
            requestedLanguage:
              writingLanguage,
            locale,
            selectedVoice:
              selectedVoice.name,
            selectedVoiceLanguage:
              selectedVoice.lang,
            localService:
              selectedVoice.localService,
          }
        );

      } else {

        console.debug(
          "[SHOBDO TTS] No matching voice:",
          {
            writingId,
            requestedLanguage:
              writingLanguage,
            locale,
          }
        );
      }

    },
    [
      voicesLoaded,
      selectedVoice,
      writingId,
      writingLanguage,
      locale,
    ]
  );


  // =======================================================
  // NO CONTENT
  // =======================================================

  if (
    !speechText
  ) {

    return null;
  }


  // =======================================================
  // BROWSER NOT SUPPORTED
  // =======================================================

  if (
    !supported
  ) {

    return (

      <div
        className="
          writing-audio-player
          writing-audio-player--unsupported
        "
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
  // UI STATE
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
    totalChunks >
      0
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


  const primaryButtonLabel =
    isPlaying
      ? labels.pause
      : isPaused
        ? labels.resume
        : labels.listen;


  const selectedVoiceTitle =
    selectedVoice
      ? `${selectedVoice.name} · ${selectedVoice.lang}`
      : labels.listen;


  // =======================================================
  // UI
  // =======================================================

  return (

    <section
      className={[
        "writing-audio-player",

        isActive
          ? "is-active"
          : "",

        status ===
          "error"
          ? "has-error"
          : "",

      ]
        .filter(Boolean)
        .join(" ")
      }
      aria-label={
        labels.listen
      }
      title={
        selectedVoiceTitle
      }
    >


      {/* =================================================
          PLAY / PAUSE
      ================================================== */}

      <button
        type="button"
        className="writing-audio-primary"
        onClick={
          isPlaying
            ? handlePause
            : handlePlay
        }
        aria-label={
          primaryButtonLabel
        }
        title={
          primaryButtonLabel
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


      {/* =================================================
          MAIN STATUS
      ================================================== */}

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

              {isActive
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


        {/* ===============================================
            PROGRESS
        ================================================ */}

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


        {/* ===============================================
            ERROR
        ================================================ */}

        {errorMessage && (

          <span
            className="writing-audio-error"
            role="status"
          >

            {errorMessage}

          </span>

        )}

      </div>


      {/* =================================================
          SPEED
      ================================================== */}

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


      {/* =================================================
          RESTART
      ================================================== */}

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


      {/* =================================================
          STOP
      ================================================== */}

      {isActive && (

        <button
          type="button"
          className="
            writing-audio-icon-button
            writing-audio-stop
          "
          onClick={
            () =>
              stopPlayback(
                true
              )
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